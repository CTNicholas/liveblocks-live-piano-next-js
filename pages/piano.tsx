import { RoomProvider, useMyPresence, useOthers, useSelf } from '@liveblocks/react'
import LivePiano, { instrumentNames } from '../components/LivePiano'
import { ChangeEvent, useEffect, useRef, useState, Fragment } from 'react'
import { motion } from 'framer-motion'

/*
 * This example shows how to use Liveblocks to build a live piano app.
 * Multiple users can connect at once and play together.
 */
export default function Root () {
  let room: string = ''

  // If in browser, get value of ?room= from the URL
  // The room parameter is added in pages/_middleware.ts
  if (typeof window !== 'undefined') {
    room = new URLSearchParams(document.location.search).get('room') || ''
  }

  return (
    <RoomProvider id={'live-piano-' + room}>
      <PianoDemo />
    </RoomProvider>
  )
}

/*
 * The piano component is called LivePiano
 * LivePiano takes an array of NotePresence objects, one for each user
 * Add a note to `notes[]` to play it, and remove it from `notes[]` to stop it
 * Notes are in MIDI format. [52, 55, 57] will play a chord of E3, G3, A3
 */
export type NotePresence = {
  instrument: string
  notes: number[],
  color?: string
  name?: string
  id?: number
}

const DEFAULT_INSTRUMENT = 'piano'

/*
 * PianoDemo is a Liveblocks wrapper around the LivePiano component
 * We're converting our presence, and others presence, into a NotePresence array
 * We then pass this array, `activeNotes`, to LivePiano
 */
function PianoDemo () {
  const self = useSelf()
  const others = useOthers<NotePresence>()
  const [myPresence, updateMyPresence] = useMyPresence<NotePresence>()
  const [activeNotes, setActiveNotes] = useState<NotePresence[]>([])

  // Function that converts `self` into a new NotePresence object
  const formatSelf = () => {
    if (!self) {
      return myPresence
    }
    return {
      ...myPresence,
      color: self.info.color,
      name: self.info.name,
      picture: self.info.picture,
      id: self.connectionId
    }
  }

  // Function that converts `others` into a new array of NotePresence objects
  const formatOthers = () => {
    return others.toArray()
      // Skip if presence and presence.notes are not set for this remote user
      .filter(({ presence }) => presence?.notes)
      // Return instrument and notes
      .map(({ presence = {}, info, connectionId }) => {
        return {
          instrument: presence.instrument || DEFAULT_INSTRUMENT,
          notes: presence.notes || [],
          color: info.color,
          name: info.name,
          picture: info.picture,
          id: connectionId
        }
      })
  }

  // Set initial values
  useEffect(() => {
    updateMyPresence({ instrument: DEFAULT_INSTRUMENT, notes: [] })
  }, [])

  // When local user plays a note, add note (if not already being played) and update myPresence
  function handlePlayNote (note: number) {
    if (!myPresence.notes.includes(note)) {
      const myNotes = [...myPresence.notes, note]
      updateMyPresence({ notes: myNotes })
    }
  }

  // When local user releases a note, remove note and update myPresence
  function handleStopNote (note: number) {
    const myNotes = [...myPresence.notes.filter(n => {
      return n !== note
    })]
    updateMyPresence({ notes: myNotes })
  }

  // When `myPresence` updates (a local user playing/releasing a note), update `activeNotes` with current notes
  useEffect(() => {
    if (myPresence.notes) {
      setActiveNotes([formatSelf(), ...formatOthers()])
    }
  }, [myPresence])

  // When `others` updates (someone else playing/releasing a note), update `activeNotes` with current notes
  useEffect(() => {
    if (myPresence.notes && others.count) {
      setActiveNotes([formatSelf(), ...formatOthers()])
    }
  }, [others])

  // Change local user's instrument
  function handleInstrumentChange (e: ChangeEvent<HTMLSelectElement>) {
    updateMyPresence({ instrument: e.target.value })
  }

  // Still connecting to Liveblocks
  if (!self) {
    return (
      <div className="bg-gray-100 w-full h-full flex justify-center items-center">
        <span>Connecting...</span>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 flex justify-center items-center h-full">
      <div className="flex flex-col drop-shadow-xl">
        <div className="bg-white mb-[1px] flex justify-end rounded-t-lg overflow-hidden">
          <div className="p-6 pr-0 sm:pr-6 flex flex-grow">
            <Avatar url={self.info.picture} color={self.info.color} />
            <div className="ml-3">
              <div className="font-semibold">You</div>
              <SelectInstrument onInstrumentChange={handleInstrumentChange} />
            </div>
          </div>
          {formatOthers().reverse().map(({ picture, name, color, instrument, id }) => (
            <Fragment key={id}>
              <motion.div className="py-6 px-4 xl:px-6 first:pl-6 last:pr-6 hidden lg:flex opacity-0" animate={{ y: [-100, 0], opacity: [0, 1] }}>
                <Avatar url={picture} color={color} />
                <div className="ml-3">
                  <div className="font-semibold">{name}</div>
                  <div>{capitalize(instrument)}</div>
                </div>
              </motion.div>
              <div className="flex lg:hidden justify-center items-center last:pr-6">
                <Avatar url={picture} color={color} />
              </div>
            </Fragment>
          ))}
        </div>
        <LivePiano
          activeNotes={activeNotes}
          onPlayNote={handlePlayNote}
          onStopNote={handleStopNote}
          defaultInstrument={DEFAULT_INSTRUMENT}
        />
      </div>
      <motion.div animate={{ opacity: [1, 0], transitionEnd: { display: 'none' } }} className="absolute inset-0 bg-gray-100" />
    </div>
  )
}

// HTML select element, for instrument selection
function SelectInstrument ({ onInstrumentChange }: { onInstrumentChange: (event: ChangeEvent<HTMLSelectElement>) => void }) {
  const select = useRef<HTMLSelectElement>(null)
  function handleChange (event: ChangeEvent<HTMLSelectElement>) {
    select.current?.blur()
    onInstrumentChange(event)
  }
  return (
    <div className="relative">
      <span className="absolute top-0.5 -left-1 flex items-center pr-2 pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
      <select
        ref={select}
        onChange={handleChange}
        defaultValue={DEFAULT_INSTRUMENT}
        className="outline-0 rounded-sm bg-transparent hover:ring-2 focus:ring-2 cursor-pointer mt-0.5 appearance-none w-full px-4 py-0.5 -mt-1.5"
      >
        {instrumentNames.map(instrument => (
          <option key={instrument} value={instrument}>
            {capitalize(instrument)}
          </option>
        ))}
      </select>
    </div>
  )
}

// Circular avatar
function Avatar ({ url = '', color = '' }) {
  return (
    <span className="inline-block relative">
      <img
        className="h-12 w-12 rounded-full ring-4 ring-white"
        src={url}
        alt=""
      />
      <span style={{ backgroundColor: color }} className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white" />
    </span>
  )
}

// Capitalize first letter of string
function capitalize (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

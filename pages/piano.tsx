import { RoomProvider, useOthers, useSelf, useUpdateMyPresence } from '../liveblocks.config'
import LivePiano, { instrumentNames } from '../components/LivePiano'
import { ChangeEvent, Fragment, useRef } from 'react'
import { motion } from 'framer-motion'
import { ClientSideSuspense } from '@liveblocks/react'

const DEFAULT_INSTRUMENT = 'piano'

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
    <RoomProvider
      id={'live-piano-' + room}
      initialPresence={{ instrument: DEFAULT_INSTRUMENT, notes: [] }}
    >
      <ClientSideSuspense fallback={<Loading />}>
        {() => <PianoDemo />}
      </ClientSideSuspense>
    </RoomProvider>
  )
}

/*
 * The piano component is called LivePiano
 * LivePiano takes an array of NotePresence objects, one for each user
 * Add a note to `notes[]` to play it, and remove it from `notes[]` to stop it
 * Notes are in MIDI format. [52, 55, 57] will play a chord of E3, G3, A3
 */
type NotePresence = {
  instrument: string
  notes: number[]
  color: string
  name: string
  id: number
}

/*
 * PianoDemo is a Liveblocks wrapper around the LivePiano component
 * We're converting our presence, and others presence, into a NotePresence array
 * We then pass this array, `activeNotes`, to LivePiano
 */
function PianoDemo () {
  const updateMyPresence = useUpdateMyPresence()

  const myNotes = useSelf(me => ({
    ...me.info,
    ...me.presence,
    id: me.connectionId
  }))

  const othersNotes = useOthers(others =>
    others.map((other => ({
      ...other.info,
      ...other.presence,
      id: other.connectionId
    }))
  ))

  const activeNotes: NotePresence[] = [myNotes, ...othersNotes]

  // When local user plays a note, add note (if not already being played) and update myPresence
  function handlePlayNote (note: number) {
    if (!myNotes.notes.includes(note)) {
      const myNewNotes = [...myNotes.notes, note]
      updateMyPresence({ notes: myNewNotes })
    }
  }

  // When local user releases a note, remove note and update myPresence
  function handleStopNote (note: number) {
    const myNewNotes = [...myNotes.notes.filter(n => {
      return n !== note
    })]
    updateMyPresence({ notes: myNewNotes })
  }

  // Change local user's instrument
  function handleInstrumentChange (e: ChangeEvent<HTMLSelectElement>) {
    updateMyPresence({ instrument: e.target.value })
  }

  return (
    <div className="bg-gray-100 flex justify-center items-center h-full">
      <div className="flex flex-col drop-shadow-xl">
        <div className="bg-white mb-[1px] flex justify-end rounded-t-lg overflow-hidden">
          <div className="p-6 pr-0 sm:pr-6 flex flex-grow">
            <Avatar url={myNotes.picture} color={myNotes.color} />
            <div className="ml-3">
              <div className="font-semibold">You</div>
              <SelectInstrument onInstrumentChange={handleInstrumentChange} />
            </div>
          </div>
          {othersNotes.reverse().map(({ picture, name, color, instrument, id }) => (
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

function Loading () {
  return (
    <div className="bg-gray-100 w-full h-full flex justify-center items-center">
      <span>Connecting...</span>
    </div>
  )
}

function capitalize (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

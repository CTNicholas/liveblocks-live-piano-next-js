import { RoomProvider, useMyPresence, useOthers, useSelf } from '@liveblocks/react'
import LivePiano, { instrumentNames } from '../components/LivePiano'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { LayoutGroup, motion } from 'framer-motion'

export default function Root () {
  return (
    <RoomProvider id="example-live-piano">
      <PianoDemo />
    </RoomProvider>
  )
}

const defaultInstrument = 'piano'

export type NotePresence = {
  instrument: string
  notes: number[],
  color?: string
  name?: string
  id?: number
}

function PianoDemo () {
  const [activeNotes, setActiveNotes] = useState<NotePresence[]>([])
  const [myPresence, updateMyPresence] = useMyPresence<NotePresence>()
  const self = useSelf()
  const others = useOthers<NotePresence>()

  // Format `self` into NotePresence[] format
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

  // Format `others` into NotePresence[] format
  const formatOthers = () => {
    return others.toArray()
      // Skip if presence and presence.notes are not set for this remote user
      .filter(({ presence }) => presence?.notes)
      // Return instrument and notes
      .map(({ presence = {}, info, connectionId }) => {
        return {
          instrument: presence.instrument || defaultInstrument,
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
    updateMyPresence({ instrument: defaultInstrument, notes: [] })
  }, [])

  // Update current notes being played when local user plays a note
  useEffect(() => {
    if (myPresence.notes) {
      setActiveNotes([formatSelf(), ...formatOthers()])
    }
  }, [myPresence])

  // Update current notes being played when other user plays a note
  useEffect(() => {
    if (myPresence.notes && others.count) {
      setActiveNotes([formatSelf(), ...formatOthers()])
    }
  }, [others])

  // When local user plays a note, add note and update presence
  function handlePlayNote (note: number) {
    const myNotes = [...myPresence.notes, note]
    updateMyPresence({ notes: myNotes })
  }

  // When local user releases a note, remove note and update presence
  function handleStopNote (note: number) {
    const myNotes = myPresence.notes.filter(n => n !== note)
    updateMyPresence({ notes: myNotes })
  }

  // Change local user's instrument
  function handleInstrumentChange (e: ChangeEvent<HTMLSelectElement>) {
    updateMyPresence({ instrument: e.target.value })
  }

  // Still connecting to Liveblocks
  if (!self) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-gray-100 flex justify-center items-center h-full">
      <div className="flex flex-col drop-shadow-xl">
        <div className="bg-white border-b flex justify-end rounded-t-lg overflow-hidden">
          <div className="p-6 flex flex-grow">
            <Avatar url={self.info.picture} color={self.info.color} />
            <div className="ml-3">
              <div className="font-semibold">You</div>
              <SelectInstrument onInstrumentChange={handleInstrumentChange} />
            </div>
          </div>
          {formatOthers().reverse().map(({ picture, name, color, instrument, id }) => (
            <motion.div className="p-6 flex opacity-0" key={id} animate={{ y: [-100, 0], opacity: [0, 1] }}>
              <Avatar url={picture} color={color} />
              <div className="ml-3">
                <div className="font-semibold">{name}</div>
                <div>{capitalize(instrument)}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <LivePiano
          activeNotes={activeNotes}
          onPlayNote={handlePlayNote}
          onStopNote={handleStopNote}
          defaultInstrument={defaultInstrument}
          showLetters={true}
        />
      </div>
    </div>
  )
}

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
        defaultValue={defaultInstrument}
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
        className="h-12 w-12 rounded-full"
        src={url}
        alt=""
      />
      <span style={{ backgroundColor: color }} className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white" />
    </span>
  )
}

function capitalize (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

import { RoomProvider, useMyPresence, useOthers, useSelf } from '@liveblocks/react'
import LivePiano, { instrumentNames } from '../components/LivePiano'
import { ChangeEvent, useEffect, useState } from 'react'

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
        <div className="bg-white border-b flex justify-end rounded-t-lg">

          <div className="p-6 flex flex-grow">
            <Avatar url={self.info.picture} color={self.info.color} />
            <div className="ml-3">
              <div className="font-semibold">You</div>
              <SelectInstrument onInstrumentChange={handleInstrumentChange} />
            </div>
          </div>

          {formatOthers().map(({ picture, name, color, instrument }) => (
            <div className="p-6 flex">
              <Avatar url={picture} color={color} />
              <div className="ml-3">
                <div className="font-semibold">{name}</div>
                <div>{capitalize(instrument)}</div>
              </div>
            </div>
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

function SelectInstrument ({ onInstrumentChange }: { onInstrumentChange: (e: ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <select onChange={onInstrumentChange} defaultValue={defaultInstrument} className="outline-0 rounded-sm hover:bg-gray-100 focus:ring-2 cursor-pointer mt-0.5 appearance-none w-full">
      {instrumentNames.map(instrument => (
        <option key={instrument} value={instrument}>
          {capitalize(instrument)}
        </option>
      ))}
    </select>
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

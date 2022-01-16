import { RoomProvider, useMyPresence, useOthers, useSelf } from '@liveblocks/react'
import LivePiano from '../components/LivePiano'
import { useEffect, useState } from 'react'

export default function Root () {
  return (
    <RoomProvider id="example-live-piano">
      <PianoDemo />
    </RoomProvider>
  )
}

type NotePresence = {
  notes: number[]
}

function PianoDemo () {
  const [activeNotes, setActiveNotes] = useState<number[]>([])
  const [myNotes, updateMyNotes] = useMyPresence<NotePresence>()
  const othersNotes = useOthers<NotePresence>()

  // Flatten all others notes to single array e.g. [45, 48, 49]
  const flattenOthersNotes = () => {
    return othersNotes.toArray().reduce((acc: any, { presence }) => {
      // Do nothing if presence and presence.notes are not set for this remote user
      if (!presence?.notes) {
        return acc
      }

      return [...acc, ...presence.notes]
    }, [])
  }

  // Set initial value
  useEffect(() => {
    updateMyNotes({ notes: [] })
  }, [])

  // Update current notes being played when another user plays a note
  useEffect(() => {
    if (myNotes.notes && othersNotes.count) {
      setActiveNotes([...flattenOthersNotes(), ...myNotes.notes])
    }
  }, [othersNotes])

  // When local user plays a note, add note, update presence and active notes
  function handlePlayNote (note: number) {
    const mine = [...myNotes.notes, note]
    updateMyNotes({ notes: mine })
    setActiveNotes([...flattenOthersNotes(), ...mine])
  }

  // When local user releases a note, remove note, update presence and active notes
  function handleStopNote (note: number) {
    const mine = myNotes.notes.filter(n => n !== note)
    updateMyNotes({ notes: mine })
    setActiveNotes([...flattenOthersNotes(), ...mine])
  }

  return (
    <main>
      <LivePiano
        onPlayNote={handlePlayNote}
        onStopNote={handleStopNote}
        activeNotes={activeNotes}
        showLetters={true}
      />
    </main>
  )
}

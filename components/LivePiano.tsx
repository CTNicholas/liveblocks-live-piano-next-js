import { KeyboardShortcuts, MidiNumbers, Piano } from 'react-piano'
import 'react-piano/dist/styles.css'
import { useEffect, useState } from 'react'
import SoundfontProvider from './SoundfontProvider'
import { useMyPresence, useOthers } from '@liveblocks/react'

const instruments = [
  'acoustic_grand_piano',
  'marimba',
  'acoustic_guitar_nylon',
  'muted_trumpet'
]

const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net'

const noteRange = {
  first: MidiNumbers.fromNote('c3'),
  last: MidiNumbers.fromNote('e4')
}

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
})

const width = 500

type NotePresence = {
  notes: number[]
}

export default function LivePiano () {
  const [audioContext, setAudioContext] = useState<AudioContext>()
  const [myNotes, updateMyNotes] = useMyPresence<NotePresence>()
  const othersNotes = useOthers<NotePresence>()
  const [activeNotes, setActiveNotes] = useState<number[]>([])

  useEffect(() => {
    setAudioContext(new window.AudioContext())
    updateMyNotes({ notes: [] })
    console.log('NOTES', myNotes)
  }, [])

  useEffect(() => {
    if (myNotes.notes && othersNotes.count) {
      const theirs = othersNotes.toArray()
        .reduce((acc: any, { presence }) => {
          if (!presence?.notes) {
            return acc
          }
          return [...acc, ...presence.notes]
        }, [])
      console.log('NOTES', myNotes)
      setActiveNotes([...theirs, ...myNotes.notes])
    }
  }, [othersNotes])

  function handlePlayNote (note: number) {
    const mine = [...myNotes.notes, note]
    //console.log('othersNotes', othersNotes.map(x => x), othersNotes.count)
    console.log('others', othersNotes.toArray())
    //const theirs = othersNotes.toArray()
    //  .reduce((acc: [], other) => [...acc, ...other.presence.notes], [])
    //console.log('theirs', theirs)

    //console.log('START', mine)
    updateMyNotes({ notes: mine })
    setActiveNotes([...mine])//[...othersNotes.notes, ...mine])
  }

  function handleStopNote (note: number) {
    const mine = myNotes.notes.filter(n => n !== note)
    //console.log('STOP', mine)
    updateMyNotes({ notes: mine })
    setActiveNotes([...mine])//[...othersNotes, ...mine])
  }

  if (!audioContext) {
    return <div>Loading...</div>
  }

  return (
    <div className="relative">
      <div className="pointer-events-none">
        <SoundfontProvider
          instrumentName="acoustic_grand_piano"
          audioContext={audioContext}
          hostname={soundfontHostname}
          render={({ isLoading, playNote, stopNote }: { isLoading: boolean, playNote: () => {}, stopNote: () => {}}) => (
            <Piano
              activeNotes={activeNotes}
              noteRange={noteRange}
              width={width}
              playNote={playNote}
              stopNote={stopNote}
              disabled={isLoading}
            />
          )}
        />
      </div>
      <div className="absolute inset-0 opacity-50">
        <Piano
          noteRange={noteRange}
          width={width}
          playNote={() => {}}
          stopNote={() => {}}
          onPlayNoteInput={handlePlayNote}
          onStopNoteInput={handleStopNote}
          keyboardShortcuts={keyboardShortcuts}
        />
      </div>
    </div>
  )
}

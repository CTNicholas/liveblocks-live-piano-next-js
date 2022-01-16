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

type LivePianoProps = {
  onPlayNote: (note: number) => void
  onStopNote: (note: number) => void
  activeNotes: number[]
  showLetters: boolean
}

export default function LivePiano ({
  onPlayNote = (note: number) => {},
  onStopNote = (note: number) => {},
  activeNotes = [],
  showLetters = false
}: LivePianoProps) {
  const [audioContext, setAudioContext] = useState<AudioContext>()

  useEffect(() => {
    setAudioContext(new window.AudioContext())
  }, [])

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
              keyboardShortcuts={showLetters ? keyboardShortcuts : null}
            />
          )}
        />
      </div>
      <div className="absolute inset-0 opacity-0">
        <Piano
          noteRange={noteRange}
          width={width}
          playNote={() => {}}
          stopNote={() => {}}
          onPlayNoteInput={onPlayNote}
          onStopNoteInput={onStopNote}
          keyboardShortcuts={keyboardShortcuts}
        />
      </div>
    </div>
  )
}

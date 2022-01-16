import { KeyboardShortcuts, MidiNumbers, Piano } from 'react-piano'
import 'react-piano/dist/styles.css'
import { useEffect, useState } from 'react'
import SoundfontProvider from './SoundfontProvider'
import { NotePresence } from '../types'

const instruments: { [name: string]: string } = {
  piano: 'acoustic_grand_piano',
  marimba: 'marimba',
  guitar: 'acoustic_guitar_nylon',
  trumpet: 'muted_trumpet'
}

const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net'

const noteRange = {
  first: MidiNumbers.fromNote('c2'), //c3
  last: MidiNumbers.fromNote('e4')
}

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
})

const width = 1000

type LivePianoProps = {
  activeNotes: NotePresence[]
  onPlayNote: (note: number) => void
  onStopNote: (note: number) => void
  showLetters: boolean
  defaultInstrument: string
}

export default function LivePiano ({
  onPlayNote = () => {},
  onStopNote = () => {},
  activeNotes = [], // [0] is always local user
  showLetters = false,
  defaultInstrument = 'piano'
}: LivePianoProps) {
  const [audioContext, setAudioContext] = useState<AudioContext>()

  useEffect(() => {
    setAudioContext(new window.AudioContext())
  }, [])

  if (!audioContext || !activeNotes.length) {
    return <div>Loading...</div>
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 opacity-0">



        {activeNotes.map(({ notes, instrument = defaultInstrument, id }) => (
          <SoundfontProvider
            key={id || 0}
            instrumentName={instruments[instrument]}
            audioContext={audioContext}
            hostname={soundfontHostname}
            render={({ isLoading, playNote, stopNote }: { isLoading: boolean, playNote: () => {}, stopNote: () => {}}) => {
              return (
                <Piano
                  activeNotes={notes}
                  noteRange={noteRange}
                  width={width}
                  playNote={playNote}
                  stopNote={stopNote}
                  disabled={isLoading}
                  keyboardShortcuts={showLetters ? keyboardShortcuts : null}
                />
              )
            }}
          />
        )
        )}

      </div>
      <div className="">
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

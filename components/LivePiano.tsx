import { KeyboardShortcuts, MidiNumbers, Piano } from './react-piano-custom'
import 'react-piano/dist/styles.css'
import { useEffect, useState } from 'react'
import SoundfontProvider from './SoundfontProvider'
import { NotePresence } from '../types'
import { motion } from 'framer-motion'

/*
Double tap on mouse makes it zoom in
 */

const instruments: { [name: string]: string } = {
  piano: 'acoustic_grand_piano',
  fiddle: 'fiddle',
  choir: 'choir_aahs',
  organ: 'reed_organ', // drawbar_organ
  guitar: 'electric_guitar_clean', // distortion_guitar
  synth: 'lead_2_sawtooth',
  steelpan: 'steel_drums',
  marimba: 'marimba',
  trumpet: 'muted_trumpet',
  piccolo: 'piccolo',
}
export const instrumentNames = Object.keys(instruments)

const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net'

const noteRange = {
  first: MidiNumbers.fromNote('c3'), //c3
  last: MidiNumbers.fromNote('b4') // e4
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
  const [keyColors, setKeyColors] = useState<{ [key: number]: string }>({})
  const [flatNotes, setFlatNotes] = useState<number[]>([])
  const [currentInstrument, setCurrentInstrument] = useState<string>(defaultInstrument)
  const [loadingInstrument, setLoadingInstrument] = useState<boolean>(false)

  useEffect(() => {
    setAudioContext(new AudioContext())
  }, [])

  useEffect(() => {
    const cols: { [note: number]: string } = {}
    activeNotes.forEach(active => {
      active.notes.forEach(note => {
        if (active.color) {
          cols[note] = active.color
        }
      })
    })
    setKeyColors(cols)

    setFlatNotes(activeNotes.reduce((acc: any, active: any) => [...acc, ...active.notes], []))

    if (activeNotes[0].instrument !== currentInstrument) {
      setLoadingInstrument(true)
      setTimeout(() => setLoadingInstrument(false), 800)
      setCurrentInstrument(activeNotes[0].instrument)
    }
  }, [activeNotes])

  if (!audioContext || !Object.keys(activeNotes).length) {
    return <div>Loading...</div>
  }

  return (
    <div className="relative h-auto" style={{ touchAction: 'manipulation' }}>
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
                />
              )
            }}
          />
        )
        )}
      </div>
      <div className="opacity-0 absolute inset-0">
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
      <div className="pointer-events-none">
        <Piano
          activeNotes={flatNotes}
          keyColors={keyColors}
          noteRange={noteRange}
          width={width}
          playNote={() => {}}
          stopNote={() => {}}
          onPlayNoteInput={onPlayNote}
          onStopNoteInput={onStopNote}
        />
      </div>

      <motion.div animate={loadingInstrument ? { opacity: 1 } : { opacity: 0, pointerEvents: 'none' }} className="absolute inset-0 flex items-center justify-center bg-white z-20 rounded-b-lg">
        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </motion.div>

    </div>
  )
}

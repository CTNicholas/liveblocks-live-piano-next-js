import { KeyboardShortcuts, MidiNumbers, Piano } from './react-piano-custom'
import 'react-piano/dist/styles.css'
import { useEffect, useState } from 'react'
import SoundfontProvider from './SoundfontProvider'
import { NotePresence } from '../types'
import { motion } from 'framer-motion'

const instruments: { [name: string]: string } = {
  piano: 'acoustic_grand_piano',
  organ: 'reed_organ', // drawbar_organ
  synth: 'lead_2_sawtooth',
  guitar: 'electric_guitar_clean', // distortion_guitar
  fiddle: 'fiddle',
  steelpan: 'steel_drums',
  marimba: 'marimba',
  trumpet: 'muted_trumpet',
  piccolo: 'piccolo',
  choir: 'choir_aahs',
}
export const instrumentNames = Object.keys(instruments)

const SOUNDFONT_LOCATION = '/assets/instruments'

const NOTE_RANGE = {
  mobile: {
    first: MidiNumbers.fromNote('c3'),
    last: MidiNumbers.fromNote('a4')
  },
  desktop: {
    first: MidiNumbers.fromNote('c3'),
    last: MidiNumbers.fromNote('a5')
  }
}

const KEYBOARD_SHORTCUTS = {
  mobile: KeyboardShortcuts.create({
    firstNote: NOTE_RANGE.mobile.first,
    lastNote: NOTE_RANGE.mobile.last,
    keyboardConfig: KeyboardShortcuts.BOTTOM_ROW
  }),
  desktop: KeyboardShortcuts.create({
    firstNote: NOTE_RANGE.desktop.first,
    lastNote: NOTE_RANGE.desktop.last,
    keyboardConfig: [...KeyboardShortcuts.QWERTY_ROW, ...KeyboardShortcuts.BOTTOM_ROW]
  })
}

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
  const [loadingInstrument, setLoadingInstrument] = useState<boolean>(false)

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: window ? window.innerWidth : 1000,
    height: window ? window.innerHeight : 400,
  })
  const [pianoWidth, setPianoWidth] = useState<number>(1000)

  const [keyboardShortcuts, setKeyboardShortcuts] = useState<any>(KEYBOARD_SHORTCUTS.desktop)
  const [noteRange, setNoteRange] = useState<any>(NOTE_RANGE.desktop)


  useEffect(() => {
    // @ts-ignore
    const context = window.AudioContext ? new window.AudioContext() : new window.webkitAudioContext()
    setAudioContext(context)

    const handler = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
    }
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
  }, [activeNotes])

  useEffect(() => {
    const { width } = dimensions
    const device = width < 1024 ? 'mobile' : 'desktop'
    setNoteRange(NOTE_RANGE[device])
    setKeyboardShortcuts(KEYBOARD_SHORTCUTS[device])

    if (width < 1250) {
      setPianoWidth(width - 20)
    } else if (width < 1550) {
      setPianoWidth(1200)
    } else {
      setPianoWidth(1500)
    }
  }, [dimensions])

  if (!audioContext || !Object.keys(activeNotes).length) {
    return <div>Loading...</div>
  }

  return (
    <div className="relative h-auto" style={{ touchAction: 'manipulation' }}>
      <div className="pointer-events-none absolute inset-0 opacity-0">
        {activeNotes.map(({ notes, instrument = defaultInstrument, id }, index) => (
            <SoundfontProvider
              key={id || 0}
              instrumentName={instruments[instrument]}
              audioContext={audioContext}
              hostname={SOUNDFONT_LOCATION}
              render={({ isLoading, playNote, stopNote }: { isLoading: boolean, playNote: () => {}, stopNote: () => {}}) => {
                if (index === 0 && isLoading !== loadingInstrument) {
                  setTimeout(() => setLoadingInstrument(!loadingInstrument))
                }
                return (
                  <Piano
                    onlyAudio={true}
                    activeNotes={notes}
                    noteRange={noteRange}
                    width={pianoWidth}
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
          width={pianoWidth}
          playNote={() => {}}
          stopNote={() => {}}
          onPlayNoteInput={onPlayNote}
          onStopNoteInput={onStopNote}
          keyboardShortcuts={keyboardShortcuts}
        />
      </div>
      <div className="pointer-events-none">
        <Piano
          glissando={false}
          activeNotes={flatNotes}
          keyColors={keyColors}
          noteRange={noteRange}
          width={pianoWidth}
          playNote={() => {}}
          stopNote={() => {}}
        />
      </div>
      <motion.div animate={loadingInstrument ? { opacity: 0.7 } : { opacity: 0, pointerEvents: 'none' }} className="absolute inset-0 flex items-center justify-center bg-white z-20 rounded-b-lg">
        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </motion.div>
    </div>
  )
}

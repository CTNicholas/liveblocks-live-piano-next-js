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

const soundfontHostname = '/assets/instruments' // 'https://d1pzp51pvbm36p.cloudfront.net'

const mobileNoteRange = {
  first: MidiNumbers.fromNote('c3'), //c3, c3
  last: MidiNumbers.fromNote('a4') // e4, b4
}

const mobileKeyboardShortcuts = KeyboardShortcuts.create({
  firstNote: mobileNoteRange.first,
  lastNote: mobileNoteRange.last,
  keyboardConfig: KeyboardShortcuts.BOTTOM_ROW
})

const desktopNoteRange = {
  first: MidiNumbers.fromNote('c3'), //c3, c3
  last: MidiNumbers.fromNote('a5') // e4, b4
}

const desktopKeyboardShortcuts = KeyboardShortcuts.create({
  firstNote: desktopNoteRange.first,
  lastNote: desktopNoteRange.last,
  keyboardConfig: [...KeyboardShortcuts.QWERTY_ROW, ...KeyboardShortcuts.BOTTOM_ROW]
})

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
    width: window ? window.innerWidth : Infinity,
    height: window ? window.innerHeight : Infinity,
  })
  const [pianoWidth, setPianoWidth] = useState<number>(1000)
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<any>(desktopKeyboardShortcuts)
  const [noteRange, setNoteRange] = useState<any>(desktopNoteRange)

  useEffect(() => {
    // @ts-ignore
    setAudioContext(new window.AudioContext() || window.webkitAudioContext)

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
    const { width } = dimensions

    if (width < 1024) {
      setNoteRange(mobileNoteRange)
      setKeyboardShortcuts(mobileKeyboardShortcuts)
    } else {

      setNoteRange(desktopNoteRange)
      setKeyboardShortcuts(desktopKeyboardShortcuts)
    }

    if (width < 550) {
      setPianoWidth(width - 20)
    }
    else if (width < 1250) {
      setPianoWidth(width - 20)
    } else if (width < 1550) {
      setPianoWidth(1200)
    } else {
      setPianoWidth(1500)
    }

    console.log(keyboardShortcuts)
  }, [dimensions])

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

  /*
  if (intro) {
    return (
      <div className="relative">
        <Piano
          activeNotes={[55]}
          keyColors={keyColors}
          noteRange={noteRange}
          width={width}
          playNote={() => {}}
          stopNote={() => {}}
        />
        <button onClick={() => setIntro(false)} className="block w-full absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 z-20">
          <span>Click to begin</span>
        </button>
      </div>
    )
  }
  */

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
            hostname={soundfontHostname}
            render={({ isLoading, playNote, stopNote }: { isLoading: boolean, playNote: () => {}, stopNote: () => {}}) => {
              if (index === 0 && isLoading !== loadingInstrument) {
                setLoadingInstrument(!loadingInstrument)
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

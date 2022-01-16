import { RoomProvider, useOthers, useSelf } from "@liveblocks/react";
import LivePiano from '../components/LivePiano'

export default function Root () {
  return (
    <RoomProvider id="example-live-piano">
      <Demo />
    </RoomProvider>
  )
}

function Demo () {
  return (
    <main>
      <LivePiano />
    </main>
  )
}

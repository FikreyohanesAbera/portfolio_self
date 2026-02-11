import { useEffect, useMemo, useReducer, useState } from "react"
import { Canvas } from "@react-three/fiber"

import styles from "./ImmersivePage.module.css"

import { buildWorldGraph } from "./engine/worldGraph"
import { createInitialModel, reducer } from "./engine/stateMachine"
import { useInputs } from "./engine/useInputs"
import { evaluatePerf } from "./engine/perf"
import type { StationId, TravelPlan } from "./engine/types"

import SceneRoot3D from "./scenes/SceneRoot3D"
import ImmersiveOverlay from "./ui/ImmersiveOverlay"

type Props = {
  reducedMotion: boolean
}

export default function ImmersivePage({ reducedMotion }: Props) {
  const graph = useMemo(() => buildWorldGraph(), [])
  const [model, dispatch] = useReducer(reducer, undefined, createInitialModel)

  const [impulseAccum, setImpulseAccum] = useState(0)
  const [perfHint, setPerfHint] = useState<{ show: boolean; avgMs: number }>({ show: false, avgMs: 0 })

  useEffect(() => {
    dispatch({ type: "SET_REDUCED_MOTION", value: reducedMotion })
  }, [reducedMotion])

  // Input handling: scroll wheel and keyboard
  useInputs({
    graph,
    model,
    dispatch,
    onImpulse: (impulse) => setImpulseAccum((v) => v + impulse)
  })

  function requestTravel(from: StationId, to: StationId) {
    const direct = graph.edges.find((e) => e.from === from && e.to === to)
    if (!direct) {
      // Make the failure visible during development rather than “doing nothing”.
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("No direct rail edge found", { from, to })
      }
      return
    }
    const plan: TravelPlan = { from, to, edgeId: direct.id }
    dispatch({ type: "REQUEST_TRAVEL", plan })
  }

  return (
    <div className={styles.shell}>
      <Canvas
        className={styles.canvas}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <SceneRoot3D
          graph={graph}
          model={model}
          dispatch={dispatch}
          impulseAccum={impulseAccum}
          setImpulseAccum={setImpulseAccum}
          onPerfSample={(samples) => {
            const { avgFrameMs, recommendedMinimal } = evaluatePerf(samples)
            if (recommendedMinimal) setPerfHint({ show: true, avgMs: avgFrameMs })
          }}
        />
      </Canvas>

      {/* Two dimensional overlay layer above the canvas */}
      <div className={styles.overlay}>
        <ImmersiveOverlay
          graph={graph}
          model={model}
          dispatch={dispatch}
          perfHint={perfHint}
          onSelect={(to) => requestTravel(model.dockedAt, to)}
        />
      </div>
    </div>
  )
}

import React, { useMemo } from "react"
import styles from "./ImmersiveOverlay.module.css"
import { buildWorldGraph } from "../engine/worldGraph"
import { ImmersiveModel, StationId } from "../engine/types"
import MapOverlay from "./MapOverlay"
import HologramPanel from "./HologramPanel"

type Props = {
  graph: ReturnType<typeof buildWorldGraph>
  model: ImmersiveModel
  dispatch: React.Dispatch<any>
  requestTravel: (from: StationId, to: StationId) => void
  perfHint: { show: boolean; avgMs: number }
}

export default function ImmersiveOverlay({ graph, model, dispatch, requestTravel, perfHint }: Props) {
  const currentThemeCss = useMemo(() => {
    if (model.dockedAt.startsWith("project:")) {
      const projId = model.dockedAt.split(":")[1]
      const proj = requireProjectTheme(projId)
      return { backgroundImage: proj.backgroundGradient } as React.CSSProperties
    }
    return {
      backgroundImage:
        "radial-gradient(1200px 900px at 30% 10%, rgba(143,178,255,0.18) 0%, rgba(7,10,16,1) 55%, rgba(5,7,13,1) 100%)"
    } as React.CSSProperties
  }, [model.dockedAt])

  return (
    <div className={styles.uiLayer} style={currentThemeCss}>
        {/* <QuickNav
            graph={graph}
            currentFrom={model.dockedAt}
            onGo={(to) => requestTravel(model.dockedAt, to)}
            /> */}
      <MapOverlay
        graph={graph}
        open={model.state === "MAP"}
        current={model.plan?.to ?? model.dockedAt}
        onClose={() => dispatch({ type: "CLOSE_MAP" })}
        onSelect={(to) => requestTravel(model.dockedAt, to)}
      />

      <HologramPanel
        model={model}
        onOpenMap={() => dispatch({ type: "OPEN_MAP" })}
        onSkip={() => dispatch({ type: "SKIP_TRAVEL_TO_DOCK" })}
        onExpress={() => dispatch({ type: "TOGGLE_EXPRESS" })}
        onDepart={() => dispatch({ type: "DEPART" })}
        onSelectHub={(to) => requestTravel(model.dockedAt, to)}
      />

      {import.meta.env.DEV ? (
        <div className={styles.debug}>
          <div><strong>State</strong>: {model.state}</div>
          <div><strong>Docked</strong>: {model.dockedAt}</div>
          <div><strong>Progress</strong>: {model.motion.progressT.toFixed(3)}</div>
          <div><strong>Velocity</strong>: {model.motion.velocity.toFixed(3)}</div>
        </div>
      ) : null}

      {perfHint.show ? (
        <div className={styles.perfHint} role="status">
          Performance looks limited (average frame time {perfHint.avgMs.toFixed(1)} milliseconds).
          Consider switching to minimal mode for a smoother experience.
          <a className={styles.perfLink} href="/minimal">Go to minimal mode</a>
        </div>
      ) : null}
    </div>
  )
}

function requireProjectTheme(projectId: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { projects } = require("../../../content/projects") as typeof import("../../../content/projects")
  const proj = projects.find((p) => p.id === projectId)
  return proj?.theme ?? {
    backgroundGradient:
      "radial-gradient(1200px 900px at 30% 10%, rgba(143,178,255,0.18) 0%, rgba(7,10,16,1) 55%, rgba(5,7,13,1) 100%)"
  }
}

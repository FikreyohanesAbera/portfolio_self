import type { CSSProperties } from "react"
import { useMemo } from "react"

import styles from "./ImmersiveOverlay.module.css"
import type { WorldGraph } from "../engine/worldGraph"
import type { ImmersiveModel, StationId } from "../engine/types"

import MapOverlay from "./MapOverlay"
import HologramPanel from "./HologramPanel"

type Props = {
  graph: WorldGraph
  model: ImmersiveModel
  dispatch: React.Dispatch<any>
  perfHint: { show: boolean; avgMs: number }
  onSelect: (to: StationId) => void
}

export default function ImmersiveOverlay({ graph, model, dispatch, perfHint, onSelect }: Props) {
  // Theme should style the panel surface only, not the whole screen.
  const panelTheme = useMemo(() => {
    if (model.dockedAt.startsWith("project:")) {
      const id = model.dockedAt.split(":")[1]
      const t = requireProjectTheme(id)
      return { backgroundImage: t.backgroundGradient } as CSSProperties
    }
    return {
      backgroundImage:
        "radial-gradient(1200px 900px at 30% 10%, rgba(143,178,255,0.14) 0%, rgba(10,12,18,0.92) 62%, rgba(7,10,16,0.96) 100%)"
    } as CSSProperties
  }, [model.dockedAt])

  return (
    <div className={styles.uiLayer}>
      <MapOverlay
        graph={graph}
        open={model.state === "MAP"}
        current={model.plan?.to ?? model.dockedAt}
        onClose={() => dispatch({ type: "CLOSE_MAP" })}
        onSelect={onSelect}
      />
        <HologramPanel
        model={model}
        themeStyle={panelTheme}
        onOpenMap={() => dispatch({ type: "OPEN_MAP" })}
        onSkip={() => dispatch({ type: "SKIP_TRAVEL_TO_DOCK" })}
        onExpress={() => dispatch({ type: "TOGGLE_EXPRESS" })}
        onDepart={() => dispatch({ type: "DEPART" })}
        onSelectHub={onSelect}
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
      "radial-gradient(1200px 900px at 30% 10%, rgba(143,178,255,0.14) 0%, rgba(10,12,18,0.92) 62%, rgba(7,10,16,0.96) 100%)"
  }
}

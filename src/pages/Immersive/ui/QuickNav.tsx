import type { StationId } from "../engine/types"
import type { WorldGraph } from "../engine/worldGraph"
import styles from "./QuickNav.module.css"

type Props = {
  graph: WorldGraph
  currentFrom: StationId
  onGo: (to: StationId) => void
}

export default function QuickNav({ graph, currentFrom, onGo }: Props) {
  // Always available, but you can also choose to render only in HUB.
  const items: { id: StationId; label: string; hint: string }[] = [
    { id: "education", label: "Education district", hint: "Foundation and coursework" },
    { id: "work", label: "Work district", hint: "Impact and metrics" },
    { id: "projects", label: "Projects district", hint: "Case studies and links" },
    { id: "tools", label: "Tools district", hint: "Stack and infrastructure" }
  ]

  return (
    <div className={styles.wrap} role="navigation" aria-label="District navigation">
      <div className={styles.title}>District navigation</div>

      <div className={styles.grid}>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={styles.btn}
            onClick={() => onGo(it.id)}
          >
            <div className={styles.btnLabel}>{it.label}</div>
            <div className={styles.btnHint}>{it.hint}</div>
          </button>
        ))}
      </div>

      <div className={styles.note}>
        Tip: Use the map for direct jumps. During travel, the scroll wheel controls pace.
      </div>
    </div>
  )
}

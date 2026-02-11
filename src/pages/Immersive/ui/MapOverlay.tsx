import styles from "./MapOverlay.module.css"
import { StationId, WorldGraph } from "../engine/types"

type Props = {
  graph: WorldGraph
  open: boolean
  current: StationId
  onClose: () => void
  onSelect: (id: StationId) => void
}

export default function MapOverlay({ graph, open, current, onClose, onSelect }: Props) {
  if (!open) return null

  return (
    <div className={styles.backdrop} role="dialog" aria-label="Map overlay">
      <div className={styles.panel}>
        <div className={styles.top}>
          <div className={styles.title}>Transit map</div>
          <button className={styles.close} onClick={onClose}>
            Close
          </button>
        </div>

        <svg className={styles.map} viewBox="-24 -18 48 40" aria-label="Schematic transit map">
          {/* Edges */}
          {graph.edges.map((e) => {
            const a = graph.nodes.find((n) => n.id === e.from)!
            const b = graph.nodes.find((n) => n.id === e.to)!
            return (
              <path
                key={e.id}
                d={`M ${a.pos.x} ${a.pos.z} Q ${e.control.x} ${e.control.z} ${b.pos.x} ${b.pos.z}`}
                className={styles.edge}
              />
            )
          })}

          {/* Nodes */}
          {graph.nodes.map((n) => {
            const isCurrent = n.id === current
            return (
              <g
                key={n.id}
                className={styles.node}
                transform={`translate(${n.pos.x}, ${n.pos.z})`}
              >
                <circle className={isCurrent ? styles.nodeCurrent : styles.nodeDot} r={n.kind === "hub" ? 1.2 : 0.9} />
                <foreignObject x={1.6} y={-1.4} width="18" height="4">
                  <div className={styles.label}>{n.kind === "project" ? "Project" : n.label}</div>
                </foreignObject>

                <rect
                  className={styles.hit}
                  x={-2.2}
                  y={-2.2}
                  width={4.4}
                  height={4.4}
                  rx={1.2}
                  onClick={() => onSelect(n.id)}
                />
              </g>
            )
          })}
        </svg>

        <div className={styles.legend}>
          Click a node to travel there. Travel is guided; scroll controls speed during travel.
        </div>
      </div>
    </div>
  )
}

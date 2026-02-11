import React from "react"
import styles from "./MapOverlay.module.css"
import type { StationId, WorldGraph } from "../engine/types"
import { findNode } from "../engine/worldGraph"

type Props = {
  graph: WorldGraph
  open: boolean
  current: StationId
  onClose: () => void
  onSelect: (id: StationId) => void
}

export default function MapOverlay({ graph, open, current, onClose, onSelect }: Props) {
  if (!open) return null

  function handleBackdropMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    // Click outside closes, click inside does not.
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-label="Transit map"
      aria-modal="true"
      onMouseDown={handleBackdropMouseDown}
    >
      <div className={styles.panel} role="document">
        <div className={styles.top}>
          <div className={styles.title}>Transit map</div>
          <button className={styles.close} onClick={onClose} type="button">
            Close
          </button>
        </div>

        <svg className={styles.map} viewBox="-24 -18 48 40" aria-label="Schematic transit map">
          {/* Edges: cubic paths (C1/C2) */}
          {graph.edges.map((e) => {
            const a = findNode(graph, e.from)
            const b = findNode(graph, e.to)
            return (
              <path
                key={e.id}
                d={`M ${a.pos.x} ${a.pos.z} C ${e.c1.x} ${e.c1.z}, ${e.c2.x} ${e.c2.z}, ${b.pos.x} ${b.pos.z}`}
                className={styles.edge}
              />
            )
          })}

          {/* Nodes: put HIT AREA LAST so it is always on top */}
          {graph.nodes.map((n) => {
            const isCurrent = n.id === current
            const r = n.kind === "hub" ? 1.2 : 0.9

            return (
              <g
                key={n.id}
                className={styles.node}
                transform={`translate(${n.pos.x}, ${n.pos.z})`}
              >
                {/* Visual dot */}
                <circle
                  className={isCurrent ? styles.nodeCurrent : styles.nodeDot}
                  r={r}
                />

                {/* Label (do not steal pointer events) */}
                <text className={styles.label} x={r + 0.9} y={0.35}>
                  {n.kind === "project" ? n.label : n.label}
                </text>

                {/* Hit target (on top, always clickable) */}
                <rect
                  className={styles.hit}
                  x={-2.4}
                  y={-2.4}
                  width={4.8}
                  height={4.8}
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

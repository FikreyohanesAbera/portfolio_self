import React from "react"
import { useMemo } from "react"
import { Vector3, Quaternion, Euler } from "three"
import type { ImmersiveModel, WorldGraph } from "../engine/types"
import { findNode } from "../engine/worldGraph"
import { evalEdgePosition } from "../engine/curve"

type Props = {
  graph: WorldGraph
  model: ImmersiveModel
}

export default function Trolley({ graph, model }: Props) {
  const { pos, rotY } = useMemo(() => {
    // If not traveling, sit at the docked station and face a stable direction.
    if (!model.plan) {
      const n = findNode(graph, model.dockedAt)
      return {
        pos: new Vector3(n.pos.x, 0.32, n.pos.z),
        rotY: 0
      }
    }

    const from = findNode(graph, model.plan.from)
    const to = findNode(graph, model.plan.to)
    const e = graph.edges.find((x) => x.id === model.plan!.edgeId)
    if (!e) {
      const n = findNode(graph, model.dockedAt)
      return { pos: new Vector3(n.pos.x, 0.32, n.pos.z), rotY: 0 }
    }

    const t = model.motion.progressT
    const p = evalEdgePosition(e, from, to, t)

    // Look slightly ahead to compute facing direction.
    const tAhead = clamp01(t + 0.02)
    const p2 = evalEdgePosition(e, from, to, tAhead)

    const dir = new Vector3(p2.x - p.x, 0, p2.z - p.z)
    const dirLen = dir.length()

    // If we are extremely close and dir is tiny, keep previous-ish orientation.
    const rotY = dirLen > 1e-5 ? Math.atan2(dir.x, dir.z) : 0

    return {
      pos: new Vector3(p.x, 0.32, p.z),
      rotY
    }
  }, [graph, model.dockedAt, model.motion.progressT, model.plan])

  return (
    <group position={pos.toArray()} rotation={[0, rotY, 0]}>
      {/* Trolley body */}
      <mesh>
        <boxGeometry args={[0.9, 0.36, 1.25]} />
        <meshStandardMaterial color="#0e1526" metalness={0.35} roughness={0.45} />
      </mesh>

      {/* Glass canopy */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.82, 0.26, 1.05]} />
        <meshStandardMaterial
          color="#0a1220"
          metalness={0.1}
          roughness={0.2}
          emissive="#8fb2ff"
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Under glow */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.95, 0.06, 1.3]} />
        <meshStandardMaterial color="#8fb2ff" emissive="#8fb2ff" emissiveIntensity={0.45} />
      </mesh>

      {/* Tiny front marker (helps you see orientation during travel) */}
      <mesh position={[0, 0.08, 0.72]}>
        <boxGeometry args={[0.16, 0.08, 0.08]} />
        <meshStandardMaterial color="#1b2a4a" emissive="#8fb2ff" emissiveIntensity={0.08} />
      </mesh>
    </group>
  )
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

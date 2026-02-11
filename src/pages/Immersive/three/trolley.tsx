import React from "react"
import { useMemo } from "react"
import { Vector3 } from "three"
import { ImmersiveModel, WorldGraph } from "../engine/types"
import { findNode } from "../engine/worldGraph"

type Props = {
  graph: WorldGraph
  model: ImmersiveModel
}

export default function Trolley({ graph, model }: Props) {
  const pos = useMemo(() => {
    if (!model.plan) {
      const hub = findNode(graph, model.dockedAt)
      return new Vector3(hub.pos.x, 0.32, hub.pos.z)
    }

    const from = findNode(graph, model.plan.from)
    const to = findNode(graph, model.plan.to)
    const e = graph.edges.find((x) => x.id === model.plan!.edgeId)!

    const t = model.motion.progressT
    const p = evalQuadratic(from.pos.x, from.pos.z, e.control.x, e.control.z, to.pos.x, to.pos.z, t)
    return new Vector3(p.x, 0.32, p.z)
  }, [graph, model.dockedAt, model.motion.progressT, model.plan])

  return (
    <group position={pos.toArray()}>
      {/* Trolley body */}
      <mesh>
        <boxGeometry args={[0.9, 0.36, 1.25]} />
        <meshStandardMaterial color="#0e1526" metalness={0.35} roughness={0.45} />
      </mesh>

      {/* Glass canopy */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.82, 0.26, 1.05]} />
        <meshStandardMaterial color="#0a1220" metalness={0.1} roughness={0.2} emissive="#8fb2ff" emissiveIntensity={0.12} />
      </mesh>

      {/* Under glow */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.95, 0.06, 1.3]} />
        <meshStandardMaterial color="#8fb2ff" emissive="#8fb2ff" emissiveIntensity={0.45} />
      </mesh>
    </group>
  )
}

function evalQuadratic(x0: number, z0: number, x1: number, z1: number, x2: number, z2: number, t: number) {
  const u = 1 - t
  const x = u * u * x0 + 2 * u * t * x1 + t * t * x2
  const z = u * u * z0 + 2 * u * t * z1 + t * t * z2
  return { x, z }
}

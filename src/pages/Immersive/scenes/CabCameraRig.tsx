import React from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Vector3 } from "three"
import type { WorldGraph, ImmersiveModel } from "../engine/types"
import { evalEdgePosition } from "../engine/curve"

type Props = {
  graph: WorldGraph
  model: ImmersiveModel
  enabled?: boolean
}

// Standing inside trolley: slightly above floor, slightly behind the front.
const CAB_UP = 1.55
const CAB_BACK = 0.25
const LOOK_AHEAD = 2.2

export default function CabCameraRig({ graph, model, enabled = true }: Props) {
  const { camera } = useThree()

  useFrame((_, dt) => {
    if (!enabled) return
    if (!model.plan) return
    if (model.state === "HUB") return

    const from = graph.nodes.find((n) => n.id === model.plan!.from)
    const to = graph.nodes.find((n) => n.id === model.plan!.to)
    const edge = graph.edges.find((e) => e.id === model.plan!.edgeId)
    if (!from || !to || !edge) return

    const t = clamp01(model.motion.progressT)

    // Use your shared curve evaluator (works with any edge path representation).
    const p = evalEdgePosition(edge as any, from as any, to as any, t)
    const p2 = evalEdgePosition(edge as any, from as any, to as any, clamp01(t + 0.01))

    if (!p || !p2) return
    if (typeof p.x !== "number" || typeof p.z !== "number") return
    if (typeof p2.x !== "number" || typeof p2.z !== "number") return

    const forward = new Vector3(p2.x - p.x, 0, p2.z - p.z)
    if (forward.lengthSq() < 1e-10) return
    forward.normalize()

    // Camera position inside the trolley
    const camPos = new Vector3(p.x, CAB_UP, p.z).add(forward.clone().multiplyScalar(-CAB_BACK))

    // Look point ahead along the track
    const lookPos = new Vector3(p.x, CAB_UP * 0.72, p.z).add(forward.clone().multiplyScalar(LOOK_AHEAD))

    const dtSafe = Math.min(dt, 0.05)
    const k = model.reducedMotion ? 0.35 : 1 - Math.pow(0.001, dtSafe)

    camera.position.lerp(camPos, k)
    camera.up.lerp(new Vector3(0, 1, 0), k)
    camera.lookAt(lookPos)
  })

  return null
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

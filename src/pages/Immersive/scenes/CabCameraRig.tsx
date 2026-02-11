import { useFrame, useThree } from "@react-three/fiber"
import { Vector3 } from "three"
import type { WorldGraph } from "../engine/worldGraph"
import type { ImmersiveModel } from "../engine/types"

type Props = {
  graph: WorldGraph
  model: ImmersiveModel
}

// Standing inside trolley: slightly above floor, slightly behind the front.
const CAB_UP = 1.55
const CAB_BACK = 0.25
const LOOK_AHEAD = 2.2

export default function CabCameraRig({ graph, model }: Props) {
  const { camera } = useThree()

  useFrame((_, dt) => {
    if (!model.plan) return

    // In hub, we let OrbitControls own the camera.
    if (model.state === "HUB") return

    const from = graph.nodes.find((n) => n.id === model.plan!.from)
    const to = graph.nodes.find((n) => n.id === model.plan!.to)
    const edge = graph.edges.find((e) => e.id === model.plan!.edgeId)
    if (!from || !to || !edge) return

    const t = model.motion.progressT

    const p = bezierPos(from.pos.x, from.pos.z, edge.control.x, edge.control.z, to.pos.x, to.pos.z, t)
    const f = bezierTangent(from.pos.x, from.pos.z, edge.control.x, edge.control.z, to.pos.x, to.pos.z, t)

    // Forward direction in the XZ plane
    const forward = new Vector3(f.x, 0, f.z).normalize()
    const up = new Vector3(0, 1, 0)

    // Camera position inside the trolley, slightly back from the front.
    const camPos = new Vector3(p.x, CAB_UP, p.z).add(forward.clone().multiplyScalar(-CAB_BACK))

    // Look point ahead along the track.
    const lookPos = new Vector3(p.x, CAB_UP * 0.72, p.z).add(forward.clone().multiplyScalar(LOOK_AHEAD))

    // Smooth motion
    const k = model.reducedMotion ? 0.35 : 1 - Math.pow(0.001, dt)
    camera.position.lerp(camPos, k)
    camera.up.lerp(up, k)
    camera.lookAt(lookPos)
  })

  return null
}

function bezierPos(x0: number, z0: number, x1: number, z1: number, x2: number, z2: number, t: number) {
  const u = 1 - t
  const x = u * u * x0 + 2 * u * t * x1 + t * t * x2
  const z = u * u * z0 + 2 * u * t * z1 + t * t * z2
  return { x, z }
}

function bezierTangent(x0: number, z0: number, x1: number, z1: number, x2: number, z2: number, t: number) {
  // Derivative of quadratic bezier
  const x = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1)
  const z = 2 * (1 - t) * (z1 - z0) + 2 * t * (z2 - z1)
  return { x, z }
}

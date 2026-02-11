import React from "react"
import { useMemo } from "react"
import { CatmullRomCurve3, Vector3 } from "three"
import type { WorldGraph, TravelPlan } from "../engine/types"
import { evalEdgePosition } from "../engine/curve"
import { findNode } from "../engine/worldGraph"

type Props = {
  graph: WorldGraph
  plan: TravelPlan | null
}

export default function Rails({ graph, plan }: Props) {
  const activeId = plan?.edgeId ?? null

  const curves = useMemo(() => {
    return graph.edges.map((e) => {
      const from = findNode(graph, e.from)
      const to = findNode(graph, e.to)

      // Sample the *cubic* curve consistently with trolley/camera.
      // Then we optionally run it through CatmullRom just to smooth spacing slightly.
      const samples: Vector3[] = []
      const N = 80
      for (let i = 0; i <= N; i++) {
        const t = i / N
        const p = evalEdgePosition(e, from, to, t)
        samples.push(new Vector3(p.x, 0, p.z))
      }

      const curve = new CatmullRomCurve3(samples, false, "catmullrom", 0.5)

      return {
        id: e.id,
        curve
      }
    })
  }, [graph])

  return (
    <group>
      {curves.map(({ id, curve }) => (
        <RailLine key={id} curve={curve} active={activeId === id} />
      ))}
    </group>
  )
}

function RailLine({ curve, active }: { curve: CatmullRomCurve3; active: boolean }) {
  const pts = useMemo(() => curve.getPoints(90), [curve])

  const positions = useMemo(() => {
    const arr = new Float32Array(pts.length * 3)
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      arr[i * 3 + 0] = p.x
      arr[i * 3 + 1] = p.y + 0.02
      arr[i * 3 + 2] = p.z
    }
    return arr
  }, [pts])

  const pylonPoints = useMemo(() => pts.filter((_, i) => i % 10 === 0), [pts])

  return (
    <group>
      {/* Rail centerline */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={pts.length}
            itemSize={3}
          />
        </bufferGeometry>

        {/* Subtle highlight for current travel edge */}
        <lineBasicMaterial color={active ? "#93b2ff" : "#2a3b5f"} />
      </line>

      {/* Pylons along the rail */}
      {pylonPoints.map((p, i) => (
        <mesh key={i} position={[p.x, 0.14, p.z]}>
          <cylinderGeometry args={[0.06, 0.07, 0.28, 10]} />
          <meshStandardMaterial
            color={active ? "#101a33" : "#0b1222"}
            roughness={0.9}
            metalness={0.15}
          />
        </mesh>
      ))}
    </group>
  )
}

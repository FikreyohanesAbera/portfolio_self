import { useMemo } from "react"
import { CatmullRomCurve3, Vector3 } from "three"
import { WorldGraph, TravelPlan } from "../engine/types"

type Props = {
  graph: WorldGraph
  plan: TravelPlan | null
}

export default function Rails({ graph }: Props) {
  const curves = useMemo(() => {
    return graph.edges.map((e) => {
      const from = graph.nodes.find((n) => n.id === e.from)!
      const to = graph.nodes.find((n) => n.id === e.to)!
      const points = [
        new Vector3(from.pos.x, 0, from.pos.z),
        new Vector3(e.control.x, 0, e.control.z),
        new Vector3(to.pos.x, 0, to.pos.z)
      ]
      // CatmullRom for smooth rail feel.
      return {
        id: e.id,
        curve: new CatmullRomCurve3(points, false, "catmullrom", 0.5)
      }
    })
  }, [graph.edges, graph.nodes])

  return (
    <group>
      {curves.map(({ id, curve }) => (
        <RailLine key={id} curve={curve} />
      ))}
    </group>
  )
}

function RailLine({ curve }: { curve: CatmullRomCurve3 }) {
  const pts = useMemo(() => curve.getPoints(90), [curve])
  const geom = useMemo(() => {
    // A lightweight “tube” substitute: we draw a thin line plus small pylons.
    // Keeping geometry low.
    return pts
  }, [pts])

  return (
    <group>
      {/* Rail centerline */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(geom.flatMap((p) => [p.x, p.y + 0.02, p.z]))}
            count={geom.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#2a3b5f" />
      </line>

      {/* Pylons along the rail */}
      {pts.filter((_, i) => i % 10 === 0).map((p, i) => (
        <mesh key={i} position={[p.x, 0.14, p.z]}>
          <cylinderGeometry args={[0.06, 0.07, 0.28, 10]} />
          <meshStandardMaterial color="#0b1222" roughness={0.9} metalness={0.15} />
        </mesh>
      ))}
    </group>
  )
}

import { useMemo, useRef } from "react"
import { Color, Vector3 } from "three"
import { useFrame } from "@react-three/fiber"
import styles from "./HubScene.module.css"
import type { StationId } from "../engine/types"
import type { WorldGraph } from "../engine/worldGraph"
import { Text } from "@react-three/drei"

type Props = {
  graph: WorldGraph
  model: { state: string }
  onSelectDistrict: (station: StationId) => void
  onSelectProject: (projectId: string) => void
}

type Marker = {
  id: StationId
  label: string
  pos: Vector3
  color: string
}

export default function HubScene({ graph, model, onSelectDistrict }: Props) {
  const markers = useMemo<Marker[]>(() => {
    const get = (id: StationId) => graph.nodes.find((n) => n.id === id)?.pos ?? new Vector3()
    return [
      { id: "education", label: "Education", pos: get("education"), color: "#b9d5ff" },
      { id: "work", label: "Work", pos: get("work"), color: "#cfe3ff" },
      { id: "projects", label: "Projects", pos: get("projects"), color: "#d6e7ff" },
      { id: "tools", label: "Tools", pos: get("tools"), color: "#bcd9ff" }
    ]
  }, [graph.nodes])

  return (
    <group>
      {/* Existing hub geometry should remain in your file.
          The only important part is adding these markers. */}

      {markers.map((m) => (
        <DistrictMarker
          key={m.id}
          id={m.id}
          label={m.label}
          position={[m.pos.x, 1.06, m.pos.z]}
          color={m.color}
          disabled={model.state === "TRAVEL" || model.state === "DOCKING"}
          onPick={() => onSelectDistrict(m.id)}
        />
      ))}
    </group>
  )
}

function DistrictMarker({
  id,
  label,
  position,
  color,
  disabled,
  onPick
}: {
  id: StationId
  label: string
  position: [number, number, number]
  color: string
  disabled: boolean
  onPick: () => void
}) {
  const ringRef = useRef<THREE.Mesh>(null)
  const base = useMemo(() => new Color(color), [color])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.6 + 0.4 * Math.sin(t * 1.6)
    if (ringRef.current) {
      ;(ringRef.current.material as any).opacity = disabled ? 0.12 : 0.18 + pulse * 0.08
    }
  })

  return (
    <group position={position}>
      {/* Big invisible click target */}
      <mesh
        onPointerDown={(e) => {
          e.stopPropagation()
          if (!disabled) onPick()
        }}
      >
        <cylinderGeometry args={[1.55, 1.55, 0.5, 18]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Visible ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.45, 56]} />
        <meshBasicMaterial
          color={base}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Small pylon */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.7, 18]} />
        <meshStandardMaterial color={"#eaf2ff"} roughness={0.25} metalness={0.05} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.95, 0]}
        fontSize={0.22}
        color={"rgba(235,242,255,0.92)"}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Sub label */}
      <Text
        position={[0, 0.72, 0]}
        fontSize={0.12}
        color={"rgba(190,205,235,0.85)"}
        anchorX="center"
        anchorY="middle"
      >
        Click to travel
      </Text>
    </group>
  )
}

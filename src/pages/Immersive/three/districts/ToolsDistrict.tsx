export default function ToolsDistrict() {
  return (
    <group position={[-12, 0, 10]}>
      <mesh>
        <boxGeometry args={[6.0, 0.35, 6.0]} />
        <meshStandardMaterial color="#0b1424" roughness={0.85} metalness={0.12} />
      </mesh>

      {/* Backbone bar */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[5.4, 0.18, 0.22]} />
        <meshStandardMaterial color="#101d34" emissive="#a7f0d8" emissiveIntensity={0.10} />
      </mesh>

      {/* Plug modules */}
      {new Array(7).fill(0).map((_, i) => (
        <mesh key={i} position={[-2.4 + i * 0.8, 0.72, 0.35]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#0e1629" roughness={0.65} metalness={0.22} />
        </mesh>
      ))}
    </group>
  )
}

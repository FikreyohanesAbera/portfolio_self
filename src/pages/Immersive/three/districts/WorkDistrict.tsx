export default function WorkDistrict() {
  return (
    <group position={[12, 0, -6]}>
      <mesh>
        <boxGeometry args={[6.2, 0.35, 5.2]} />
        <meshStandardMaterial color="#0b1322" roughness={0.85} metalness={0.14} />
      </mesh>

      {/* Pipeline columns */}
      {new Array(6).fill(0).map((_, i) => (
        <mesh key={i} position={[-2.4 + i * 0.96, 0.9, 0]}>
          <boxGeometry args={[0.6, 1.6, 0.6]} />
          <meshStandardMaterial color="#0f1b33" emissive="#a7f0d8" emissiveIntensity={0.10} />
        </mesh>
      ))}
    </group>
  )
}

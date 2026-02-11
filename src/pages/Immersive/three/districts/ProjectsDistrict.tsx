export default function ProjectsDistrict() {
  return (
    <group position={[12, 0, 10]}>
      <mesh>
        <cylinderGeometry args={[4.8, 5.3, 0.35, 40]} />
        <meshStandardMaterial color="#0b1324" roughness={0.9} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <torusGeometry args={[3.2, 0.07, 10, 70]} />
        <meshStandardMaterial color="#8fb2ff" emissive="#8fb2ff" emissiveIntensity={0.22} />
      </mesh>
    </group>
  )
}

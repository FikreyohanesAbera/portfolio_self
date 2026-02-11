export default function EducationDistrict() {
  return (
    <group position={[-12, 0, -6]}>
      <mesh>
        <boxGeometry args={[5.6, 0.35, 5.6]} />
        <meshStandardMaterial color="#0b1326" roughness={0.85} metalness={0.12} />
      </mesh>

      {/* Blueprint grid accent */}
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.2, 5.2, 18, 18]} />
        <meshStandardMaterial color="#0a1020" emissive="#8fb2ff" emissiveIntensity={0.08} wireframe />
      </mesh>
    </group>
  )
}

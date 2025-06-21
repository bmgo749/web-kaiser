import { useRef, useState } from "react";
import { Mesh, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useSolarSystem } from "../hooks/useSolarSystem";
import { PlanetData, planetData as allPlanets } from "../lib/solarSystemData";
import * as THREE from "three";

interface PlanetProps {
  planetData: PlanetData;
  elapsedTime: number;
}

export default function Planet({ planetData, elapsedTime }: PlanetProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { setSelectedPlanet } = useSolarSystem();

  useFrame(() => {
    if (!groupRef.current) return;

    // Calculate orbital position with distance-based speed adjustment (closer = faster)
    const baseOrbitalSpeed = (2 * Math.PI) / (planetData.orbitalPeriod * 365.25 * 24 * 3600); // radians per second
    
    // Speed increases as distance from star decreases (Kepler's laws approximation)
    const distanceFromStar = planetData.orbitRadius;
    const speedMultiplier = Math.pow(400 / distanceFromStar, 0.5); // Closer planets orbit faster
    const orbitalSpeed = baseOrbitalSpeed * speedMultiplier;
    
    let angle = elapsedTime * orbitalSpeed;
    
    // Special case for P-Rinnia: orbit around G-Hopper's current position
    if (planetData.name === "P-Rinnia") {
      // Find G-Hopper's current position (updated to new distance)
      const hopperOrbitalSpeed = (2 * Math.PI) / (19.29 * 365.25 * 24 * 3600);
      const hopperSpeedMultiplier = Math.pow(400 / 950.0, 0.5);
      const hopperSpeed = hopperOrbitalSpeed * hopperSpeedMultiplier;
      const hopperAngle = elapsedTime * hopperSpeed;
      const hopperX = Math.cos(hopperAngle) * 950.0;
      const hopperZ = Math.sin(hopperAngle) * 950.0;
      
      // P-Rinnia orbits around G-Hopper with 25 dm spacing, slowed down by 2x
      const localOrbitRadius = 25.0; // 25dm distance as specified
      const rinniaSpeed = (2 * Math.PI) / (1.0 * 365.25 * 24 * 3600); // 1 year local orbit (2x slower)
      const localAngle = elapsedTime * rinniaSpeed;
      const localX = Math.cos(localAngle) * localOrbitRadius;
      const localZ = Math.sin(localAngle) * localOrbitRadius;
      
      groupRef.current.position.set(hopperX + localX, 0, hopperZ + localZ);
    } else {
      // Normal orbit around the star
      const x = Math.cos(angle) * planetData.orbitRadius;
      const z = Math.sin(angle) * planetData.orbitRadius;
      groupRef.current.position.set(x, 0, z);
    }

    // Rotate planet on its axis
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const handleClick = () => {
    setSelectedPlanet(planetData);
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[planetData.size, 32, 32]} />
        <meshStandardMaterial 
          color={planetData.color}
          roughness={0.6}
          metalness={0.3}
          emissive={planetData.color}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Planet label */}
      {hovered && (
        <Text
          position={[0, planetData.size + 2, 0]}
          fontSize={1.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {planetData.name}
        </Text>
      )}
    </group>
  );
}

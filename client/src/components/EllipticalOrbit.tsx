import React, { useRef, useState } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useSolarSystem } from "../hooks/useSolarSystem";
import { PlanetData } from "../lib/solarSystemData";
import * as THREE from "three";

interface EllipticalOrbitProps {
  planetData: PlanetData;
  elapsedTime: number;
}

export default function EllipticalOrbit({ planetData, elapsedTime }: EllipticalOrbitProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { setSelectedPlanet } = useSolarSystem();

  useFrame(() => {
    if (!groupRef.current) return;

    // P-Serion elliptical orbit - speed similar to Hopper but 1.3x faster
    const hopperOrbitalSpeed = (2 * Math.PI) / (19.29 * 365.25 * 24 * 3600);
    const hopperSpeedMultiplier = Math.pow(400 / 950.0, 0.5);
    const baseHopperSpeed = hopperOrbitalSpeed * hopperSpeedMultiplier;
    const orbitalSpeed = baseHopperSpeed * 1.3; // 1.3x faster than Hopper
    const time = elapsedTime * orbitalSpeed;
    
    // Elliptical path parameters - stretches from inner system to outer system (updated for Serion at 369.39dm)
    const perihelion = 369.39; // Closest approach (Serion moved forward 18dm)
    const aphelion = 630.0;    // Farthest approach (adjusted for new scale)
    const semiMajorAxis = (perihelion + aphelion) / 2;
    const eccentricity = (aphelion - perihelion) / (aphelion + perihelion);
    
    // Elliptical orbit calculation
    const angle = time;
    const radius = semiMajorAxis * (1 - eccentricity * Math.cos(angle));
    
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    
    groupRef.current.position.set(x, 0, z);

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
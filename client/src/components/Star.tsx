import { useRef } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { starData } from "../lib/solarSystemData";
import { useSolarSystem } from "../hooks/useSolarSystem";
import * as THREE from "three";

export default function Star() {
  const meshRef = useRef<Mesh>(null);
  const { setSelectedPlanet } = useSolarSystem();

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle rotation
    meshRef.current.rotation.y += 0.005;
    
    // Pulsing effect
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    meshRef.current.scale.setScalar(scale);
  });

  const handleClick = () => {
    setSelectedPlanet(starData);
  };

  return (
    <mesh ref={meshRef} onClick={handleClick}>
      <sphereGeometry args={[starData.size, 32, 32]} />
      <meshStandardMaterial 
        color={starData.color}
        emissive="#FF8C00"
        emissiveIntensity={0.6}
      />
      
      {/* Inner glow effect */}
      <mesh scale={1.2}>
        <sphereGeometry args={[starData.size, 32, 32]} />
        <meshBasicMaterial 
          color="#FFA500"
          transparent
          opacity={0.15}
        />
      </mesh>
      
      {/* Outer glow effect */}
      <mesh scale={1.5}>
        <sphereGeometry args={[starData.size, 32, 32]} />
        <meshBasicMaterial 
          color="#FFD700"
          transparent
          opacity={0.08}
        />
      </mesh>
    </mesh>
  );
}

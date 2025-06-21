import { useMemo, useRef } from "react";
import { Points, BufferGeometry } from "three";
import { useFrame } from "@react-three/fiber";
import { getAsteroidBeltRadius, getAsteroidBeltWidth } from "../lib/solarSystemData";
import * as THREE from "three";

export default function AsteroidBelt() {
  const pointsRef = useRef<Points>(null);
  
  // Generate asteroid belt at 260 million km (26.0 cm)
  const particles = useMemo(() => {
    const positions = new Float32Array(5000 * 3); // Dense asteroid belt
    const colors = new Float32Array(5000 * 3);
    
    const beltCenterRadius = getAsteroidBeltRadius(); // 26.0 cm
    const beltWidth = getAsteroidBeltWidth(); // 4 cm wide
    
    for (let i = 0; i < 5000; i++) {
      const i3 = i * 3;
      
      // Create asteroid belt between Forto and Tester
      const angle = Math.random() * Math.PI * 2;
      const radiusVariation = (Math.random() - 0.5) * beltWidth; // ±2 units variation
      const radius = beltCenterRadius + radiusVariation;
      const height = (Math.random() - 0.5) * 4; // Moderate height
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      // Gray-brown asteroid colors
      colors[i3] = 0.6 + Math.random() * 0.3;
      colors[i3 + 1] = 0.5 + Math.random() * 0.3;
      colors[i3 + 2] = 0.4 + Math.random() * 0.3;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    // Slow rotation of the asteroid belt
    pointsRef.current.rotation.y += 0.0002;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.6}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

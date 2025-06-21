import { useRef, useMemo } from "react";
import { Points } from "three";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function CosmicStorm() {
  const stormRef = useRef<Points>(null);
  const starsRef = useRef<Points>(null);
  
  // Generate cosmic dust 3x wider, positioned behind Hopper-Rinnia
  const stormParticles = useMemo(() => {
    const positions = new Float32Array(24000 * 3); // 3x more particles for wider area
    const colors = new Float32Array(24000 * 3);
    
    for (let i = 0; i < 24000; i++) {
      const i3 = i * 3;
      
      // Create cosmic dust behind Hopper-Rinnia (radius 1100-1400 dm, moved back 100dm)
      const angle = Math.random() * Math.PI * 2;
      const radius = 1100 + Math.random() * 300; // Moved back 100dm from previous position
      const height = (Math.random() - 0.5) * 240; // 3x vertical spread
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      // Purple-pink cosmic dust colors
      colors[i3] = 0.8 + Math.random() * 0.2; // Strong red
      colors[i3 + 1] = 0.15 + Math.random() * 0.25; // Low green  
      colors[i3 + 2] = 0.9 + Math.random() * 0.1; // Very strong blue
    }
    
    return { positions, colors };
  }, []);

  // Generate bright sparkling stars in cosmic dust (3x more)
  const sparklingStars = useMemo(() => {
    const positions = new Float32Array(9000 * 3); // 3x more sparkling stars
    const colors = new Float32Array(9000 * 3);
    
    for (let i = 0; i < 9000; i++) {
      const i3 = i * 3;
      
      // Scattered throughout wider cosmic dust area (moved back 100dm)
      const angle = Math.random() * Math.PI * 2;
      const radius = 1080 + Math.random() * 340; // Moved back 100dm
      const height = (Math.random() - 0.5) * 300; // 3x vertical spread
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      // Bright sparkling stars
      const brightness = 0.95 + Math.random() * 0.05;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness;
      colors[i3 + 2] = brightness;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (stormRef.current) {
      // Very slow rotation of cosmic dust
      stormRef.current.rotation.y += 0.0003;
      
      // Gentle vertical movement
      stormRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 1;
    }
    
    if (starsRef.current) {
      // Slow sparkling effect for stars  
      starsRef.current.rotation.y += 0.0002;
      starsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    }
  });

  return (
    <>
      {/* Cosmic Storm */}
      <points ref={stormRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={stormParticles.positions.length / 3}
            array={stormParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={stormParticles.colors.length / 3}
            array={stormParticles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.8}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>

      {/* Sparkling Stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={sparklingStars.positions.length / 3}
            array={sparklingStars.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={sparklingStars.colors.length / 3}
            array={sparklingStars.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.2}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    </>
  );
}
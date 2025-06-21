import { useRef, useMemo } from "react";
import { Line } from "@react-three/drei";
import { PlanetData, planetData as allPlanets } from "../lib/solarSystemData";
import * as THREE from "three";

interface OrbitTrailProps {
  planetData: PlanetData;
  elapsedTime: number;
}

export default function OrbitTrail({ planetData, elapsedTime }: OrbitTrailProps) {
  // Generate orbit trail points
  const trailPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 128; // Number of trail segments for smooth curve
    
    // Special case for P-Rinnia orbiting G-Hopper
    if (planetData.name === "P-Rinnia") {
      const localOrbitRadius = 25.0; // 25dm radius around G-Hopper
      const hopperOrbitalSpeed = (2 * Math.PI) / (19.29 * 365.25 * 24 * 3600);
      const hopperSpeedMultiplier = Math.pow(400 / 950.0, 0.5);
      const hopperSpeed = hopperOrbitalSpeed * hopperSpeedMultiplier;
      const hopperAngle = elapsedTime * hopperSpeed;
      const hopperX = Math.cos(hopperAngle) * 950.0;
      const hopperZ = Math.sin(hopperAngle) * 950.0;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = hopperX + Math.cos(angle) * localOrbitRadius;
        const z = hopperZ + Math.sin(angle) * localOrbitRadius;
        points.push(new THREE.Vector3(x, 0, z));
      }
    } else {
      // Normal orbit around star
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * planetData.orbitRadius;
        const z = Math.sin(angle) * planetData.orbitRadius;
        points.push(new THREE.Vector3(x, 0, z));
      }
    }
    
    return points;
  }, [planetData.orbitRadius, planetData.name]);

  // Generate current position trail (showing where planet has been)
  const currentTrail = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const trailLength = 50; // Number of trail points to show
    const orbitalSpeed = (2 * Math.PI) / (planetData.orbitalPeriod * 365.25 * 24 * 3600);
    
    // Special case for P-Rinnia orbiting G-Hopper
    if (planetData.name === "P-Rinnia") {
      const hopper = allPlanets.find(p => p.name === "G-Hopper");
      if (hopper) {
        const hopperOrbitalSpeed = (2 * Math.PI) / (hopper.orbitalPeriod * 365.25 * 24 * 3600);
        const localOrbitRadius = 12;
        
        for (let i = 0; i < trailLength; i++) {
          const timeOffset = (i * 0.1);
          const hopperAngle = (elapsedTime - timeOffset) * hopperOrbitalSpeed;
          const localAngle = (elapsedTime - timeOffset) * orbitalSpeed * 2; // 2x faster local orbit
          
          const hopperX = Math.cos(hopperAngle) * hopper.orbitRadius;
          const hopperZ = Math.sin(hopperAngle) * hopper.orbitRadius;
          
          const localX = Math.cos(localAngle) * localOrbitRadius;
          const localZ = Math.sin(localAngle) * localOrbitRadius;
          
          points.push(new THREE.Vector3(hopperX + localX, 0, hopperZ + localZ));
        }
      }
    } else {
      // Normal orbit trail
      for (let i = 0; i < trailLength; i++) {
        const timeOffset = (i * 0.1); // Small time increments
        const angle = (elapsedTime - timeOffset) * orbitalSpeed;
        const x = Math.cos(angle) * planetData.orbitRadius;
        const z = Math.sin(angle) * planetData.orbitRadius;
        points.push(new THREE.Vector3(x, 0, z));
      }
    }
    
    return points;
  }, [elapsedTime, planetData.orbitRadius, planetData.orbitalPeriod, planetData.name]);

  // Special rendering for different orbit types
  if (planetData.name === "P-Rinnia") {
    // No orbit trail for Rinnia (hidden as requested)
    return null;
  }

  if (planetData.name === "P-Serion") {
    // P-Serion uses EllipticalTrail component - no additional trail needed
    return null;
  }

  return (
    <>
      {/* Full orbit path - subtle */}
      <Line
        points={trailPoints}
        color="#444444"
        lineWidth={1}
        transparent
        opacity={0.3}
      />
    </>
  );
}
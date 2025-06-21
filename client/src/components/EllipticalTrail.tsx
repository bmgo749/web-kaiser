import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface EllipticalTrailProps {
  planetData: {
    name: string;
    orbitalPeriod: number;
  };
}

export default function EllipticalTrail({ planetData }: EllipticalTrailProps) {
  // Generate elliptical trail points for P-Serion
  const trailPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const numPoints = 200; // Smooth curve
    
    // Elliptical path parameters matching EllipticalOrbit (updated for Serion at 369.39dm)
    const perihelion = 369.39; // Closest approach (Serion moved forward 18dm)
    const aphelion = 630.0;    // Farthest approach (adjusted for new scale)
    const semiMajorAxis = (perihelion + aphelion) / 2;
    const eccentricity = (aphelion - perihelion) / (aphelion + perihelion);
    
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const radius = semiMajorAxis * (1 - eccentricity * Math.cos(angle));
      
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      
      points.push(new THREE.Vector3(x, 0, z));
    }
    
    return points;
  }, []);

  return (
    <Line
      points={trailPoints}
      color="#444444"
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
}
import { useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import Star from "./Star";
import Planet from "./Planet";
import AsteroidBelt from "./AsteroidBelt";
import OrbitTrail from "./OrbitTrail";
import EllipticalOrbit from "./EllipticalOrbit";
import EllipticalTrail from "./EllipticalTrail";
import CosmicStorm from "./CosmicStorm";
import { useSolarSystem } from "../hooks/useSolarSystem";
import { planetData } from "../lib/solarSystemData";
import * as THREE from "three";

export default function SolarSystem() {
  const groupRef = useRef<Group>(null);
  const { elapsedTime, setElapsedTime } = useSolarSystem();

  useFrame((state, delta) => {
    // Auto-update elapsed time with fixed speed - reduced 135x total for extremely slow planets
    setElapsedTime(prev => prev + delta * 3600 * 24 * 0.22); // 0.22 days per second (135x slower total)
  });

  return (
    <group ref={groupRef}>
      {/* Central Star - S-Centagma */}
      <Star />

      {/* Orbit trails */}
      {planetData.map((planet) => 
        planet.name === "P-Serion" ? (
          <EllipticalTrail
            key={`elliptical-trail-${planet.name}`}
            planetData={planet}
          />
        ) : (
          <OrbitTrail
            key={`trail-${planet.name}`}
            planetData={planet}
            elapsedTime={elapsedTime}
          />
        )
      )}

      {/* Planets - Special rendering for P-Serion with elliptical orbit */}
      {planetData.map((planet) => 
        planet.name === "P-Serion" ? (
          <EllipticalOrbit
            key={planet.name}
            planetData={planet}
            elapsedTime={elapsedTime}
          />
        ) : (
          <Planet
            key={planet.name}
            planetData={planet}
            elapsedTime={elapsedTime}
          />
        )
      )}

      {/* Asteroid Belt after P-Forto */}
      <AsteroidBelt />

      {/* Cosmic Storm at outer edge */}
      <CosmicStorm />
    </group>
  );
}

export interface PlanetData {
  name: string;
  type: string;
  orbitalPeriod: number; // in Earth years
  orbitRadius: number; // scaled distance from star
  size: number; // scaled radius
  color: string;
  temperature: number; // in Kelvin
  gravity: number; // in m/s²
  description?: string;
}

// Planet data for Gaugaria system in correct order from star
export const planetData: PlanetData[] = [
  {
    name: "P-Insignia",
    type: "P",
    orbitalPeriod: 0.29, // Closest to S-Centagma
    orbitRadius: calculateOrbitRadius(0.29),
    size: 0.8 * 3 * 2.1, // 3x larger, then 2.1x more
    color: "#d2691e",
    temperature: 710, // Similar to Venus
    gravity: 8.9,
    description: "Volcanic world with molten surface, extreme heat, and dense toxic atmosphere. Constant lava flows create a hellish landscape."
  },
  {
    name: "H-Alfa",
    type: "H",
    orbitalPeriod: 1.02, // Second from star
    orbitRadius: calculateOrbitRadius(1.02),
    size: 1.0 * 3 * 2.1, // 3x larger, then 2.1x more
    color: "#2E8B57",
    temperature: 288, // Earth-like
    gravity: 9.8,
    description: "Earth-like world with blue oceans, green continents, white cloud formations, and polar ice caps. Perfect conditions for diverse life."
  },
  {
    name: "P-Serion",
    type: "P",
    orbitalPeriod: 1.4, // Third - elliptical orbit
    orbitRadius: calculateOrbitRadius(1.4),
    size: 0.9 * 3 * 2.1, // 3x larger, then 2.1x more
    color: "#B0C4DE",
    temperature: 210, // Mars-like but colder
    gravity: 3.7,
    description: "Frozen world with ice caps, rocky terrain, and thin atmosphere. Extreme temperature variations due to elliptical orbit."
  },
  {
    name: "P-Forto",
    type: "P",
    orbitalPeriod: 1.9, // Fourth - before asteroid belt
    orbitRadius: calculateOrbitRadius(1.9),
    size: 1.1 * 3 * 2.1, // 3x larger, then 2.1x more
    color: "#CD853F",
    temperature: 180, // Cold Mars-like
    gravity: 4.2,
    description: "Arid desert world with reddish-brown surface, ancient dried riverbeds, and polar ice caps. Thin atmosphere with dust storms."
  },
  {
    name: "G-Tester",
    type: "G",
    orbitalPeriod: 8.78, // Fifth - after asteroid belt
    orbitRadius: calculateOrbitRadius(8.78),
    size: 2.5 * 3, // 3x larger
    color: "#4682B4",
    temperature: 120, // Jupiter-like
    gravity: 24.8,
    description: "Massive blue gas giant with swirling storm bands, ice crystal clouds, and a strong magnetic field. Multiple small moons orbit this giant."
  },
  {
    name: "G-Plata",
    type: "G",
    orbitalPeriod: 11.9, // Sixth planet
    orbitRadius: calculateOrbitRadius(11.9),
    size: 2.2 * 3, // 3x larger
    color: "#DAA520",
    temperature: 95, // Saturn-like
    gravity: 10.4,
    description: "Golden gas giant with spectacular ring system made of ice and rock particles. Low density with hydrogen-helium atmosphere."
  },
  {
    name: "G-Hopper",
    type: "G",
    orbitalPeriod: 19.29, // Seventh - outermost major planet
    orbitRadius: calculateOrbitRadius(19.29),
    size: 2.8 * 3, // 3x larger
    color: "#8A2BE2",
    temperature: 65, // Uranus/Neptune-like
    gravity: 11.2,
    description: "Massive purple gas giant with methane atmosphere creating deep blue-violet appearance. Tilted magnetic field and extreme winds."
  },
  {
    name: "P-Rinnia",
    type: "P",
    orbitalPeriod: 19, // Orbits G-Hopper at 6mm distance
    orbitRadius: calculateOrbitRadius(19),
    size: 2.2 * 3 / 1.5, // Size of Plata but 1.5x smaller
    color: "#E0E0E0",
    temperature: 55, // Europa-like
    gravity: 1.3,
    description: "Large icy moon with subsurface ocean beneath frozen crust. Possible hydrothermal activity creates potential for life."
  }
];

// Calculate orbital radius based on real distances
// Scale: 1 unit = 1024 dm (102.4 meter) on website, 10 million km in space
function calculateOrbitRadius(period: number): number {
  switch(period) {
    case 0.29: // P-Insignia - closest to star, 1.4x further from Centagma
      return 101.376 * 1.4; // 141.93 dm
    case 1.02: // H-Alfa - moved to halfway between current position and Insignia
      return (141.93 + 322.56) / 2; // 232.25 dm (halfway point)
    case 1.4: // P-Serion - elliptical orbit base, moved back 145dm total
      return 224.39 + 145; // 369.39 dm
    case 1.9: // P-Forto - moved slightly back toward asteroid belt
      return 310.0; // Positioned closer to asteroid belt
    case 8.78: // G-Tester - after asteroid belt, 3x further spacing
      return 450.0; // Much further from inner planets
    case 11.9: // G-Plata - large gas giant, 3x further from Tester
      return 650.0; // 450.0 + (200 * 1.0) = 650.0
    case 19.29: // G-Hopper - outermost, 3x further from Plata
      return 950.0; // 650.0 + (300 * 1.0) = 950.0
    case 19: // P-Rinnia - orbits around G-Hopper, distance adjusted for new Hopper position
      return 975.0; // 25 dm from Hopper (950.0 + 25.0) orbit radius
    default:
      return 200;
  }
}

// Asteroid belt at 75% distance between Forto and Tester
export function getAsteroidBeltRadius(): number {
  const fortoDistance = 310.0;
  const testerDistance = 450.0;
  return fortoDistance + (testerDistance - fortoDistance) * 0.75; // 415.0 dm
}

export function getAsteroidBeltWidth(): number {
  return 40; // Wide belt spanning ±20 units from center
}

// Cosmic dust at outer edge, positioned behind Hopper-Rinnia system, moved back 100dm
export function getCosmicDustRadius(): number {
  return 1200.0; // Moved back 100dm from previous position
}

export const starData: PlanetData = {
  name: "S-Centagma",
  type: "S",
  orbitalPeriod: 0, // Central star doesn't orbit
  orbitRadius: 0,
  size: 4.0 * 3 * 2.1 * 2.4, // 3x larger, then 2.1x more, then 2.4x more
  color: "#FFA500",
  temperature: 5778, // Sun-like surface temperature in Kelvin
  gravity: 274.0, // Surface gravity in m/s²
  description: "Massive yellow-orange main sequence star with active corona, solar flares, and magnetic field. Powers the entire Gaugaria system with nuclear fusion."
};
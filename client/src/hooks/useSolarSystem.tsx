import { create } from "zustand";
import { PlanetData } from "../lib/solarSystemData";

interface SolarSystemState {
  timeScale: number;
  isPaused: boolean;
  elapsedTime: number;
  selectedPlanet: PlanetData | null;
  
  setTimeScale: (scale: number) => void;
  setIsPaused: (paused: boolean) => void;
  setElapsedTime: (time: number | ((prev: number) => number)) => void;
  setSelectedPlanet: (planet: PlanetData | null) => void;
  resetTime: () => void;
}

export const useSolarSystem = create<SolarSystemState>((set, get) => ({
  timeScale: 10,
  isPaused: false,
  elapsedTime: 0,
  selectedPlanet: null,
  
  setTimeScale: (scale) => set({ timeScale: scale }),
  setIsPaused: (paused) => set({ isPaused: paused }),
  setElapsedTime: (time) => {
    const { isPaused } = get();
    if (isPaused) return;
    
    if (typeof time === 'function') {
      set((state) => ({ elapsedTime: time(state.elapsedTime) }));
    } else {
      set({ elapsedTime: time });
    }
  },
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  resetTime: () => set({ elapsedTime: 0 }),
}));

import { create } from 'zustand';

interface IntroState {
  showIntro: boolean;
  currentStep: 'welcome' | 'description' | 'start' | 'completed';
  isTransitioning: boolean;
  
  // Actions
  setCurrentStep: (step: 'welcome' | 'description' | 'start' | 'completed') => void;
  setIsTransitioning: (transitioning: boolean) => void;
  startSystem: () => void;
  skipIntro: () => void;
}

export const useIntro = create<IntroState>((set) => ({
  showIntro: true,
  currentStep: 'welcome',
  isTransitioning: false,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  setIsTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  startSystem: () => set({ showIntro: false, currentStep: 'completed' }),
  skipIntro: () => set({ showIntro: false, currentStep: 'completed' }),
}));
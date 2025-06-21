import { useEffect, useState } from 'react';
import { useIntro } from '../hooks/useIntro';

export default function IntroSequence() {
  const { currentStep, setCurrentStep, setIsTransitioning, startSystem } = useIntro();
  const [fadeClass, setFadeClass] = useState('opacity-0');
  const [blinkClass, setBlink] = useState('opacity-100');

  useEffect(() => {
    const sequence = async () => {
      // Fade in welcome message
      await new Promise(resolve => setTimeout(resolve, 500)); // Initial delay
      setFadeClass('opacity-100');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Fade in for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 5800)); // Show for 5.8 seconds
      
      // Fade out welcome
      setFadeClass('opacity-0');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Fade out for 3 seconds
      
      // Description message - fade in
      setCurrentStep('description');
      setFadeClass('opacity-100');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Fade in for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 5800)); // Show for 5.8 seconds
      
      // Fade out description
      setFadeClass('opacity-0');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Fade out for 3 seconds
      
      // Start button - fade in and start blinking
      setCurrentStep('start');
      setFadeClass('opacity-100');
      startBlinking();
    };

    if (currentStep === 'welcome') {
      sequence();
    }
  }, [currentStep, setCurrentStep]);

  const startBlinking = () => {
    const blinkInterval = setInterval(() => {
      setBlink(prev => prev === 'opacity-100' ? 'opacity-30' : 'opacity-100');
    }, 630); // Blink every 0.63 seconds

    // Store interval for cleanup
    (window as any).blinkInterval = blinkInterval;
  };

  const handleStartClick = () => {
    // Clear blinking interval
    if ((window as any).blinkInterval) {
      clearInterval((window as any).blinkInterval);
    }
    
    // Slow fade out over 2.33 seconds
    setFadeClass('opacity-0');
    setTimeout(() => {
      startSystem();
    }, 2330);
  };

  const renderText = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-light text-white mb-4 leading-relaxed">
              Welcome to our Facility
            </h1>
            <h2 className="text-2xl md:text-4xl text-orange-300 font-light">
              Gaugaria Solar System V1
            </h2>
          </div>
        );
      case 'description':
        return (
          <div className="text-center">
            <p className="text-2xl md:text-4xl text-white font-light leading-relaxed">
              This is, our Solar System,
            </p>
            <p className="text-white font-light leading-relaxed mt-2" style={{ fontSize: 'calc(1.5rem - 2px)' }}>
              enjoy for seeing this beautiful object.
            </p>
          </div>
        );
      case 'start':
        return (
          <div className="text-center">
            <button
              onClick={handleStartClick}
              className={`text-2xl md:text-4xl font-light text-white transition-opacity duration-1000 ${blinkClass} bg-transparent border-none cursor-pointer block mx-auto mb-4`}
            >
              Start System
            </button>
            <p className={`font-light text-white transition-opacity duration-1000 ${blinkClass}`} style={{ fontSize: '13px' }}>
              click anywhere to start system
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer"
      onClick={currentStep === 'start' ? handleStartClick : undefined}
    >
      {/* Dark overlay with blur effect */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
      
      {/* Text content */}
      <div 
        className={`relative z-10 transition-opacity ${fadeClass}`} 
        style={{ 
          transitionDuration: currentStep === 'start' && fadeClass === 'opacity-0' ? '2330ms' : '3000ms' 
        }}
      >
        {renderText()}
      </div>
    </div>
  );
}
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense } from "react";
import SolarSystem from "./components/SolarSystem";
import PlanetInfo from "./components/ui/PlanetInfo";
import IntroSequence from "./components/IntroSequence";
import { useSolarSystem } from "./hooks/useSolarSystem";
import { useIntro } from "./hooks/useIntro";
import "@fontsource/inter";

function App() {
  const { selectedPlanet, timeScale } = useSolarSystem();
  const { showIntro } = useIntro();

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* 3D Scene */}
      <Canvas
        camera={{
          position: [0, 300, 600],
          fov: 65,
          near: 1,
          far: 8000
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={["#000011"]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#FFD700" />
        <pointLight position={[0, 0, 0]} intensity={1.5} color="#FFA500" distance={200} />
        
        {/* Stars background */}
        <Stars radius={1000} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={50}
          maxDistance={1500}
          autoRotate={false}
        />
        
        {/* Solar System */}
        <Suspense fallback={null}>
          <SolarSystem />
        </Suspense>
      </Canvas>

      {/* Intro Sequence Overlay */}
      {showIntro && <IntroSequence />}

      {/* UI Overlay - Only show when intro is completed */}
      {!showIntro && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Beta Status - Top Left */}
          <div className="absolute top-4 left-4 text-white">
            <p className="text-sm font-light">
              Not Finished
            </p>
            <p className="text-xs opacity-70">
              Beta System | Code: EHWD_Y1
            </p>
          </div>

          {/* Planet Info */}
          {selectedPlanet && (
            <div className="absolute top-4 right-4 pointer-events-auto">
              <PlanetInfo planet={selectedPlanet} />
            </div>
          )}

          {/* Title */}
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-2xl font-bold mb-1">Gaugaria Solar System</h1>
            <p className="text-sm opacity-70">
              Solar System Navigation
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

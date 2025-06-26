import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense } from "react";
import SolarSystem from "./components/SolarSystem";
import PlanetInfo from "./components/ui/PlanetInfo";
import IntroSequence from "./components/IntroSequence";
import { useSolarSystem } from "./hooks/useSolarSystem";
import { useIntro } from "./hooks/useIntro";
import { useEffect, useState } from "react";
import axios from 'axios';
import "@fontsource/inter";

function CaptchaGate({ onPassed }: { onPassed: () => void }) {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
  // Ambil CSRF token dari backend
  axios.get('/csrf-token', { credentials: 'include' })
    .then(res => {
      if (!res.ok) throw new Error(`CSRF token fetch failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log("🛡️ CSRF Token received:", data.csrfToken);
      axios.defaults.headers.common['CSRF-Token'] = token;
    })
    .catch(err => {
      console.error("❌ Failed to fetch CSRF token:", err);
    });

  // Coba render Turnstile secara berkala hingga siap
  const interval = setInterval(() => {
    if (window.turnstile && document.getElementById('cf-turnstile')) {
      console.log("✅ Cloudflare Turnstile loaded");

      window.turnstile.render('#cf-turnstile', {
        sitekey: '0x4AAAAAABiGO8kRAt_pShN0',
        callback: (token: string) => {
          setVerified(true);
          onPassed();
        },
      });

      clearInterval(interval); // hentikan polling
    }
  }, 300);

  return () => clearInterval(interval); // bersihkan interval saat unmount
}, []);

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div>
          <h1 className="mb-4 text-lg font-bold">Verifikasi terlebih dahulu</h1>
          <div id="cf-turnstile" />
        </div>
      </div>
    );
  }

  return null;
}

function App() {
  const [passed, setPassed] = useState(false); // Tambahkan state verifikasi
  const { selectedPlanet, timeScale } = useSolarSystem();
  const { showIntro } = useIntro();

  if (!passed) {
    return <CaptchaGate onPassed={() => setPassed(true)} />;
  }

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
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#FFD700" />
        <pointLight position={[0, 0, 0]} intensity={1.5} color="#FFA500" distance={200} />
        <Stars radius={1000} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enablePan enableZoom enableRotate minDistance={50} maxDistance={1500} />
        <Suspense fallback={null}>
          <SolarSystem />
        </Suspense>
      </Canvas>

      {showIntro && <IntroSequence />}

      {!showIntro && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 text-white">
            <p className="text-sm font-light">Not Finished</p>
            <p className="text-xs opacity-70">Beta System | Code: EHWD_Y1</p>
          </div>
          {selectedPlanet && (
            <div className="absolute top-4 right-4 pointer-events-auto">
              <PlanetInfo planet={selectedPlanet} />
            </div>
          )}
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-2xl font-bold mb-1">Gaugaria Solar System</h1>
            <p className="text-sm opacity-70">Solar System Navigation</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

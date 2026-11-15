// MISSIONVERSE Home Dashboard Module
// Futuristic NASA-inspired Mission Control interface with animated Three.js planets & stars

import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { fetchNasaAPOD, fetchNasaAsteroids } from '../services/nasaService';
import { playClick, initAudio } from '../utils/sounds';

export default function HomeDashboard({
  onStartMission,
  onOpenNasaHub,
  onOpenHistory,
  onOpenExplore,
  stats = {}
}) {
  const mountRef = useRef(null);
  const [apodData, setApodData] = useState(null);
  const [asteroidCount, setAsteroidCount] = useState(4);
  const [activeGlobe, setActiveGlobe] = useState('earth'); // earth, moon, mars

  // Load NASA Live Data
  useEffect(() => {
    fetchNasaAPOD().then((data) => setApodData(data));
    fetchNasaAsteroids().then((res) => {
      if (res && res.asteroids) setAsteroidCount(res.asteroids.length);
    });
  }, []);

  // Three.js Animated Planetary Backdrop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Space Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff7e6, 2.8);
    sun.position.set(6, 4, 5);
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0x00d4ff, 1.2);
    rim.position.set(-6, -2, -3);
    scene.add(rim);

    // Planet Mesh Group
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // Colors by planet
    let sphereColor = 0x1a66cc;
    if (activeGlobe === 'mars') sphereColor = 0xc1440e;
    if (activeGlobe === 'moon') sphereColor = 0xa0a0a0;

    const sphereGeo = new THREE.SphereGeometry(2.5, 36, 36);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: sphereColor,
      roughness: 0.7,
      metalness: 0.1
    });
    const planetMesh = new THREE.Mesh(sphereGeo, sphereMat);
    planetGroup.add(planetMesh);

    // Atmosphere Glow
    const glowGeo = new THREE.SphereGeometry(2.58, 36, 36);
    const glowMat = new THREE.MeshBasicMaterial({
      color: activeGlobe === 'mars' ? 0xff7733 : activeGlobe === 'moon' ? 0xcccccc : 0x00d4ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    planetGroup.add(glowMesh);

    // Orbit Ring
    const orbitRingGeo = new THREE.TorusGeometry(3.6, 0.02, 16, 64);
    const orbitRingMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3 });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.rotation.x = Math.PI / 2.4;
    scene.add(orbitRing);

    // Orbiting Satellite dot
    const satMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x00ff88 })
    );
    scene.add(satMesh);

    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      planetGroup.rotation.y = time * 0.15;
      planetGroup.rotation.x = 0.1;

      // Orbiting satellite position
      const satAngle = time * 0.8;
      satMesh.position.set(
        Math.cos(satAngle) * 3.6,
        Math.sin(satAngle) * 1.5,
        Math.sin(satAngle) * 3.6 * Math.cos(Math.PI / 2.4)
      );

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeGlobe]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Hero Mission Control Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-gray-950 via-gray-900 to-black border-2 border-space-accent/40 p-6 md:p-10 shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-space-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Briefing (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-space-accent/20 border border-space-accent/40 text-space-accent text-xs font-mono font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-space-accent animate-ping" />
              NASA-INSPIRED SPACE FLIGHT SIMULATOR
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
              MISSION<span className="text-space-accent">VERSE</span>
            </h1>
            <div className="text-sm md:text-base text-space-accent font-mono font-bold">
              BUILD YOUR OWN SPACE MISSION · AEROSPACE ENGINEERING LAB
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
              Architect rockets using real Tsiolkovsky orbital mechanics, configure modular planetary probes across 6 core subsystems, survive in-flight anomalies, and command missions to the Moon, Mars, Earth Orbit, and Asteroid Belt.
            </p>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-3 gap-2 py-2 max-w-md font-mono text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-gray-400">FLIGHTS</div>
                <div className="text-base font-bold text-white">{stats.totalMissions || 0}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-gray-400">SUCCESS RATE</div>
                <div className="text-base font-bold text-green-400">
                  {stats.totalMissions ? Math.round(((stats.successfulMissions || 0) / stats.totalMissions) * 100) : 100}%
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-gray-400">BEST SCIENCE</div>
                <div className="text-base font-bold text-space-accent">{stats.bestScience || 0} pts</div>
              </div>
            </div>

            {/* Start Mission Button CTA */}
            <div className="pt-2 flex flex-wrap gap-3 items-center">
              <button
                onClick={() => {
                  initAudio();
                  playClick();
                  onStartMission();
                }}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-space-accent to-cyan-400 text-black font-black text-base hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-space-accent/40 flex items-center gap-3 cursor-pointer"
              >
                <span className="text-xl">🚀</span>
                <span>START SPACE MISSION</span>
                <span>➔</span>
              </button>

              <button
                onClick={() => {
                  playClick();
                  onOpenNasaHub();
                }}
                className="px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
              >
                <span>🛰️ NASA LIVE HUB</span>
              </button>

              <button
                onClick={() => {
                  playClick();
                  onOpenHistory();
                }}
                className="px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
              >
                <span>📜 FLIGHT LOGS</span>
              </button>
            </div>
          </div>

          {/* Right 3D Rotating Planet Canvas (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-full h-[320px] flex items-center justify-center">
              <div ref={mountRef} className="w-full h-full cursor-grab" />
            </div>

            {/* Planet Toggle Buttons */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-2xl border border-white/15 backdrop-blur-sm mt-2">
              {[
                { id: 'earth', label: '🌍 Earth LEO' },
                { id: 'moon', label: '🌙 Moon South Pole' },
                { id: 'mars', label: '🔴 Mars Jezero' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    playClick();
                    setActiveGlobe(p.id);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                    activeGlobe === p.id
                      ? 'bg-space-accent text-black shadow-lg shadow-space-accent/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real NASA Live Data Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* NASA APOD Feature Card (8 cols) */}
        <div className="lg:col-span-8 bg-black/60 border border-white/15 rounded-3xl p-5 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌌</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    NASA ASTRONOMY PICTURE OF THE DAY
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                    [REAL NASA DATA]
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  Official NASA Open Science Feed (api.nasa.gov)
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playClick();
                onOpenNasaHub();
              }}
              className="text-xs font-mono text-space-accent hover:underline"
            >
              Explore Full Observatory ➔
            </button>
          </div>

          {apodData ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 rounded-2xl overflow-hidden border border-white/15 aspect-video md:aspect-square bg-gray-900">
                <img
                  src={apodData.url}
                  alt={apodData.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images-assets.nasa.gov/image/PIA25432/PIA25432~orig.jpg';
                  }}
                />
              </div>

              <div className="md:col-span-7 space-y-2">
                <div className="text-[10px] font-mono text-space-accent">
                  📅 {apodData.date} · {apodData.copyright || 'NASA / STScI'}
                </div>
                <h4 className="font-bold text-white text-base leading-snug">{apodData.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
                  {apodData.explanation}
                </p>
                <div className="pt-2 text-[10px] font-mono text-gray-400">
                  Source: <span className="text-gray-200">{apodData.source}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono text-gray-400 animate-pulse">
              Connecting to NASA Planetary Data Network...
            </div>
          )}
        </div>

        {/* NASA Near-Earth Asteroid Radar Widget (4 cols) */}
        <div className="lg:col-span-4 bg-black/60 border border-white/15 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">☄️</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">NEO RADAR</h3>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      [REAL DATA]
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">NASA Planetary Defense</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="text-[10px] text-gray-400">ACTIVE TRACKING OBJECTS</div>
                <div className="text-2xl font-bold text-amber-400">{asteroidCount} Near-Earth Asteroids</div>
                <div className="text-[9px] text-gray-400 mt-0.5">Continuous CNEOS radar monitoring</div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                <div className="text-[10px] text-gray-400 font-bold">16 PSYCHE HIGHLIGHT</div>
                <div className="text-white text-xs">Metallic protoplanet core in Main Belt</div>
                <div className="text-green-400 text-[10px]">Distance: ~2.5 AU · Ion Thruster Target</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onOpenNasaHub();
            }}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold border border-white/20 transition-all text-center"
          >
            VIEW ASTEROID TELEMETRY ➔
          </button>
        </div>
      </div>
    </div>
  );
}

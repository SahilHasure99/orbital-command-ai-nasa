// ORBITAL COMMAND AI — Premium NASA/SpaceX-Inspired Mission Control Dashboard
// Large interactive 3D central planet, live flight telemetry, engineering alerts & readiness gauges

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getPlanetTexture } from '../utils/proceduralAssets';
import { playClick, initAudio } from '../utils/sounds';

export default function MissionControlDashboard({
  objective,
  rocket,
  metrics,
  validation,
  onStartMission,
  onOpenSolarSystem,
  onOpenSpacecraftBuilder,
  onOpenNasaHub,
  onOpenAI,
  onOpenStats,
  onOpenHistory,
  careerStats = {}
}) {
  const mountRef = useRef(null);
  const [activePlanetId, setActivePlanetId] = useState(() => (
    objective?.id === 'mars' ? 'mars' : objective?.id === 'moon' ? 'mercury' : 'earth'
  ));

  // Sync active planet with selected mission
  useEffect(() => {
    if (objective?.id === 'mars') setActivePlanetId('mars');
    else if (objective?.id === 'moon') setActivePlanetId('mercury');
    else setActivePlanetId('earth');
  }, [objective]);

  // Three.js Central Interactive 3D Planet
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 550;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Space Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 2.6);
    sunLight.position.set(7, 5, 6);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00d4ff, 1.2);
    rimLight.position.set(-7, -3, -4);
    scene.add(rimLight);

    // Planet Mesh
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const texture = getPlanetTexture(activePlanetId);
    const sphereGeo = new THREE.SphereGeometry(2.4, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.15
    });
    const planetMesh = new THREE.Mesh(sphereGeo, sphereMat);
    planetGroup.add(planetMesh);

    // Atmospheric Glow Halo
    const glowGeo = new THREE.SphereGeometry(2.48, 48, 48);
    const glowMat = new THREE.MeshBasicMaterial({
      color: activePlanetId === 'mars' ? 0xff6622 : 0x00d4ff,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(glowGeo, glowMat);
    planetGroup.add(atmosphere);

    // Orbit Ring
    const orbitGeo = new THREE.TorusGeometry(3.5, 0.015, 16, 64);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.35 });
    const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
    orbitRing.rotation.x = Math.PI / 2.3;
    scene.add(orbitRing);

    // Orbiting Satellite Beacon
    const satGroup = new THREE.Group();
    const satMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x00ff88 })
    );
    satGroup.add(satMesh);
    scene.add(satGroup);

    // Drag Interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotY = 0.5;
    let rotX = 0.1;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };

      rotY += dx * 0.007;
      rotX += dy * 0.007;
      rotX = Math.max(-0.6, Math.min(0.6, rotX));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!isDragging) {
        rotY += 0.25 * delta;
      }

      planetGroup.rotation.y += (rotY - planetGroup.rotation.y) * 0.1;
      planetGroup.rotation.x += (rotX - planetGroup.rotation.x) * 0.1;

      // Orbiting satellite position
      const satAngle = time * 0.7;
      satGroup.position.set(
        Math.cos(satAngle) * 3.5,
        Math.sin(satAngle) * 1.5,
        Math.sin(satAngle) * 3.5 * Math.cos(Math.PI / 2.3)
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
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activePlanetId]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto select-none">
      {/* Top Directorate Hero Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-gray-950 via-gray-900 to-black p-4 rounded-3xl border border-white/15 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-space-accent/20 border border-space-accent flex items-center justify-center text-2xl shadow-lg shadow-space-accent/30 animate-pulse">
            🛰️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-space-accent uppercase tracking-widest">
                NASA DEEP SPACE OPERATIONS CENTER
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                ACTIVE TELEMETRY LINK
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
              ORBITAL COMMAND <span className="text-space-accent">AI</span>
            </h1>
          </div>
        </div>

        {/* Rapid Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
            MET: <strong className="text-white">00:00:00 UTC</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
            MISSIONS: <strong className="text-space-accent">{careerStats.totalMissions || 0}</strong>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border font-bold ${
            validation.isValid
              ? 'bg-green-500/20 border-green-500/40 text-green-300'
              : 'bg-red-500/20 border-red-500/40 text-red-300'
          }`}>
            LAUNCH: {validation.isValid ? 'GO FOR FLIGHT' : 'NO-GO (DEFECTS)'}
          </div>
        </div>
      </div>

      {/* Main 3-Column Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Mission Profile & Flight Directorate (3 cols) */}
        <div className="lg:col-span-3 bg-black/60 border border-white/15 rounded-3xl p-4 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-white/10 pb-2 mb-3">
              <div className="text-[10px] font-mono text-space-accent font-bold uppercase tracking-wider">
                CURRENT FLIGHT DIRECTIVE
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span>{objective.icon}</span>
                <span>{objective.name}</span>
              </h2>
              <div className="text-[10px] text-gray-400 font-mono mt-0.5">{objective.codeName}</div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-gray-400 text-[10px]">ASTRONOMICAL TARGET</span>
                <div className="font-bold text-white text-sm mt-0.5">{objective.targetBody}</div>
                <div className="text-[10px] text-space-accent">{objective.distanceDisplay}</div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-gray-400 text-[10px]">REQUIRED DELTA-V</span>
                <div className="font-bold text-green-400 text-sm mt-0.5">{objective.deltaVRequired} m/s</div>
                <div className="text-[10px] text-gray-400">Available: {metrics.calculatedDeltaV} m/s</div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-gray-400 text-[10px]">PRIMARY OBJECTIVE</span>
                <p className="text-[11px] text-gray-300 font-sans leading-tight mt-1 line-clamp-3">
                  {objective.description}
                </p>
              </div>

              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-gray-400 text-[10px]">NASA REFERENCE PROGRAM</span>
                <div className="text-[11px] text-purple-300 font-bold mt-0.5">
                  {objective.nasaMissionContext.realMission}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onOpenSpacecraftBuilder();
            }}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white font-bold transition-all text-center"
          >
            MODIFY MISSION DESIGN ➔
          </button>
        </div>

        {/* Central Column: Large Interactive 3D Planet Globe (6 cols) */}
        <div className="lg:col-span-6 bg-black/70 border border-white/15 rounded-3xl p-4 backdrop-blur-md shadow-2xl flex flex-col justify-between relative overflow-hidden min-h-[460px]">
          {/* Top Planet Info Bar */}
          <div className="relative z-10 flex items-center justify-between bg-black/60 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-space-accent animate-ping" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                ORBITAL TARGET: {activePlanetId.toUpperCase()}
              </span>
            </div>

            {/* Planet View Quick-Switcher */}
            <div className="flex items-center gap-1">
              {[
                { id: 'earth', label: '🌍 Earth' },
                { id: 'mercury', label: '🌙 Moon' },
                { id: 'mars', label: '🔴 Mars' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    playClick();
                    setActivePlanetId(p.id);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    activePlanetId === p.id
                      ? 'bg-space-accent text-black font-bold shadow-md shadow-space-accent/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Canvas Mount */}
          <div className="relative w-full h-[340px] flex items-center justify-center my-auto">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          </div>

          {/* Bottom Launch Action Button */}
          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                initAudio();
                playClick();
                onStartMission();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-space-accent via-cyan-400 to-blue-500 text-black font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-space-accent/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🚀</span>
              <span>INITIATE MISSION LAUNCH</span>
              <span>➔</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onOpenSolarSystem();
              }}
              className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white transition-all whitespace-nowrap"
            >
              🌌 3D SOLAR SYSTEM
            </button>
          </div>
        </div>

        {/* Right Column: Spacecraft Condition & Engineering Telemetry (3 cols) */}
        <div className="lg:col-span-3 bg-black/60 border border-white/15 rounded-3xl p-4 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-4 font-mono">
          <div>
            <div className="border-b border-white/10 pb-2 mb-3">
              <div className="text-[10px] text-space-accent font-bold uppercase tracking-wider">
                SUBSYSTEM READINESS & TELEMETRY
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">Spacecraft State</h2>
              <div className="text-[10px] text-gray-400">Launcher: {rocket.name}</div>
            </div>

            <div className="space-y-2 text-xs">
              {/* Health */}
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-gray-400">INTEGRITY & O₂</span>
                  <strong className={metrics.healthIndex >= 70 ? 'text-green-400' : 'text-amber-400'}>
                    {metrics.healthIndex}% Nominal
                  </strong>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400"
                    style={{ width: `${metrics.healthIndex}%` }}
                  />
                </div>
              </div>

              {/* Mass */}
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-gray-400">MASS / CAPACITY</span>
                  <strong className={metrics.payloadMarginKg >= 0 ? 'text-white' : 'text-red-400'}>
                    {metrics.probeWetMassKg} / {metrics.maxPayloadKg} kg
                  </strong>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metrics.payloadMarginKg >= 0 ? 'bg-space-accent' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (metrics.probeWetMassKg / metrics.maxPayloadKg) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Power */}
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-gray-400">POWER BALANCE</span>
                  <strong className={metrics.netPowerW >= 0 ? 'text-yellow-400' : 'text-red-400'}>
                    {metrics.netPowerW >= 0 ? `+${metrics.netPowerW}W` : `${metrics.netPowerW}W`}
                  </strong>
                </div>
                <div className="text-[9px] text-gray-400 flex justify-between">
                  <span>Gen: {metrics.totalPowerGenW}W</span>
                  <span>Load: {metrics.powerConsumptionW}W</span>
                </div>
              </div>

              {/* Communication */}
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">DSN SIGNAL LINK</span>
                  <strong className={metrics.linkMarginDb >= 0 ? 'text-cyan-400' : 'text-red-400'}>
                    {metrics.linkMarginDb >= 0 ? `${metrics.linkMarginDb} dB SNR` : 'BLACKOUT'}
                  </strong>
                </div>
                <div className="text-[9px] text-gray-400 mt-1">Latency: {metrics.latencyDisplay}</div>
              </div>

              {/* Budget */}
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">BUDGET MARGIN</span>
                  <strong className={metrics.budgetRemainingM >= 0 ? 'text-amber-400' : 'text-red-400'}>
                    ${metrics.totalCostM}M / ${objective.maxBudget}M
                  </strong>
                </div>
                <div className="text-[9px] text-gray-400 mt-1">Remaining: +${metrics.budgetRemainingM}M</div>
              </div>
            </div>
          </div>

          {/* Active Engineering Alerts Box */}
          <div>
            <div className="text-[10px] text-gray-400 mb-1.5 font-bold uppercase">Engineering Advisory:</div>
            {validation.errors.length > 0 ? (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-[10px] text-red-300 space-y-0.5">
                <div className="font-bold text-red-400">CRITICAL HOLD ({validation.errors.length}):</div>
                <div className="truncate">• {validation.errors[0]}</div>
              </div>
            ) : validation.warnings.length > 0 ? (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[10px] text-amber-300 space-y-0.5">
                <div className="font-bold text-amber-400">ADVISORY ({validation.warnings.length}):</div>
                <div className="truncate">• {validation.warnings[0]}</div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-green-950/30 border border-green-500/30 text-[10px] text-green-300">
                ✅ All systems nominal. Launchpad clearance granted.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Command Center Control Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <button
          onClick={() => {
            playClick();
            onOpenAI();
          }}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-space-accent font-bold transition-all"
        >
          <span>🤖</span>
          <span>AI FLIGHT DIRECTOR</span>
        </button>

        <button
          onClick={() => {
            playClick();
            onOpenNasaHub();
          }}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-green-300 font-bold transition-all"
        >
          <span>🛰️</span>
          <span>NASA OBSERVATORY HUB</span>
        </button>

        <button
          onClick={() => {
            playClick();
            onOpenStats();
          }}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-white font-bold transition-all"
        >
          <span>📊</span>
          <span>CHART.JS TELEMETRY</span>
        </button>

        <button
          onClick={() => {
            playClick();
            onOpenHistory();
          }}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-amber-300 font-bold transition-all"
        >
          <span>📜</span>
          <span>MISSION FLIGHT LOGS</span>
        </button>
      </div>
    </div>
  );
}

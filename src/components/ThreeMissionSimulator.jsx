// MISSIONVERSE Interactive 3D Multi-Stage Mission Simulator (Three.js)
// Simulates the 6 flight phases:
// 1. Rocket Launch (Pad, Ignition, Ascent, Staging)
// 2. Earth Orbit (Parking orbit, telemetry, insertion)
// 3. Space Travel (Cruise, solar wing deploy, time warp)
// 4. Planet Approach (SOI capture, retro-burn)
// 5. Landing / Deployment (Touchdown or orbital lock)
// 6. Scientific Data Collection (LIDAR scan, telemetry downlink)

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  playLaunchRumble,
  playThrusterBurst,
  playCountdownBeep,
  playTelemetryChirp,
  playSuccess,
  playClick
} from '../utils/sounds';

export const SIMULATION_PHASES = [
  { id: 'launch', name: 'Phase 1: Rocket Launch', icon: '🚀', desc: 'Liftoff, atmospheric ascent, staging separation' },
  { id: 'orbit', name: 'Phase 2: Earth Orbit Insertion', icon: '🌍', desc: 'Parking orbit circularization and telemetry check' },
  { id: 'cruise', name: 'Phase 3: Deep Space Cruise', icon: '🌌', desc: 'Trans-planetary transit and solar array deployment' },
  { id: 'approach', name: 'Phase 4: Target Approach', icon: '🎯', desc: 'Gravity capture and retro-propulsion braking burn' },
  { id: 'landing', name: 'Phase 5: Landing / Deployment', icon: '🛬', desc: 'Surface touchdown or orbital slot injection' },
  { id: 'science', name: 'Phase 6: Scientific Collection', icon: '🔬', desc: 'LIDAR scanning, core sampling & telemetry downlink' }
];

export default function ThreeMissionSimulator({
  objective,
  rocket: _rocket,
  metrics,
  componentIds: _componentIds = [],
  onTriggerCrisis,
  onSimulationComplete,
  onAbort
}) {
  const mountRef = useRef(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0); // 0 to 100
  const [timeWarp, setTimeWarp] = useState(1); // 1x, 2x, 5x
  const [cameraMode, setCameraMode] = useState('chase'); // chase, orbit, sensor
  const [isPaused, setIsPaused] = useState(false);
  const [liveScienceYield, setLiveScienceYield] = useState(0);
  const [fuelBurnedKg, setFuelBurnedKg] = useState(0);
  const [crisisTriggered, setCrisisTriggered] = useState(false);

  // Flight telemetry state for HUD
  const [telemetry, setTelemetry] = useState({
    altitudeKm: 0,
    velocityKmS: 0,
    distanceToTargetKm: objective.distanceKm,
    thrustOutputKn: 0,
    batterySoC: 100,
    statusText: 'STANDBY FOR COUNTDOWN'
  });

  const currentPhase = SIMULATION_PHASES[currentPhaseIndex];

  // Particle systems & 3D references
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    rocketMesh: null,
    spacecraftMesh: null,
    targetPlanetMesh: null,
    earthMesh: null,
    exhaustParticles: null,
    scanBeam: null,
    clock: new THREE.Clock()
  });

  // Handle phase progression & audio
  useEffect(() => {
    let interval;
    if (!isPaused) {
      interval = setInterval(() => {
        setPhaseProgress((prev) => {
          const step = 0.8 * timeWarp;
          const next = prev + step;

          // Anomaly trigger around cruise phase at 50%
          if (currentPhaseIndex === 2 && next >= 45 && !crisisTriggered && Math.random() < 0.75) {
            setCrisisTriggered(true);
            if (onTriggerCrisis) onTriggerCrisis();
          }

          if (next >= 100) {
            if (currentPhaseIndex < SIMULATION_PHASES.length - 1) {
              setCurrentPhaseIndex((c) => c + 1);
              playTelemetryChirp();
              return 0;
            } else {
              clearInterval(interval);
              playSuccess();
              if (onSimulationComplete) {
                setTimeout(() => onSimulationComplete({ finalScience: liveScienceYield }), 1200);
              }
              return 100;
            }
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [currentPhaseIndex, isPaused, timeWarp, crisisTriggered, liveScienceYield, onTriggerCrisis, onSimulationComplete]);

  // Update Telemetry based on Phase & Progress
  useEffect(() => {
    const p = phaseProgress / 100;
    if (currentPhaseIndex === 0) {
      // Launch phase
      const alt = Math.round(p * 180);
      const vel = Number((p * 7.8).toFixed(2));
      const fuelUsed = Math.round(p * (metrics.fuelMassKg * 0.4 + 200));
      setFuelBurnedKg(fuelUsed);
      setTelemetry({
        altitudeKm: alt,
        velocityKmS: vel,
        distanceToTargetKm: objective.distanceKm,
        thrustOutputKn: Math.round(metrics.totalThrustKn * (1 - p * 0.2)),
        batterySoC: 100,
        statusText: p < 0.2 ? 'MAIN ENGINE IGNITION & LIFTOFF' : p < 0.6 ? 'MAX-Q & SUPERSONIC ASCENT' : 'BOOSTER CUTOFF & STAGING'
      });
    } else if (currentPhaseIndex === 1) {
      // Earth Orbit
      setTelemetry({
        altitudeKm: 220 + Math.round(Math.sin(p * Math.PI) * 20),
        velocityKmS: 7.78,
        distanceToTargetKm: objective.distanceKm,
        thrustOutputKn: 0,
        batterySoC: 98,
        statusText: 'PARKING ORBIT ESTABLISHED · SYSTEMS NOMINAL'
      });
    } else if (currentPhaseIndex === 2) {
      // Cruise
      const remDist = Math.max(1000, Math.round(objective.distanceKm * (1 - p * 0.85)));
      const fuelUsed = Math.round(metrics.fuelMassKg * 0.5 + p * (metrics.fuelMassKg * 0.2));
      setFuelBurnedKg(fuelUsed);
      setTelemetry({
        altitudeKm: Math.round(1000 + p * 50000),
        velocityKmS: Number((11.2 - p * 1.5).toFixed(2)),
        distanceToTargetKm: remDist,
        thrustOutputKn: p < 0.25 ? 400 : 0,
        batterySoC: Math.max(85, Math.round(100 - p * 12)),
        statusText: 'SOLAR ARRAYS DEPLOYED · DEEP SPACE CRUISE'
      });
    } else if (currentPhaseIndex === 3) {
      // Approach
      const remDist = Math.max(50, Math.round(objective.distanceKm * 0.15 * (1 - p)));
      setTelemetry({
        altitudeKm: Math.round(5000 * (1 - p) + 120),
        velocityKmS: Number((4.5 - p * 2.8).toFixed(2)),
        distanceToTargetKm: remDist,
        thrustOutputKn: Math.round(350 * Math.sin(p * Math.PI)),
        batterySoC: 92,
        statusText: 'GRAVITATIONAL SOI CAPTURE · BRAKING BURN'
      });
    } else if (currentPhaseIndex === 4) {
      // Landing / Deployment
      const alt = Math.max(0, Math.round(120 * (1 - p)));
      const vel = Number((1.7 * (1 - p)).toFixed(2));
      const fuelUsed = Math.round(metrics.fuelMassKg * 0.9);
      setFuelBurnedKg(fuelUsed);
      setTelemetry({
        altitudeKm: alt,
        velocityKmS: vel,
        distanceToTargetKm: alt,
        thrustOutputKn: alt > 0 ? 180 : 0,
        batterySoC: 90,
        statusText: objective.id === 'satellite'
          ? (alt === 0 ? 'ORBITAL SLOT LOCKED · PAYLOAD DEPLOYED' : 'SOLAR SYNCHRONOUS INSERTION')
          : (alt === 0 ? 'TOUCHDOWN CONFIRMED! SURFACE ANCHORED' : 'TERMINAL DESCENT RETRO-BURN')
      });
    } else if (currentPhaseIndex === 5) {
      // Science Collection
      const pts = Math.round(p * metrics.sciencePoints);
      setLiveScienceYield(pts);
      setTelemetry({
        altitudeKm: 0,
        velocityKmS: 0,
        distanceToTargetKm: 0,
        thrustOutputKn: 0,
        batterySoC: Math.max(75, Math.round(90 - p * 8)),
        statusText: `SURFACE DATA STREAMING · +${pts} SCIENCE PTS`
      });
    }
  }, [currentPhaseIndex, phaseProgress, objective, metrics]);

  // Initial sound trigger on launch
  useEffect(() => {
    if (currentPhaseIndex === 0) {
      playCountdownBeep(true);
      setTimeout(() => playLaunchRumble(4), 400);
    }
  }, [currentPhaseIndex]);

  // Three.js 3D Interactive Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060d);
    scene.fog = new THREE.FogExp2(0x04060d, 0.0015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Space Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    sunLight.position.set(30, 40, 20);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00d4ff, 1.2);
    rimLight.position.set(-20, -10, -20);
    scene.add(rimLight);

    // 3. Deep Starfield
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 600;
      starPos[i + 1] = (Math.random() - 0.5) * 600;
      starPos[i + 2] = (Math.random() - 0.5) * 600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.85 });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 4. Celestial Bodies (Earth & Target Body)
    // 3D Earth
    const earthGeo = new THREE.SphereGeometry(18, 36, 36);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x1a5bb8,
      roughness: 0.6,
      metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(0, -22, -15);
    scene.add(earthMesh);

    // Atmospheric Glow on Earth
    const glowGeo = new THREE.SphereGeometry(18.6, 36, 36);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    const earthGlow = new THREE.Mesh(glowGeo, glowMat);
    earthMesh.add(earthGlow);

    // 3D Target Planet (Moon / Mars / Asteroid)
    let targetMesh;
    if (objective.id === 'mars') {
      const marsGeo = new THREE.SphereGeometry(12, 32, 32);
      const marsMat = new THREE.MeshStandardMaterial({
        color: 0xc1440e,
        roughness: 0.85,
        metalness: 0.15
      });
      targetMesh = new THREE.Mesh(marsGeo, marsMat);
      targetMesh.position.set(0, 10, -80);
      scene.add(targetMesh);
    } else if (objective.id === 'moon') {
      const moonGeo = new THREE.SphereGeometry(10, 32, 32);
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0xa8a8a8,
        roughness: 0.95,
        metalness: 0.05
      });
      targetMesh = new THREE.Mesh(moonGeo, moonMat);
      targetMesh.position.set(0, 10, -80);
      scene.add(targetMesh);
    } else if (objective.id === 'asteroid') {
      const astGeo = new THREE.DodecahedronGeometry(8, 2);
      // Displace vertices to create craggy, cratered irregular asteroid
      const pos = astGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = new THREE.Vector3().fromBufferAttribute(pos, i);
        u.multiplyScalar(0.85 + Math.sin(u.x * 2) * Math.cos(u.y * 2) * 0.25);
        pos.setXYZ(i, u.x, u.y, u.z);
      }
      astGeo.computeVertexNormals();
      const astMat = new THREE.MeshStandardMaterial({
        color: 0x4a4f56,
        metalness: 0.6,
        roughness: 0.8
      });
      targetMesh = new THREE.Mesh(astGeo, astMat);
      targetMesh.position.set(0, 10, -80);
      scene.add(targetMesh);
    }

    // 5. Spacecraft / Rocket Assembly Model
    const craftGroup = new THREE.Group();
    scene.add(craftGroup);

    // Rocket Body (for launch/orbit phases)
    const rocketCore = new THREE.Group();
    const rocketGeo = new THREE.CylinderGeometry(0.55, 0.6, 4.2, 16);
    const rocketMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.6, roughness: 0.3 });
    const rocketMesh = new THREE.Mesh(rocketGeo, rocketMat);
    rocketCore.add(rocketMesh);

    // Payload Fairing cone
    const fairingGeo = new THREE.ConeGeometry(0.58, 1.4, 16);
    const fairingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.3 });
    const fairingMesh = new THREE.Mesh(fairingGeo, fairingMat);
    fairingMesh.position.y = 2.8;
    rocketCore.add(fairingMesh);

    // Rocket Engine Bells
    const engineGeo = new THREE.ConeGeometry(0.25, 0.6, 12, 1, true);
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
    const engineMesh = new THREE.Mesh(engineGeo, engineMat);
    engineMesh.position.y = -2.4;
    engineMesh.rotation.x = Math.PI;
    rocketCore.add(engineMesh);

    craftGroup.add(rocketCore);

    // Spacecraft Bus (shown once upper stage separates or in space)
    const probeCore = new THREE.Group();
    probeCore.position.y = 1.0;
    const probeGeo = new THREE.CylinderGeometry(0.5, 0.55, 0.9, 8);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });
    const probeMesh = new THREE.Mesh(probeGeo, goldMat);
    probeCore.add(probeMesh);

    // Deployable Solar Wings on probe
    const solarWingLeft = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.6, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x0d2b63, metalness: 0.9, roughness: 0.2 })
    );
    solarWingLeft.position.set(-1.1, 0, 0);
    probeCore.add(solarWingLeft);

    const solarWingRight = solarWingLeft.clone();
    solarWingRight.position.x = 1.1;
    probeCore.add(solarWingRight);

    // High Gain Antenna Dish
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, side: THREE.DoubleSide })
    );
    dish.position.set(0, 0.7, 0.2);
    dish.rotation.x = Math.PI / 3;
    probeCore.add(dish);

    craftGroup.add(probeCore);

    // 6. Thruster Exhaust Flame Particles
    const exhaustCount = 80;
    const exhaustGeo = new THREE.BufferGeometry();
    const exhaustPos = new Float32Array(exhaustCount * 3);
    for (let i = 0; i < exhaustCount * 3; i += 3) {
      exhaustPos[i] = (Math.random() - 0.5) * 0.3;
      exhaustPos[i + 1] = -2.5 - Math.random() * 2.5;
      exhaustPos[i + 2] = (Math.random() - 0.5) * 0.3;
    }
    exhaustGeo.setAttribute('position', new THREE.BufferAttribute(exhaustPos, 3));
    const exhaustMat = new THREE.PointsMaterial({
      color: 0xff5500,
      size: 0.45,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const exhaustParticles = new THREE.Points(exhaustGeo, exhaustMat);
    craftGroup.add(exhaustParticles);

    // 7. Scientific LIDAR Scan Beam Cone
    const scanGeo = new THREE.ConeGeometry(3.5, 10, 16, 1, true);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const scanBeam = new THREE.Mesh(scanGeo, scanMat);
    scanBeam.position.y = -5.0;
    scanBeam.visible = false;
    craftGroup.add(scanBeam);

    // Save refs
    threeRef.current = {
      scene,
      camera,
      renderer,
      rocketCore,
      probeCore,
      targetMesh,
      earthMesh,
      exhaustParticles,
      scanBeam,
      craftGroup,
      clock: new THREE.Clock()
    };

    // 8. Animation & Camera Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = threeRef.current.clock.getDelta();
      const time = threeRef.current.clock.getElapsedTime();

      // Rotate stars and planets
      starPoints.rotation.y += 0.0003;
      earthMesh.rotation.y += 0.001;
      if (targetMesh) targetMesh.rotation.y += 0.002;

      // Animate exhaust fire particles
      const posArr = exhaustParticles.geometry.attributes.position.array;
      for (let i = 1; i < posArr.length; i += 3) {
        posArr[i] -= 0.25 * (timeWarp > 1 ? 1.5 : 1);
        if (posArr[i] < -5.0) posArr[i] = -2.5;
      }
      exhaustParticles.geometry.attributes.position.needsUpdate = true;

      // Update Phase-specific visuals
      // Staging visibility
      if (currentPhaseIndex >= 2) {
        // Rocket first stage jettisoned; probe visible
        rocketCore.visible = false;
        probeCore.visible = true;
        exhaustParticles.position.y = 1.0;
        exhaustParticles.scale.set(0.4, 0.4, 0.4);
      } else {
        rocketCore.visible = true;
        probeCore.visible = false;
        exhaustParticles.position.y = 0;
        exhaustParticles.scale.set(1, 1, 1);
      }

      // Exhaust visibility (only during burns)
      const isBurning = currentPhaseIndex === 0 || currentPhaseIndex === 3 || (currentPhaseIndex === 4 && phaseProgress < 95);
      exhaustParticles.visible = isBurning;

      // Science scan cone
      scanBeam.visible = currentPhaseIndex === 5;
      if (scanBeam.visible) {
        scanBeam.rotation.y += 0.03;
        scanMat.opacity = 0.2 + Math.sin(time * 6) * 0.1;
      }

      // Trajectory and Craft Motion
      if (currentPhaseIndex === 0) {
        // Launch ascent: ascends from Earth
        const altRatio = phaseProgress / 100;
        craftGroup.position.set(0, -6 + altRatio * 10, 0);
        craftGroup.rotation.z = -altRatio * 0.4; // Gravity turn
        earthMesh.position.y = -22 - altRatio * 15;
      } else if (currentPhaseIndex === 1) {
        // Orbit: circular path around Earth
        const orbAngle = time * 0.4;
        craftGroup.position.set(Math.cos(orbAngle) * 6, Math.sin(orbAngle) * 2, Math.sin(orbAngle) * 3);
        craftGroup.rotation.set(0, -orbAngle + Math.PI / 2, 0.3);
        earthMesh.position.set(0, -12, -10);
      } else if (currentPhaseIndex === 2) {
        // Cruise: drifting through deep space
        craftGroup.position.set(0, Math.sin(time) * 0.2, 0);
        craftGroup.rotation.set(0.1, time * 0.1, 0);
        earthMesh.position.set(-20, -15, -60);
      } else if (currentPhaseIndex === 3) {
        // Approach: target body appears in background
        const appRatio = phaseProgress / 100;
        if (targetMesh) {
          targetMesh.position.set(0, 2, -50 + appRatio * 32);
        }
        craftGroup.position.set(0, Math.sin(time * 2) * 0.15, 0);
        craftGroup.rotation.set(0.2, Math.PI, 0); // Retro-burn orientation
      } else if (currentPhaseIndex === 4) {
        // Landing / Slot lock
        const landRatio = phaseProgress / 100;
        if (targetMesh) {
          targetMesh.position.set(0, -14 + landRatio * 5, -15);
        }
        craftGroup.position.set(0, 4 - landRatio * 4, 0);
        craftGroup.rotation.set(0, 0, 0);
      } else if (currentPhaseIndex === 5) {
        // Science collection
        craftGroup.position.set(0, 0, 0);
        craftGroup.rotation.y = time * 0.15;
      }

      // Camera Controls
      if (cameraMode === 'chase') {
        camera.position.set(craftGroup.position.x + 3, craftGroup.position.y + 2.5, craftGroup.position.z + 7);
        camera.lookAt(craftGroup.position);
      } else if (cameraMode === 'orbit') {
        const camAngle = time * 0.3;
        camera.position.set(
          craftGroup.position.x + Math.sin(camAngle) * 9,
          craftGroup.position.y + 4,
          craftGroup.position.z + Math.cos(camAngle) * 9
        );
        camera.lookAt(craftGroup.position);
      } else if (cameraMode === 'sensor') {
        camera.position.set(craftGroup.position.x, craftGroup.position.y - 1.2, craftGroup.position.z);
        camera.lookAt(craftGroup.position.x, craftGroup.position.y - 15, craftGroup.position.z);
      }

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
  }, [currentPhaseIndex, phaseProgress, cameraMode, timeWarp, objective]);

  return (
    <div className="relative w-full h-[580px] bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Mission Control Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-3 bg-black/65 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-space-accent/20 border border-space-accent flex items-center justify-center text-lg animate-pulse">
            {currentPhase.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wider uppercase">{currentPhase.name}</span>
              <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-space-accent/20 border border-space-accent/40 text-space-accent">
                {Math.round(phaseProgress)}% COMPLETE
              </span>
            </div>
            <div className="text-[10px] text-gray-400">{currentPhase.desc}</div>
          </div>
        </div>

        {/* Interactive Simulator Controls */}
        <div className="flex items-center gap-2">
          {/* Time Warp Buttons */}
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5 text-xs">
            <span className="px-1.5 text-[10px] text-gray-400 font-mono">WARP:</span>
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  playClick();
                  setTimeWarp(speed);
                }}
                className={`px-2 py-0.5 rounded font-mono font-bold transition-all ${
                  timeWarp === speed
                    ? 'bg-space-accent text-black shadow-lg shadow-space-accent/50'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Camera Selector */}
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5 text-xs">
            <span className="px-1.5 text-[10px] text-gray-400 font-mono">CAM:</span>
            {[
              { id: 'chase', label: 'Chase' },
              { id: 'orbit', label: 'Orbit' },
              { id: 'sensor', label: 'Sensor' }
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => {
                  playClick();
                  setCameraMode(cam.id);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                  cameraMode === cam.id
                    ? 'bg-space-accent/30 border border-space-accent text-space-accent'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => {
              playClick();
              setIsPaused(!isPaused);
            }}
            className="px-2.5 py-1 rounded-lg border border-white/20 bg-white/10 text-xs font-bold hover:bg-white/20 text-white"
          >
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>

          {/* Emergency Manual Thruster Burst */}
          <button
            onClick={() => {
              playThrusterBurst();
              setFuelBurnedKg((f) => f + 15);
            }}
            className="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/20 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all"
            title="Manual RCS Thruster Attitude Correction"
          >
            💨 RCS BURST
          </button>

          {/* Mission Abort */}
          <button
            onClick={() => {
              playClick();
              if (window.confirm('Abort mission and return to Mission Control?')) {
                if (onAbort) onAbort();
              }
            }}
            className="px-2.5 py-1 rounded-lg border border-red-500/50 bg-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/30 transition-all"
          >
            🛑 ABORT
          </button>
        </div>
      </div>

      {/* Flight Phase Step Indicator */}
      <div className="relative z-10 w-full px-4 py-1.5 bg-black/40 backdrop-blur-sm border-b border-white/5 flex gap-1.5 items-center">
        {SIMULATION_PHASES.map((p, idx) => {
          const isDone = idx < currentPhaseIndex;
          const isCurr = idx === currentPhaseIndex;
          return (
            <div key={p.id} className="flex-1 flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
                <span className={isCurr ? 'text-space-accent font-bold' : isDone ? 'text-green-400' : ''}>
                  {idx + 1}. {p.name.split(':')[1]}
                </span>
                {isDone && <span className="text-green-400">✓</span>}
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    isDone ? 'bg-green-400' : isCurr ? 'bg-space-accent' : 'bg-transparent'
                  }`}
                  style={{ width: isDone ? '100%' : isCurr ? `${phaseProgress}%` : '0%' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Live In-Flight Telemetry HUD Overlay */}
      <div className="relative z-10 mt-auto p-4 flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-none">
        {/* Left Telemetry Cluster */}
        <div className="bg-black/75 border border-white/15 rounded-2xl p-3 backdrop-blur-md w-full md:w-auto shadow-2xl pointer-events-auto">
          <div className="text-[10px] text-space-accent font-mono font-bold tracking-widest flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-space-accent animate-ping" />
            LIVE FLIGHT TELEMETRY · MET 00:04:22
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-[9px] text-gray-400">ALTITUDE</div>
              <div className="text-sm font-bold text-white">{telemetry.altitudeKm.toLocaleString()} km</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-[9px] text-gray-400">VELOCITY</div>
              <div className="text-sm font-bold text-space-accent">{telemetry.velocityKmS} km/s</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-[9px] text-gray-400">RANGE TO TARGET</div>
              <div className="text-sm font-bold text-amber-400">{telemetry.distanceToTargetKm.toLocaleString()} km</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-[9px] text-gray-400">THRUST</div>
              <div className="text-sm font-bold text-green-400">{telemetry.thrustOutputKn} kN</div>
            </div>
          </div>
          <div className="mt-2 text-[10px] font-mono text-gray-300 flex items-center justify-between border-t border-white/10 pt-1.5">
            <span>STATUS: <strong className="text-space-accent">{telemetry.statusText}</strong></span>
            <span>BATTERY: <strong className="text-green-400">{telemetry.batterySoC}%</strong></span>
          </div>
        </div>

        {/* Right Resource Gauges Mini-HUD */}
        <div className="bg-black/75 border border-white/15 rounded-2xl p-3 backdrop-blur-md w-full md:w-72 shadow-2xl pointer-events-auto">
          <div className="text-[10px] text-gray-400 font-mono font-bold mb-2 flex justify-between">
            <span>PROPULSION & PAYLOAD</span>
            <span className="text-space-accent">{objective.targetBody}</span>
          </div>
          <div className="space-y-1.5 text-[10px] font-mono">
            <div>
              <div className="flex justify-between text-gray-400 mb-0.5">
                <span>Fuel Expended</span>
                <span className="text-white font-bold">{fuelBurnedKg} / {metrics.fuelMassKg} kg</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (fuelBurnedKg / (metrics.fuelMassKg || 1)) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-gray-400 mb-0.5">
                <span>Science Data Yield</span>
                <span className="text-space-accent font-bold">+{liveScienceYield} / {metrics.scienceTarget} pts</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-space-accent transition-all duration-300"
                  style={{ width: `${Math.min(100, (liveScienceYield / (metrics.scienceTarget || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

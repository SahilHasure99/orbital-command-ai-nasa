// ORBITAL COMMAND AI — 3D Space Journey, Planetary Landing & Rover Exploration
// Implements interplanetary cruise trajectory, planetary approach, atmospheric entry plasma,
// precision landing, and Mars rover deployment with scientific lasers & sampling

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getPlanetTexture } from '../utils/proceduralAssets';
import { playSuccess, playClick } from '../utils/sounds';

export default function ThreeJourneyAndLanding({
  objective,
  rocket: _rocket,
  metrics,
  componentIds: _componentIds = [],
  onComplete,
  onAbort
}) {
  const mountRef = useRef(null);
  const [subPhase, setSubPhase] = useState('cruise'); // cruise, approach, entry, landing, rover, science
  const [journeyProgress, setJourneyProgress] = useState(0); // 0 to 100
  const [scienceYield, setScienceYield] = useState(0);
  const [roverDeployed, setRoverDeployed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('INTERPLANETARY CRUISE · TRAJECTORY CORRECTION');

  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    craftGroup: null,
    targetPlanet: null,
    roverGroup: null,
    laserBeam: null,
    plasmaGlow: null,
    groundDust: null,
    clock: new THREE.Clock()
  });

  const isMars = objective.id === 'mars';

  // Sub-phase progression
  useEffect(() => {
    const timer = setInterval(() => {
      setJourneyProgress((prev) => {
        const next = prev + 1.2;

        if (next < 25) {
          setSubPhase('cruise');
          setStatusMessage('INTERPLANETARY CRUISE · TRAJECTORY ACCURATE');
        } else if (next >= 25 && next < 50) {
          setSubPhase('approach');
          setStatusMessage(`GRAVITATIONAL SPHERE OF INFLUENCE · ${objective.targetBody.toUpperCase()} INSERTION`);
        } else if (next >= 50 && next < 70) {
          setSubPhase('entry');
          setStatusMessage(isMars ? 'HYPERSONIC ATMOSPHERIC ENTRY · 12,000 KM/H PLASMA' : 'DEORBIT BRAKING RETRO-BURN');
        } else if (next >= 70 && next < 85) {
          setSubPhase('landing');
          setStatusMessage(isMars ? 'TERMINAL RETRO-DESCENT · SKYCRANE TOUCHDOWN' : 'SURFACE TOUCHDOWN · LANDING GEAR ANCHORED');
        } else if (next >= 85 && next < 100) {
          setSubPhase('rover');
          setRoverDeployed(true);
          setStatusMessage(isMars ? 'PERSEVERANCE ROVER DEPLOYED · MAST & DRILL EXTENDED' : 'ROBOTIC ARM DEPLOYED · INSTRUMENTS ACTIVE');
          setScienceYield(Math.round(((next - 85) / 15) * metrics.sciencePoints));
        } else if (next >= 100) {
          clearInterval(timer);
          playSuccess();
          setTimeout(() => {
            if (onComplete) onComplete({ finalScience: metrics.sciencePoints });
          }, 1200);
          return 100;
        }

        return next;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [isMars, metrics, objective, onComplete]);

  // Three.js 3D Space Journey & Surface Exploration Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060e);
    scene.fog = new THREE.FogExp2(0x04060e, 0.002);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Space Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    sunLight.position.set(20, 25, 15);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Deep Starfield
    const starCount = 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 800;
      starPos[i + 1] = (Math.random() - 0.5) * 800;
      starPos[i + 2] = (Math.random() - 0.5) * 800;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Target Planet (Mars / Moon / Earth)
    const targetGroup = new THREE.Group();
    targetGroup.position.set(0, 0, -45);

    const planetTexture = getPlanetTexture(isMars ? 'mars' : objective.id === 'moon' ? 'mercury' : 'earth');
    const planetGeo = new THREE.SphereGeometry(isMars ? 10 : 8, 36, 36);
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    const targetPlanet = new THREE.Mesh(planetGeo, planetMat);
    targetGroup.add(targetPlanet);

    // Atmospheric Plasma Halo (for Mars entry)
    const plasmaGeo = new THREE.SphereGeometry(isMars ? 10.5 : 8.4, 36, 36);
    const plasmaMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide
    });
    const plasmaGlow = new THREE.Mesh(plasmaGeo, plasmaMat);
    targetGroup.add(plasmaGlow);

    scene.add(targetGroup);

    // 3D Spacecraft Group
    const craftGroup = new THREE.Group();
    craftGroup.position.set(0, 0, 0);

    // Spacecraft Bus (Gold MLI chassis)
    const busGeo = new THREE.CylinderGeometry(0.8, 0.9, 1.2, 8);
    const busMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });
    const bus = new THREE.Mesh(busGeo, busMat);
    craftGroup.add(bus);

    // Deployable Solar Arrays
    const wingGeo = new THREE.BoxGeometry(1.6, 0.6, 0.04);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0a224a, metalness: 0.9, roughness: 0.2 });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-1.4, 0.1, 0);
    craftGroup.add(leftWing);

    const rightWing = leftWing.clone();
    rightWing.position.x = 1.4;
    craftGroup.add(rightWing);

    // High Gain Antenna Dish
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6, side: THREE.DoubleSide })
    );
    dish.position.set(0, 0.8, 0.2);
    dish.rotation.x = Math.PI / 3;
    craftGroup.add(dish);

    // Heat Shield on bottom
    const shieldGeo = new THREE.CylinderGeometry(1.1, 0.8, 0.2, 24);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x181a1f, roughness: 0.9 });
    const heatShield = new THREE.Mesh(shieldGeo, shieldMat);
    heatShield.position.y = -0.7;
    craftGroup.add(heatShield);

    scene.add(craftGroup);

    // 3D Mars Rover Model Group (Perseverance / Curiosity class)
    const roverGroup = new THREE.Group();
    roverGroup.position.set(0, -100, 0); // Hidden until landing phase

    // Rover Chassis Body
    const rBodyGeo = new THREE.BoxGeometry(1.4, 0.6, 2.0);
    const rBodyMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.6, roughness: 0.3 });
    const rBody = new THREE.Mesh(rBodyGeo, rBodyMat);
    roverGroup.add(rBody);

    // 6 Rocker-Bogie Rover Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222225, metalness: 0.8 });
    const wheelPositions = [
      [-0.85, -0.4, 0.8], [0.85, -0.4, 0.8],
      [-0.9, -0.4, 0], [0.9, -0.4, 0],
      [-0.85, -0.4, -0.8], [0.85, -0.4, -0.8]
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, y, z);
      roverGroup.add(w);
    });

    // Remote Sensing Mast (Mastcam-Z & SuperCam)
    const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1);
    const mast = new THREE.Mesh(mastGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
    mast.position.set(0.3, 0.8, 0.6);
    roverGroup.add(mast);

    const headGeo = new THREE.BoxGeometry(0.25, 0.18, 0.22);
    const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0x00d4ff }));
    head.position.set(0.3, 1.4, 0.6);
    roverGroup.add(head);

    // Robotic Sampling Arm with Drill
    const armGroup = new THREE.Group();
    armGroup.position.set(-0.35, 0.2, 0.9);
    const armSegmentGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7);
    const armSegment = new THREE.Mesh(armSegmentGeo, new THREE.MeshStandardMaterial({ color: 0x444444 }));
    armSegment.position.y = 0.35;
    armGroup.add(armSegment);
    roverGroup.add(armGroup);

    // RTG Power Cylinder at Rear of Rover
    const rtgGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12);
    const rtg = new THREE.Mesh(rtgGeo, new THREE.MeshStandardMaterial({ color: 0x444444 }));
    rtg.position.set(0, 0.45, -0.9);
    roverGroup.add(rtg);

    scene.add(roverGroup);

    // SuperCam Science Laser Beam (Ray)
    const laserGeo = new THREE.CylinderGeometry(0.015, 0.015, 6);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.position.set(0.3, 1.4, 3.6);
    laserBeam.rotation.x = Math.PI / 2.2;
    roverGroup.add(laserBeam);

    threeRef.current = {
      scene,
      camera,
      renderer,
      craftGroup,
      targetPlanet,
      targetGroup,
      roverGroup,
      laserBeam,
      plasmaGlow,
      clock: new THREE.Clock()
    };

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = threeRef.current.clock.getElapsedTime();

      // Planet rotation
      targetPlanet.rotation.y = time * 0.08;

      // Update Phase-specific Motion
      if (subPhase === 'cruise') {
        // Spacecraft drifting through cosmos
        craftGroup.position.set(0, Math.sin(time * 1.5) * 0.15, 0);
        craftGroup.rotation.set(0.1, time * 0.15, 0);
        targetGroup.position.set(0, 0, -65);
        plasmaGlow.material.opacity = 0;
      } else if (subPhase === 'approach') {
        // Approaching target body
        craftGroup.position.set(0, Math.sin(time * 2) * 0.2, 0);
        craftGroup.rotation.set(0.3, Math.PI, 0); // Retro-burn orientation
        targetGroup.position.set(0, -2, -35);
        plasmaGlow.material.opacity = 0;
      } else if (subPhase === 'entry') {
        // Hypersonic atmospheric entry
        craftGroup.position.set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, 0);
        craftGroup.rotation.set(0.4, 0, 0);
        targetGroup.position.set(0, -8, -18);
        plasmaGlow.material.opacity = 0.65 + Math.sin(time * 20) * 0.2; // Glowing fire
      } else if (subPhase === 'landing') {
        // Terminal retro-braking touchdown
        craftGroup.position.set(0, 2, 0);
        craftGroup.rotation.set(0, 0, 0);
        targetGroup.position.set(0, -14, -8);
        plasmaGlow.material.opacity = 0;
      } else if (subPhase === 'rover') {
        // Rover surface operations
        craftGroup.position.set(0, -100, 0); // probe landed off-screen
        roverGroup.position.set(0, -0.6, 0);
        roverGroup.rotation.y = Math.sin(time * 0.5) * 0.2;
        targetGroup.position.set(0, -14, -8);

        // Fire scientific laser
        laserMat.opacity = 0.5 + Math.sin(time * 12) * 0.4;
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
  }, [subPhase, isMars, objective]);

  return (
    <div className="fixed inset-0 z-[95] bg-black flex flex-col overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3 font-mono">
          <div className="w-9 h-9 rounded-xl bg-space-accent/20 border border-space-accent flex items-center justify-center text-xl">
            {isMars ? '🔴' : '🛰️'}
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-widest uppercase">
              ORBITAL COMMAND AI · SPACE JOURNEY & EXPLORATION
            </div>
            <div className="text-[10px] text-space-accent font-bold">
              Target: {objective.name} · Range: {objective.distanceDisplay}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playClick();
              if (onComplete) onComplete({ finalScience: metrics.sciencePoints });
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-gray-300"
          >
            SKIP TO DEBRIEF ➔
          </button>
          <button
            onClick={() => {
              playClick();
              if (onAbort) onAbort();
            }}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-mono text-red-400 font-bold"
          >
            🛑 ABORT
          </button>
        </div>
      </div>

      {/* Trajectory Phase Step Indicator */}
      <div className="relative z-10 max-w-2xl mx-auto w-full px-4">
        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
          <span className="text-gray-400">MISSION FLIGHT PROFILE:</span>
          <span className="text-space-accent font-bold">{Math.round(journeyProgress)}% COMPLETE</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/15">
          <div
            className="h-full bg-gradient-to-r from-space-accent via-cyan-400 to-green-400 transition-all duration-300"
            style={{ width: `${journeyProgress}%` }}
          />
        </div>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="relative z-10 mt-auto p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
        <div className="max-w-4xl mx-auto bg-black/75 border border-white/15 rounded-2xl p-4 backdrop-blur-md shadow-2xl space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">STATUS: <strong className="text-space-accent">{statusMessage}</strong></span>
            <span className="text-amber-400 font-bold uppercase">{subPhase} STAGE</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-[9px] text-gray-400">SURFACE ELEVATION</div>
              <div className="text-lg font-bold text-white">
                {subPhase === 'rover' ? '0.0 m (Landed)' : subPhase === 'landing' ? '450 m' : '180,000 km'}
              </div>
            </div>

            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-[9px] text-gray-400">THERMAL LOAD</div>
              <div className={`text-lg font-bold ${subPhase === 'entry' ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                {subPhase === 'entry' ? '1,840°C' : '-65°C (Nominal)'}
              </div>
            </div>

            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-[9px] text-gray-400">SCIENCE SAMPLES</div>
              <div className="text-lg font-bold text-space-accent">
                +{scienceYield} / {metrics.scienceTarget} pts
              </div>
            </div>

            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-[9px] text-gray-400">PAYLOAD STATE</div>
              <div className="text-lg font-bold text-purple-400">
                {roverDeployed ? 'ROVER DEPLOYED ✓' : 'CRUISE CRADLE'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

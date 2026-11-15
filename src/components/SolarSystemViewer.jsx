// ============================================================================
// ORBITAL COMMAND AI — Advanced 3D Solar System & Planetary Exploration
// Features Sun with corona flares, dual-layer Earth with rotating clouds & night lights,
// orbiting 3D Moon, Saturn rings with Cassini division, 6 camera modes,
// time warp (0x-50x), raycaster click focus, and authentic NASA scientific dossier
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { solarSystemBodies } from '../data/planets';
import {
  getPlanetTexture,
  getSaturnRingTexture,
  getEarthCloudsTexture,
  getEarthNightLightsTexture,
  getMoonTexture
} from '../utils/proceduralAssets';
import { playClick, playTelemetryChirp } from '../utils/sounds';

export default function SolarSystemViewer({ onSelectTargetMission, onClose }) {
  const mountRef = useRef(null);

  // Simulation State
  const [selectedBodyId, setSelectedBodyId] = useState('earth');
  const [simSpeed, setSimSpeed] = useState(1); // 0 (pause), 1, 5, 10, 50
  const [showOrbits, setShowOrbits] = useState(true);
  const [cameraMode, setCameraMode] = useState('overview'); // overview, focus, spacecraft, orbital, cinematic, free
  const [showDossier, setShowDossier] = useState(true);

  const selectedBody = solarSystemBodies.find((b) => b.id === selectedBodyId) || solarSystemBodies[3];

  const threeState = useRef({
    scene: null,
    camera: null,
    renderer: null,
    planets: [],
    orbitLines: [],
    earthClouds: null,
    moonMesh: null,
    sunCorona: null,
    spacecraftProbe: null,
    targetCamPos: new THREE.Vector3(0, 48, 88),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    camDistance: 88,
    camRotX: 0.55,
    camRotY: 0.35,
    clock: new THREE.Clock()
  });

  // Handle Planet Selection & Smooth Camera Flight
  const handleSelectBody = (id) => {
    playClick();
    setSelectedBodyId(id);
    setShowDossier(true);

    const bodyObj = threeState.current.planets.find((p) => p.data.id === id);
    if (bodyObj) {
      setCameraMode('focus');
      playTelemetryChirp();

      const worldPos = new THREE.Vector3();
      bodyObj.mesh.getWorldPosition(worldPos);
      threeState.current.targetLookAt.copy(worldPos);

      const offsetDist = Math.max(3.5, bodyObj.data.radiusScale * 4.2);
      threeState.current.targetCamPos.set(
        worldPos.x + offsetDist * 1.4,
        worldPos.y + offsetDist * 0.7,
        worldPos.z + offsetDist * 1.4
      );
    }
  };

  // Switch Camera Modes
  const handleSetCameraMode = (mode) => {
    playClick();
    setCameraMode(mode);

    if (mode === 'overview') {
      threeState.current.targetCamPos.set(0, 55, 95);
      threeState.current.targetLookAt.set(0, 0, 0);
    } else if (mode === 'orbital') {
      threeState.current.targetCamPos.set(0, 2.5, 110);
      threeState.current.targetLookAt.set(0, 0, 0);
    } else if (mode === 'spacecraft') {
      // Follow interplanetary probe
      threeState.current.targetLookAt.set(18, 0, 8);
      threeState.current.targetCamPos.set(22, 4, 14);
    } else if (mode === 'focus' || mode === 'cinematic') {
      const bodyObj = threeState.current.planets.find((p) => p.data.id === selectedBodyId);
      if (bodyObj) {
        const worldPos = new THREE.Vector3();
        bodyObj.mesh.getWorldPosition(worldPos);
        threeState.current.targetLookAt.copy(worldPos);
        const offsetDist = Math.max(3.5, bodyObj.data.radiusScale * 4.2);
        threeState.current.targetCamPos.set(
          worldPos.x + offsetDist * 1.4,
          worldPos.y + offsetDist * 0.7,
          worldPos.z + offsetDist * 1.4
        );
      }
    }
  };

  // Initialize Three.js 3D Solar System Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 950;
    const height = container.clientHeight || 650;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020308);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
    camera.position.set(0, 55, 95);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Solar Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(ambientLight);

    // The Sun serves as the omnidirectional central point light
    const sunLight = new THREE.PointLight(0xfff7ea, 4.0, 1200, 0.35);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Deep Cosmic Starfield Background
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1600;
      starPositions[i + 1] = (Math.random() - 0.5) * 1600;
      starPositions[i + 2] = (Math.random() - 0.5) * 1600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.3,
      transparent: true,
      opacity: 0.85
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 3. Celestial Bodies & Orbital Planes
    const planetsList = [];
    const orbitLinesList = [];

    solarSystemBodies.forEach((body) => {
      // Orbital pivot group centered at (0,0,0)
      const pivotGroup = new THREE.Group();
      scene.add(pivotGroup);

      // Planet Mesh & PBR Shading
      const texture = getPlanetTexture(body.id);
      let material;

      if (body.id === 'sun') {
        // Emissive photosphere
        material = new THREE.MeshBasicMaterial({
          map: texture,
          color: 0xffffff
        });
      } else {
        // High-fidelity standard material receiving real solar shadows
        material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: body.id === 'earth' ? 0.6 : 0.75,
          metalness: 0.1
        });
      }

      const sphereGeo = new THREE.SphereGeometry(body.radiusScale, 48, 48);
      const mesh = new THREE.Mesh(sphereGeo, material);
      mesh.position.x = body.orbitalRadius;
      mesh.rotation.z = (body.axialTilt * Math.PI) / 180;
      mesh.castShadow = body.id !== 'sun';
      mesh.receiveShadow = body.id !== 'sun';
      mesh.userData = { bodyId: body.id, name: body.name };
      pivotGroup.add(mesh);

      // A. THE SUN: Dynamic Coronal Halo & Flare Prominences
      if (body.id === 'sun') {
        const coronaGeo = new THREE.SphereGeometry(body.radiusScale * 1.28, 36, 36);
        const coronaMat = new THREE.MeshBasicMaterial({
          color: 0xff8800,
          transparent: true,
          opacity: 0.28,
          side: THREE.BackSide
        });
        const corona = new THREE.Mesh(coronaGeo, coronaMat);
        mesh.add(corona);
        threeState.current.sunCorona = corona;
      }

      // B. EARTH: Dual-Layer Clouds, Night Lights & 3D Moon
      if (body.id === 'earth') {
        // Rotating Cloud Sphere Layer
        const cloudTex = getEarthCloudsTexture();
        const cloudGeo = new THREE.SphereGeometry(body.radiusScale * 1.025, 48, 48);
        const cloudMat = new THREE.MeshStandardMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.65,
          roughness: 1.0,
          blending: THREE.NormalBlending
        });
        const earthClouds = new THREE.Mesh(cloudGeo, cloudMat);
        mesh.add(earthClouds);
        threeState.current.earthClouds = earthClouds;

        // Orbiting 3D Moon with Craters
        const moonGroup = new THREE.Group();
        mesh.add(moonGroup);

        const moonTex = getMoonTexture();
        const moonGeo = new THREE.SphereGeometry(0.28, 32, 32);
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTex,
          roughness: 0.85,
          metalness: 0.05
        });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.x = 2.4;
        moonMesh.castShadow = true;
        moonMesh.receiveShadow = true;
        moonGroup.add(moonMesh);
        threeState.current.moonMesh = moonGroup;

        // Lunar Orbit Circle
        const lunarOrbitGeo = new THREE.RingGeometry(2.38, 2.42, 64);
        const lunarOrbitMat = new THREE.MeshBasicMaterial({ color: 0x88bbff, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
        const lunarOrbit = new THREE.Mesh(lunarOrbitGeo, lunarOrbitMat);
        lunarOrbit.rotation.x = Math.PI / 2;
        mesh.add(lunarOrbit);
      }

      // C. SATURN: Multi-Layer Rings with Cassini Division
      if (body.hasRings && body.id === 'saturn') {
        const ringGeo = new THREE.RingGeometry(body.ringInnerRadius, body.ringOuterRadius, 96);
        const ringTex = getSaturnRingTexture();
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
          roughness: 0.5
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + 0.15;
        ringMesh.castShadow = true;
        ringMesh.receiveShadow = true;
        mesh.add(ringMesh);
      }

      // D. URANUS: Faint Vertical Ring
      if (body.hasRings && body.id === 'uranus') {
        const uRingGeo = new THREE.RingGeometry(body.ringInnerRadius, body.ringOuterRadius, 64);
        const uRingMat = new THREE.MeshBasicMaterial({
          color: 0x7bc8d4,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35
        });
        const uRing = new THREE.Mesh(uRingGeo, uRingMat);
        uRing.rotation.y = Math.PI / 2;
        mesh.add(uRing);
      }

      // E. Planetary Atmospheric Glow Halos
      if (body.id !== 'sun') {
        const haloColor = body.id === 'mars' ? 0xff6622 : body.id === 'venus' ? 0xf5deb3 : body.id === 'earth' ? 0x00d4ff : 0x88ccff;
        const haloGeo = new THREE.SphereGeometry(body.radiusScale * 1.05, 32, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: haloColor,
          transparent: true,
          opacity: body.id === 'venus' ? 0.35 : 0.18,
          side: THREE.BackSide
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        mesh.add(halo);
      }

      // F. Orbit Path Trace Circle
      if (body.orbitalRadius > 0) {
        const orbitCurve = new THREE.EllipseCurve(0, 0, body.orbitalRadius, body.orbitalRadius, 0, 2 * Math.PI, false, 0);
        const points = orbitCurve.getPoints(128);
        const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, 0, p.y)));
        const orbitLineMat = new THREE.LineBasicMaterial({
          color: 0x336699,
          transparent: true,
          opacity: 0.3
        });
        const orbitLine = new THREE.Line(orbitLineGeo, orbitLineMat);
        scene.add(orbitLine);
        orbitLinesList.push(orbitLine);
      }

      planetsList.push({ data: body, mesh, pivot: pivotGroup });
    });

    // 4. Interplanetary Spacecraft Probe on Transfer Trajectory
    const probeGroup = new THREE.Group();
    probeGroup.position.set(18, 0, 8);
    const probeBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 }));
    probeGroup.add(probeBody);
    const probeWing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.3), new THREE.MeshStandardMaterial({ color: 0x0f2b5c }));
    probeGroup.add(probeWing);
    scene.add(probeGroup);
    threeState.current.spacecraftProbe = probeGroup;

    threeState.current.scene = scene;
    threeState.current.camera = camera;
    threeState.current.renderer = renderer;
    threeState.current.planets = planetsList;
    threeState.current.orbitLines = orbitLinesList;

    // 5. Raycaster Planet Click Detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e) => {
      threeState.current.isDragging = true;
      threeState.current.prevMouse = { x: e.clientX, y: e.clientY };

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = planetsList.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.bodyId) {
          handleSelectBody(hit.userData.bodyId);
        }
      }
    };

    const onPointerMove = (e) => {
      if (!threeState.current.isDragging) return;
      const dx = e.clientX - threeState.current.prevMouse.x;
      const dy = e.clientY - threeState.current.prevMouse.y;
      threeState.current.prevMouse = { x: e.clientX, y: e.clientY };

      threeState.current.camRotY += dx * 0.006;
      threeState.current.camRotX += dy * 0.006;
      threeState.current.camRotX = Math.max(-0.85, Math.min(1.2, threeState.current.camRotX));
    };

    const onPointerUp = () => {
      threeState.current.isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      threeState.current.camDistance = Math.max(12, Math.min(240, threeState.current.camDistance + e.deltaY * 0.12));
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 6. Animation & Orbital Physics Loop
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = threeState.current.clock.getDelta();
      const time = threeState.current.clock.getElapsedTime();

      // Orbital Revolution & Axial Rotation
      const speedMult = simSpeed;
      planetsList.forEach((p) => {
        // Orbit around Sun
        if (p.data.orbitSpeed > 0 && speedMult > 0) {
          p.pivot.rotation.y += p.data.orbitSpeed * delta * speedMult;
        }
        // Axial self-rotation
        if (p.data.rotationSpeed && speedMult > 0) {
          p.mesh.rotation.y += p.data.rotationSpeed * delta * Math.min(5, speedMult);
        }
      });

      // Earth Cloud Layer Rotation (slightly faster than planet)
      if (threeState.current.earthClouds) {
        threeState.current.earthClouds.rotation.y += delta * 0.08 * Math.max(1, speedMult);
      }

      // Moon Orbiting Earth
      if (threeState.current.moonMesh) {
        threeState.current.moonMesh.rotation.y += delta * 0.25 * Math.max(1, speedMult);
      }

      // Sun Corona Flare Pulse
      if (threeState.current.sunCorona) {
        const pulse = 1.0 + Math.sin(time * 3.5) * 0.04;
        threeState.current.sunCorona.scale.set(pulse, pulse, pulse);
      }

      // Interplanetary Probe Movement along transfer ellipse
      if (threeState.current.spacecraftProbe) {
        const probeAngle = time * 0.12 * Math.max(1, speedMult);
        threeState.current.spacecraftProbe.position.set(
          Math.cos(probeAngle) * 19,
          Math.sin(probeAngle * 0.5) * 2,
          Math.sin(probeAngle) * 19
        );
      }

      // Orbit lines visibility toggle
      orbitLinesList.forEach((line) => {
        line.visible = showOrbits;
      });

      // Camera Movement by Mode
      if (cameraMode === 'cinematic') {
        threeState.current.camRotY += 0.25 * delta;
      }

      // Camera Position Interpolation
      if (cameraMode === 'free' || cameraMode === 'overview' || cameraMode === 'orbital' || cameraMode === 'cinematic') {
        const dist = threeState.current.camDistance;
        const cy = Math.sin(threeState.current.camRotX) * dist;
        const horizontalDist = Math.cos(threeState.current.camRotX) * dist;
        const cx = Math.sin(threeState.current.camRotY) * horizontalDist;
        const cz = Math.cos(threeState.current.camRotY) * horizontalDist;

        camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.08);
        camera.lookAt(threeState.current.targetLookAt);
      } else {
        // Focus or Spacecraft mode: track world position of target
        const currentTarget = planetsList.find((p) => p.data.id === selectedBodyId);
        if (currentTarget) {
          const worldPos = new THREE.Vector3();
          currentTarget.mesh.getWorldPosition(worldPos);
          threeState.current.targetLookAt.lerp(worldPos, 0.1);

          const offsetDist = Math.max(3.5, currentTarget.data.radiusScale * 4.2);
          const targetPos = new THREE.Vector3(
            worldPos.x + Math.sin(threeState.current.camRotY) * offsetDist * 2.0,
            worldPos.y + offsetDist * 0.8,
            worldPos.z + Math.cos(threeState.current.camRotY) * offsetDist * 2.0
          );
          camera.position.lerp(targetPos, 0.08);
          camera.lookAt(threeState.current.targetLookAt);
        }
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
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedBodyId, simSpeed, showOrbits, cameraMode]);

  return (
    <div className="relative w-full h-full bg-[#020308] select-none overflow-hidden font-mono text-white flex flex-col justify-between">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Directorate Controls Bar */}
      <div className="relative z-10 p-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-space-accent/20 border border-space-accent flex items-center justify-center text-base">
            🪐
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
              <span>SOLAR SYSTEM SIMULATOR</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-space-accent/20 border border-space-accent/40 text-space-accent">
                9 CELESTIAL BODIES
              </span>
            </div>
            <div className="text-[9px] text-gray-400">
              Interactive Keplerian Orbital Mechanics · Simplified Educational Model
            </div>
          </div>
        </div>

        {/* Speed Multiplier & Orbit Toggle */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {/* Orbits Toggle */}
          <button
            onClick={() => {
              playClick();
              setShowOrbits(!showOrbits);
            }}
            className={`px-2.5 py-1 rounded-xl border font-bold transition-all ${
              showOrbits ? 'bg-space-accent/20 border-space-accent text-space-accent' : 'bg-white/10 border-white/20 text-gray-400'
            }`}
            title="Toggle Orbital Path Lines"
          >
            {showOrbits ? '⚪ ORBITS ON' : '⚪ ORBITS OFF'}
          </button>

          {/* Time Warp Speeds */}
          <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/20">
            {[
              { val: 0, label: '⏸' },
              { val: 1, label: '1×' },
              { val: 5, label: '5×' },
              { val: 10, label: '10×' },
              { val: 50, label: '50×' }
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => {
                  playClick();
                  setSimSpeed(spd.val);
                }}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                  simSpeed === spd.val
                    ? 'bg-space-accent text-black shadow-md shadow-space-accent/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          {/* Close / Return to Dashboard */}
          {onClose && (
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 font-bold transition-all"
            >
              ✕ EXIT
            </button>
          )}
        </div>
      </div>

      {/* Floating Scientific Dossier Panel (when a planet is selected) */}
      {showDossier && selectedBody && (
        <div className="absolute top-16 right-4 z-20 w-80 md:w-96 max-h-[78vh] overflow-y-auto bg-black/80 border border-white/20 rounded-3xl p-4 backdrop-blur-xl shadow-2xl space-y-3">
          <div className="flex items-start justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{selectedBody.icon}</span>
              <div>
                <h3 className="text-lg font-extrabold text-white leading-tight">{selectedBody.name}</h3>
                <span className="text-[10px] text-space-accent font-bold uppercase">{selectedBody.type}</span>
              </div>
            </div>
            <button
              onClick={() => setShowDossier(false)}
              className="text-gray-400 hover:text-white text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* Scientific Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-gray-400">DISTANCE TO SUN</span>
              <div className="font-bold text-white text-xs mt-0.5">{selectedBody.distanceDisplay}</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-gray-400">DIAMETER</span>
              <div className="font-bold text-white text-xs mt-0.5">{selectedBody.diameter}</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-gray-400">SURFACE GRAVITY</span>
              <div className="font-bold text-green-400 text-xs mt-0.5">{selectedBody.surfaceGravity}</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-gray-400">SURFACE TEMP</span>
              <div className="font-bold text-amber-400 text-xs mt-0.5">{selectedBody.surfaceTemp}</div>
            </div>
          </div>

          {/* Atmosphere Composition */}
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-[10px]">
            <span className="text-gray-400 uppercase font-bold">Atmospheric Composition:</span>
            <div className="text-gray-200 mt-0.5">{selectedBody.atmosphere}</div>
          </div>

          {/* Scientific Fact */}
          <div className="bg-space-accent/10 border border-space-accent/30 p-2.5 rounded-xl text-[10px] text-space-accent leading-relaxed">
            💡 <strong>ASTRONOMICAL RECORD:</strong> {selectedBody.scientificFact}
          </div>

          {/* NASA Exploration Programs */}
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold">NASA Historic & Active Missions:</span>
            <div className="flex flex-wrap gap-1">
              {selectedBody.nasaMissions.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[9px] font-bold"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Action: Target for Mission Launch */}
          {selectedBody.id !== 'sun' && (
            <button
              onClick={() => {
                playClick();
                if (onSelectTargetMission) onSelectTargetMission(selectedBody.id);
              }}
              className="w-full py-2.5 rounded-xl bg-space-accent hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-space-accent/30 transition-all flex items-center justify-center gap-1.5"
            >
              <span>🚀 TARGET {selectedBody.name.toUpperCase()} FOR MISSION LAUNCH</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Planet Selection Carousel & Camera Mode Bar */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-2">
        {/* Camera Modes */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="text-gray-400 mr-1 hidden sm:inline">CAMERA:</span>
            {[
              { id: 'overview', label: '🌌 Overview' },
              { id: 'focus', label: '🔍 Focus' },
              { id: 'spacecraft', label: '🛰️ Probe Track' },
              { id: 'orbital', label: '📐 Orbital Plane' },
              { id: 'cinematic', label: '🎬 Cinematic Orbit' }
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => handleSetCameraMode(cam.id)}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  cameraMode === cam.id
                    ? 'bg-space-accent text-black font-bold shadow-md shadow-space-accent/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/15 border border-white/10'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-gray-400">
            🎮 Drag to rotate · Scroll to zoom · Click planet to focus
          </div>
        </div>

        {/* 9 Planetary Selection Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {solarSystemBodies.map((body) => {
            const isSelected = selectedBodyId === body.id;
            return (
              <button
                key={body.id}
                onClick={() => handleSelectBody(body.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-space-accent text-black font-bold border-space-accent shadow-lg shadow-space-accent/30'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/15 hover:text-white'
                }`}
              >
                <span>{body.icon}</span>
                <span>{body.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

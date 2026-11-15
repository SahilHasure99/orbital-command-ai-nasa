// ============================================================================
// ORBITAL COMMAND AI — Premium Cinematic Rocket Launch Experience
// 10-Second synchronized countdown, engine ignition shock diamonds,
// billowing volumetric smoke, camera rumble, multi-stage separation,
// fairing jettison, Earth orbital insertion, and multi-angle flight cameras
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getRocketSkinTexture } from '../utils/proceduralAssets';
import {
  playCountdownBeep,
  playLaunchRumble,
  playThrusterBurst,
  playTelemetryChirp,
  playClick
} from '../utils/sounds';

export default function CinematicLaunch({
  rocket,
  objective,
  metrics,
  componentIds = [],
  onLaunchComplete,
  onAbort
}) {
  const mountRef = useRef(null);

  // Flight State
  const [countdown, setCountdown] = useState(10);
  const [isLaunched, setIsLaunched] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraMode, setCameraMode] = useState('tracking'); // tracking, tower, booster, chase
  const [flightPhase, setFlightPhase] = useState('COUNTDOWN'); // COUNTDOWN, LIFTOFF, MAX_Q, MECO_STAGING, SECOND_STAGE, FAIRING_SEP, ORBIT_INSERTION
  const [statusMessage, setStatusMessage] = useState('FLIGHT DIRECTOR: ALL SYSTEMS NOMINAL · T-10 SEC');

  // Live Telemetry
  const [telemetry, setTelemetry] = useState({
    altitudeKm: 0,
    velocityKmS: 0,
    accelerationG: 1.0,
    fuelPercent: 100,
    engineStatus: 'STANDBY',
    metSeconds: 0,
    commLink: 'DSN GOLDSTONE (99.8%)'
  });

  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    rocketGroup: null,
    stage1Mesh: null,
    stage2Group: null,
    fairingL: null,
    fairingR: null,
    payloadMesh: null,
    fireParticles: null,
    smokeParticles: null,
    shockDiamond: null,
    vacuumPlume: null,
    engineFireLight: null,
    arm1: null,
    arm2: null,
    towerGroup: null,
    cloudMesh: null,
    earthHorizon: null,
    stars: null,
    isIgnited: false,
    stageSeparated: false,
    fairingSeparated: false,
    orbitInserted: false,
    ascentSpeed: 0,
    rocketY: 0,
    screenShake: 0,
    clock: new THREE.Clock()
  });

  // 10-Second Synchronized Countdown Sequence
  useEffect(() => {
    if (isPaused) return;

    if (countdown > 0) {
      playCountdownBeep(countdown <= 3);

      if (countdown === 10) setStatusMessage('FLIGHT SYSTEMS CHECK · RANGE SAFETY GREEN');
      else if (countdown === 8) setStatusMessage('PROPULSION TANKS PRESSURIZED · LOX/RP-1 READY');
      else if (countdown === 6) setStatusMessage('GUIDANCE COMPUTER INTERNAL FLIGHT PROGRAM ACTIVE');
      else if (countdown === 4) setStatusMessage('HYDRAULICS & THRUST VECTOR CONTROL ALIGNED');
      else if (countdown === 3) {
        // T-3s: Engine Ignition Sequence Start
        threeRef.current.isIgnited = true;
        threeRef.current.screenShake = 0.35;
        setStatusMessage('TURBOPUMP SPINUP · ENGINE IGNITION SEQUENCE START');
        playLaunchRumble(8);
      } else if (countdown === 2) {
        setStatusMessage('ALL ENGINES VERIFIED AT 100% THRUST · CLAMPS ARMED');
      } else if (countdown === 1) {
        setStatusMessage('TERMINAL COUNT · LAUNCH AUTONOMOUS COMMENCE');
      }

      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isLaunched) {
      // T-0s: Liftoff!
      setIsLaunched(true);
      setFlightPhase('LIFTOFF');
      setStatusMessage('LIFTOFF! CLAMPS RELEASED · TOWER CLEARED · GO FOR ASCENT');
      playCountdownBeep(true);
      playThrusterBurst();
    }
  }, [countdown, isLaunched, isPaused]);

  // Main Three.js Cinematic Launch Environment
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1e38); // Twilight atmospheric dusk
    scene.fog = new THREE.FogExp2(0x0c1e38, 0.0035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 3, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Launchpad Lighting & Atmospheric Sun
    const ambientLight = new THREE.AmbientLight(0x283a54, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5dd, 2.5);
    sunLight.position.set(40, 60, 45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const padSpot1 = new THREE.SpotLight(0xffeedd, 3.5, 75, Math.PI / 4, 0.5);
    padSpot1.position.set(-16, 22, 14);
    padSpot1.castShadow = true;
    scene.add(padSpot1);

    const padSpot2 = new THREE.SpotLight(0x88ccff, 2.5, 75, Math.PI / 4, 0.5);
    padSpot2.position.set(16, 22, 14);
    scene.add(padSpot2);

    const engineFireLight = new THREE.PointLight(0xff7700, 0, 70);
    engineFireLight.position.set(0, -2.5, 0);
    scene.add(engineFireLight);

    // 3. Ground Terrain & Concrete Launch Platform
    const groundGeo = new THREE.PlaneGeometry(600, 600, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x141822, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4;
    ground.receiveShadow = true;
    scene.add(ground);

    // Elevated Launch Stand with Flame Trench Opening
    const padStandGeo = new THREE.BoxGeometry(12, 2.8, 12);
    const padStandMat = new THREE.MeshStandardMaterial({ color: 0x242834, roughness: 0.85 });
    const padStand = new THREE.Mesh(padStandGeo, padStandMat);
    padStand.position.y = -2.6;
    padStand.receiveShadow = true;
    scene.add(padStand);

    // Flame Trench Deflector Wedge
    const deflectorGeo = new THREE.ConeGeometry(3.5, 2.2, 4);
    const deflectorMat = new THREE.MeshStandardMaterial({ color: 0x1a1c22, roughness: 0.9 });
    const deflector = new THREE.Mesh(deflectorGeo, deflectorMat);
    deflector.rotation.y = Math.PI / 4;
    deflector.position.set(0, -3.8, 0);
    scene.add(deflector);

    // Launch Umbilical Gantry Tower
    const towerGroup = new THREE.Group();
    towerGroup.position.set(-5.2, 6, 0);
    const towerTrussGeo = new THREE.BoxGeometry(1.6, 20, 1.6);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x8a2020, metalness: 0.7, roughness: 0.4 });
    const towerTruss = new THREE.Mesh(towerTrussGeo, towerMat);
    towerTruss.castShadow = true;
    towerGroup.add(towerTruss);

    // Lightning Mast
    const mastGeo = new THREE.CylinderGeometry(0.04, 0.1, 4.5);
    const mast = new THREE.Mesh(mastGeo, new THREE.MeshStandardMaterial({ color: 0xdddddd }));
    mast.position.y = 12.2;
    towerGroup.add(mast);

    // Retractable Umbilical Swing Arms
    const armGeo = new THREE.BoxGeometry(3.8, 0.4, 0.4);
    const arm1 = new THREE.Mesh(armGeo, towerMat);
    arm1.position.set(2.2, 5.5, 0);
    towerGroup.add(arm1);

    const arm2 = new THREE.Mesh(armGeo, towerMat);
    arm2.position.set(2.2, 0.8, 0);
    towerGroup.add(arm2);
    scene.add(towerGroup);

    // Atmospheric Cloud Deck (Volumetric Layer at y = 45)
    const cloudGroup = new THREE.Group();
    cloudGroup.position.y = 45;
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      roughness: 1.0
    });
    for (let i = 0; i < 20; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(Math.random() * 8 + 6, 12, 12), cloudMat);
      puff.position.set((Math.random() - 0.5) * 160, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 160);
      puff.scale.set(1.8, 0.5, 1.2);
      cloudGroup.add(puff);
    }
    scene.add(cloudGroup);

    // Curved Earth Sphere for Orbital Insertion View (high altitude)
    const earthGeo = new THREE.SphereGeometry(180, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x114488,
      roughness: 0.7
    });
    const earthHorizon = new THREE.Mesh(earthGeo, earthMat);
    earthHorizon.position.set(0, -190, -80);
    earthHorizon.visible = false;
    scene.add(earthHorizon);

    // High-Altitude Starfield
    const starCount = 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 600;
      starPos[i + 1] = Math.random() * 400 + 40;
      starPos[i + 2] = (Math.random() - 0.5) * 600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 4. Staged Launch Vehicle Construction
    const rocketGroup = new THREE.Group();
    rocketGroup.position.set(0, 0, 0);
    scene.add(rocketGroup);

    // Fuselage Materials
    const stage1Skin = getRocketSkinTexture(rocket.id, 'stage1');
    const stage2Skin = getRocketSkinTexture(rocket.id, 'stage2');
    const fairingSkin = getRocketSkinTexture(rocket.id, 'fairing');

    const s1Mat = new THREE.MeshStandardMaterial({ map: stage1Skin, metalness: 0.45, roughness: 0.35 });
    const s2Mat = new THREE.MeshStandardMaterial({ map: stage2Skin, metalness: 0.45, roughness: 0.35 });
    const fMat = new THREE.MeshStandardMaterial({ map: fairingSkin, metalness: 0.4, roughness: 0.4 });
    const darkAlloy = new THREE.MeshStandardMaterial({ color: 0x181a20, metalness: 0.85, roughness: 0.3 });
    const copperNozzle = new THREE.MeshStandardMaterial({ color: 0x8a4b2a, metalness: 0.9, roughness: 0.25 });

    // A. Stage 1 Booster Core
    const s1Height = 5.2;
    const s1Radius = 0.58;
    const s1Geo = new THREE.CylinderGeometry(s1Radius, s1Radius, s1Height, 32);
    const stage1Mesh = new THREE.Mesh(s1Geo, s1Mat);
    stage1Mesh.castShadow = true;
    rocketGroup.add(stage1Mesh);

    // Engine Cluster bells on Stage 1
    const s1EngineGroup = new THREE.Group();
    s1EngineGroup.position.y = -s1Height * 0.5 - 0.35;
    const s1NozzleGeo = new THREE.ConeGeometry(0.18, 0.6, 16, 1, true);
    for (let i = 0; i < 9; i++) {
      const nozzle = new THREE.Mesh(s1NozzleGeo, copperNozzle);
      const angle = (i * Math.PI) / 4;
      const r = i === 0 ? 0 : 0.32;
      nozzle.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      nozzle.rotation.x = Math.PI;
      s1EngineGroup.add(nozzle);
    }
    stage1Mesh.add(s1EngineGroup);

    // Interstage band
    const interGeo = new THREE.CylinderGeometry(s1Radius, s1Radius, 0.5, 32);
    const interMesh = new THREE.Mesh(interGeo, darkAlloy);
    interMesh.position.y = s1Height * 0.5 + 0.25;
    stage1Mesh.add(interMesh);

    // B. Stage 2 (Upper Stage)
    const stage2Group = new THREE.Group();
    stage2Group.position.y = s1Height * 0.5 + 1.25;
    rocketGroup.add(stage2Group);

    const s2Height = 1.8;
    const s2Geo = new THREE.CylinderGeometry(s1Radius, s1Radius, s2Height, 32);
    const stage2Body = new THREE.Mesh(s2Geo, s2Mat);
    stage2Group.add(stage2Body);

    // Stage 2 Vacuum Engine Nozzle
    const vacNozzleGeo = new THREE.ConeGeometry(0.35, 0.75, 20, 1, true);
    const vacNozzle = new THREE.Mesh(vacNozzleGeo, darkAlloy);
    vacNozzle.position.y = -s2Height * 0.5 - 0.35;
    vacNozzle.rotation.x = Math.PI;
    stage2Group.add(vacNozzle);

    // C. Spacecraft Payload (Inside fairing)
    const payloadGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.7, 8);
    const payloadMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
    const payloadMesh = new THREE.Mesh(payloadGeo, payloadMat);
    payloadMesh.position.y = s2Height * 0.5 + 0.6;
    stage2Group.add(payloadMesh);

    // D. Split Clamshell Payload Fairing (Left & Right halves)
    const fHeight = 2.4;
    const fairingLGroup = new THREE.Group();
    const fairingRGroup = new THREE.Group();
    fairingLGroup.position.y = s2Height * 0.5 + 0.3;
    fairingRGroup.position.y = s2Height * 0.5 + 0.3;
    stage2Group.add(fairingLGroup);
    stage2Group.add(fairingRGroup);

    // Fairing Left Half
    const fCylL = new THREE.CylinderGeometry(s1Radius * 1.15, s1Radius * 1.15, fHeight * 0.45, 24, 1, false, 0, Math.PI);
    const fCylLMesh = new THREE.Mesh(fCylL, fMat);
    fCylLMesh.position.y = fHeight * 0.22;
    fairingLGroup.add(fCylLMesh);

    const fConeL = new THREE.ConeGeometry(s1Radius * 1.15, fHeight * 0.55, 24, 1, false, 0, Math.PI);
    const fConeLMesh = new THREE.Mesh(fConeL, fMat);
    fConeLMesh.position.y = fHeight * 0.45 + fHeight * 0.27;
    fairingLGroup.add(fConeLMesh);

    // Fairing Right Half
    const fCylR = new THREE.CylinderGeometry(s1Radius * 1.15, s1Radius * 1.15, fHeight * 0.45, 24, 1, false, Math.PI, Math.PI);
    const fCylRMesh = new THREE.Mesh(fCylR, fMat);
    fCylRMesh.position.y = fHeight * 0.22;
    fairingRGroup.add(fCylRMesh);

    const fConeR = new THREE.ConeGeometry(s1Radius * 1.15, fHeight * 0.55, 24, 1, false, Math.PI, Math.PI);
    const fConeRMesh = new THREE.Mesh(fConeR, fMat);
    fConeRMesh.position.y = fHeight * 0.45 + fHeight * 0.27;
    fairingRGroup.add(fConeRMesh);

    // 5. Engine Combustion Particles & Volumetric Smoke
    // Fire Plume Particle Stream
    const fireCount = 450;
    const fireGeo = new THREE.BufferGeometry();
    const firePositions = new Float32Array(fireCount * 3);
    for (let i = 0; i < fireCount * 3; i += 3) {
      firePositions[i] = (Math.random() - 0.5) * 0.6;
      firePositions[i + 1] = -Math.random() * 5 - 2.8;
      firePositions[i + 2] = (Math.random() - 0.5) * 0.6;
    }
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePositions, 3));
    const fireMat = new THREE.PointsMaterial({
      color: 0xff6600,
      size: 1.4,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const fireParticles = new THREE.Points(fireGeo, fireMat);
    fireParticles.visible = false;
    rocketGroup.add(fireParticles);

    // Shock Diamond Inner Cone (Mach Diamonds)
    const diamondGeo = new THREE.ConeGeometry(0.24, 1.2, 12);
    const diamondMat = new THREE.MeshBasicMaterial({ color: 0x88ffff, transparent: true, opacity: 0.85 });
    const shockDiamond = new THREE.Mesh(diamondGeo, diamondMat);
    shockDiamond.position.y = -s1Height * 0.5 - 1.2;
    shockDiamond.rotation.x = Math.PI;
    shockDiamond.visible = false;
    rocketGroup.add(shockDiamond);

    // Volumetric Billowing Smoke Particles (Roll across launchpad trench)
    const smokeCount = 700;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount * 3; i += 3) {
      smokePositions[i] = (Math.random() - 0.5) * 4;
      smokePositions[i + 1] = -3.4 + Math.random() * 1.5;
      smokePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0x99a6b8,
      size: 3.2,
      transparent: true,
      opacity: 0.5
    });
    const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
    smokeParticles.visible = false;
    scene.add(smokeParticles);

    // Vacuum Plume for Stage 2 (Bright violet/cyan bloom in upper atmosphere)
    const vacPlumeGeo = new THREE.ConeGeometry(0.85, 3.2, 16);
    const vacPlumeMat = new THREE.MeshBasicMaterial({
      color: 0x8844ff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const vacuumPlume = new THREE.Mesh(vacPlumeGeo, vacPlumeMat);
    vacuumPlume.position.y = -s2Height * 0.5 - 2.0;
    vacuumPlume.rotation.x = Math.PI;
    vacuumPlume.visible = false;
    stage2Group.add(vacuumPlume);

    // Store references
    threeRef.current = {
      scene,
      camera,
      renderer,
      rocketGroup,
      stage1Mesh,
      stage2Group,
      fairingL: fairingLGroup,
      fairingR: fairingRGroup,
      payloadMesh,
      fireParticles,
      smokeParticles,
      shockDiamond,
      vacuumPlume,
      engineFireLight,
      arm1,
      arm2,
      towerGroup,
      cloudMesh: cloudGroup,
      earthHorizon,
      stars,
      isIgnited: false,
      stageSeparated: false,
      fairingSeparated: false,
      orbitInserted: false,
      ascentSpeed: 0,
      rocketY: 0,
      screenShake: 0,
      clock: new THREE.Clock()
    };

    // 6. Animation & Physical Ascent Loop
    let animId;
    let metCounter = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isPaused) return;

      const delta = threeRef.current.clock.getDelta();
      const time = threeRef.current.clock.getElapsedTime();

      // Screen shake damping
      if (threeRef.current.screenShake > 0) {
        camera.position.x += (Math.random() - 0.5) * threeRef.current.screenShake;
        camera.position.y += (Math.random() - 0.5) * threeRef.current.screenShake;
        threeRef.current.screenShake = Math.max(0, threeRef.current.screenShake - delta * 0.25);
      }

      // Engine Ignition Combustion
      if (threeRef.current.isIgnited) {
        fireParticles.visible = true;
        shockDiamond.visible = true;
        smokeParticles.visible = true;
        engineFireLight.intensity = 6.5 + Math.sin(time * 35) * 2.0;

        // Animate flame particles
        const pos = fireParticles.geometry.attributes.position.array;
        for (let i = 1; i < pos.length; i += 3) {
          pos[i] -= 0.42;
          if (pos[i] < -9) pos[i] = -2.8;
        }
        fireParticles.geometry.attributes.position.needsUpdate = true;

        // Billow volumetric smoke horizontally out through the flame trench
        const sPos = smokeParticles.geometry.attributes.position.array;
        for (let i = 0; i < sPos.length; i += 3) {
          sPos[i] += (sPos[i] >= 0 ? 0.12 : -0.12);
          sPos[i + 2] += (sPos[i + 2] >= 0 ? 0.12 : -0.12);
          sPos[i + 1] += 0.02;
          if (Math.abs(sPos[i]) > 22 || Math.abs(sPos[i + 2]) > 22) {
            sPos[i] = (Math.random() - 0.5) * 4;
            sPos[i + 1] = -3.4;
            sPos[i + 2] = (Math.random() - 0.5) * 4;
          }
        }
        smokeParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Physical Ascent & Staging Sequence
      if (isLaunched) {
        metCounter += delta;
        threeRef.current.ascentSpeed += 0.75 * delta;
        threeRef.current.rocketY += threeRef.current.ascentSpeed * 7.5 * delta;
        rocketGroup.position.y = threeRef.current.rocketY;

        // Swing Retractable Umbilical Arms
        arm1.rotation.y = Math.min(Math.PI / 2.3, arm1.rotation.y + delta * 1.8);
        arm2.rotation.y = Math.min(Math.PI / 2.3, arm2.rotation.y + delta * 1.8);

        // Rocket Gravity Turn (Pitch over 15° as velocity builds)
        if (threeRef.current.rocketY > 12) {
          rocketGroup.rotation.z = Math.min(0.42, rocketGroup.rotation.z + 0.03 * delta);
        }

        // Live Telemetry Calculations
        const altKm = Math.round(threeRef.current.rocketY * 2.2);
        const velKmS = Number((threeRef.current.ascentSpeed * 0.42).toFixed(2));
        const accelG = Number((1.0 + threeRef.current.ascentSpeed * 0.35).toFixed(2));
        const fuelPct = Math.max(0, Math.round(100 - (threeRef.current.rocketY / 70) * 85));

        setTelemetry({
          altitudeKm: altKm,
          velocityKmS: velKmS,
          accelerationG: accelG,
          fuelPercent: fuelPct,
          engineStatus: altKm < 50 ? 'STAGE 1 (9x ENGINES 100%)' : altKm < 90 ? 'STAGE 2 (VACUUM 100%)' : 'ORBIT INSERTION',
          metSeconds: Math.round(metCounter),
          commLink: 'DSN GOLDSTONE (99.8%)'
        });

        // --------------------------------------------------------------------
        // FLIGHT PHASE 1: Max-Q (Maximum Dynamic Aerodynamic Pressure)
        // --------------------------------------------------------------------
        if (altKm >= 14 && altKm < 40 && flightPhase !== 'MAX_Q') {
          setFlightPhase('MAX_Q');
          setStatusMessage('MAX-Q · MAXIMUM DYNAMIC PRESSURE · VEHICLE THROTTLING DOWN');
          threeRef.current.screenShake = 0.25;
        }

        // --------------------------------------------------------------------
        // FLIGHT PHASE 2: Cloud Penetration (Sky darkens into space)
        // --------------------------------------------------------------------
        if (altKm >= 35) {
          // Fade sky background to black space
          const skyFactor = Math.max(0, 1 - (altKm - 35) / 45);
          scene.background.setRGB(0.05 * skyFactor, 0.08 * skyFactor, 0.18 * skyFactor);
          scene.fog.density = 0.0035 * skyFactor;
          stars.material.opacity = Math.min(0.9, (1 - skyFactor) * 1.2);
        }

        // --------------------------------------------------------------------
        // FLIGHT PHASE 3: MECO & Stage 1 Separation (at alt ~55 km)
        // --------------------------------------------------------------------
        if (altKm >= 52 && !threeRef.current.stageSeparated) {
          threeRef.current.stageSeparated = true;
          setFlightPhase('MECO_STAGING');
          setStatusMessage('STAGE 1 MECO · PNEUMATIC PUSHERS FIRED · STAGE SEPARATION NOMINAL');
          playTelemetryChirp();

          // Cut stage 1 engine particles
          fireParticles.visible = false;
          shockDiamond.visible = false;

          // Ignite vacuum plume on second stage!
          vacuumPlume.visible = true;
          playThrusterBurst();
        }

        // Drop Stage 1 Booster Core away
        if (threeRef.current.stageSeparated) {
          stage1Mesh.position.y -= delta * 12;
          stage1Mesh.rotation.z += delta * 0.2; // slight tumble away
        }

        // --------------------------------------------------------------------
        // FLIGHT PHASE 4: Payload Fairing Jettison (at alt ~80 km)
        // --------------------------------------------------------------------
        if (altKm >= 78 && !threeRef.current.fairingSeparated) {
          threeRef.current.fairingSeparated = true;
          setFlightPhase('FAIRING_SEP');
          setStatusMessage('ATMOSPHERE EXITED · FAIRING JETTISONED · SPACECRAFT EXPOSED TO SUN');
          playThrusterBurst();
        }

        // Push fairing halves sideways
        if (threeRef.current.fairingSeparated) {
          fairingLGroup.position.x -= delta * 6;
          fairingLGroup.rotation.z -= delta * 0.4;
          fairingRGroup.position.x += delta * 6;
          fairingRGroup.rotation.z += delta * 0.4;
        }

        // --------------------------------------------------------------------
        // FLIGHT PHASE 5: Orbital Insertion Achieved (at alt ~95 km)
        // --------------------------------------------------------------------
        if (altKm >= 95 && !threeRef.current.orbitInserted) {
          threeRef.current.orbitInserted = true;
          earthHorizon.visible = true;
          setFlightPhase('ORBIT_INSERTION');
          setStatusMessage('ORBITAL VELOCITY ACHIEVED · 7.8 KM/S · PARKING ORBIT INSERTION CONFIRMED');
          playTelemetryChirp();
        }

        // Completion & Transition to Space Journey
        if (threeRef.current.rocketY > 75) {
          cancelAnimationFrame(animId);
          setTimeout(() => {
            if (onLaunchComplete) onLaunchComplete();
          }, 1200);
          return;
        }

        // --------------------------------------------------------------------
        // CAMERA TRACKING MODES
        // --------------------------------------------------------------------
        if (cameraMode === 'tracking') {
          // Ground tracking telephoto camera following ascending rocket
          camera.position.x = 8;
          camera.position.y = Math.max(3, threeRef.current.rocketY * 0.7 + 3);
          camera.position.z = Math.min(65, 24 + threeRef.current.rocketY * 0.45);
          camera.lookAt(0, threeRef.current.rocketY, 0);
        } else if (cameraMode === 'tower') {
          // Launch Tower Cam looking down at the pad
          camera.position.set(-4.5, 12, 5);
          camera.lookAt(0, Math.min(25, threeRef.current.rocketY), 0);
        } else if (cameraMode === 'booster') {
          // Downward-looking onboard camera mounted on the second stage
          camera.position.set(0.8, threeRef.current.rocketY + 2.5, 1.8);
          camera.lookAt(0, threeRef.current.rocketY - 10, 0);
        } else if (cameraMode === 'chase') {
          // Third-person cinematic follow camera behind and above
          camera.position.set(2, threeRef.current.rocketY + 4, 14);
          camera.lookAt(0, threeRef.current.rocketY + 2, 0);
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
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isLaunched, isPaused, cameraMode, onLaunchComplete, rocket]);

  return (
    <div className="fixed inset-0 z-[95] bg-black flex flex-col overflow-hidden select-none font-mono">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Directorate Telemetry Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-space-accent/20 border border-space-accent flex items-center justify-center text-xl shadow-lg shadow-space-accent/30 animate-pulse">
            🚀
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <span>ORBITAL COMMAND AI · FLIGHT LAUNCH DIRECTIVE</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                isLaunched ? 'bg-green-500/25 text-green-300 border border-green-500/40' : 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
              }`}>
                {flightPhase}
              </span>
            </div>
            <div className="text-[10px] text-space-accent mt-0.5">
              Launch Vehicle: <strong>{rocket.name}</strong> · Mission Target: <strong>{objective.name}</strong>
            </div>
          </div>
        </div>

        {/* Flight Control Buttons */}
        <div className="flex items-center gap-2 text-xs">
          {/* Pause / Resume */}
          <button
            onClick={() => {
              playClick();
              setIsPaused(!isPaused);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all"
          >
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>

          {/* Skip to Orbit Insertion */}
          <button
            onClick={() => {
              playClick();
              if (onLaunchComplete) onLaunchComplete();
            }}
            className="px-3 py-1.5 rounded-xl bg-space-accent/20 border border-space-accent text-space-accent hover:bg-space-accent/30 font-bold transition-all"
            title="Fast-forward to space journey"
          >
            SKIP CINEMATIC ➔
          </button>

          {/* Abort Mission */}
          <button
            onClick={() => {
              playClick();
              if (onAbort) onAbort();
            }}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all font-bold"
          >
            ABORT FLIGHT ✕
          </button>
        </div>
      </div>

      {/* Large Countdown Overlay (Active during T-10 to T-0) */}
      {!isLaunched && countdown > 0 && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center space-y-2 bg-black/60 p-8 rounded-3xl border border-white/15 backdrop-blur-md shadow-2xl">
            <div className="text-xs tracking-widest text-space-accent font-bold uppercase">
              AUTOMATED IGNITION SEQUENCE
            </div>
            <div className={`text-8xl md:text-9xl font-black tracking-tighter ${
              countdown <= 3 ? 'text-red-500 animate-pulse' : 'text-white'
            }`}>
              T-{countdown}
            </div>
            <div className="text-xs text-gray-300 max-w-sm mx-auto font-sans leading-tight">
              {statusMessage}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Mission Telemetry & Flight Camera Selector */}
      <div className="relative z-10 mt-auto p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent space-y-3">
        {/* Status Message Ticker */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-space-accent">
          <span className="w-2 h-2 rounded-full bg-space-accent animate-ping" />
          <span className="font-bold uppercase tracking-wider">{statusMessage}</span>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="bg-black/60 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="text-[10px] text-gray-400">ALTITUDE</div>
            <div className="text-base font-bold text-white mt-0.5">{telemetry.altitudeKm} km</div>
          </div>

          <div className="bg-black/60 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="text-[10px] text-gray-400">VELOCITY</div>
            <div className="text-base font-bold text-green-400 mt-0.5">{telemetry.velocityKmS} km/s</div>
          </div>

          <div className="bg-black/60 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="text-[10px] text-gray-400">ACCELERATION</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">{telemetry.accelerationG} G</div>
          </div>

          <div className="bg-black/60 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="text-[10px] text-gray-400">PROPELLANT</div>
            <div className="text-base font-bold text-cyan-400 mt-0.5">{telemetry.fuelPercent}%</div>
          </div>

          <div className="bg-black/60 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="text-[10px] text-gray-400">MET (FLIGHT TIME)</div>
            <div className="text-base font-bold text-white mt-0.5">T+{telemetry.metSeconds}s</div>
          </div>

          <div className="bg-black/60 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="text-[10px] text-gray-400">FLIGHT STAGE</div>
            <div className="text-[11px] font-bold text-purple-300 mt-1 truncate">{telemetry.engineStatus}</div>
          </div>
        </div>

        {/* Camera Angles Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-[10px] hidden sm:inline">FLIGHT CAMERAS:</span>
            {[
              { id: 'tracking', label: '🔭 Ground Tracking Cam' },
              { id: 'tower', label: '🗼 Launch Tower Cam' },
              { id: 'booster', label: '📹 Booster Onboard Cam' },
              { id: 'chase', label: '🎬 Cinematic Chase Cam' }
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => {
                  playClick();
                  setCameraMode(cam.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                  cameraMode === cam.id
                    ? 'bg-space-accent text-black shadow-lg shadow-space-accent/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/15 border border-white/10'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-gray-400">
            DSN Tracking: <strong className="text-green-400">GOLDSTONE ACTIVE</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

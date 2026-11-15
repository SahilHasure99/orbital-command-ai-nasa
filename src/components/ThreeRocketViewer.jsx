// ============================================================================
// ORBITAL COMMAND AI — Advanced 3D Rocket Design Studio & Assembly Engine
// Implements PBR aerospace materials, multi-stage architectures, engine clusters,
// grid fins, landing legs, technical annotations, cinematic orbits & assembly animations
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getRocketSkinTexture } from '../utils/proceduralAssets';
import { playClick, playSuccess, playThrusterBurst } from '../utils/sounds';

export default function ThreeRocketViewer({
  rocketId = 'medium',
  rocketConfig = {},
  componentIds = [],
  className = ''
}) {
  const mountRef = useRef(null);

  // Studio Controls State
  const [cameraView, setCameraView] = useState('full'); // full, engines, interstage, fairing, interior
  const [isCinematicOrbit, setIsCinematicOrbit] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [isFairingTransparent, setIsFairingTransparent] = useState(false);
  const [isExplodedView, setIsExplodedView] = useState(false);
  const [assemblyStep, setAssemblyStep] = useState(6); // 1 to 6 (6 = fully assembled)
  const [isAssembling, setIsAssembling] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(10.5);

  const threeState = useRef({
    scene: null,
    camera: null,
    renderer: null,
    rocketGroup: null,
    boosterCore: null,
    engineCluster: null,
    interstage: null,
    upperStage: null,
    spacecraftPayload: null,
    fairingLeft: null,
    fairingRight: null,
    sideBoosters: [],
    targetCamPos: new THREE.Vector3(0, 1.5, 10.5),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    isInteracting: false,
    prevMouse: { x: 0, y: 0 },
    rotY: 0.5,
    rotX: 0.1,
    clock: new THREE.Clock()
  });

  // Staged Assembly Sequence Timer
  useEffect(() => {
    let timer;
    if (isAssembling) {
      if (assemblyStep < 6) {
        timer = setTimeout(() => {
          playThrusterBurst();
          setAssemblyStep((s) => s + 1);
        }, 1200);
      } else {
        setIsAssembling(false);
        playSuccess();
      }
    }
    return () => clearTimeout(timer);
  }, [isAssembling, assemblyStep]);

  // Trigger Assembly Routine
  const handleStartAssembly = () => {
    playClick();
    setAssemblyStep(1);
    setIsExplodedView(false);
    setIsAssembling(true);
  };

  // Toggle Exploded View
  const handleToggleExploded = () => {
    playClick();
    setIsExplodedView((prev) => !prev);
    setIsAssembling(false);
    setAssemblyStep(6);
  };

  // Set Camera View Preset
  const handleSetView = (viewKey) => {
    playClick();
    setCameraView(viewKey);
    setIsCinematicOrbit(false);

    if (viewKey === 'full') {
      threeState.current.targetCamPos.set(0, 1.5, 10.5);
      threeState.current.targetLookAt.set(0, 0, 0);
    } else if (viewKey === 'engines') {
      threeState.current.targetCamPos.set(0, -3.2, 5.2);
      threeState.current.targetLookAt.set(0, -3.0, 0);
    } else if (viewKey === 'interstage') {
      threeState.current.targetCamPos.set(0, 0.8, 4.8);
      threeState.current.targetLookAt.set(0, 0.8, 0);
    } else if (viewKey === 'fairing') {
      threeState.current.targetCamPos.set(0, 3.8, 5.5);
      threeState.current.targetLookAt.set(0, 3.6, 0);
    } else if (viewKey === 'interior') {
      setIsFairingTransparent(true);
      threeState.current.targetCamPos.set(0, 3.4, 4.2);
      threeState.current.targetLookAt.set(0, 3.2, 0);
    }
  };

  // Main Three.js Rocket Studio Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 550;
    const height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.5, zoomLevel);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Space Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ea, 2.8);
    keyLight.position.set(8, 12, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00d4ff, 1.8);
    rimLight.position.set(-8, -4, -6);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0xffaa44, 0.6, 12);
    bottomGlow.position.set(0, -4, 0);
    scene.add(bottomGlow);

    // 3. Rocket Root Group
    const rocketGroup = new THREE.Group();
    scene.add(rocketGroup);
    threeState.current.rocketGroup = rocketGroup;

    // Aerospace PBR Materials
    const stage1Tex = getRocketSkinTexture(rocketId, 'stage1');
    const stage2Tex = getRocketSkinTexture(rocketId, 'stage2');
    const fairingTex = getRocketSkinTexture(rocketId, 'fairing');

    const stage1Mat = new THREE.MeshStandardMaterial({
      map: stage1Tex,
      metalness: rocketId === 'super_heavy' ? 0.85 : 0.45,
      roughness: rocketId === 'super_heavy' ? 0.25 : 0.35
    });

    const stage2Mat = new THREE.MeshStandardMaterial({
      map: stage2Tex,
      metalness: rocketId === 'super_heavy' ? 0.85 : 0.45,
      roughness: 0.35
    });

    const fairingMat = new THREE.MeshStandardMaterial({
      map: fairingTex,
      metalness: 0.4,
      roughness: 0.4,
      transparent: isFairingTransparent,
      opacity: isFairingTransparent ? 0.28 : 1.0,
      side: isFairingTransparent ? THREE.DoubleSide : THREE.FrontSide
    });

    const carbonDarkMat = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      metalness: 0.85,
      roughness: 0.3
    });

    const titaniumNozzleMat = new THREE.MeshStandardMaterial({
      color: 0x8a4b2a, // heat-tinted titanium copper
      metalness: 0.95,
      roughness: 0.25
    });

    const cyanSensorMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });

    // Dimensional Parameters by Rocket Class
    let coreRadius = 0.52;
    let coreHeight = 4.6;
    let upperHeight = 1.6;
    let numEngines = 9;
    let hasSideBoosters = false;
    let hasGridFins = true;
    let hasLandingLegs = true;

    if (rocketId === 'light') {
      coreRadius = 0.34;
      coreHeight = 3.6;
      upperHeight = 1.2;
      numEngines = 4;
      hasGridFins = false;
      hasLandingLegs = false;
    } else if (rocketId === 'medium') {
      coreRadius = 0.5;
      coreHeight = 4.8;
      upperHeight = 1.7;
      numEngines = 9; // Falcon 9 Octaweb style
      hasGridFins = true;
      hasLandingLegs = true;
    } else if (rocketId === 'heavy') {
      coreRadius = 0.52;
      coreHeight = 4.8;
      upperHeight = 1.8;
      numEngines = 9;
      hasSideBoosters = true;
      hasGridFins = true;
      hasLandingLegs = true;
    } else if (rocketId === 'super_heavy') {
      coreRadius = 0.75;
      coreHeight = 5.8;
      upperHeight = 2.4;
      numEngines = 5; // Heavy 5-engine cluster
      hasSideBoosters = true;
      hasGridFins = true;
      hasLandingLegs = false;
    }

    // Custom configuration overrides
    if (rocketConfig.boosterId === 'srb_twin' || rocketConfig.boosterId === 'liquid_strap') {
      hasSideBoosters = true;
    }

    // ========================================================================
    // COMPONENT 1: FIRST STAGE BOOSTER CORE
    // ========================================================================
    const boosterCoreGroup = new THREE.Group();
    rocketGroup.add(boosterCoreGroup);
    threeState.current.boosterCore = boosterCoreGroup;

    // Main Cylindrical Tank
    const coreGeo = new THREE.CylinderGeometry(coreRadius, coreRadius, coreHeight, 32);
    const coreMesh = new THREE.Mesh(coreGeo, stage1Mat);
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    boosterCoreGroup.add(coreMesh);

    // Thrust Structure Base Ring (Aft Dome)
    const aftDomeGeo = new THREE.CylinderGeometry(coreRadius, coreRadius * 0.94, 0.45, 32);
    const aftDome = new THREE.Mesh(aftDomeGeo, carbonDarkMat);
    aftDome.position.y = -coreHeight * 0.5 - 0.22;
    boosterCoreGroup.add(aftDome);

    // Deployable Carbon Landing Legs (4 legs folded tight to core)
    if (hasLandingLegs) {
      for (let i = 0; i < 4; i++) {
        const legGroup = new THREE.Group();
        legGroup.rotation.y = (i * Math.PI) / 2;
        legGroup.position.set(0, -coreHeight * 0.5 + 0.3, 0);

        // Main strut
        const strutGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.8, 12);
        const strut = new THREE.Mesh(strutGeo, carbonDarkMat);
        strut.position.set(coreRadius + 0.06, 0.6, 0);
        strut.rotation.z = -0.06;
        legGroup.add(strut);

        // Foot pad
        const padGeo = new THREE.BoxGeometry(0.18, 0.06, 0.14);
        const pad = new THREE.Mesh(padGeo, carbonDarkMat);
        pad.position.set(coreRadius + 0.12, -0.25, 0);
        legGroup.add(pad);

        boosterCoreGroup.add(legGroup);
      }
    }

    // Hypersonic Titanium Grid Fins (4 fins mounted forward on booster)
    if (hasGridFins) {
      for (let i = 0; i < 4; i++) {
        const finGroup = new THREE.Group();
        finGroup.rotation.y = (i * Math.PI) / 2 + Math.PI / 4;
        finGroup.position.set(0, coreHeight * 0.42, 0);

        // Grid fin frame
        const finGeo = new THREE.BoxGeometry(0.42, 0.35, 0.04);
        const fin = new THREE.Mesh(finGeo, carbonDarkMat);
        fin.position.x = coreRadius + 0.22;
        finGroup.add(fin);

        // Actuator hinge
        const hingeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 12);
        const hinge = new THREE.Mesh(hingeGeo, carbonDarkMat);
        hinge.position.x = coreRadius + 0.03;
        hinge.rotation.z = Math.PI / 2;
        finGroup.add(hinge);

        boosterCoreGroup.add(finGroup);
      }
    }

    // ========================================================================
    // COMPONENT 2: FIRST STAGE ENGINE CLUSTER
    // ========================================================================
    const engineClusterGroup = new THREE.Group();
    rocketGroup.add(engineClusterGroup);
    threeState.current.engineCluster = engineClusterGroup;

    const baseEngineY = -coreHeight * 0.5 - 0.45;
    engineClusterGroup.position.y = baseEngineY;

    // Nozzle geometry
    const nozzleGeo = new THREE.ConeGeometry(coreRadius * 0.22, 0.65, 24, 1, true);

    if (numEngines === 9) {
      // Octaweb: 1 center engine + 8 peripheral engines
      const centerNozzle = new THREE.Mesh(nozzleGeo, titaniumNozzleMat);
      centerNozzle.rotation.x = Math.PI;
      engineClusterGroup.add(centerNozzle);

      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const dist = coreRadius * 0.58;
        const nozzle = new THREE.Mesh(nozzleGeo, titaniumNozzleMat);
        nozzle.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        nozzle.rotation.x = Math.PI;
        engineClusterGroup.add(nozzle);
      }
    } else if (numEngines === 5) {
      // Quincunx: 1 center + 4 corners
      const centerNozzle = new THREE.Mesh(nozzleGeo, titaniumNozzleMat);
      centerNozzle.rotation.x = Math.PI;
      centerNozzle.scale.set(1.4, 1.4, 1.4);
      engineClusterGroup.add(centerNozzle);

      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const dist = coreRadius * 0.55;
        const nozzle = new THREE.Mesh(nozzleGeo, titaniumNozzleMat);
        nozzle.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        nozzle.rotation.x = Math.PI;
        nozzle.scale.set(1.3, 1.3, 1.3);
        engineClusterGroup.add(nozzle);
      }
    } else {
      // 4 engines
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const dist = coreRadius * 0.45;
        const nozzle = new THREE.Mesh(nozzleGeo, titaniumNozzleMat);
        nozzle.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        nozzle.rotation.x = Math.PI;
        engineClusterGroup.add(nozzle);
      }
    }

    // Gimbal Actuator Struts around engines
    const gimbalRingGeo = new THREE.TorusGeometry(coreRadius * 0.85, 0.03, 8, 32);
    const gimbalRing = new THREE.Mesh(gimbalRingGeo, carbonDarkMat);
    gimbalRing.rotation.x = Math.PI / 2;
    gimbalRing.position.y = 0.2;
    engineClusterGroup.add(gimbalRing);

    // ========================================================================
    // COMPONENT 3: INTERSTAGE TRANSITION JOINT
    // ========================================================================
    const interstageGroup = new THREE.Group();
    rocketGroup.add(interstageGroup);
    threeState.current.interstage = interstageGroup;

    const interY = coreHeight * 0.5 + 0.28;
    interstageGroup.position.y = interY;

    // Vented interstage structure
    const interGeo = new THREE.CylinderGeometry(coreRadius, coreRadius, 0.56, 32);
    const interMesh = new THREE.Mesh(interGeo, carbonDarkMat);
    interstageGroup.add(interMesh);

    // Separation Pushers (pneumatic staging pistons)
    for (let i = 0; i < 4; i++) {
      const pusherGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8);
      const pusher = new THREE.Mesh(pusherGeo, cyanSensorMat);
      pusher.position.set(
        Math.cos((i * Math.PI) / 2) * (coreRadius - 0.05),
        0.1,
        Math.sin((i * Math.PI) / 2) * (coreRadius - 0.05)
      );
      interstageGroup.add(pusher);
    }

    // ========================================================================
    // COMPONENT 4: SECOND / UPPER STAGE
    // ========================================================================
    const upperStageGroup = new THREE.Group();
    rocketGroup.add(upperStageGroup);
    threeState.current.upperStage = upperStageGroup;

    const upperY = interY + 0.28 + upperHeight * 0.5;
    upperStageGroup.position.y = upperY;

    // Upper Stage Cryogenic Fuselage
    const upperGeo = new THREE.CylinderGeometry(coreRadius, coreRadius, upperHeight, 32);
    const upperMesh = new THREE.Mesh(upperGeo, stage2Mat);
    upperMesh.castShadow = true;
    upperMesh.receiveShadow = true;
    upperStageGroup.add(upperMesh);

    // Vacuum High-Expansion Carbon Engine Bell inside interstage
    const isVacNozzle = rocketConfig.upperStageId === 'upper_vac';
    const vacBellGeo = new THREE.ConeGeometry(coreRadius * (isVacNozzle ? 0.65 : 0.45), 0.85, 24, 1, true);
    const vacBell = new THREE.Mesh(vacBellGeo, carbonDarkMat);
    vacBell.position.y = -upperHeight * 0.5 - 0.35;
    vacBell.rotation.x = Math.PI;
    upperStageGroup.add(vacBell);

    // Payload Adapter Fitting (PAF cone)
    const pafGeo = new THREE.CylinderGeometry(coreRadius * 0.65, coreRadius, 0.4, 32);
    const paf = new THREE.Mesh(pafGeo, carbonDarkMat);
    paf.position.y = upperHeight * 0.5 + 0.2;
    upperStageGroup.add(paf);

    // ========================================================================
    // COMPONENT 5: SPACECRAFT PAYLOAD (Rendered inside fairing)
    // ========================================================================
    const payloadGroup = new THREE.Group();
    rocketGroup.add(payloadGroup);
    threeState.current.spacecraftPayload = payloadGroup;

    const payloadY = upperY + upperHeight * 0.5 + 0.8;
    payloadGroup.position.y = payloadY;

    // Spacecraft Bus Gold Octagon
    const scGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.7, 8);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });
    const scMesh = new THREE.Mesh(scGeo, goldMat);
    payloadGroup.add(scMesh);

    // Folded Solar Array wings
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0f2b5c, metalness: 0.9, roughness: 0.2 });
    [-1, 1].forEach((side) => {
      const foldedWingGeo = new THREE.BoxGeometry(0.08, 0.65, 0.22);
      const wing = new THREE.Mesh(foldedWingGeo, wingMat);
      wing.position.set(side * 0.42, 0, 0);
      payloadGroup.add(wing);
    });

    // High-Gain Dish (stowed upwards)
    const dishGeo = new THREE.SphereGeometry(0.24, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.y = 0.45;
    dish.rotation.x = Math.PI;
    payloadGroup.add(dish);

    // ========================================================================
    // COMPONENT 6: PAYLOAD FAIRING (DUAL HALVES)
    // ========================================================================
    const fairingHeight = rocketConfig.fairingId === 'fairing_deep' ? 2.6 : 2.1;
    const fairingRadius = coreRadius * (rocketConfig.fairingId === 'fairing_deep' ? 1.35 : 1.12);
    const fairingBaseY = upperY + upperHeight * 0.5 + 0.2;

    const fairingLeftGroup = new THREE.Group();
    const fairingRightGroup = new THREE.Group();
    fairingLeftGroup.position.y = fairingBaseY;
    fairingRightGroup.position.y = fairingBaseY;
    rocketGroup.add(fairingLeftGroup);
    rocketGroup.add(fairingRightGroup);
    threeState.current.fairingLeft = fairingLeftGroup;
    threeState.current.fairingRight = fairingRightGroup;

    // Fairing Half Cylinder (Left: angle 0 to PI)
    const fCylLeft = new THREE.CylinderGeometry(fairingRadius, fairingRadius, fairingHeight * 0.4, 24, 1, false, 0, Math.PI);
    const fCylLeftMesh = new THREE.Mesh(fCylLeft, fairingMat);
    fCylLeftMesh.position.y = fairingHeight * 0.2;
    fairingLeftGroup.add(fCylLeftMesh);

    // Fairing Ogive Nose Cone (Left)
    const fConeLeft = new THREE.ConeGeometry(fairingRadius, fairingHeight * 0.6, 24, 1, false, 0, Math.PI);
    const fConeLeftMesh = new THREE.Mesh(fConeLeft, fairingMat);
    fConeLeftMesh.position.y = fairingHeight * 0.4 + fairingHeight * 0.3;
    fairingLeftGroup.add(fConeLeftMesh);

    // Fairing Half Cylinder (Right: angle PI to 2PI)
    const fCylRight = new THREE.CylinderGeometry(fairingRadius, fairingRadius, fairingHeight * 0.4, 24, 1, false, Math.PI, Math.PI);
    const fCylRightMesh = new THREE.Mesh(fCylRight, fairingMat);
    fCylRightMesh.position.y = fairingHeight * 0.2;
    fairingRightGroup.add(fCylRightMesh);

    // Fairing Ogive Nose Cone (Right)
    const fConeRight = new THREE.ConeGeometry(fairingRadius, fairingHeight * 0.6, 24, 1, false, Math.PI, Math.PI);
    const fConeRightMesh = new THREE.Mesh(fConeRight, fairingMat);
    fConeRightMesh.position.y = fairingHeight * 0.4 + fairingHeight * 0.3;
    fairingRightGroup.add(fConeRightMesh);

    // ========================================================================
    // COMPONENT 7: STRAP-ON SIDE BOOSTERS (Heavy & Super Heavy)
    // ========================================================================
    threeState.current.sideBoosters = [];
    if (hasSideBoosters) {
      const bRadius = coreRadius * 0.88;
      const bHeight = coreHeight * 0.88;

      [-1, 1].forEach((side) => {
        const sideGroup = new THREE.Group();
        sideGroup.position.set(side * (coreRadius + bRadius + 0.12), -coreHeight * 0.06, 0);

        // Booster Body
        const bGeo = new THREE.CylinderGeometry(bRadius, bRadius, bHeight, 24);
        const bMesh = new THREE.Mesh(bGeo, stage1Mat);
        bMesh.castShadow = true;
        sideGroup.add(bMesh);

        // Aerodynamic Nose Cone
        const noseGeo = new THREE.ConeGeometry(bRadius, 1.1, 24);
        const nose = new THREE.Mesh(noseGeo, carbonDarkMat);
        nose.position.y = bHeight * 0.5 + 0.55;
        sideGroup.add(nose);

        // Separation Thruster Pack on nosecone
        const sepPackGeo = new THREE.BoxGeometry(0.12, 0.18, 0.12);
        const sepPack = new THREE.Mesh(sepPackGeo, cyanSensorMat);
        sepPack.position.set(side * 0.12, bHeight * 0.5 + 0.2, 0);
        sideGroup.add(sepPack);

        // Booster Engine Nozzle
        const bNozzle = new THREE.Mesh(nozzleGeo, titaniumNozzleMat);
        bNozzle.position.y = -bHeight * 0.5 - 0.35;
        bNozzle.rotation.x = Math.PI;
        bNozzle.scale.set(1.2, 1.2, 1.2);
        sideGroup.add(bNozzle);

        // Structural Mounting Struts to center core
        const strutGeo = new THREE.BoxGeometry(0.18, 0.08, 0.08);
        const strut1 = new THREE.Mesh(strutGeo, carbonDarkMat);
        strut1.position.set(-side * (bRadius + 0.06), bHeight * 0.35, 0);
        sideGroup.add(strut1);

        const strut2 = new THREE.Mesh(strutGeo, carbonDarkMat);
        strut2.position.set(-side * (bRadius + 0.06), -bHeight * 0.35, 0);
        sideGroup.add(strut2);

        rocketGroup.add(sideGroup);
        threeState.current.sideBoosters.push(sideGroup);
      });
    }

    // ========================================================================
    // MOUSE DRAG & WHEEL ZOOM CONTROLS
    // ========================================================================
    const onMouseDown = (e) => {
      threeState.current.isInteracting = true;
      threeState.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!threeState.current.isInteracting) return;
      const dx = e.clientX - threeState.current.prevMouse.x;
      const dy = e.clientY - threeState.current.prevMouse.y;
      threeState.current.prevMouse = { x: e.clientX, y: e.clientY };

      threeState.current.rotY += dx * 0.008;
      threeState.current.rotX += dy * 0.008;
      threeState.current.rotX = Math.max(-0.65, Math.min(0.65, threeState.current.rotX));
    };

    const onMouseUp = () => {
      threeState.current.isInteracting = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      setZoomLevel((z) => Math.max(4.0, Math.min(18.0, z + e.deltaY * 0.008)));
      threeState.current.targetCamPos.z = Math.max(4.0, Math.min(18.0, threeState.current.targetCamPos.z + e.deltaY * 0.008));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    dom.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ========================================================================
    // ANIMATION & INTERPOLATION LOOP
    // ========================================================================
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = threeState.current.clock.getDelta();

      // Slow cinematic orbit
      if (isCinematicOrbit && !threeState.current.isInteracting) {
        threeState.current.rotY += 0.35 * delta;
      }

      rocketGroup.rotation.y += (threeState.current.rotY - rocketGroup.rotation.y) * 0.1;
      rocketGroup.rotation.x += (threeState.current.rotX - rocketGroup.rotation.x) * 0.1;

      // Smooth camera interpolation
      camera.position.lerp(threeState.current.targetCamPos, 0.08);
      camera.lookAt(threeState.current.targetLookAt);

      // Staged Assembly & Exploded View offsets
      let boosterOffsetY = 0;
      let engineOffsetY = 0;
      let interstageOffsetY = 0;
      let upperOffsetY = 0;
      let payloadOffsetY = 0;
      let fairingSpreadX = 0;

      if (isExplodedView) {
        // Dramatic engineering exploded view separation
        engineOffsetY = -1.6;
        boosterOffsetY = 0;
        interstageOffsetY = 0.9;
        upperOffsetY = 2.2;
        payloadOffsetY = 3.6;
        fairingSpreadX = 1.8;
      } else if (isAssembling) {
        // Staged assembly sequence interpolation
        if (assemblyStep < 1) boosterOffsetY = -8.0;
        if (assemblyStep < 2) engineOffsetY = -4.0;
        if (assemblyStep < 3) {
          interstageOffsetY = 4.0;
          upperOffsetY = 5.5;
        }
        if (assemblyStep < 4) payloadOffsetY = 6.0;
        if (assemblyStep < 5) fairingSpreadX = 3.0;
      }

      // Smoothly apply offsets
      if (boosterCoreGroup) boosterCoreGroup.position.y += (boosterOffsetY - boosterCoreGroup.position.y) * 0.12;
      if (engineClusterGroup) engineClusterGroup.position.y += ((baseEngineY + engineOffsetY) - engineClusterGroup.position.y) * 0.12;
      if (interstageGroup) interstageGroup.position.y += ((interY + interstageOffsetY) - interstageGroup.position.y) * 0.12;
      if (upperStageGroup) upperStageGroup.position.y += ((upperY + upperOffsetY) - upperStageGroup.position.y) * 0.12;
      if (payloadGroup) payloadGroup.position.y += ((payloadY + payloadOffsetY) - payloadGroup.position.y) * 0.12;

      if (fairingLeftGroup) {
        fairingLeftGroup.position.x += (-fairingSpreadX - fairingLeftGroup.position.x) * 0.12;
        fairingLeftGroup.position.y += ((fairingBaseY + upperOffsetY) - fairingLeftGroup.position.y) * 0.12;
      }
      if (fairingRightGroup) {
        fairingRightGroup.position.x += (fairingSpreadX - fairingRightGroup.position.x) * 0.12;
        fairingRightGroup.position.y += ((fairingBaseY + upperOffsetY) - fairingRightGroup.position.y) * 0.12;
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
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    rocketId,
    rocketConfig,
    isFairingTransparent,
    isCinematicOrbit,
    isExplodedView,
    isAssembling,
    assemblyStep,
    zoomLevel
  ]);

  return (
    <div className={`relative w-full h-[450px] bg-black/60 rounded-3xl border border-white/15 overflow-hidden shadow-2xl flex flex-col justify-between ${className}`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Bar: Studio Tools & Inspection Modes */}
      <div className="relative z-10 p-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-space-accent animate-ping" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            3D ROCKET DESIGN STUDIO · PBR SIMULATION
          </span>
        </div>

        {/* Studio Actions */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          {/* Assembly Button */}
          <button
            onClick={handleStartAssembly}
            disabled={isAssembling}
            className="px-2.5 py-1 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 transition-all font-bold flex items-center gap-1"
            title="Trigger Staged 3D Assembly Animation"
          >
            <span>{isAssembling ? '⚙️ ASSEMBLING...' : '▶ START ASSEMBLY'}</span>
          </button>

          {/* Exploded View Toggle */}
          <button
            onClick={handleToggleExploded}
            className={`px-2.5 py-1 rounded-xl border font-bold transition-all ${
              isExplodedView
                ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20'
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            }`}
            title="Inspect Components in Exploded View"
          >
            {isExplodedView ? '💥 EXPLODED VIEW' : '🔍 EXPLODED VIEW'}
          </button>

          {/* Fairing Transparency Toggle */}
          <button
            onClick={() => {
              playClick();
              setIsFairingTransparent(!isFairingTransparent);
            }}
            className={`px-2 py-1 rounded-xl border font-bold transition-all ${
              isFairingTransparent
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-white/10 border-white/20 text-gray-400'
            }`}
            title="Toggle Transparent Fairing to View Payload Spacecraft"
          >
            {isFairingTransparent ? '👁️ PAYLOAD VISIBLE' : '🔒 FAIRING CLOSED'}
          </button>

          {/* Annotations Toggle */}
          <button
            onClick={() => {
              playClick();
              setShowAnnotations(!showAnnotations);
            }}
            className={`px-2 py-1 rounded-xl border font-bold transition-all ${
              showAnnotations
                ? 'bg-space-accent/20 border-space-accent text-space-accent'
                : 'bg-white/10 border-white/20 text-gray-400'
            }`}
            title="Toggle Technical Annotations"
          >
            {showAnnotations ? '🏷️ SPECS ON' : '🏷️ SPECS OFF'}
          </button>

          {/* Cinematic Orbit Toggle */}
          <button
            onClick={() => {
              playClick();
              setIsCinematicOrbit(!isCinematicOrbit);
            }}
            className={`px-2 py-1 rounded-xl border font-bold transition-all ${
              isCinematicOrbit
                ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                : 'bg-white/10 border-white/20 text-gray-400'
            }`}
            title="Toggle Slow Cinematic Inspection Orbit"
          >
            {isCinematicOrbit ? '↻ ORBITING' : '⏸ PAUSED'}
          </button>
        </div>
      </div>

      {/* 3D Technical Annotation Callout Overlays */}
      {showAnnotations && (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
          <div className="self-end bg-black/80 border border-cyan-500/40 p-2 rounded-xl text-[10px] font-mono text-cyan-300 shadow-xl max-w-[210px] space-y-1 backdrop-blur-md">
            <div className="font-bold text-white flex items-center gap-1">
              <span>🛰️</span> PAYLOAD FAIRING
            </div>
            <div>Composite acoustic shroud. Encapsulates & protects scientific payload during ascent.</div>
          </div>

          <div className="self-start bg-black/80 border border-amber-500/40 p-2 rounded-xl text-[10px] font-mono text-amber-300 shadow-xl max-w-[210px] space-y-1 backdrop-blur-md">
            <div className="font-bold text-white flex items-center gap-1">
              <span>⚡</span> INTERSTAGE & GRID FINS
            </div>
            <div>Pneumatic stage pushers + 4 hypersonic titanium grid fins for atmospheric guidance.</div>
          </div>

          <div className="self-end bg-black/80 border border-green-500/40 p-2 rounded-xl text-[10px] font-mono text-green-300 shadow-xl max-w-[210px] space-y-1 backdrop-blur-md">
            <div className="font-bold text-white flex items-center gap-1">
              <span>🚀</span> ENGINE CLUSTER
            </div>
            <div>Gimbaled high-thrust turbopump nozzles providing liftoff thrust & vectoring.</div>
          </div>
        </div>
      )}

      {/* Assembly Progress Toast */}
      {isAssembling && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-black/90 border border-green-500 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <span className="w-3 h-3 rounded-full bg-green-400 animate-ping" />
          <div className="text-xs font-mono">
            <div className="font-bold text-green-400">STAGE {assemblyStep} / 6 INTEGRATION</div>
            <div className="text-[10px] text-gray-300">
              {assemblyStep === 1 && '1. Booster Core Lowered Onto Assembly Stand'}
              {assemblyStep === 2 && '2. Gimbaled Engine Cluster Attached & Plumbed'}
              {assemblyStep === 3 && '3. Interstage & Cryogenic Second Stage Docked'}
              {assemblyStep === 4 && '4. Spacecraft Payload Clamped To Payload Adapter'}
              {assemblyStep === 5 && '5. Dual Aerodynamic Fairing Halves Closed'}
              {assemblyStep === 6 && '6. Aerospace Vehicle Integration Nominal!'}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Camera Angle Presets & Navigation Bar */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-wrap items-center justify-between gap-2">
        {/* Preset Angles */}
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span className="text-gray-400 mr-1 hidden sm:inline">ANGLES:</span>
          {[
            { id: 'full', label: '🚀 Full Rocket' },
            { id: 'engines', label: '🔥 Engines' },
            { id: 'interstage', label: '⚙️ Interstage' },
            { id: 'fairing', label: '🛡️ Fairing' },
            { id: 'interior', label: '🛰️ Inside Bay' }
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSetView(preset.id)}
              className={`px-2.5 py-1 rounded-xl transition-all ${
                cameraView === preset.id
                  ? 'bg-space-accent text-black font-bold shadow-md shadow-space-accent/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/15 border border-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1 z-10">
          <button
            onClick={() => {
              playClick();
              setZoomLevel((z) => Math.max(4.0, z - 1.2));
              threeState.current.targetCamPos.z = Math.max(4.0, threeState.current.targetCamPos.z - 1.2);
            }}
            className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono"
            title="Zoom In"
          >
            🔍+
          </button>
          <button
            onClick={() => {
              playClick();
              setZoomLevel((z) => Math.min(18.0, z + 1.2));
              threeState.current.targetCamPos.z = Math.min(18.0, threeState.current.targetCamPos.z + 1.2);
            }}
            className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono"
            title="Zoom Out"
          >
            🔍-
          </button>
          <button
            onClick={() => handleSetView('full')}
            className="px-2 py-0.5 text-[9px] rounded bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 font-mono font-bold"
            title="Reset Camera Orientation"
          >
            ↺ RESET
          </button>
        </div>
      </div>
    </div>
  );
}

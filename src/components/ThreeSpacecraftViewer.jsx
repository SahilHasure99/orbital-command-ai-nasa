import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeSpacecraftViewer({
  componentIds = [],
  rocketId = 'medium',
  highlightedComponentId = null,
  className = ''
}) {
  const mountRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(5.5);
  const isInteracting = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = null; // transparent

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, zoomLevel);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Space Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(6, 8, 5);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00d4ff, 1.4);
    rimLight.position.set(-6, -2, -5);
    scene.add(rimLight);

    // 3. Spacecraft Root Group
    const craftGroup = new THREE.Group();
    scene.add(craftGroup);

    // Highlight helper: returns true if component is hovered/highlighted
    const isHighlighted = (id) => highlightedComponentId === id;

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.85,
      roughness: 0.25
    });

    const goldFoilMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.3
    });

    const darkAlloyMat = new THREE.MeshStandardMaterial({
      color: 0x22252a,
      metalness: 0.7,
      roughness: 0.4
    });

    const solarCellMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b5c,
      metalness: 0.95,
      roughness: 0.15,
      emissive: isHighlighted('solar_deployable_wings') || isHighlighted('solar_ultraflex') || isHighlighted('solar_body_panels') ? 0x00d4ff : 0x051530,
      emissiveIntensity: isHighlighted('solar_deployable_wings') || isHighlighted('solar_ultraflex') ? 0.9 : 0.2
    });

    const glowBlueMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff
    });

    // --- Core Bus Body ---
    // Octagonal main chassis
    const busGeo = new THREE.CylinderGeometry(0.85, 0.95, 1.4, 8);
    const busMesh = new THREE.Mesh(busGeo, goldFoilMat);
    busMesh.castShadow = true;
    busMesh.receiveShadow = true;
    craftGroup.add(busMesh);

    // Top deck plate
    const topDeckGeo = new THREE.CylinderGeometry(0.8, 0.85, 0.15, 8);
    const topDeckMesh = new THREE.Mesh(topDeckGeo, darkAlloyMat);
    topDeckMesh.position.y = 0.75;
    craftGroup.add(topDeckMesh);

    // Avionics ring
    const ringGeo = new THREE.TorusGeometry(0.92, 0.04, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, glowBlueMat);
    ringMesh.rotation.x = Math.PI / 2;
    craftGroup.add(ringMesh);

    // --- Modular Components ---
    const has = (id) => componentIds.includes(id);

    // A. Solar Panels
    if (has('solar_deployable_wings') || has('solar_ultraflex')) {
      const isUltra = has('solar_ultraflex');
      // Left Wing
      const leftWing = new THREE.Group();
      leftWing.position.set(-1.1, 0.2, 0);

      const boomGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6);
      const boomMesh = new THREE.Mesh(boomGeo, darkAlloyMat);
      boomMesh.rotation.z = Math.PI / 2;
      leftWing.add(boomMesh);

      if (isUltra) {
        // Circular Ultraflex fan
        const ultraGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.03, 16);
        const ultraMesh = new THREE.Mesh(ultraGeo, solarCellMat);
        ultraMesh.rotation.z = Math.PI / 2;
        ultraMesh.position.x = -1.1;
        leftWing.add(ultraMesh);
      } else {
        // Dual rectangular panels
        const panelGeo = new THREE.BoxGeometry(1.6, 0.75, 0.04);
        const panelMesh = new THREE.Mesh(panelGeo, solarCellMat);
        panelMesh.position.x = -1.1;
        leftWing.add(panelMesh);
      }
      craftGroup.add(leftWing);

      // Right Wing
      const rightWing = leftWing.clone();
      rightWing.position.x = 1.1;
      rightWing.rotation.y = Math.PI;
      craftGroup.add(rightWing);
    } else if (has('solar_body_panels')) {
      // Body mounted solar facets
      const facetGeo = new THREE.BoxGeometry(0.2, 1.1, 0.02);
      for (let i = 0; i < 8; i += 2) {
        const facet = new THREE.Mesh(facetGeo, solarCellMat);
        facet.position.set(Math.cos(i * Math.PI / 4) * 0.96, 0, Math.sin(i * Math.PI / 4) * 0.96);
        facet.rotation.y = -i * Math.PI / 4 + Math.PI / 2;
        craftGroup.add(facet);
      }
    }

    // B. Propulsion & Thruster Engine
    if (has('prop_biprop') || has('prop_monoprop') || has('prop_ion_hall') || has('prop_cold_gas')) {
      const isIon = has('prop_ion_hall');
      const nozzleGeo = new THREE.ConeGeometry(isIon ? 0.35 : 0.45, 0.65, 24, 1, true);
      const nozzleMesh = new THREE.Mesh(nozzleGeo, darkAlloyMat);
      nozzleMesh.position.y = -1.0;
      nozzleMesh.rotation.x = Math.PI;
      craftGroup.add(nozzleMesh);

      // Thruster exhaust glow
      const glowGeo = new THREE.ConeGeometry(isIon ? 0.28 : 0.35, 0.8, 16);
      const thrusterGlowMat = new THREE.MeshBasicMaterial({
        color: isIon ? 0x00d4ff : 0xff7700,
        transparent: true,
        opacity: 0.7
      });
      const glowMesh = new THREE.Mesh(glowGeo, thrusterGlowMat);
      glowMesh.position.y = -1.2;
      glowMesh.rotation.x = Math.PI;
      craftGroup.add(glowMesh);
    }

    // C. Communication System
    if (has('comm_ka_deep_space') || has('comm_x_band_dish')) {
      const isKa = has('comm_ka_deep_space');
      const dishGroup = new THREE.Group();
      dishGroup.position.set(0, 1.25, 0.3);

      // Mast
      const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5);
      const mast = new THREE.Mesh(mastGeo, darkAlloyMat);
      dishGroup.add(mast);

      // Parabolic dish
      const dishGeo = new THREE.SphereGeometry(isKa ? 0.75 : 0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3);
      const dishMat = new THREE.MeshStandardMaterial({
        color: isKa ? 0xffffff : 0xcccccc,
        metalness: 0.7,
        roughness: 0.3,
        side: THREE.DoubleSide
      });
      const dishMesh = new THREE.Mesh(dishGeo, dishMat);
      dishMesh.position.y = 0.35;
      dishMesh.rotation.x = Math.PI / 4;
      dishGroup.add(dishMesh);

      // Feed horn
      const hornGeo = new THREE.CylinderGeometry(0.02, 0.05, 0.25);
      const horn = new THREE.Mesh(hornGeo, glowBlueMat);
      horn.position.set(0, 0.5, 0.15);
      horn.rotation.x = Math.PI / 4;
      dishGroup.add(horn);

      craftGroup.add(dishGroup);
    } else if (has('comm_s_band')) {
      // S-Band whip antenna
      const whipGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.9);
      const whip = new THREE.Mesh(whipGeo, metalMat);
      whip.position.set(0.5, 1.1, -0.4);
      whip.rotation.z = -0.2;
      craftGroup.add(whip);
    }

    // D. Power: RTG
    if (has('power_rtg')) {
      const rtgGroup = new THREE.Group();
      rtgGroup.position.set(0.9, -0.2, 0);

      const rtgCyl = new THREE.CylinderGeometry(0.22, 0.22, 0.7, 12);
      const rtgMesh = new THREE.Mesh(rtgCyl, darkAlloyMat);
      rtgGroup.add(rtgMesh);

      // Cooling fins
      const finGeo = new THREE.BoxGeometry(0.65, 0.65, 0.02);
      for (let i = 0; i < 4; i++) {
        const fin = new THREE.Mesh(finGeo, darkAlloyMat);
        fin.rotation.y = (i * Math.PI) / 4;
        rtgGroup.add(fin);
      }
      craftGroup.add(rtgGroup);
    }

    // E. Scientific Instruments
    if (has('inst_magnetometer')) {
      // Long deployable boom
      const boomGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.2);
      const boom = new THREE.Mesh(boomGeo, metalMat);
      boom.position.set(-0.8, -0.4, 0.7);
      boom.rotation.z = Math.PI / 3;
      boom.rotation.x = 0.4;

      const sensorBall = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), glowBlueMat);
      sensorBall.position.y = 1.1;
      boom.add(sensorBall);
      craftGroup.add(boom);
    }

    if (has('inst_multispectral_cam') || has('inst_laser_lidar')) {
      const camGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.45, 16);
      const camMesh = new THREE.Mesh(camGeo, darkAlloyMat);
      camMesh.position.set(0.3, 0.95, -0.4);
      camMesh.rotation.x = -Math.PI / 6;

      const lensGeo = new THREE.CircleGeometry(0.13, 16);
      const lensMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.y = 0.23;
      lens.rotation.x = -Math.PI / 2;
      camMesh.add(lens);
      craftGroup.add(camMesh);
    }

    if (has('inst_sample_drill')) {
      const drillGeo = new THREE.CylinderGeometry(0.06, 0.02, 0.9, 12);
      const drillMesh = new THREE.Mesh(drillGeo, metalMat);
      drillMesh.position.set(-0.4, -0.9, 0.4);
      craftGroup.add(drillMesh);
    }

    // F. Thermal Heat Shield
    if (has('protect_heat_shield')) {
      const shieldGeo = new THREE.CylinderGeometry(1.15, 0.8, 0.22, 24);
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0x181a1f,
        roughness: 0.9,
        metalness: 0.2
      });
      const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
      shieldMesh.position.y = -0.85;
      craftGroup.add(shieldMesh);
    }

    // 4. Mouse Interactive Drag Controls
    let targetRotationX = 0.2;
    let targetRotationY = 0.5;

    const onMouseDown = (e) => {
      isInteracting.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isInteracting.current) return;
      const deltaX = e.clientX - prevMousePos.current.x;
      const deltaY = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;
      targetRotationX = Math.max(-1.2, Math.min(1.2, targetRotationX));
    };

    const onMouseUp = () => {
      isInteracting.current = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      setZoomLevel((prev) => Math.max(3.0, Math.min(9.0, prev + e.deltaY * 0.005)));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    dom.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 5. Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isInteracting.current) {
        targetRotationY += 0.5 * delta;
      }

      craftGroup.rotation.y += (targetRotationY - craftGroup.rotation.y) * 0.1;
      craftGroup.rotation.x += (targetRotationX - craftGroup.rotation.x) * 0.1;

      // Smooth camera zoom
      camera.position.z += (zoomLevel - camera.position.z) * 0.1;

      // Slight floating motion
      craftGroup.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    // 6. Resize Handler
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
  }, [componentIds, rocketId, autoRotate, highlightedComponentId, zoomLevel]);

  return (
    <div className={`relative w-full h-full min-h-[300px] flex items-center justify-center ${className}`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
        {/* Zoom In */}
        <button
          onClick={() => setZoomLevel((z) => Math.max(3.0, z - 0.75))}
          className="px-2 py-1 text-xs rounded font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
          title="Zoom In"
        >
          🔍+
        </button>
        {/* Zoom Out */}
        <button
          onClick={() => setZoomLevel((z) => Math.min(9.0, z + 0.75))}
          className="px-2 py-1 text-xs rounded font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
          title="Zoom Out"
        >
          🔍-
        </button>
        {/* Reset Zoom */}
        <button
          onClick={() => setZoomLevel(5.5)}
          className="px-2 py-1 text-[10px] rounded font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 transition-all"
          title="Reset View"
        >
          ↺ RESET
        </button>
        {/* Toggle Auto-Rotate */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2 py-1 text-[10px] rounded font-bold transition-colors border ${
            autoRotate
              ? 'bg-space-accent/20 border-space-accent text-space-accent'
              : 'bg-white/10 border-white/20 text-gray-400'
          }`}
          title="Toggle 360° Auto Rotation"
        >
          {autoRotate ? '↻ ROTATING' : '⏸ PAUSED'}
        </button>
      </div>
      <div className="absolute bottom-2 left-3 text-[10px] text-gray-400 bg-black/60 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm pointer-events-none flex items-center gap-2">
        <span>🎮 Drag to rotate · Scroll wheel to zoom in/out</span>
        {highlightedComponentId && (
          <span className="text-space-accent font-bold animate-pulse">
            • Highlighting: {highlightedComponentId}
          </span>
        )}
      </div>
    </div>
  );
}

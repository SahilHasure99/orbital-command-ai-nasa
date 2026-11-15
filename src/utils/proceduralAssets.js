// ORBITAL COMMAND AI — Procedural 3D Texture & Material Engine
// Generates high-fidelity procedural planetary maps, solar halos, and aerospace materials
// 100% self-contained: Zero broken URLs, zero external assets required, fully offline-ready

import * as THREE from 'three';

const textureCache = new Map();

/**
 * Creates a procedural 1024x512 Canvas texture for any celestial body
 */
export function getPlanetTexture(planetId) {
  if (textureCache.has(planetId)) {
    return textureCache.get(planetId);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  switch (planetId) {
    case 'sun': {
      // Solar photosphere with turbulent granulation & solar flares
      const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 2);
      grad.addColorStop(0, '#fff4cc');
      grad.addColorStop(0.3, '#ffaa00');
      grad.addColorStop(0.7, '#ff5500');
      grad.addColorStop(1, '#991100');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Solar granules
      for (let i = 0; i < 4000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 8 + 2;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 230, 150, 0.4)' : 'rgba(200, 50, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'mercury': {
      // Cratered volcanic gray regolith
      ctx.fillStyle = '#6e6e73';
      ctx.fillRect(0, 0, w, h);

      // Noise & impact craters
      for (let i = 0; i < 350; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 18 + 3;
        ctx.fillStyle = 'rgba(40, 40, 42, 0.6)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(180, 180, 185, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      break;
    }

    case 'venus': {
      // Dense sulfuric acid yellowish clouds with equatorial chevron bands
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#d1ab6e');
      grad.addColorStop(0.3, '#e8caa4');
      grad.addColorStop(0.5, '#f5deb3');
      grad.addColorStop(0.7, '#e0be88');
      grad.addColorStop(1, '#c99b5a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Cloud swirls
      for (let y = 0; y < h; y += 12) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15 + 0.05})`;
        ctx.fillRect(0, y, w, Math.random() * 8 + 4);
      }
      break;
    }

    case 'earth': {
      // Deep blue ocean baseline
      ctx.fillStyle = '#0f3875';
      ctx.fillRect(0, 0, w, h);

      // Continental landmasses (green, ochre, brown)
      const continents = [
        { x: 220, y: 180, r: 120, col: '#2d6a36' }, // N America
        { x: 300, y: 340, r: 100, col: '#2a5e30' }, // S America
        { x: 520, y: 160, r: 110, col: '#526938' }, // Europe
        { x: 540, y: 280, r: 130, col: '#8a7238' }, // Africa / Sahara
        { x: 740, y: 180, r: 160, col: '#345e33' }, // Asia
        { x: 820, y: 360, r: 80, col: '#8a5e2f' }   // Australia
      ];

      continents.forEach(c => {
        ctx.fillStyle = c.col;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.r, c.r * 0.75, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Coastal variance
        for (let j = 0; j < 12; j++) {
          const offsetX = (Math.random() - 0.5) * c.r;
          const offsetY = (Math.random() - 0.5) * c.r;
          ctx.beginPath();
          ctx.arc(c.x + offsetX, c.y + offsetY, Math.random() * 40 + 10, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Polar ice caps (North & South)
      ctx.fillStyle = 'rgba(240, 248, 255, 0.95)';
      ctx.fillRect(0, 0, w, 40);
      ctx.fillRect(0, h - 45, w, 45);

      // Swirling atmospheric cloud patterns
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 40; i++) {
        const cx = Math.random() * w;
        const cy = Math.random() * (h - 100) + 50;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.random() * 120 + 30, Math.random() * 25 + 5, Math.random() * 0.8 - 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'mars': {
      // Rusty iron-oxide orange/red surface
      ctx.fillStyle = '#b84419';
      ctx.fillRect(0, 0, w, h);

      // Dark volcanic basalt regions (Syrtis Major, Acidalia Planitia)
      ctx.fillStyle = 'rgba(92, 32, 14, 0.65)';
      for (let i = 0; i < 18; i++) {
        const x = Math.random() * w;
        const y = Math.random() * (h - 140) + 70;
        ctx.beginPath();
        ctx.ellipse(x, y, Math.random() * 140 + 40, Math.random() * 60 + 20, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Craters & canyon scratches (Valles Marineris)
      ctx.strokeStyle = 'rgba(50, 15, 8, 0.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h * 0.52);
      ctx.bezierCurveTo(w * 0.45, h * 0.55, w * 0.55, h * 0.51, w * 0.7, h * 0.54);
      ctx.stroke();

      // North & South CO₂ ice caps
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(w / 2, 20, 140, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(w / 2, h - 20, 110, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'jupiter': {
      // Alternating bands of ammonia clouds and Jovian storms
      const bands = [
        '#d89b63', '#ecd5b3', '#a85b32', '#f3dec4', '#bc6b3c',
        '#deb88b', '#9c4c25', '#f5e4cc', '#c07e4d', '#7d381c'
      ];
      const bandHeight = h / bands.length;
      bands.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(0, idx * bandHeight, w, bandHeight);

        // Turbulent shear ripples along band borders
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let x = 0; x < w; x += 15) {
          ctx.beginPath();
          ctx.arc(x, idx * bandHeight + Math.sin(x * 0.05) * 4, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // The Great Red Spot (giant anticyclone)
      ctx.fillStyle = '#c03823';
      ctx.beginPath();
      ctx.ellipse(w * 0.65, h * 0.62, 55, 32, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e6735c';
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }

    case 'saturn': {
      // Golden butterscotch and cream bands
      const saturnBands = ['#dfba73', '#ecd39c', '#cda55a', '#f5e4ba', '#b88d44', '#ecd8a5'];
      const bh = h / saturnBands.length;
      saturnBands.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(0, i * bh, w, bh);
      });
      break;
    }

    case 'uranus': {
      // Uniform aquamarine / cyan methane haze
      const uGrad = ctx.createLinearGradient(0, 0, 0, h);
      uGrad.addColorStop(0, '#5faebc');
      uGrad.addColorStop(0.5, '#7bc8d4');
      uGrad.addColorStop(1, '#4f9ca8');
      ctx.fillStyle = uGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'neptune': {
      // Azure cobalt blue with white methane cirrus cloud streaks
      const nGrad = ctx.createLinearGradient(0, 0, 0, h);
      nGrad.addColorStop(0, '#1c3fa8');
      nGrad.addColorStop(0.5, '#2e5ee8');
      nGrad.addColorStop(1, '#152f82');
      ctx.fillStyle = nGrad;
      ctx.fillRect(0, 0, w, h);

      // White storm clouds ("Scooter" & Great Dark Spot)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.ellipse(w * 0.45, h * 0.42, 60, 12, 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.75, h * 0.65, 45, 8, -0.05, 0, Math.PI * 2);
      ctx.fill();

      // Great Dark Spot
      ctx.fillStyle = 'rgba(12, 28, 80, 0.7)';
      ctx.beginPath();
      ctx.ellipse(w * 0.35, h * 0.38, 45, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'moon': {
      return getMoonTexture();
    }

    default: {
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, w, h);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(planetId, texture);
  return texture;
}

/**
 * Creates a dedicated concentric Ring texture with alpha for Saturn or Uranus
 */
export function getSaturnRingTexture() {
  if (textureCache.has('saturn_rings')) {
    return textureCache.get('saturn_rings');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(180, 150, 100, 0)');
  grad.addColorStop(0.15, 'rgba(200, 170, 120, 0.7)'); // C Ring
  grad.addColorStop(0.35, 'rgba(225, 195, 140, 0.95)'); // B Ring (dense)
  grad.addColorStop(0.65, 'rgba(50, 40, 25, 0.08)'); // Cassini Division!
  grad.addColorStop(0.72, 'rgba(215, 185, 130, 0.85)'); // A Ring
  grad.addColorStop(0.92, 'rgba(160, 135, 95, 0.3)'); // Encke gap
  grad.addColorStop(1, 'rgba(140, 115, 80, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 64);

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set('saturn_rings', texture);
  return texture;
}

/**
 * Procedural Spacecraft Gold Foil / Solar Cell texture
 */
export function getSpacecraftTextures() {
  if (textureCache.has('gold_foil')) {
    return {
      goldFoil: textureCache.get('gold_foil'),
      solarCell: textureCache.get('solar_cell')
    };
  }

  // 1. Gold foil MLI
  const fCanvas = document.createElement('canvas');
  fCanvas.width = 256;
  fCanvas.height = 256;
  const fCtx = fCanvas.getContext('2d');
  fCtx.fillStyle = '#d4af37';
  fCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 200; i++) {
    fCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 235, 160, 0.25)' : 'rgba(140, 100, 20, 0.25)';
    fCtx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 25, Math.random() * 25);
  }
  const goldFoil = new THREE.CanvasTexture(fCanvas);
  goldFoil.wrapS = THREE.RepeatWrapping;
  goldFoil.wrapT = THREE.RepeatWrapping;

  // 2. Solar Cell Grid
  const sCanvas = document.createElement('canvas');
  sCanvas.width = 256;
  sCanvas.height = 256;
  const sCtx = sCanvas.getContext('2d');
  sCtx.fillStyle = '#081c3d';
  sCtx.fillRect(0, 0, 256, 256);
  sCtx.strokeStyle = 'rgba(100, 180, 255, 0.4)';
  sCtx.lineWidth = 1;
  for (let x = 0; x < 256; x += 32) {
    sCtx.beginPath();
    sCtx.moveTo(x, 0);
    sCtx.lineTo(x, 256);
    sCtx.stroke();
  }
  for (let y = 0; y < 256; y += 32) {
    sCtx.beginPath();
    sCtx.moveTo(0, y);
    sCtx.lineTo(256, y);
    sCtx.stroke();
  }
  const solarCell = new THREE.CanvasTexture(sCanvas);
  solarCell.wrapS = THREE.RepeatWrapping;
  solarCell.wrapT = THREE.RepeatWrapping;

  textureCache.set('gold_foil', goldFoil);
  textureCache.set('solar_cell', solarCell);

  return { goldFoil, solarCell };
}

/**
 * Creates high-fidelity procedural PBR rocket fuselage skin textures
 * With weld seams, panel lines, race-ways, flags, and aerospace stencils
 */
export function getRocketSkinTexture(rocketId = 'medium', stage = 'stage1') {
  const cacheKey = `rocket_${rocketId}_${stage}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Base fuselage tone by launcher type
  if (rocketId === 'light') {
    // Carbon-fiber composite weave with silver titanium stringers
    ctx.fillStyle = '#181a20';
    ctx.fillRect(0, 0, w, h);

    // Subtle carbon weave pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = 0; x < w; x += 8) {
      for (let y = 0; y < h; y += 8) {
        if ((x + y) % 16 === 0) ctx.fillRect(x, y, 4, 4);
      }
    }
  } else if (rocketId === 'super_heavy') {
    // Stainless steel 304L mirror metallic sheen with longitudinal weld seams
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#d8dbe2');
    grad.addColorStop(0.25, '#f4f6fa');
    grad.addColorStop(0.5, '#c5c9d4');
    grad.addColorStop(0.75, '#f0f3f8');
    grad.addColorStop(1, '#d8dbe2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Thermal protection tile grid on windward hemisphere (right half of texture)
    ctx.fillStyle = '#111215';
    ctx.fillRect(w * 0.5, 0, w * 0.5, h);
    ctx.strokeStyle = 'rgba(60, 62, 70, 0.6)';
    ctx.lineWidth = 1;
    for (let x = w * 0.5; x < w; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 16) {
      ctx.beginPath();
      ctx.moveTo(w * 0.5, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  } else {
    // Aerospace high-reflectance pure white with matte thermal coating
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#e8ebf2');
    grad.addColorStop(0.3, '#ffffff');
    grad.addColorStop(0.7, '#ffffff');
    grad.addColorStop(1, '#e4e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Horizontal weld seams & structural stringers
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.lineWidth = 2;
  const numRings = stage === 'fairing' ? 4 : 8;
  for (let i = 1; i <= numRings; i++) {
    const y = (h / (numRings + 1)) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();

    // Rivet dots along ring
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    for (let x = 0; x < w; x += 24) {
      ctx.fillRect(x, y - 1, 2, 2);
    }
  }

  // Vertical cable raceway & propellant conduit lines
  ctx.fillStyle = rocketId === 'light' ? '#333742' : '#22252e';
  ctx.fillRect(w * 0.22, 0, 18, h);
  ctx.fillRect(w * 0.72, 0, 18, h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.strokeRect(w * 0.22, 0, 18, h);
  ctx.strokeRect(w * 0.72, 0, 18, h);

  // Interstage separation hazard diagonal stripes (if booster core or interstage)
  if (stage === 'stage1' || stage === 'interstage') {
    const stripeY = h - 45;
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(0, stripeY, w, 40);

    ctx.fillStyle = '#111115';
    for (let x = -40; x < w + 40; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, stripeY);
      ctx.lineTo(x + 18, stripeY);
      ctx.lineTo(x - 6, stripeY + 40);
      ctx.lineTo(x - 24, stripeY + 40);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Mission Markings, Stencils & Identification
  ctx.fillStyle = rocketId === 'light' ? '#ffffff' : '#111318';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';

  if (stage === 'fairing') {
    ctx.fillText('ORBITAL COMMAND', w * 0.45, h * 0.35);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('MISSION PAYLOAD SYSTEM', w * 0.45, h * 0.45);

    // USA Flag style stencil badge
    ctx.fillStyle = '#b22222';
    ctx.fillRect(w * 0.45 - 35, h * 0.55, 70, 36);
    ctx.fillStyle = '#ffffff';
    for (let i = 1; i < 5; i++) {
      ctx.fillRect(w * 0.45 - 35, h * 0.55 + i * 7, 70, 3.5);
    }
    ctx.fillStyle = '#1c3d72';
    ctx.fillRect(w * 0.45 - 35, h * 0.55, 30, 20);
  } else {
    ctx.save();
    ctx.translate(w * 0.45, h * 0.4);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 32px sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(rocketId === 'super_heavy' ? 'SATURN-OMEGA' : rocketId === 'heavy' ? 'TITAN HEAVY' : rocketId === 'light' ? 'SCOUT-LITE' : 'ARES-1', 0, 0);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#888c96';
    ctx.fillText(stage === 'stage2' ? 'STAGE 2 · VACUUM PROPULSION' : 'STAGE 1 · REUSABLE BOOSTER', 0, 30);
    ctx.restore();

    // Propellant Tank Placards
    ctx.font = '11px monospace';
    ctx.fillStyle = '#555b68';
    ctx.fillText('▲ LIQUID OXYGEN (LOX) TANK ▲', w * 0.45, h * 0.15);
    ctx.fillText('▼ LIQUID FUEL (RP-1/CH4) TANK ▼', w * 0.45, h * 0.75);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates dynamic high-res transparent cloud deck texture for Earth
 */
export function getEarthCloudsTexture() {
  if (textureCache.has('earth_clouds')) {
    return textureCache.get('earth_clouds');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Clear with transparent alpha
  ctx.clearRect(0, 0, w, h);

  // Draw realistic atmospheric cloud systems
  // 1. Tropical storm spirals (Cyclones)
  const drawCyclone = (cx, cy, radius) => {
    for (let angle = 0; angle < Math.PI * 6; angle += 0.15) {
      const r = (angle / (Math.PI * 6)) * radius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * (r * 0.6);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.75 - (r / radius) * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 8 + 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  drawCyclone(260, 160, 65); // N. Atlantic Hurricane
  drawCyclone(720, 200, 75); // W. Pacific Typhoon
  drawCyclone(840, 340, 50); // S. Indian Ocean Cyclone

  // 2. Intertropical Convergence Zone (ITCZ) equatorial cloud band
  for (let x = 0; x < w; x += 12) {
    const y = h * 0.5 + Math.sin(x * 0.02) * 18 + (Math.random() - 0.5) * 20;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.35})`;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.random() * 30 + 15, Math.random() * 12 + 4, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Mid-latitude storm tracks & cold front waves
  for (let i = 0; i < 35; i++) {
    const x = Math.random() * w;
    const y = Math.random() > 0.5 ? Math.random() * 100 + 70 : Math.random() * 100 + 330;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.25})`;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.random() * 90 + 30, Math.random() * 18 + 6, Math.random() * 0.6 - 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('earth_clouds', texture);
  return texture;
}

/**
 * Creates Earth night lights texture (emissive city lights on dark hemisphere)
 */
export function getEarthNightLightsTexture() {
  if (textureCache.has('earth_night_lights')) {
    return textureCache.get('earth_night_lights');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Major global metropolitan clusters
  const clusters = [
    { x: 230, y: 175, spread: 45, density: 160 }, // US East Coast
    { x: 155, y: 185, spread: 35, density: 90 },  // US West Coast
    { x: 510, y: 155, spread: 38, density: 180 }, // Western Europe
    { x: 780, y: 190, spread: 45, density: 200 }, // Coastal China & Japan
    { x: 670, y: 240, spread: 35, density: 140 }, // India
    { x: 575, y: 220, spread: 25, density: 80 },  // Nile River & Persian Gulf
    { x: 310, y: 350, spread: 30, density: 70 },  // S. America (Sao Paulo)
    { x: 840, y: 370, spread: 25, density: 60 }   // SE Australia
  ];

  clusters.forEach((c) => {
    for (let i = 0; i < c.density; i++) {
      const x = c.x + (Math.random() - 0.5) * c.spread * 2;
      const y = c.y + (Math.random() - 0.5) * c.spread * 1.4;
      const brightness = Math.random() * 0.7 + 0.3;
      ctx.fillStyle = `rgba(255, 215, 120, ${brightness})`;
      ctx.fillRect(x, y, Math.random() > 0.8 ? 2 : 1.2, Math.random() > 0.8 ? 2 : 1.2);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('earth_night_lights', texture);
  return texture;
}

/**
 * Creates cratered lunar highlands & basaltic maria texture for the Moon
 */
export function getMoonTexture() {
  if (textureCache.has('moon')) {
    return textureCache.get('moon');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Anorthosite light gray highlands
  ctx.fillStyle = '#8f9196';
  ctx.fillRect(0, 0, w, h);

  // Basaltic dark maria (Sea of Tranquility, Oceanus Procellarum, etc.)
  const maria = [
    { x: 480, y: 210, rx: 90, ry: 60 }, // Mare Tranquillitatis
    { x: 380, y: 190, rx: 110, ry: 75 }, // Oceanus Procellarum
    { x: 520, y: 150, rx: 65, ry: 45 },  // Mare Serenitatis
    { x: 580, y: 220, rx: 55, ry: 40 },  // Mare Crisium
    { x: 440, y: 290, rx: 75, ry: 50 }   // Mare Nubium
  ];

  maria.forEach((m) => {
    ctx.fillStyle = 'rgba(55, 57, 62, 0.75)';
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, m.rx, m.ry, Math.random() * 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Impact craters with rim highlights
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 14 + 2;

    ctx.fillStyle = 'rgba(40, 42, 45, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(210, 215, 225, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Tycho ray crater ejecta spokes
  const tychoX = 490;
  const tychoY = 380;
  ctx.strokeStyle = 'rgba(235, 240, 255, 0.4)';
  ctx.lineWidth = 1;
  for (let a = 0; a < Math.PI * 2; a += 0.2) {
    ctx.beginPath();
    ctx.moveTo(tychoX, tychoY);
    ctx.lineTo(tychoX + Math.cos(a) * (Math.random() * 160 + 80), tychoY + Math.sin(a) * (Math.random() * 160 + 80));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('moon', texture);
  return texture;
}

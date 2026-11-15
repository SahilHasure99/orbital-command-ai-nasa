// Spacecraft Modular Components Catalog
// Organized across the 6 core subsystems requested:
// 1. Fuel Tank & Propulsion
// 2. Solar Panels
// 3. Batteries & Power Storage
// 4. Communication System
// 5. Scientific Instruments
// 6. Navigation & Guidance

export const componentCategories = [
  { id: 'propulsion', name: 'Fuel & Propulsion', icon: '🚀', description: 'Fuel tanks and orbital maneuvering engines' },
  { id: 'solar', name: 'Solar Panels', icon: '☀️', description: 'Photovoltaic power generation from solar photons' },
  { id: 'battery', name: 'Batteries & Storage', icon: '🔋', description: 'Energy storage for eclipse periods and deep space' },
  { id: 'communication', name: 'Communication', icon: '📡', description: 'Downlink telemetry & command receiver' },
  { id: 'science', name: 'Scientific Instruments', icon: '🔬', description: 'Sensors, spectrometers, and sample collectors' },
  { id: 'navigation', name: 'Navigation & Guidance', icon: '🧭', description: 'Attitude control, star trackers, and landing LIDAR' },
  { id: 'protection', name: 'Thermal & Structure', icon: '🛡️', description: 'Heat shields and radiation protection' }
];

export const components = {
  // ================= 1. FUEL TANK & PROPULSION =================
  prop_cold_gas: {
    id: 'prop_cold_gas',
    name: 'Cold Gas Thruster System',
    category: 'propulsion',
    icon: '💨',
    dryMass: 18, // kg
    fuelMass: 35, // kg
    cost: 5, // $M
    power: -10, // W continuous
    isp: 75, // s
    thrustN: 20, // N
    deltaVContribution: 420, // m/s baseline
    description: 'Pressurized nitrogen gas thrusters. Ultra-clean, non-toxic, lightweight, best for small satellite attitude control.',
    techDetail: 'Propellant: N₂ Gas · Isp: 75s · Simple solenoid valves with zero ignition risk'
  },
  prop_monoprop: {
    id: 'prop_monoprop',
    name: 'Hydrazine Monopropellant System',
    category: 'propulsion',
    icon: '⛽',
    dryMass: 45,
    fuelMass: 140,
    cost: 16,
    power: -25,
    isp: 235,
    thrustN: 400,
    deltaVContribution: 1650,
    description: 'Catalytic hydrazine thrusters. Standard workhorse for orbital adjustments, lunar transfer corrections, and attitude maneuvers.',
    techDetail: 'Propellant: N₂H₄ · Isp: 235s · Decomposition over Shell 405 iridium catalyst'
  },
  prop_biprop: {
    id: 'prop_biprop',
    name: 'Hypergolic Bipropellant Tank & Engine',
    category: 'propulsion',
    icon: '🔥',
    dryMass: 85,
    fuelMass: 380,
    cost: 32,
    power: -45,
    isp: 325,
    thrustN: 3000,
    deltaVContribution: 2950,
    description: 'High-thrust hypergolic propulsion (MMH / NTO). Essential for heavy braking burns, planetary orbit insertion, and landing retro-burns.',
    techDetail: 'Propellant: MMH + NTO · Isp: 325s · Hypergolic spontaneous ignition on contact'
  },
  prop_ion_hall: {
    id: 'prop_ion_hall',
    name: 'Hall-Effect Xenon Ion Engine',
    category: 'propulsion',
    icon: '⚡',
    dryMass: 65,
    fuelMass: 90,
    cost: 42,
    power: -350, // High electrical power demand!
    isp: 3100, // Massive ISP!
    thrustN: 0.25,
    deltaVContribution: 4800, // Tremendous Delta-V for deep space cruise
    description: 'Electric propulsion accelerating ionized Xenon plasma with magnetic fields. Immense fuel efficiency (Isp 3,100s) for deep space & asteroid rendezvous.',
    techDetail: 'Propellant: Xe Gas · Isp: 3,100s · Requires high electrical wattage (> 350W)'
  },

  // ================= 2. SOLAR PANELS =================
  solar_body_panels: {
    id: 'solar_body_panels',
    name: 'Body-Mounted Silicon Solar Cells',
    category: 'solar',
    icon: '🔲',
    dryMass: 25,
    fuelMass: 0,
    cost: 8,
    power: 180, // W generated at 1 AU
    degradationFactor: 0.98,
    description: 'Compact silicon photovoltaic tiles bonded directly to spacecraft hull. Extremely rugged, zero moving parts, but limited surface area.',
    techDetail: 'Efficiency: 19% · Output: 180W at 1 AU · No deployment risk'
  },
  solar_deployable_wings: {
    id: 'solar_deployable_wings',
    name: 'Deployable Multi-Junction GaAs Wings',
    category: 'solar',
    icon: '☀️',
    dryMass: 55,
    fuelMass: 0,
    cost: 18,
    power: 650, // W at 1 AU
    degradationFactor: 0.95,
    description: 'Dual folding solar panel wings with gallium-arsenide triple-junction cells and sun-tracking gimbals. Excellent power-to-mass ratio.',
    techDetail: 'Efficiency: 32% · Output: 650W at 1 AU · Automated 2-axis solar tracking'
  },
  solar_ultraflex: {
    id: 'solar_ultraflex',
    name: 'Circular UltraFlex High-Yield Arrays',
    category: 'solar',
    icon: '🏵️',
    dryMass: 85,
    fuelMass: 0,
    cost: 32,
    power: 1400, // W at 1 AU (massive collecting area for deep space)
    degradationFactor: 0.93,
    description: 'Accordion-folding circular fan solar arrays (Orion/Mars-style). Massive collecting area to maintain viable electrical output in deep space.',
    techDetail: 'Efficiency: 34% · Output: 1,200W at 1 AU · Ultra-lightweight carbon backbone'
  },

  // ================= 3. BATTERIES & ENERGY STORAGE =================
  battery_li_ion: {
    id: 'battery_li_ion',
    name: 'Space-Grade Lithium-Ion Battery Bank',
    category: 'battery',
    icon: '🔋',
    dryMass: 35,
    fuelMass: 0,
    cost: 10,
    power: 0,
    batteryCapacityWh: 750, // Wh storage
    maxDischargeW: 400,
    description: 'High-density sealed Li-ion cells with thermal heating jackets. Powers spacecraft avionics during planetary eclipse shadow periods.',
    techDetail: 'Storage: 750 Wh · Specific Energy: 180 Wh/kg · 10,000 charge cycles'
  },
  battery_solid_state: {
    id: 'battery_solid_state',
    name: 'Radiation-Hardened Solid-State Battery',
    category: 'battery',
    icon: '🛡️',
    dryMass: 65,
    fuelMass: 0,
    cost: 22,
    power: 0,
    batteryCapacityWh: 1600,
    maxDischargeW: 800,
    description: 'Ceramic electrolyte battery immune to dendritic short circuits and thermal runaway. Withstands harsh cosmic radiation belts.',
    techDetail: 'Storage: 1,600 Wh · Operating Range: -80°C to +120°C · Radiation hardened'
  },
  power_rtg: {
    id: 'power_rtg',
    name: 'Next-Gen RTG Nuclear Power Unit',
    category: 'battery',
    icon: '⚛️',
    dryMass: 90,
    fuelMass: 0,
    cost: 48,
    power: 380, // Generates constant 380W continuous independent of sunlight!
    batteryCapacityWh: 900,
    maxDischargeW: 500,
    description: 'Radioisotope Thermoelectric Generator fueled by Plutonium-238 decay heat. Provides continuous electrical power with zero reliance on the Sun—essential for asteroids and outer planets.',
    techDetail: 'Fuel: Pu-238 · Continuous Output: 380W · Half-life: 87.7 years · Immune to solar distance'
  },

  // ================= 4. COMMUNICATION SYSTEMS =================
  comm_s_band: {
    id: 'comm_s_band',
    name: 'S-Band Omnidirectional Patch Antenna',
    category: 'communication',
    icon: '📶',
    dryMass: 14,
    fuelMass: 0,
    cost: 6,
    power: -30,
    commRating: 45,
    maxRangeKm: 50000,
    bandwidth: '256 kbps',
    description: 'Wide-beam omnidirectional antennas providing spherical coverage. Guarantees emergency telemetry uplink/downlink without precise Earth-pointing.',
    techDetail: 'Frequency: 2.2 GHz · Coverage: 360° Sphere · Optimal for Low Earth Orbit'
  },
  comm_x_band_dish: {
    id: 'comm_x_band_dish',
    name: 'Gimbaled X-Band High-Gain Dish',
    category: 'communication',
    icon: '📡',
    dryMass: 32,
    fuelMass: 0,
    cost: 18,
    power: -75,
    commRating: 120,
    maxRangeKm: 2000000,
    bandwidth: '4 Mbps',
    description: 'Motorized parabolic reflector dish. Provides high data-rate imagery and command channels for lunar and cis-lunar exploration missions.',
    techDetail: 'Frequency: 8.4 GHz · Dish Diameter: 1.2m · Direct DSN tracking lock'
  },
  comm_ka_deep_space: {
    id: 'comm_ka_deep_space',
    name: 'Ka-Band Deep Space Optical/RF Transceiver',
    category: 'communication',
    icon: '🌐',
    dryMass: 55,
    fuelMass: 0,
    cost: 36,
    power: -130,
    commRating: 250,
    maxRangeKm: 400000000,
    bandwidth: '25 Mbps',
    description: 'Dual Ka-band RF dish and optical laser downlink terminal. Communicates with NASA Deep Space Network across hundreds of millions of kilometers (Mars & Asteroid Belt).',
    techDetail: 'Frequency: 32 GHz & 1550nm Laser · Connects to Goldstone, Madrid, & Canberra DSN antennas'
  },

  // ================= 5. SCIENTIFIC INSTRUMENTS =================
  inst_multispectral_cam: {
    id: 'inst_multispectral_cam',
    name: 'Multispectral Scientific Imaging System',
    category: 'science',
    icon: '📷',
    dryMass: 22,
    fuelMass: 0,
    cost: 14,
    power: -40,
    science: 45,
    description: 'High-resolution telescopic optical & infrared camera array. Captures surface morphology, terrain hazards, and mineral color mapping.',
    techDetail: 'Spectral Bands: 14 channels (UV to Near-IR) · Resolution: 0.15m/pixel from 100km orbit'
  },
  inst_xray_spectrometer: {
    id: 'inst_xray_spectrometer',
    name: 'Alpha Particle X-Ray Spectrometer (APXS)',
    category: 'science',
    icon: '🔬',
    dryMass: 28,
    fuelMass: 0,
    cost: 20,
    power: -55,
    science: 60,
    description: 'Bombards regolith samples with alpha radiation and detects emitted X-rays to accurately catalog planetary elemental abundance and mineralogy.',
    techDetail: 'Curium-244 source · Detects: Fe, Si, Al, Mg, Ti, S, Ca, K, P'
  },
  inst_ground_radar: {
    id: 'inst_ground_radar',
    name: 'Subsurface Sounding Ground Radar',
    category: 'science',
    icon: '📉',
    dryMass: 42,
    fuelMass: 0,
    cost: 26,
    power: -95,
    science: 75,
    description: 'Synthetic aperture penetrating radar. Probes up to 10 meters beneath the planetary crust to discover buried water-ice reservoirs and lava tubes.',
    techDetail: 'Frequency: 15-100 MHz radar chirps · Subsurface penetration depth: 10m'
  },
  inst_laser_lidar: {
    id: 'inst_laser_lidar',
    name: 'Precision Laser Altimeter & 3D LIDAR',
    category: 'science',
    icon: '🔦',
    dryMass: 30,
    fuelMass: 0,
    cost: 18,
    power: -60,
    science: 50,
    description: 'Fires 10,000 laser pulses per second to build sub-millimeter 3D digital elevation models of craters, boulders, and asteroid topography.',
    techDetail: 'Wavelength: 1064nm Nd:YAG · Measurement accuracy: ±2 cm range precision'
  },
  inst_magnetometer: {
    id: 'inst_magnetometer',
    name: 'Deployable Fluxgate Magnetometer Boom',
    category: 'science',
    icon: '🧭',
    dryMass: 18,
    fuelMass: 0,
    cost: 12,
    power: -25,
    science: 35,
    description: 'Triaxial fluxgate sensors mounted on an isolated 3-meter boom to measure planetary magnetic crustal anomalies and solar wind interactions.',
    techDetail: 'Boom Length: 3.2m · Sensitivity: 0.01 nT · Isolates magnetic noise from bus electronics'
  },
  inst_sample_drill: {
    id: 'inst_sample_drill',
    name: 'Robotic Coring Drill & Hermetic Cacher',
    category: 'science',
    icon: '⛏️',
    dryMass: 62,
    fuelMass: 0,
    cost: 38,
    power: -140,
    science: 95,
    description: 'Rotary-percussive drill capable of extracting deep core samples and hermetically sealing them in ultra-clean titanium tubes for sample return.',
    techDetail: 'Drill Depth: 1.5m · Core Diameter: 13mm · Rotary speed: 300 RPM'
  },

  // ================= 6. NAVIGATION & GUIDANCE =================
  nav_star_tracker: {
    id: 'nav_star_tracker',
    name: 'Star Tracker & Ring-Laser Gyro IMU',
    category: 'navigation',
    icon: '✨',
    dryMass: 16,
    fuelMass: 0,
    cost: 12,
    power: -20,
    navRating: 60,
    description: 'Autonomous celestial navigation comparing star patterns with an on-board catalog of 200,000 stars. Delivers arcsecond attitude knowledge.',
    techDetail: 'Precision: 1.5 arcsec · Dual optical cameras · Autonomous lost-in-space recovery algorithm'
  },
  nav_reaction_wheels: {
    id: 'nav_reaction_wheels',
    name: '3-Axis Momentum Reaction Wheels',
    category: 'navigation',
    icon: '⚙️',
    dryMass: 38,
    fuelMass: 0,
    cost: 20,
    power: -50,
    navRating: 85,
    description: 'Spinning heavy flywheels that store and exchange angular momentum to orient the probe smoothly without burning a single gram of fuel.',
    techDetail: 'Max Momentum: 12 N·m·s · Angular slew rate: 2.5 deg/s · Zero propellant consumption'
  },
  nav_terrain_lidar: {
    id: 'nav_terrain_lidar',
    name: 'Terrain-Relative Navigation & Hazard Avoidance',
    category: 'navigation',
    icon: '🎯',
    dryMass: 32,
    fuelMass: 0,
    cost: 28,
    power: -65,
    navRating: 110,
    description: 'Machine vision and real-time flash LIDAR that analyzes planetary surface craters and slopes in milliseconds during descent to divert away from hazards.',
    techDetail: 'Real-time 100Hz surface mapping · Diverts probe away from slopes > 15° and boulders > 0.5m'
  },

  // ================= 7. PROTECTION & THERMAL SHIELD =================
  protect_heat_shield: {
    id: 'protect_heat_shield',
    name: 'Phenolic-Impregnated Carbon Ablator (PICA-X)',
    category: 'protection',
    icon: '🛡️',
    dryMass: 55,
    fuelMass: 0,
    cost: 22,
    power: 0,
    protectionRating: 100,
    description: 'Ablative thermal heat shield capable of dissipating 2,800°C temperatures generated during hypersonic planetary atmospheric entry (Mars/Earth).',
    techDetail: 'Peak Heat Flux: 1,200 W/cm² · Material: Carbon fiber matrix filled with phenolic resin'
  },
  protect_radiators: {
    id: 'protect_radiators',
    name: 'Deployable Thermal Louvers & Radiator Panels',
    category: 'protection',
    icon: '❄️',
    dryMass: 30,
    fuelMass: 0,
    cost: 12,
    power: -15,
    protectionRating: 60,
    description: 'Ammonia-loop heat pipes and variable emissivity louvers. Dumps excess waste heat in direct sunlight and closes during eclipse freeze.',
    techDetail: 'Heat rejection: 800W · Maintains electronics between -10°C and +35°C'
  }
};

// Backward-compatibility aliases for existing saves
components.solar_panel = components.solar_deployable_wings;
components.camera = components.inst_multispectral_cam;
components.high_gain_antenna = components.comm_x_band_dish;
components.drill = components.inst_sample_drill;
components.spectrometer = components.inst_xray_spectrometer;
components.rtg = components.power_rtg;
components.propulsion = components.prop_biprop;
components.heat_shield = components.protect_heat_shield;

export const getComponent = (id) => components[id];

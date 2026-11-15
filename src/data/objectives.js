// Missionverse Objectives Data
// Four real-world missions with authentic NASA mission telemetry & targets

export const objectives = [
  {
    id: 'moon',
    name: 'Moon Exploration',
    codeName: 'ARTEMIS LUNAR ICE HUNTER',
    icon: '🌙',
    badge: 'NASA Artemis Profile',
    tagline: 'Targeting the Lunar South Pole – Shackleton Crater',
    description: 'Establish a landing in permanently shadowed craters at the lunar south pole to prospect for water ice deposits and test deep-space surface communications.',
    targetBody: 'Moon',
    distanceKm: 384400,
    distanceDisplay: '384,400 km (1.3 light-seconds)',
    surfaceGravity: 1.62, // m/s²
    atmosphere: 'Vacuum (< 10⁻¹⁴ bar)',
    solarFactor: 1.0, // 100% solar irradiance relative to 1 AU
    deltaVRequired: 3900, // m/s required for LEO to Lunar Landing
    maxBudget: 180, // $M
    minBudget: 85,
    scienceTarget: 100, // Science points goal
    recommendedRocket: 'medium',
    keyRequirements: [
      'Sufficient Delta-V (≥ 3,900 m/s) for Trans-Lunar Injection & Descent',
      'Battery reserve or RTG for 14-day lunar night operations',
      'Medium or High-Gain Antenna for Lunar-Earth link',
      'Sample drill or LIDAR for crater ice mapping'
    ],
    nasaMissionContext: {
      realMission: 'NASA Artemis III & VIPER Rover',
      targetFeature: 'Shackleton Crater Rim (89.9°S)',
      scientificGoal: 'Characterize lunar volatiles and water ice distribution in permanently shadowed regions (PSRs).',
      source: 'NASA Planetary Data System (PDS)'
    }
  },
  {
    id: 'mars',
    name: 'Mars Exploration',
    codeName: 'PERSEVERANCE DEEP RED',
    icon: '🔴',
    badge: 'NASA Mars 2020 Profile',
    tagline: 'Descent to Jezero Crater Ancient River Delta',
    description: 'Travel across interplanetary space to study the Martian surface, test atmospheric entry heat shields, search for ancient biosignatures, and cache core samples.',
    targetBody: 'Mars',
    distanceKm: 225000000,
    distanceDisplay: '225,000,000 km (~12.5 light-minutes)',
    surfaceGravity: 3.72, // m/s²
    atmosphere: 'Thin CO₂ (0.006 bar, aerocapture required)',
    solarFactor: 0.43, // Solar drops to 43% due to 1/r² at 1.52 AU!
    deltaVRequired: 4600, // m/s
    maxBudget: 360, // $M
    minBudget: 150,
    scienceTarget: 180,
    recommendedRocket: 'heavy',
    keyRequirements: [
      'High-thrust propulsion or staged Delta-V (≥ 4,600 m/s)',
      'Heat Shield for 12,000 km/h Martian atmospheric entry interface',
      'High-Gain Ka-band Antenna for interplanetary Deep Space Network tracking',
      'High power reserve: Solar panels generate only 43% power at Mars!'
    ],
    nasaMissionContext: {
      realMission: 'NASA Mars 2020 Perseverance & Curiosity',
      targetFeature: 'Jezero Crater Delta (18.38°N, 77.58°E)',
      scientificGoal: 'Seek signs of ancient microbial life and collect hermetically sealed geological samples.',
      source: 'NASA JPL Mars Exploration Directorate'
    }
  },
  {
    id: 'satellite',
    name: 'Satellite Deployment',
    codeName: 'TERRA-ORBIT CLIMATE SENTRY',
    icon: '🛰️',
    badge: 'NASA Earth Science / Landsat',
    tagline: 'Sun-Synchronous Low Earth Orbit Insertion',
    description: 'Deploy an advanced Earth-observation environmental satellite into a 705 km Sun-Synchronous Orbit (SSO) to continuously monitor polar ice caps, sea surface temperatures, and atmospheric greenhouse gases.',
    targetBody: 'Earth Orbit',
    distanceKm: 705,
    distanceDisplay: '705 km LEO (0.002 light-seconds)',
    surfaceGravity: 9.81, // m/s² (Earth gravity at surface, orbital velocity ~7.5 km/s)
    atmosphere: 'Thermosphere micro-drag',
    solarFactor: 1.0, // 100% solar
    deltaVRequired: 1600, // m/s for orbital circularization and station keeping
    maxBudget: 95, // $M
    minBudget: 35,
    scienceTarget: 75,
    recommendedRocket: 'light',
    keyRequirements: [
      'Cost efficiency: Complete under $95M budget',
      'Star Tracker & Reaction Wheels for precision Earth pointing',
      'High-speed downlink for continuous gigabit climate telemetry',
      'Deployable solar arrays with battery buffer during 35-min eclipse phase'
    ],
    nasaMissionContext: {
      realMission: 'NASA Landsat 9 / Terra / Sentinel Earth Fleet',
      targetFeature: 'Sun-Synchronous Polar Orbit (98.2° Inclination)',
      scientificGoal: 'Multi-decadal monitoring of global biosphere dynamics and climate indicators.',
      source: 'NASA Earth Observing System (EOSDIS)'
    }
  },
  {
    id: 'asteroid',
    name: 'Asteroid Exploration',
    codeName: 'PSYCHE DEEP METAL EXPLORER',
    icon: '☄️',
    badge: 'NASA Discovery Program',
    tagline: 'Main Asteroid Belt Deep Trajectory Rendezvous',
    description: 'Journey past Mars into the main asteroid belt to intercept metallic asteroid 16 Psyche. Utilize electric ion propulsion or staged burns to map its metallic nickel-iron surface and acquire regolith samples.',
    targetBody: '16 Psyche',
    distanceKm: 370000000,
    distanceDisplay: '370,000,000 km (~20.5 light-minutes)',
    surfaceGravity: 0.14, // m/s² (micro-gravity)
    atmosphere: 'Deep space vacuum',
    solarFactor: 0.16, // Solar power drops to only 16% at 2.5 AU!
    deltaVRequired: 5200, // m/s
    maxBudget: 460, // $M
    minBudget: 180,
    scienceTarget: 220,
    recommendedRocket: 'super_heavy',
    keyRequirements: [
      'Massive Delta-V (≥ 5,200 m/s): Hall-Effect Ion Thruster highly recommended',
      'RTG Nuclear Generator or Massive Solar Wings: Solar irradiance is 84% weaker at 2.5 AU',
      'Deep Space Ka-Band Transponder with autonomous star navigation',
      'LIDAR and Spectrometer for micro-gravity proximity mapping'
    ],
    nasaMissionContext: {
      realMission: 'NASA Psyche & OSIRIS-REx Missions',
      targetFeature: '16 Psyche (Asteroid Belt at 2.5 AU)',
      scientificGoal: 'Investigate the exposed metallic core of an early planetary building block (planetesimal).',
      source: 'NASA Small Bodies Database (SBDB)'
    }
  }
];

export const getObjective = (id) => {
  let targetId = id;
  if (id === 'lunar') targetId = 'moon';
  if (id === 'earth') targetId = 'satellite';
  return objectives.find((o) => o.id === targetId) || objectives[0];
};

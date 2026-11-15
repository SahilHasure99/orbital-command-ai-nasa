// Rockets Data with realistic physics parameters for Tsiolkovsky calculations & TWR

export const rockets = [
  {
    id: 'light',
    name: 'Scout-Lite Orbital',
    realWorldRef: 'Electron / Falcon 1 class',
    icon: '🚀',
    tier: 'Light Lifter',
    cost: 25, // $M
    maxPayload: 380, // kg to LEO
    thrustKn: 440, // kN
    dryMassKg: 3500, // kg
    fuelCapacityKg: 28000, // kg
    ispSeaLevel: 280, // seconds
    ispVacuum: 315, // seconds
    reliability: 0.94,
    description: 'Affordable two-stage light launcher. Optimized for rapid responsive satellite deployment and lightweight probes.',
    strengths: ['Low cost ($28M)', 'High launch cadence', 'Ideal for Earth LEO satellites'],
    weaknesses: ['Cannot launch heavy planetary probes', 'Payload capped at 380kg']
  },
  {
    id: 'medium',
    name: 'Ares Medium Lifter',
    realWorldRef: 'Falcon 9 / Atlas V class',
    icon: '🛰️',
    tier: 'Medium-Heavy Workhorse',
    cost: 55, // $M
    maxPayload: 1350, // kg to Lunar/Mars transfer
    thrustKn: 1900, // kN
    dryMassKg: 18000,
    fuelCapacityKg: 110000,
    ispSeaLevel: 310,
    ispVacuum: 348,
    reliability: 0.97,
    description: 'Reusable two-stage workhorse rocket. Proven track record for commercial satellites, Moon orbiters, and Mars lightweight landers.',
    strengths: ['High reliability (97%)', 'Balanced budget & performance', 'Supports Moon orbit & Mars probes'],
    weaknesses: ['May require mass-savings for deep asteroid cruise']
  },
  {
    id: 'heavy',
    name: 'Titan Heavy Explorer',
    realWorldRef: 'Falcon Heavy / New Glenn class',
    icon: '🛸',
    tier: 'Heavy Lift Vehicle',
    cost: 110, // $M
    maxPayload: 4200, // kg to deep space
    thrustKn: 5400, // kN
    dryMassKg: 42000,
    fuelCapacityKg: 360000,
    ispSeaLevel: 325,
    ispVacuum: 382,
    reliability: 0.96,
    description: 'Triple-core heavy lift vehicle with side strap-on boosters. Delivers high Delta-V for direct lunar landings and deep Mars surface rovers.',
    strengths: ['Massive 4,200kg payload capacity', 'Multi-burn restartable upper stage', 'Excellent for Mars & Moon missions'],
    weaknesses: ['High cost ($110M)']
  },
  {
    id: 'super_heavy',
    name: 'Saturn-Omega Super Heavy',
    realWorldRef: 'SLS Block 2 / Saturn V / Starship class',
    icon: '🌠',
    tier: 'Super Heavy Deep Space Lifter',
    cost: 180, // $M
    maxPayload: 9500, // kg
    thrustKn: 12500, // kN
    dryMassKg: 95000,
    fuelCapacityKg: 850000,
    ispSeaLevel: 365,
    ispVacuum: 452, // Hydrolox vacuum efficiency
    reliability: 0.98,
    description: 'Colossal cryogenic super-heavy launch vehicle. Provides immense escape velocity for heavy outer planet exploration, deep asteroid belt sample returns, and crewed lunar habitats.',
    strengths: ['Massive thrust & hydrolox high Isp (452s)', 'Trans-planetary direct injection', 'Highest reliability (98%)'],
    weaknesses: ['Premium price tag ($230M), requiring large mission budget']
  }
];

// Rocket staging and configuration accessories
export const rocketConfigurations = {
  boosterOptions: [
    { id: 'standard', name: 'Standard Core', cost: 0, thrustBonusKn: 0, massPenaltyKg: 0, ispBonus: 0, desc: 'Base vehicle configuration' },
    { id: 'srb_twin', name: 'Twin Solid Rocket Boosters (SRBs)', cost: 14, thrustBonusKn: 850, massPenaltyKg: 4200, ispBonus: -10, desc: '+850 kN liftoff thrust for high launchpad TWR' },
    { id: 'liquid_strap', name: 'Liquid Methane Strap-on Boosters', cost: 26, thrustBonusKn: 1400, massPenaltyKg: 3500, ispBonus: 15, desc: 'High-efficiency liquid boosters (+1400 kN, +15s Isp)' }
  ],
  fairingOptions: [
    { id: 'fairing_std', name: 'Standard Aerodynamic Fairing (3.5m)', cost: 0, massKg: 120, dragReduction: 1.0, desc: 'Standard carbon-composite payload shroud' },
    { id: 'fairing_deep', name: 'Deep Space Extended Fairing (5.2m)', cost: 8, massKg: 240, dragReduction: 0.92, desc: 'Extended volume fairing for folded solar wings & high-gain dishes' }
  ],
  upperStageOptions: [
    { id: 'upper_std', name: 'Standard Orbital Upper Stage', cost: 0, ispBonus: 0, massKg: 0, desc: 'Factory upper stage engine' },
    { id: 'upper_vac', name: 'Vacuum High-Expansion Carbon Nozzle', cost: 12, ispBonus: 28, massKg: 65, desc: '+28s vacuum Isp for trans-planetary burn efficiency' }
  ]
};

export const getRocket = (id) => {
  let targetId = id;
  if (id === 'small') targetId = 'light';
  return rockets.find((r) => r.id === targetId) || rockets[0];
};

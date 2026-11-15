// MISSIONVERSE Random Challenges & In-Flight Crisis Engine
// Simulates realistic spaceflight anomalies with procedural decision trees

export const CRISIS_EVENTS = [
  {
    id: 'engine_failure',
    title: 'PROPULSION ANOMALY: TURBOPUMP CAVITATION',
    category: 'propulsion',
    severity: 'CRITICAL',
    icon: '🔥',
    badge: 'Main Engine Malfunction',
    description: 'During a critical orbital burn, telemetry registers severe vibration and turbopump cavitation in the primary combustion chamber. Thrust has dropped by 45%, threatening to leave the spacecraft on an eccentric abort trajectory.',
    options: [
      {
        id: 'opt_throttle_extend',
        title: 'Option A: Throttle Down & Extend Burn Duration',
        description: 'Throttle engine down to 60% rated thrust to prevent catastrophic uncontained failure and extend burn time by 140 seconds.',
        fuelCostKg: 35,
        scienceDelta: 0,
        riskPercent: 12,
        successMessage: 'Throttled burn completed successfully! Trajectory captured with slight fuel expenditure penalty.'
      },
      {
        id: 'opt_rcs_backup',
        title: 'Option B: Cut Main Engine & Fire Secondary RCS',
        description: 'Immediately isolate main engine and complete orbital insertion using cold-gas / monopropellant attitude thrusters.',
        fuelCostKg: 70,
        scienceDelta: 0,
        requiredComponent: 'prop_monoprop',
        riskPercent: 5,
        successMessage: 'Auxiliary thrusters fired on backup vector. Clean orbital insertion achieved with zero engine damage.'
      },
      {
        id: 'opt_jettison_mass',
        title: 'Option C: Jettison Non-Essential Instrumentation',
        description: 'Emergency dump secondary ballast and sensor booms to lighten craft mass and reach required velocity with remaining thrust.',
        fuelCostKg: 0,
        scienceDelta: -25,
        riskPercent: 2,
        successMessage: 'Mass reduction allowed orbital capture, but secondary scientific instruments were sacrificed.'
      }
    ]
  },
  {
    id: 'fuel_leakage',
    title: 'PROPELLANT FEEDLINE PRESSURE DROP: FUEL LEAK',
    category: 'propulsion',
    severity: 'WARNING',
    icon: '⛽',
    badge: 'Propellant Loss Detected',
    description: 'Pressure sensors in Propellant Quadrant B indicate a micro-fracture in the oxidizer feedline. Liquid propellant is actively venting into vacuum at 1.2 kg per minute!',
    options: [
      {
        id: 'opt_isolate_manifold',
        title: 'Option A: Isolate Tank Manifold Solenoids',
        description: 'Remotely close the pyro-isolation valves on Quadrant B, isolating the damaged tank and relying exclusively on Quadrant A reserves.',
        fuelCostKg: 45,
        scienceDelta: 0,
        riskPercent: 8,
        successMessage: 'Feedline isolated! Propellant leak halted with minimal loss.'
      },
      {
        id: 'opt_burn_early',
        title: 'Option B: Execute Early Trans-Planetary Injection Burn',
        description: 'Advance the scheduled injection burn immediately, expending the leaking propellant for useful delta-V before it vents.',
        fuelCostKg: 20,
        scienceDelta: -10,
        riskPercent: 20,
        successMessage: 'Early burn performed! Propellant converted into delta-V, though navigation correction will be required.'
      },
      {
        id: 'opt_balance_vent',
        title: 'Option C: Vent Fuel to Balance Center of Mass',
        description: 'Symmetrically vent oxidizer and fuel to avoid catastrophic spin-up, recalculating arrival trajectory for minimal delta-V.',
        fuelCostKg: 60,
        scienceDelta: 0,
        riskPercent: 6,
        successMessage: 'Center of mass stabilized. Mission proceeds on fuel-optimized cruise trajectory.'
      }
    ]
  },
  {
    id: 'comm_failure',
    title: 'SOLAR FLARE RADIATION: DSN COMMUNICATION BLACKOUT',
    category: 'communication',
    severity: 'HIGH',
    icon: '📡',
    badge: 'Deep Space Network Loss of Signal',
    description: 'An X-class Coronal Mass Ejection (CME) from the Sun has ionized interplanetary space. The high-gain antenna radio frequency link to NASA Deep Space Network (DSN) in Madrid has broken, leaving Mission Control with Loss of Signal (LOS).',
    options: [
      {
        id: 'opt_autonomous_star',
        title: 'Option A: Engage Autonomous Star Tracker Safe-Mode',
        description: 'Put spacecraft into autonomous celestial orientation using star tracker quaternions, maintaining solar lock until flare subsides.',
        fuelCostKg: 10,
        scienceDelta: 0,
        requiredComponent: 'nav_star_tracker',
        riskPercent: 6,
        successMessage: 'Star tracker kept spacecraft stably locked on Sun and Earth vector. Telemetry link automatically restored!'
      },
      {
        id: 'opt_boost_rf_power',
        title: 'Option B: Overdrive RF Traveling Wave Tube Amplifier',
        description: 'Double transmitter microwave amplifier power to burn through the solar plasma interference and force link reconnect.',
        fuelCostKg: 0,
        powerCostW: 60,
        scienceDelta: 0,
        riskPercent: 18,
        successMessage: 'Boosted RF power pierced through solar noise! DSN lock re-established at Goldstone.'
      },
      {
        id: 'opt_buffer_telemetry',
        title: 'Option C: Buffer Telemetry to Solid-State Recorder',
        description: 'Shut off transmitter and store all scientific observations into flash memory until craft emerges from the plasma shadow.',
        fuelCostKg: 0,
        scienceDelta: +15, // Patient scientists rewarded!
        riskPercent: 4,
        successMessage: 'All science telemetry safely buffered without data loss. Downlink resumed with high SNR!'
      }
    ]
  },
  {
    id: 'solar_panel_damage',
    title: 'MICROMETEOROID IMPACT: SOLAR PANEL DEGRADATION',
    category: 'power',
    severity: 'HIGH',
    icon: '⚡',
    badge: 'Photovoltaic Array Punctured',
    description: 'A hypervelocity micrometeoroid has pierced the port solar array. Power generation has plummeted by 40%, and electrical bus voltage is sagging towards critical shutdown threshold.',
    options: [
      {
        id: 'opt_hibernate_instruments',
        title: 'Option A: Hibernate Non-Critical Scientific Instruments',
        description: 'Shut down high-draw spectrometers and drills, prioritizing core avionics, thermal heaters, and command receiver.',
        fuelCostKg: 0,
        scienceDelta: -20,
        riskPercent: 5,
        successMessage: 'Craft placed into power-conservation mode. Essential flight computers and heaters maintained.'
      },
      {
        id: 'opt_reroute_bus',
        title: 'Option B: Reroute Power Bus via Battery Shunts',
        description: 'Electrically disconnect the damaged solar cell strings and draw peak supplement from the high-capacity battery bank.',
        fuelCostKg: 0,
        scienceDelta: 0,
        requiredComponent: 'battery_solid_state',
        riskPercent: 10,
        successMessage: 'Bus successfully rerouted! Radiation-hardened battery absorbed load without voltage drop.'
      },
      {
        id: 'opt_rtg_rely',
        title: 'Option C: Rely on RTG Continuous Thermal Power',
        description: 'If equipped with an RTG, disregard solar loss and power all instruments continuously from Plutonium decay heat.',
        fuelCostKg: 0,
        scienceDelta: +10,
        requiredComponent: 'power_rtg',
        riskPercent: 1,
        successMessage: 'RTG nuclear generator provides 100% continuous power unaffected by solar panel damage!'
      }
    ]
  },
  {
    id: 'asteroid_collision_risk',
    title: 'ORBITAL CONJUNCTION: DEBRIS / ASTEROID COLLISION RISK',
    category: 'navigation',
    severity: 'CRITICAL',
    icon: '☄️',
    badge: 'Impact Probability > 1:50',
    description: 'NASA Deep Space Tracking radar flags an uncatalogued 15-meter asteroid on a direct collision vector. Time to closest approach: 12 minutes!',
    options: [
      {
        id: 'opt_avoidance_burn',
        title: 'Option A: Execute 25 m/s Emergency Avoidance Burn',
        description: 'Fire orbital maneuvering thrusters perpendicular to the trajectory to alter orbit and guarantee a 500 km safe miss-distance.',
        fuelCostKg: 40,
        scienceDelta: 0,
        riskPercent: 4,
        successMessage: 'Trajectory deflated safely by 520 km. Craft completely cleared the conjunction hazard.'
      },
      {
        id: 'opt_orient_shield',
        title: 'Option B: Orient Heat Shield Towards Conjunction Vector',
        description: 'Rotate spacecraft using reaction wheels to present the heavy ablative heat shield to any incoming debris fragments.',
        fuelCostKg: 0,
        scienceDelta: 0,
        requiredComponent: 'protect_heat_shield',
        riskPercent: 8,
        successMessage: 'Spacecraft successfully oriented behind heat shield. Debris whistled past with zero hull damage.'
      },
      {
        id: 'opt_lidar_track',
        title: 'Option C: Autonomous Precision Micro-Dodge',
        description: 'Use Terrain Hazard LIDAR and star tracker to calculate the exact asteroid centroid and execute a minimal 5 m/s puff dodge.',
        fuelCostKg: 12,
        scienceDelta: +25, // Close flyby scientific discovery!
        requiredComponent: 'nav_terrain_lidar',
        riskPercent: 7,
        successMessage: 'Spectacular autonomous dodge! LIDAR captured ultra-rare close-up 3D imagery of the passing asteroid!'
      }
    ]
  }
];

/**
 * Pick a relevant random crisis based on current design
 */
export function pickRandomCrisis(design) {
  const randomIndex = Math.floor(Math.random() * CRISIS_EVENTS.length);
  return CRISIS_EVENTS[randomIndex];
}

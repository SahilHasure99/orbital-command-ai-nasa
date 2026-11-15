// MISSIONVERSE Space Mission Physics Simulation Engine
// Implements authentic spaceflight equations & constraint verification

import { getRocket, rocketConfigurations } from '../data/rockets.js';
import { getObjective } from '../data/objectives.js';
import { getComponent } from '../data/spacecraft.js';

export const G0 = 9.80665; // Earth standard gravity (m/s²)
export const SPEED_OF_LIGHT = 299792; // km/s

/**
 * Calculates comprehensive spacecraft and rocket metrics based on physics models
 */
export function calculateSpacecraftMetrics(design) {
  const { objectiveId, rocketId, componentIds = [], rocketConfig = {} } = design;
  const objective = getObjective(objectiveId);
  const rocket = getRocket(rocketId);

  // 1. Accumulate Spacecraft Component Masses & Properties
  let probeDryMassKg = 120; // Base bus structure mass
  let fuelMassKg = 0;
  let totalCostM = rocket.cost;
  let totalSolarPowerW = 0;
  let constantPowerGenW = 0; // e.g. RTG
  let powerConsumptionW = 35; // Baseline bus avionics & thermal heaters
  let sciencePoints = 0;
  let commRating = 0;
  let navRating = 0;
  let protectionRating = 0;
  let batteryCapacityWh = 200; // Base bus buffer
  let highestIsp = 0;
  let rawDeltaVContribution = 0;

  componentIds.forEach((id) => {
    const comp = getComponent(id);
    if (!comp) return;

    probeDryMassKg += comp.dryMass || 0;
    fuelMassKg += comp.fuelMass || 0;
    totalCostM += comp.cost || 0;
    sciencePoints += comp.science || 0;
    commRating += comp.commRating || 0;
    navRating += comp.navRating || 0;
    protectionRating += comp.protectionRating || 0;
    if (comp.batteryCapacityWh) batteryCapacityWh += comp.batteryCapacityWh;

    // Power generation vs consumption
    if (comp.category === 'solar') {
      totalSolarPowerW += comp.power || 0;
    } else if (comp.id === 'power_rtg') {
      constantPowerGenW += comp.power || 0;
    } else if (comp.power < 0) {
      // Scientific instruments run on duty cycles; communications & avionics are continuous
      const isIntermittentInstrument = comp.category === 'science';
      powerConsumptionW += isIntermittentInstrument
        ? Math.round(Math.abs(comp.power) * 0.4)
        : Math.abs(comp.power);
    }

    if (comp.isp && comp.isp > highestIsp) {
      highestIsp = comp.isp;
    }
    if (comp.deltaVContribution) {
      rawDeltaVContribution += comp.deltaVContribution;
    }
  });

  // 2. Rocket Accessories adjustments
  let boosterBonusKn = 0;
  let boosterMassKg = 0;
  let upperIspBonus = 0;

  if (rocketConfig.boosterId) {
    const b = rocketConfigurations.boosterOptions.find((x) => x.id === rocketConfig.boosterId);
    if (b) {
      boosterBonusKn = b.thrustBonusKn;
      boosterMassKg = b.massPenaltyKg;
      totalCostM += b.cost;
    }
  }
  if (rocketConfig.fairingId) {
    const f = rocketConfigurations.fairingOptions.find((x) => x.id === rocketConfig.fairingId);
    if (f) {
      probeDryMassKg += f.massKg;
      totalCostM += f.cost;
    }
  }
  if (rocketConfig.upperStageId) {
    const u = rocketConfigurations.upperStageOptions.find((x) => x.id === rocketConfig.upperStageId);
    if (u) {
      upperIspBonus = u.ispBonus;
      totalCostM += u.cost;
    }
  }

  // Total spacecraft wet mass (payload to the launcher)
  const probeWetMassKg = probeDryMassKg + fuelMassKg;

  // 3. Thrust-to-Weight Ratio (TWR) on Launchpad
  // Total launchpad wet mass = Rocket Dry + Rocket Fuel + Boosters + Probe Wet Mass
  const totalLaunchpadMassKg = rocket.dryMassKg + rocket.fuelCapacityKg + boosterMassKg + probeWetMassKg;
  const totalThrustKn = rocket.thrustKn + boosterBonusKn;
  const twr = (totalThrustKn * 1000) / (totalLaunchpadMassKg * G0);

  // 4. Spacecraft & Staging Delta-V Calculation (Tsiolkovsky Rocket Equation)
  // Launcher Upper Stage Injection Capability based on vehicle class and payload ratio
  let launcherBaseInjection = 1800; // m/s for light lifter
  if (rocket.id === 'medium') launcherBaseInjection = 3600;
  else if (rocket.id === 'heavy') launcherBaseInjection = 4700;
  else if (rocket.id === 'super_heavy') launcherBaseInjection = 6000;

  // Payload mass discount factor
  const payloadRatio = Math.min(1.2, probeWetMassKg / Math.max(1, rocket.maxPayload));
  const launcherEffectiveDeltaV = Math.max(800, Math.round(launcherBaseInjection * (1 - payloadRatio * 0.45) + upperIspBonus * 12));

  // Spacecraft Onboard Propulsion Stage Delta-V: Δv = Isp * g0 * ln(m0 / mf)
  let probeStageDeltaV = 0;
  if (fuelMassKg > 0 && highestIsp > 0) {
    probeStageDeltaV = Math.round(highestIsp * G0 * Math.log(probeWetMassKg / probeDryMassKg));
  }

  // Total Mission Delta-V available for orbital maneuvers, trans-injection, and landing
  const calculatedDeltaV = launcherEffectiveDeltaV + probeStageDeltaV;

  // 5. Environmental & Power Calculation based on Target Astronomical Distance (1/r²)
  // Solar irradiance diminishes with inverse square of distance from the Sun
  const solarIrradianceFactor = objective.solarFactor || 1.0;
  const effectiveSolarPowerW = Math.round(totalSolarPowerW * solarIrradianceFactor);
  const totalPowerGenW = effectiveSolarPowerW + constantPowerGenW;
  const netPowerW = totalPowerGenW - powerConsumptionW;

  // Battery autonomy in shadow/eclipse (hours):
  // How long the craft can survive if solar is cut off (using batteries + RTG)
  const eclipsePowerDraw = Math.max(0, powerConsumptionW - constantPowerGenW);
  const batteryEnduranceHours = eclipsePowerDraw > 0
    ? (batteryCapacityWh / eclipsePowerDraw).toFixed(1)
    : 'Unlimited (RTG Powered)';

  // 6. Deep Space Network Communication & Signal Latency
  // Time = distance / c
  const signalOneWayDelaySec = objective.distanceKm / SPEED_OF_LIGHT;
  const latencyDisplay = formatLatency(signalOneWayDelaySec);

  // Communication Link Margin (dB)
  // Based on antenna rating vs mission distance
  let linkMarginDb = 0;
  if (objective.id === 'satellite') {
    linkMarginDb = commRating > 0 ? (commRating >= 40 ? 28 : 12) : -15;
  } else if (objective.id === 'moon') {
    linkMarginDb = commRating >= 100 ? 18 : commRating >= 40 ? 6 : -8;
  } else if (objective.id === 'mars') {
    linkMarginDb = commRating >= 200 ? 12 : commRating >= 100 ? 2 : -22;
  } else if (objective.id === 'asteroid') {
    linkMarginDb = commRating >= 200 ? 9 : commRating >= 100 ? -4 : -35;
  }

  // 7. Consumables / Oxygen & Thermal Health Index (0-100%)
  let healthIndex = 100;
  if (netPowerW < 0) healthIndex -= 30;
  if (protectionRating < 50 && (objective.id === 'mars' || objective.id === 'moon')) healthIndex -= 20;
  if (navRating < 50) healthIndex -= 15;
  if (commRating < 40) healthIndex -= 15;
  healthIndex = Math.max(10, Math.min(100, healthIndex));

  return {
    objective,
    rocket,
    probeDryMassKg,
    fuelMassKg,
    probeWetMassKg,
    maxPayloadKg: rocket.maxPayload,
    payloadMarginKg: rocket.maxPayload - probeWetMassKg,
    totalCostM,
    budgetRemainingM: objective.maxBudget - totalCostM,
    totalThrustKn,
    totalLaunchpadMassKg,
    twr: Number(twr.toFixed(2)),
    calculatedDeltaV,
    deltaVRequired: objective.deltaVRequired,
    deltaVMargin: calculatedDeltaV - objective.deltaVRequired,
    effectiveSolarPowerW,
    constantPowerGenW,
    totalPowerGenW,
    powerConsumptionW,
    netPowerW,
    batteryCapacityWh,
    batteryEnduranceHours,
    solarIrradianceFactor,
    commRating,
    linkMarginDb,
    signalOneWayDelaySec,
    latencyDisplay,
    sciencePoints,
    scienceTarget: objective.scienceTarget,
    navRating,
    protectionRating,
    healthIndex
  };
}

/**
 * Validates design feasibility and generates specific engineering warnings and errors
 */
export function validateMissionDesign(metrics) {
  const errors = [];
  const warnings = [];

  // 1. Payload Mass vs Launcher Limit
  if (metrics.probeWetMassKg > metrics.maxPayloadKg) {
    errors.push(
      `CRITICAL OVERMASS: Spacecraft wet mass (${metrics.probeWetMassKg} kg) exceeds ${metrics.rocket.name} capacity (${metrics.maxPayloadKg} kg) by ${metrics.probeWetMassKg - metrics.maxPayloadKg} kg.`
    );
  }

  // 2. Thrust to Weight Ratio on Pad
  if (metrics.twr < 1.15) {
    errors.push(
      `INSUFFICIENT TWR: Launchpad Thrust-to-Weight ratio is ${metrics.twr} (< 1.15). The rocket will fail to lift off Earth's gravity pad!`
    );
  } else if (metrics.twr < 1.25) {
    warnings.push(
      `LOW TWR MARGIN: Launchpad TWR is ${metrics.twr}. Heavy gravity drag losses will occur during initial ascent.`
    );
  }

  // 3. Delta-V Burn Budget
  if (metrics.deltaVMargin < 0) {
    errors.push(
      `INSUFFICIENT DELTA-V: Craft has ${metrics.calculatedDeltaV} m/s, but ${metrics.objective.name} requires ${metrics.deltaVRequired} m/s (Deficit: ${Math.abs(metrics.deltaVMargin)} m/s). Craft will run out of fuel before target capture!`
    );
  } else if (metrics.deltaVMargin < 250) {
    warnings.push(
      `TIGHT DELTA-V MARGIN: Reserve fuel is only ${metrics.deltaVMargin} m/s. An in-flight trajectory anomaly could deplete fuel reserves.`
    );
  }

  // 4. Budget Constraint
  if (metrics.budgetRemainingM < 0) {
    errors.push(
      `BUDGET OVERRUN: Total mission expenditure is $${metrics.totalCostM}M, exceeding agency budget limit of $${metrics.objective.maxBudget}M by $${Math.abs(metrics.budgetRemainingM)}M.`
    );
  } else if (metrics.budgetRemainingM < 10) {
    warnings.push(`TIGHT BUDGET: Only $${metrics.budgetRemainingM}M contingency remaining.`);
  }

  // 5. Electrical Power Balance & Eclipse
  if (metrics.netPowerW < 0) {
    errors.push(
      `CRITICAL POWER DEFICIT: Continuous draw (${metrics.powerConsumptionW}W) exceeds power generation (${metrics.totalPowerGenW}W) by ${Math.abs(metrics.netPowerW)}W. Spacecraft batteries will permanently discharge in transit!`
    );
  } else if (metrics.netPowerW < 30) {
    warnings.push(
      `LOW POWER MARGIN: Only ${metrics.netPowerW}W surplus. Simultaneous instrument activation may trip circuit breakers.`
    );
  }

  // Deep space solar attenuation warning (Mars / Asteroid)
  if (metrics.objective.solarFactor < 0.5 && metrics.constantPowerGenW === 0) {
    warnings.push(
      `SOLAR ATTENUATION ALERT: Sunlight is ${Math.round(metrics.objective.solarFactor * 100)}% of Earth levels at ${metrics.objective.targetBody}. An RTG Nuclear unit is strongly recommended for deep space.`
    );
  }

  // 6. Deep Space Network Communication
  if (metrics.commRating === 0) {
    errors.push('NO ANTENNA: Spacecraft has no communication system. Unable to downlink telemetry or receive flight commands!');
  } else if (metrics.linkMarginDb < 0) {
    errors.push(
      `COMMUNICATION BLACKOUT: Selected antenna cannot maintain RF link over ${metrics.objective.distanceDisplay} (Link margin ${metrics.linkMarginDb} dB). Equip a higher gain dish!`
    );
  } else if (metrics.linkMarginDb < 6) {
    warnings.push(
      `WEAK RF LINK: Signal margin is only ${metrics.linkMarginDb} dB. Data rates will be throttled during solar storms.`
    );
  }

  // 7. Mission-Specific Equipment Requirements
  if (metrics.objective.id === 'mars' && metrics.protectionRating < 50) {
    errors.push('NO HEAT SHIELD: Mars atmospheric entry interface requires a PICA-X Thermal Heat Shield to prevent spacecraft incineration.');
  }

  if (metrics.sciencePoints < metrics.scienceTarget) {
    warnings.push(
      `SCIENCE GOAL DEFICIT: Installed instruments provide ${metrics.sciencePoints} science pts (Mission target is ${metrics.scienceTarget} pts).`
    );
  }

  if (metrics.navRating === 0) {
    warnings.push('NO AVIONICS: Lacking Star Tracker or Reaction Wheels will increase propellant consumption for manual attitude stabilization.');
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0,
    canLaunch: errors.length === 0
  };
}

/**
 * Format speed of light latency into human-readable string
 */
function formatLatency(seconds) {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)} ms`;
  }
  if (seconds < 60) {
    return `${seconds.toFixed(2)} sec`;
  }
  const mins = Math.floor(seconds / 60);
  const remSec = Math.round(seconds % 60);
  return `${mins}m ${remSec}s`;
}

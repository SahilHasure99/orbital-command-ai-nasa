// Bridge simulator that links to physics engine
import { calculateSpacecraftMetrics, validateMissionDesign } from './physics.js';

export const calculateMetrics = (design) => {
  const pMetrics = calculateSpacecraftMetrics(design);
  return {
    ...pMetrics,
    mass: pMetrics.probeWetMassKg,
    cost: pMetrics.totalCostM,
    power: pMetrics.netPowerW,
    science: pMetrics.sciencePoints,
    communication: pMetrics.commRating,
    protection: pMetrics.protectionRating,
    rocket: pMetrics.rocket
  };
};

export const validateDesign = (metrics, _design) => {
  // If metrics has pMetrics fields, validate directly
  const validated = validateMissionDesign(metrics);
  return {
    ...validated,
    errors: validated.errors,
    warnings: validated.warnings,
    isValid: validated.isValid
  };
};

export const simulateLaunch = (metrics, design, eventBonus = 0) => {
  const validation = validateDesign(metrics, design);
  if (!validation.isValid) {
    return {
      status: 'FAILED',
      score: 0,
      finalScience: metrics.science || 0,
      message: 'Design failed pre-launch engineering validation',
      details: validation.errors
    };
  }

  const finalScience = Math.max(0, (metrics.science || metrics.sciencePoints || 0) + eventBonus);
  let score = 0;
  score += finalScience * 1.5;
  score += Math.max(0, metrics.deltaVMargin || 0) * 0.05;
  score += Math.max(0, metrics.budgetRemainingM || 0) * 0.8;
  score += metrics.power >= 0 ? 15 : 0;

  const reliability = metrics.rocket?.reliability || 0.95;
  const luck = Math.random();

  let status = 'SUCCESS';
  if (luck > reliability + 0.08) {
    status = 'PARTIAL';
    score *= 0.7;
  } else if (score >= 80) {
    status = 'SUCCESS';
  } else if (score >= 45) {
    status = 'PARTIAL';
  } else {
    status = 'FAILED';
  }

  return {
    status,
    score: Math.round(score),
    finalScience,
    fuelExpendedKg: Math.round(metrics.fuelMassKg * 0.85),
    details: validation.warnings
  };
};

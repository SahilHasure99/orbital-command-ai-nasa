// Comprehensive Test Suite for MISSIONVERSE
import { objectives } from './src/data/objectives.js';
import { rockets, rocketConfigurations } from './src/data/rockets.js';
import { components } from './src/data/spacecraft.js';
import { calculateSpacecraftMetrics, validateMissionDesign } from './src/engine/physics.js';
import { CRISIS_EVENTS } from './src/engine/randomEvents.js';
import { fetchNasaAPOD, fetchNasaAsteroids } from './src/services/nasaService.js';

console.log('====================================================');
console.log('MISSIONVERSE SIMULATOR VERIFICATION SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}`);
  }
}

// 1. Mission Objectives Validation (Module 2)
console.log('--- 1. Testing Mission Profiles (Module 2) ---');
assert(objectives.length === 4, 'Four distinct space missions defined');
const missionIds = objectives.map(o => o.id);
assert(missionIds.includes('moon'), 'Moon Exploration mission present');
assert(missionIds.includes('mars'), 'Mars Exploration mission present');
assert(missionIds.includes('satellite'), 'Satellite Deployment mission present');
assert(missionIds.includes('asteroid'), 'Asteroid Exploration mission present');

objectives.forEach(obj => {
  assert(obj.distanceKm > 0, `${obj.name}: Valid astronomical distance (${obj.distanceKm} km)`);
  assert(obj.deltaVRequired > 0, `${obj.name}: Target Delta-V specified (${obj.deltaVRequired} m/s)`);
  assert(obj.maxBudget > 0, `${obj.name}: Mission budget ceiling specified ($${obj.maxBudget}M)`);
  assert(obj.solarFactor > 0 && obj.solarFactor <= 1.0, `${obj.name}: Realistic solar irradiance factor (${obj.solarFactor})`);
  assert(obj.nasaMissionContext?.realMission, `${obj.name}: Authentic NASA mission reference (${obj.nasaMissionContext.realMission})`);
});

// 2. Rockets & Physics Staging (Module 3)
console.log('\n--- 2. Testing Launch Vehicles & Staging (Module 3) ---');
assert(rockets.length === 4, 'Four launch vehicles defined');
rockets.forEach(rkt => {
  assert(rkt.maxPayload > 0, `${rkt.name}: Max payload capacity > 0 (${rkt.maxPayload} kg)`);
  assert(rkt.thrustKn > 0, `${rkt.name}: Thrust specified (${rkt.thrustKn} kN)`);
  assert(rkt.ispVacuum >= 300, `${rkt.name}: Vacuum ISP realistic (${rkt.ispVacuum}s)`);
});

assert(rocketConfigurations.boosterOptions.length >= 3, 'Booster staging options available');
assert(rocketConfigurations.fairingOptions.length >= 2, 'Fairing options available');
assert(rocketConfigurations.upperStageOptions.length >= 2, 'Upper stage options available');

// 3. Spacecraft Subsystems Catalog (Module 4)
console.log('\n--- 3. Testing 6 Spacecraft Subsystems (Module 4) ---');
const compList = Object.values(components);
const categories = [...new Set(compList.map(c => c.category))];
assert(categories.includes('propulsion'), 'Subsystem 1: Fuel Tank & Propulsion present');
assert(categories.includes('solar'), 'Subsystem 2: Solar Panels present');
assert(categories.includes('battery'), 'Subsystem 3: Batteries & Energy Storage present');
assert(categories.includes('communication'), 'Subsystem 4: Communication Systems present');
assert(categories.includes('science'), 'Subsystem 5: Scientific Instruments present');
assert(categories.includes('navigation'), 'Subsystem 6: Navigation & Guidance present');

// 4. Resource Management & Physics Equations (Module 5)
console.log('\n--- 4. Testing Resource Simulation & Physics Engine (Module 5) ---');

// Test Lunar Mission Design
const lunarDesign = {
  objectiveId: 'moon',
  rocketId: 'medium',
  rocketConfig: { boosterId: 'standard', fairingId: 'fairing_std', upperStageId: 'upper_std' },
  componentIds: ['prop_biprop', 'solar_deployable_wings', 'battery_li_ion', 'comm_x_band_dish', 'inst_multispectral_cam', 'nav_star_tracker']
};
const lunarMetrics = calculateSpacecraftMetrics(lunarDesign);
const lunarValidation = validateMissionDesign(lunarMetrics);

assert(lunarMetrics.twr > 1.15, `Lunar Launchpad TWR is nominal: ${lunarMetrics.twr} (> 1.15)`);
assert(lunarMetrics.calculatedDeltaV >= 3900, `Lunar Delta-V satisfies requirement: ${lunarMetrics.calculatedDeltaV} m/s (>= 3900 m/s)`);
assert(lunarMetrics.netPowerW > 0, `Power balance positive: +${lunarMetrics.netPowerW}W surplus`);
assert(lunarMetrics.budgetRemainingM >= 0, `Within budget: $${lunarMetrics.totalCostM}M <= $180M (Margin: +$${lunarMetrics.budgetRemainingM}M)`);
assert(lunarValidation.isValid === true, 'Lunar mission design passes engineering validation');

// Test Mars Mission Design with Heat Shield
const marsDesign = {
  objectiveId: 'mars',
  rocketId: 'heavy',
  rocketConfig: { boosterId: 'standard', fairingId: 'fairing_std', upperStageId: 'upper_vac' },
  componentIds: ['prop_biprop', 'solar_ultraflex', 'battery_solid_state', 'comm_ka_deep_space', 'inst_multispectral_cam', 'inst_sample_drill', 'protect_heat_shield', 'nav_terrain_lidar']
};
const marsMetrics = calculateSpacecraftMetrics(marsDesign);
const marsValidation = validateMissionDesign(marsMetrics);

assert(marsMetrics.solarIrradianceFactor === 0.43, 'Mars solar attenuation calculated accurately: 43% of 1 AU');
assert(marsMetrics.protectionRating >= 50, 'Mars Heat Shield equipped for atmospheric entry');
assert(marsMetrics.calculatedDeltaV >= 4600, `Mars Delta-V satisfies requirement: ${marsMetrics.calculatedDeltaV} m/s`);
assert(marsValidation.isValid === true, 'Mars mission design passes engineering validation');

// Test Deep Asteroid Mission with Hall-Effect Ion Engine
const asteroidDesign = {
  objectiveId: 'asteroid',
  rocketId: 'super_heavy',
  rocketConfig: { boosterId: 'standard', fairingId: 'fairing_deep', upperStageId: 'upper_vac' },
  componentIds: ['prop_ion_hall', 'power_rtg', 'solar_ultraflex', 'battery_solid_state', 'comm_ka_deep_space', 'inst_laser_lidar', 'inst_xray_spectrometer', 'nav_star_tracker']
};
const astMetrics = calculateSpacecraftMetrics(asteroidDesign);
const astValidation = validateMissionDesign(astMetrics);

assert(astMetrics.solarIrradianceFactor === 0.16, 'Asteroid solar attenuation calculated accurately: 16% of 1 AU');
assert(astMetrics.constantPowerGenW >= 380, 'RTG nuclear generator provides 380W continuous power in deep space');
assert(astMetrics.calculatedDeltaV >= 5200, `Ion Engine Delta-V satisfies requirement: ${astMetrics.calculatedDeltaV} m/s (>= 5200 m/s)`);
assert(astValidation.isValid === true, 'Asteroid mission design passes engineering validation');

// Test Over-mass / Under-powered negative validation
const failingDesign = {
  objectiveId: 'mars',
  rocketId: 'light', // Light rocket cannot carry heavy probe to Mars!
  rocketConfig: {},
  componentIds: ['prop_biprop', 'inst_sample_drill', 'inst_ground_radar'] // Missing power, comms, heat shield
};
const failMetrics = calculateSpacecraftMetrics(failingDesign);
const failValidation = validateMissionDesign(failMetrics);
assert(failValidation.isValid === false, 'Invalid design properly rejected');
assert(failValidation.errors.length >= 3, `Proper engineering errors raised (${failValidation.errors.length} errors)`);

// 5. Random Crisis & Anomaly Decision Trees (Module 7)
console.log('\n--- 5. Testing Random Challenges (Module 7) ---');
assert(CRISIS_EVENTS.length >= 5, `At least 5 random crisis events defined (${CRISIS_EVENTS.length} events)`);
const crisisIds = CRISIS_EVENTS.map(c => c.id);
assert(crisisIds.includes('engine_failure'), 'Crisis: Engine Failure implemented');
assert(crisisIds.includes('fuel_leakage'), 'Crisis: Fuel Leakage implemented');
assert(crisisIds.includes('comm_failure'), 'Crisis: Communication Failure implemented');
assert(crisisIds.includes('solar_panel_damage'), 'Crisis: Solar Panel Damage implemented');
assert(crisisIds.includes('asteroid_collision_risk'), 'Crisis: Asteroid Collision Risk implemented');

CRISIS_EVENTS.forEach(ev => {
  assert(ev.options.length >= 3, `${ev.title}: Has 3 distinct resolution options`);
});

// 6. NASA Open APIs & Fallback Resilience
console.log('\n--- 6. Testing NASA Open APIs Integration ---');
Promise.all([fetchNasaAPOD(), fetchNasaAsteroids()]).then(([apod, neo]) => {
  assert(apod && apod.title, `NASA APOD returned valid title: "${apod.title}"`);
  assert(apod.isRealNasaData === true, 'NASA APOD correctly tagged as Real NASA Data');
  assert(neo && neo.asteroids && neo.asteroids.length > 0, `NASA NeoWs returned ${neo.asteroids.length} tracked asteroids`);
  neo.asteroids.forEach(a => {
    assert(a.name && a.miss_distance_km > 0, `Asteroid ${a.name}: Distance ${a.miss_distance_km} km`);
  });

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log('🌟 ALL MISSIONVERSE TESTS PASSED NOMINALLY!');
  } else {
    console.error(`⚠️ ${totalTests - passedTests} TESTS FAILED!`);
    process.exit(1);
  }
  console.log('====================================================');
});

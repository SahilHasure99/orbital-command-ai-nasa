// MISSIONVERSE Dynamic Resource Management HUD
// Tracks the 6 required systems dynamically: Budget, Fuel, Mass, Power, Communication, Oxygen/Thermal Health

import { useState } from 'react';
import { playClick } from '../utils/sounds';

export default function ResourceHUD({ metrics, compact = false, onShowDetails }) {
  const [expanded, setExpanded] = useState(!compact);

  // Budget calculations
  const budgetRatio = Math.min(100, (metrics.totalCostM / metrics.objective.maxBudget) * 100);
  const budgetSafe = metrics.budgetRemainingM >= 0;

  // Mass calculations
  const massRatio = Math.min(100, (metrics.probeWetMassKg / metrics.maxPayloadKg) * 100);
  const massSafe = metrics.payloadMarginKg >= 0;

  // Power calculations
  const powerSafe = metrics.netPowerW >= 0;
  const powerRatio = Math.min(
    100,
    (metrics.powerConsumptionW / Math.max(1, metrics.totalPowerGenW)) * 100
  );

  // Delta-V calculations
  const deltaVRatio = Math.min(100, (metrics.calculatedDeltaV / metrics.deltaVRequired) * 100);
  const deltaVSafe = metrics.deltaVMargin >= 0;

  // Communication Link
  const commSafe = metrics.linkMarginDb >= 0;

  // Consumables / Oxygen & Thermal Health
  const healthSafe = metrics.healthIndex >= 70;

  return (
    <div className="w-full bg-black/60 backdrop-blur-md border border-white/15 rounded-3xl p-4 shadow-2xl transition-all">
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎛️</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-widest uppercase">
                TELEMETRY & RESOURCE MANAGEMENT
              </span>
              <span
                className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold ${
                  budgetSafe && massSafe && powerSafe && deltaVSafe && commSafe
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {budgetSafe && massSafe && powerSafe && deltaVSafe && commSafe ? 'ALL NOMINAL' : 'LIMIT WARNINGS'}
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono">
              Target: <strong className="text-space-accent">{metrics.objective.name}</strong> ({metrics.objective.distanceDisplay})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {compact && (
            <button
              onClick={() => {
                playClick();
                setExpanded(!expanded);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 border border-white/15 font-mono"
            >
              {expanded ? '▲ MINIMIZE' : '▼ EXPAND'}
            </button>
          )}
        </div>
      </div>

      {/* Primary 6 Dynamic Resource Channels */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. BUDGET */}
        <div className={`p-3 rounded-2xl border transition-all ${
          budgetSafe ? 'bg-white/5 border-white/10' : 'bg-red-950/40 border-red-500/50'
        }`}>
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-gray-400 font-bold">1. BUDGET</span>
            <span className={budgetSafe ? 'text-amber-400 font-bold' : 'text-red-400 font-bold'}>
              ${metrics.totalCostM}M / ${metrics.objective.maxBudget}M
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-300 ${budgetSafe ? 'bg-amber-400' : 'bg-red-500'}`}
              style={{ width: `${budgetRatio}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-gray-400 flex justify-between">
            <span>Remaining:</span>
            <span className={budgetSafe ? 'text-green-400' : 'text-red-400'}>
              {metrics.budgetRemainingM >= 0 ? `+$${metrics.budgetRemainingM}M` : `-$${Math.abs(metrics.budgetRemainingM)}M`}
            </span>
          </div>
        </div>

        {/* 2. FUEL & DELTA-V */}
        <div className={`p-3 rounded-2xl border transition-all ${
          deltaVSafe ? 'bg-white/5 border-white/10' : 'bg-red-950/40 border-red-500/50'
        }`}>
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-gray-400 font-bold">2. FUEL (Δv)</span>
            <span className={deltaVSafe ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
              {metrics.calculatedDeltaV} m/s
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-300 ${deltaVSafe ? 'bg-green-400' : 'bg-red-500'}`}
              style={{ width: `${deltaVRatio}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-gray-400 flex justify-between">
            <span>Goal: {metrics.deltaVRequired} m/s</span>
            <span className={deltaVSafe ? 'text-green-400' : 'text-red-400'}>
              {metrics.deltaVMargin >= 0 ? `+${metrics.deltaVMargin} m/s` : `${metrics.deltaVMargin} m/s`}
            </span>
          </div>
        </div>

        {/* 3. MASS VS PAYLOAD */}
        <div className={`p-3 rounded-2xl border transition-all ${
          massSafe ? 'bg-white/5 border-white/10' : 'bg-red-950/40 border-red-500/50'
        }`}>
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-gray-400 font-bold">3. MASS</span>
            <span className={massSafe ? 'text-space-accent font-bold' : 'text-red-400 font-bold'}>
              {metrics.probeWetMassKg} kg
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-300 ${massSafe ? 'bg-space-accent' : 'bg-red-500'}`}
              style={{ width: `${massRatio}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-gray-400 flex justify-between">
            <span>Max: {metrics.maxPayloadKg} kg</span>
            <span className={massSafe ? 'text-green-400' : 'text-red-400'}>
              {metrics.payloadMarginKg >= 0 ? `${metrics.payloadMarginKg} kg left` : `+${Math.abs(metrics.payloadMarginKg)} kg over`}
            </span>
          </div>
        </div>

        {/* 4. ELECTRICAL POWER BALANCE */}
        <div className={`p-3 rounded-2xl border transition-all ${
          powerSafe ? 'bg-white/5 border-white/10' : 'bg-red-950/40 border-red-500/50'
        }`}>
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-gray-400 font-bold">4. POWER</span>
            <span className={powerSafe ? 'text-yellow-400 font-bold' : 'text-red-400 font-bold'}>
              {metrics.netPowerW >= 0 ? `+${metrics.netPowerW}W` : `${metrics.netPowerW}W`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-300 ${powerSafe ? 'bg-yellow-400' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, Math.max(15, powerRatio))}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-gray-400 flex justify-between">
            <span>Gen: {metrics.totalPowerGenW}W</span>
            <span>Load: {metrics.powerConsumptionW}W</span>
          </div>
        </div>

        {/* 5. COMMUNICATION & LATENCY */}
        <div className={`p-3 rounded-2xl border transition-all ${
          commSafe ? 'bg-white/5 border-white/10' : 'bg-red-950/40 border-red-500/50'
        }`}>
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-gray-400 font-bold">5. COMMS</span>
            <span className={commSafe ? 'text-cyan-400 font-bold' : 'text-red-400 font-bold'}>
              {commSafe ? `${metrics.linkMarginDb} dB SNR` : 'BLACKOUT'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-300 ${commSafe ? 'bg-cyan-400' : 'bg-red-500'}`}
              style={{ width: `${Math.max(10, Math.min(100, (metrics.commRating / 250) * 100))}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-gray-400 flex justify-between">
            <span>Delay: {metrics.latencyDisplay}</span>
            <span className={commSafe ? 'text-green-400' : 'text-red-400'}>
              {commSafe ? 'DSN LOCK' : 'NO LINK'}
            </span>
          </div>
        </div>

        {/* 6. CONSUMABLES / OXYGEN & THERMAL HEALTH */}
        <div className={`p-3 rounded-2xl border transition-all ${
          healthSafe ? 'bg-white/5 border-white/10' : 'bg-amber-950/40 border-amber-500/50'
        }`}>
          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
            <span className="text-gray-400 font-bold">6. HEALTH / O₂</span>
            <span className={healthSafe ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {metrics.healthIndex}% INTEGRITY
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.healthIndex > 75 ? 'bg-emerald-400' : metrics.healthIndex > 45 ? 'bg-amber-400' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.healthIndex}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-gray-400 flex justify-between">
            <span>Thermal: {metrics.protectionRating >= 50 ? 'Shielded' : 'Exposed'}</span>
            <span className="text-emerald-400">Nominal</span>
          </div>
        </div>
      </div>

      {/* Expanded Engineering Insights Drawer */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono text-gray-300">
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
            <div className="text-[10px] text-gray-400 font-bold mb-1">🚀 LAUNCH VEHICLE DYNAMICS</div>
            <div>Pad TWR: <strong className={metrics.twr >= 1.15 ? 'text-green-400' : 'text-red-400'}>{metrics.twr}</strong> (Min 1.15)</div>
            <div>Liftoff Thrust: <strong>{metrics.totalThrustKn.toLocaleString()} kN</strong></div>
            <div>Dry Mass: <strong>{metrics.probeDryMassKg} kg</strong> | Fuel: <strong>{metrics.fuelMassKg} kg</strong></div>
          </div>

          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
            <div className="text-[10px] text-gray-400 font-bold mb-1">☀️ SOLAR & ECLIPSE EQUILIBRIUM</div>
            <div>Solar Irradiance: <strong>{Math.round(metrics.solarIrradianceFactor * 100)}%</strong> at target</div>
            <div>Solar Gen: <strong>{metrics.effectiveSolarPowerW}W</strong> | RTG: <strong>{metrics.constantPowerGenW}W</strong></div>
            <div>Eclipse Autonomy: <strong className="text-space-accent">{metrics.batteryEnduranceHours}</strong></div>
          </div>

          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
            <div className="text-[10px] text-gray-400 font-bold mb-1">🔬 SCIENTIFIC RETURN POTENTIAL</div>
            <div>Payload Instrumentation: <strong>{metrics.sciencePoints} pts</strong></div>
            <div>Target Mission Goal: <strong>{metrics.scienceTarget} pts</strong></div>
            <div>Yield Ratio: <strong className={metrics.sciencePoints >= metrics.scienceTarget ? 'text-green-400' : 'text-amber-400'}>
              {Math.round((metrics.sciencePoints / metrics.scienceTarget) * 100)}%
            </strong></div>
          </div>
        </div>
      )}
    </div>
  );
}

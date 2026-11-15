// MISSIONVERSE Mission Results & Final Debrief Report
// Comprehensive scoring & Chart.js flight telemetry analytics

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { playClick } from '../utils/sounds';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

export default function MissionResults({
  missionData,
  metrics,
  objective,
  rocket,
  onFlyAgain,
  onViewLogs
}) {
  const {
    finalScience = metrics.sciencePoints,
    fuelExpendedKg = Math.round(metrics.fuelMassKg * 0.85),
    crisisResolved = true
  } = missionData || {};

  // Comprehensive Mission Scoring Model
  // Score based on: Budget Efficiency, Fuel Remaining, Power Management, Mission Objectives, Scientific Results
  const scoreBreakdown = useMemo(() => {
    // 1. Budget Efficiency (max 25 pts): Higher score for completing mission under budget
    const budgetSaved = Math.max(0, metrics.budgetRemainingM);
    const budgetScore = Math.min(25, Math.round((budgetSaved / objective.maxBudget) * 45 + 10));

    // 2. Fuel Remaining & Delta-V Margin (max 25 pts)
    const fuelRemainingKg = Math.max(0, metrics.fuelMassKg - fuelExpendedKg);
    const deltaVBonus = Math.max(0, Math.min(25, Math.round((metrics.deltaVMargin / 500) * 15 + 10)));

    // 3. Power Management & System Health (max 20 pts)
    const powerScore = metrics.netPowerW >= 0 ? 20 : Math.max(5, Math.round(20 - Math.abs(metrics.netPowerW) / 10));

    // 4. Scientific Results & Discovery (max 30 pts)
    const scienceRatio = Math.min(1.5, finalScience / (objective.scienceTarget || 1));
    const scienceScore = Math.round(scienceRatio * 30);

    // 5. Objective Completion Base (max 20 pts)
    const objectiveScore = 20;

    const totalScore = budgetScore + deltaVBonus + powerScore + scienceScore + objectiveScore;

    // Grade Assignment
    let grade = 'C';
    let gradeColor = 'text-amber-400';
    let statusText = 'MISSION SUCCESSFUL';

    if (totalScore >= 105) {
      grade = 'S';
      gradeColor = 'text-purple-400';
      statusText = 'LEGENDARY MISSION ARCHITECT';
    } else if (totalScore >= 90) {
      grade = 'A+';
      gradeColor = 'text-green-400';
      statusText = 'OUTSTANDING SUCCESS';
    } else if (totalScore >= 75) {
      grade = 'A';
      gradeColor = 'text-green-300';
      statusText = 'EXEMPLARY FLIGHT';
    } else if (totalScore >= 60) {
      grade = 'B';
      gradeColor = 'text-space-accent';
      statusText = 'PRIMARY OBJECTIVES ACHIEVED';
    } else {
      grade = 'C';
      gradeColor = 'text-amber-400';
      statusText = 'PARTIAL SUCCESS';
    }

    return {
      budgetScore,
      deltaVBonus,
      powerScore,
      scienceScore,
      objectiveScore,
      totalScore,
      grade,
      gradeColor,
      statusText,
      fuelRemainingKg,
      budgetSaved
    };
  }, [metrics, objective, finalScience, fuelExpendedKg]);

  // Chart 1: Trajectory Profile (Altitude & Velocity vs MET)
  const trajectoryChartData = useMemo(() => {
    const labels = ['T-0s Ignition', 'T+60s Max-Q', 'T+180s MECO', 'Orbit Insertion', 'Trans Burn', 'Approach', 'Landing/Deploy'];
    return {
      labels,
      datasets: [
        {
          label: 'Altitude (km)',
          data: [0, 45, 160, 220, 15000, objective.distanceKm * 0.4, objective.distanceKm],
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.15)',
          fill: true,
          tension: 0.35,
          yAxisID: 'y'
        },
        {
          label: 'Velocity (km/s)',
          data: [0, 2.1, 5.8, 7.8, 11.2, 4.2, 0.1],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.3,
          yAxisID: 'y1'
        }
      ]
    };
  }, [objective]);

  const trajectoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#ffffff', font: { family: 'monospace', size: 10 } }
      },
      tooltip: {
        backgroundColor: 'rgba(5, 8, 20, 0.9)',
        titleColor: '#00d4ff',
        bodyFont: { family: 'monospace' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af', font: { family: 'monospace', size: 9 } },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        type: 'linear',
        position: 'left',
        ticks: { color: '#00d4ff', font: { family: 'monospace', size: 9 } },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y1: {
        type: 'linear',
        position: 'right',
        ticks: { color: '#f59e0b', font: { family: 'monospace', size: 9 } },
        grid: { drawOnChartArea: false }
      }
    }
  };

  // Chart 2: Resource Depletion & Power Balance
  const resourceChartData = useMemo(() => {
    const labels = ['Pre-Launch', 'Ascent', 'Orbit', 'Cruise', 'Capture', 'Surface Ops'];
    return {
      labels,
      datasets: [
        {
          label: 'Propellant Mass (kg)',
          data: [
            metrics.fuelMassKg,
            Math.round(metrics.fuelMassKg * 0.75),
            Math.round(metrics.fuelMassKg * 0.65),
            Math.round(metrics.fuelMassKg * 0.35),
            Math.round(metrics.fuelMassKg * 0.2),
            scoreBreakdown.fuelRemainingKg
          ],
          backgroundColor: '#10b981'
        },
        {
          label: 'Net Power Margin (W)',
          data: [
            metrics.netPowerW + 50,
            metrics.netPowerW,
            metrics.netPowerW,
            Math.round(metrics.netPowerW * 0.8),
            metrics.netPowerW,
            metrics.netPowerW
          ],
          backgroundColor: '#f59e0b'
        }
      ]
    };
  }, [metrics, scoreBreakdown]);

  const resourceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#ffffff', font: { family: 'monospace', size: 10 } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af', font: { family: 'monospace', size: 9 } },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        ticks: { color: '#ffffff', font: { family: 'monospace', size: 9 } },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Flight Debrief Header */}
      <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-space-accent/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-space-accent via-green-400 to-space-accent animate-pulse" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <span className="text-5xl p-3 rounded-2xl bg-white/10 border border-white/15">
              {objective.icon}
            </span>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-space-accent/20 border border-space-accent/40 text-space-accent text-[10px] font-mono font-bold tracking-widest uppercase">
                OFFICIAL MISSION FLIGHT DEBRIEF · MET COMPLETED
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                {objective.name} — {scoreBreakdown.statusText}
              </h1>
              <p className="text-xs text-gray-300 font-mono mt-0.5">
                Target: {objective.targetBody} ({objective.distanceDisplay}) · Launcher: {rocket.name}
              </p>
            </div>
          </div>

          {/* Letter Grade Badge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/60 border border-white/20 min-w-[130px]">
            <div className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-widest">
              MISSION GRADE
            </div>
            <div className={`text-5xl font-black ${scoreBreakdown.gradeColor} tracking-tighter my-0.5`}>
              {scoreBreakdown.grade}
            </div>
            <div className="text-xs font-mono font-bold text-white">
              {scoreBreakdown.totalScore} / 120 PTS
            </div>
          </div>
        </div>

        {/* 5-Channel Scoring Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 text-center font-mono text-xs">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 mb-0.5">1. BUDGET EFFICIENCY</div>
            <div className="text-lg font-bold text-amber-400">+{scoreBreakdown.budgetScore} / 25</div>
            <div className="text-[9px] text-gray-400 mt-1">${scoreBreakdown.budgetSaved}M saved</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 mb-0.5">2. FUEL MARGIN</div>
            <div className="text-lg font-bold text-green-400">+{scoreBreakdown.deltaVBonus} / 25</div>
            <div className="text-[9px] text-gray-400 mt-1">{scoreBreakdown.fuelRemainingKg}kg reserve</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 mb-0.5">3. POWER BALANCE</div>
            <div className="text-lg font-bold text-yellow-400">+{scoreBreakdown.powerScore} / 20</div>
            <div className="text-[9px] text-gray-400 mt-1">{metrics.netPowerW}W surplus</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400 mb-0.5">4. SCIENTIFIC YIELD</div>
            <div className="text-lg font-bold text-space-accent">+{scoreBreakdown.scienceScore} / 30</div>
            <div className="text-[9px] text-gray-400 mt-1">{finalScience} science pts</div>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 col-span-2 md:col-span-1">
            <div className="text-[10px] text-gray-400 mb-0.5">5. OBJECTIVE LOCK</div>
            <div className="text-lg font-bold text-purple-400">+{scoreBreakdown.objectiveScore} / 20</div>
            <div className="text-[9px] text-gray-400 mt-1">Touchdown / Orbit</div>
          </div>
        </div>
      </div>

      {/* Interactive Chart.js Flight Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Trajectory Profile */}
        <div className="bg-black/60 border border-white/15 rounded-3xl p-5 backdrop-blur-md shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📈</span>
              <div>
                <h3 className="text-sm font-bold text-white">FLIGHT TRAJECTORY PROFILE</h3>
                <p className="text-[10px] text-gray-400 font-mono">Altitude & Velocity vs Mission Elapsed Time</p>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-space-accent/20 text-space-accent border border-space-accent/30 font-bold">
              CHART.JS LIVE
            </span>
          </div>

          <div className="h-[240px] w-full">
            <Line data={trajectoryChartData} options={trajectoryChartOptions} />
          </div>
        </div>

        {/* Chart 2: Resource Depletion Profile */}
        <div className="bg-black/60 border border-white/15 rounded-3xl p-5 backdrop-blur-md shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <div>
                <h3 className="text-sm font-bold text-white">PROPELLANT & POWER PROFILE</h3>
                <p className="text-[10px] text-gray-400 font-mono">Propellant mass burned vs electrical balance</p>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30 font-bold">
              CHART.JS LIVE
            </span>
          </div>

          <div className="h-[240px] w-full">
            <Bar data={resourceChartData} options={resourceChartOptions} />
          </div>
        </div>
      </div>

      {/* Real NASA Data vs Simulated Mission Values Comparison Card */}
      <div className="bg-white/5 border border-white/15 rounded-3xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛰️</span>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                REAL NASA DATA VS. SIMULATED FLIGHT TELEMETRY
              </h3>
              <p className="text-[10px] text-gray-400">
                Educational comparison of authentic astronomical measurements with simplified simulation models
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-black/50 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-2 text-space-accent font-bold text-[11px]">
              <span>[REAL NASA OPEN DATA]</span>
            </div>
            <div>Reference Program: <strong className="text-white">{objective.nasaMissionContext.realMission}</strong></div>
            <div>Astronomical Target: <strong className="text-white">{objective.nasaMissionContext.targetFeature}</strong></div>
            <div>Surface Gravity: <strong>{objective.surfaceGravity} m/s²</strong></div>
            <div>Solar Irradiance (1/r²): <strong>{Math.round(objective.solarFactor * 100)}% of Earth</strong></div>
            <div>Official Data Source: <span className="text-gray-400">{objective.nasaMissionContext.source}</span></div>
          </div>

          <div className="bg-black/50 p-4 rounded-2xl border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px]">
              <span>[SIMULATED FLIGHT TELEMETRY]</span>
            </div>
            <div>Launcher Configuration: <strong className="text-white">{rocket.name}</strong></div>
            <div>Calculated Delta-V: <strong className="text-green-400">{metrics.calculatedDeltaV} m/s</strong> (Req: {objective.deltaVRequired} m/s)</div>
            <div>Total Mission Expenditure: <strong className="text-amber-400">${metrics.totalCostM}M</strong> (Max: ${objective.maxBudget}M)</div>
            <div>Communication SNR: <strong className="text-cyan-400">{metrics.linkMarginDb} dB</strong> (Delay: {metrics.latencyDisplay})</div>
            <div>Final Scientific Score: <strong className="text-purple-400">{finalScience} pts</strong></div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
        <button
          onClick={() => {
            playClick();
            if (onViewLogs) onViewLogs();
          }}
          className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold border border-white/20 transition-all"
        >
          📜 VIEW MISSION LOGS & CAREER ARCHIVE
        </button>

        <button
          onClick={() => {
            playClick();
            if (onFlyAgain) onFlyAgain();
          }}
          className="px-6 py-3 rounded-2xl bg-space-accent text-black font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-space-accent/40 flex items-center gap-2"
        >
          <span>PLAN NEXT SPACE MISSION</span>
          <span>🚀</span>
        </button>
      </div>
    </div>
  );
}

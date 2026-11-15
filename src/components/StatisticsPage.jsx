// MISSIONVERSE Statistics & Analytics Dashboard (Chart.js)
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getMissions } from '../utils/auth';
import { playClick } from '../utils/sounds';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function StatisticsPage({ onClose }) {
  const missions = useMemo(() => getMissions(), []);

  const stats = useMemo(() => {
    const success = missions.filter((m) => m.status === 'SUCCESS').length;
    const partial = missions.filter((m) => m.status === 'PARTIAL').length;
    const failed = missions.filter((m) => m.status === 'FAILED').length;
    const total = missions.length;

    // Timeline of scores
    const labels = missions.slice(0, 10).reverse().map((_, i) => `Flight #${i + 1}`);
    const scores = missions.slice(0, 10).reverse().map((m) => m.score || 0);

    // Group science by destination
    const destinationScience = { moon: 0, mars: 0, satellite: 0, asteroid: 0 };
    missions.forEach((m) => {
      const dest = m.objective || 'moon';
      destinationScience[dest] = (destinationScience[dest] || 0) + (m.science || 0);
    });

    return {
      total,
      success,
      partial,
      failed,
      successRate: total > 0 ? Math.round((success / total) * 100) : 100,
      labels,
      scores,
      destinationScience
    };
  }, [missions]);

  // Chart 1: Flight Score Progression (Line)
  const scoreLineData = {
    labels: stats.labels.length > 0 ? stats.labels : ['Flight #1', 'Flight #2', 'Flight #3'],
    datasets: [
      {
        label: 'Mission Flight Score',
        data: stats.scores.length > 0 ? stats.scores : [75, 92, 108],
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.15)',
        tension: 0.35,
        fill: true
      }
    ]
  };

  // Chart 2: Success Rate (Doughnut)
  const doughnutData = {
    labels: ['Success', 'Partial', 'Failed'],
    datasets: [
      {
        data: stats.total > 0 ? [stats.success, stats.partial, stats.failed] : [5, 1, 0],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 2,
        borderColor: '#060913'
      }
    ]
  };

  // Chart 3: Destination Science Yield (Bar)
  const barData = {
    labels: ['Moon South Pole', 'Mars Jezero', 'Earth LEO Satellite', '16 Psyche Asteroid'],
    datasets: [
      {
        label: 'Scientific Points Gathered',
        data: [
          stats.destinationScience.moon || 120,
          stats.destinationScience.mars || 180,
          stats.destinationScience.satellite || 85,
          stats.destinationScience.asteroid || 210
        ],
        backgroundColor: ['#a8a8a8', '#c1440e', '#00d4ff', '#8b5cf6']
      }
    ]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#ffffff', font: { family: 'monospace', size: 10 } } }
    },
    scales: {
      x: { ticks: { color: '#9ca3af', font: { family: 'monospace', size: 9 } }, grid: { color: 'rgba(255, 255, 255, 0.08)' } },
      y: { ticks: { color: '#9ca3af', font: { family: 'monospace', size: 9 } }, grid: { color: 'rgba(255, 255, 255, 0.08)' } }
    }
  };

  return (
    <div className="fixed inset-0 z-[85] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-space-accent/40 rounded-3xl p-5 md:p-8 max-w-4xl w-full my-auto shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-space-accent/20 border border-space-accent/40">
              📊
            </span>
            <div>
              <div className="text-[10px] font-mono text-space-accent font-bold uppercase tracking-widest">
                CHART.JS MISSION TELEMETRY ANALYTICS
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
                FLIGHT DIRECTORY STATISTICS
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              if (onClose) onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-center">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400">TOTAL FLIGHTS</div>
            <div className="text-xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400">SUCCESS RATE</div>
            <div className="text-xl font-bold text-green-400 mt-1">{stats.successRate}%</div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400">SUCCESSFUL</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{stats.success}</div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-400">PARTIAL / ANOMALIES</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{stats.partial + stats.failed}</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Chart 1: Score Progression (7 cols) */}
          <div className="md:col-span-7 bg-black/60 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="text-xs font-bold text-white font-mono flex items-center justify-between">
              <span>FLIGHT SCORE PROGRESSION</span>
              <span className="text-[9px] text-space-accent font-bold">[CHART.JS]</span>
            </div>
            <div className="h-[210px] w-full">
              <Line data={scoreLineData} options={commonOptions} />
            </div>
          </div>

          {/* Chart 2: Success Ratio (5 cols) */}
          <div className="md:col-span-5 bg-black/60 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="text-xs font-bold text-white font-mono flex items-center justify-between">
              <span>OUTCOME DISTRIBUTION</span>
              <span className="text-[9px] text-green-400 font-bold">[CHART.JS]</span>
            </div>
            <div className="h-[210px] w-full flex items-center justify-center">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { labels: { color: '#ffffff', font: { family: 'monospace', size: 9 } } } }
                }}
              />
            </div>
          </div>

          {/* Chart 3: Destination Science Yield (12 cols) */}
          <div className="md:col-span-12 bg-black/60 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="text-xs font-bold text-white font-mono flex items-center justify-between">
              <span>SCIENTIFIC DISCOVERY BY DESTINATION</span>
              <span className="text-[9px] text-space-accent font-bold">[CHART.JS]</span>
            </div>
            <div className="h-[200px] w-full">
              <Bar data={barData} options={commonOptions} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-space-accent text-black font-bold text-xs uppercase hover:brightness-110"
          >
            RETURN TO MISSION CONTROL
          </button>
        </div>
      </div>
    </div>
  );
}

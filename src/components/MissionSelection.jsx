// MISSIONVERSE Mission Selection Module
// Displays four distinct space missions with authentic NASA telemetry & constraints

import { objectives } from '../data/objectives';
import { playClick } from '../utils/sounds';

export default function MissionSelection({ selectedId, onSelectMission, onProceedToRocket }) {
  const currentObjective = objectives.find((o) => o.id === selectedId) || objectives[0];

  return (
    <div className="space-y-6">
      {/* Title & Mission Directorate Briefing */}
      <div className="text-center max-w-2xl mx-auto space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-space-accent/20 border border-space-accent/40 text-space-accent text-xs font-mono font-bold tracking-widest">
          <span>NASA EXPLORATION ARCHITECTURE</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          SELECT YOUR TARGET DESTINATION
        </h2>
        <p className="text-xs md:text-sm text-gray-400">
          Choose a mission profile. Each destination presents unique gravitational wells, radiation environments, Delta-V budgets, and scientific discovery targets.
        </p>
      </div>

      {/* 4 Mission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {objectives.map((obj) => {
          const isSelected = obj.id === selectedId;
          return (
            <div
              key={obj.id}
              onClick={() => {
                playClick();
                onSelectMission(obj.id);
              }}
              className={`group relative p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'bg-space-accent/10 border-space-accent shadow-2xl shadow-space-accent/30 scale-[1.01]'
                  : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.07]'
              }`}
            >
              {/* Top Row: Icon + Badge + Code Name */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-white/10 border border-white/15">
                      {obj.icon}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-space-accent/20 border border-space-accent/40 text-space-accent">
                        {obj.badge}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1 group-hover:text-space-accent transition-colors">
                        {obj.name}
                      </h3>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-space-accent text-black font-bold text-xs flex items-center justify-center animate-pulse">
                      ✓
                    </span>
                  )}
                </div>

                <div className="text-xs text-space-accent font-mono mb-2">{obj.tagline}</div>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">{obj.description}</p>

                {/* Real NASA Telemetry Specs */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-black/40 p-3 rounded-2xl border border-white/10 mb-3">
                  <div>
                    <span className="text-gray-400">Target Range:</span>
                    <div className="text-white font-bold">{obj.distanceDisplay}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Surface Gravity:</span>
                    <div className="text-white font-bold">{obj.surfaceGravity} m/s²</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Atmosphere:</span>
                    <div className="text-white font-bold truncate">{obj.atmosphere}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Solar Intensity:</span>
                    <div className="text-yellow-400 font-bold">{Math.round(obj.solarFactor * 100)}% of 1 AU</div>
                  </div>
                </div>

                {/* Delta-V & Budget Barometers */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-[9px] text-gray-400">REQUIRED DELTA-V</div>
                    <div className="text-sm font-bold text-green-400">{obj.deltaVRequired.toLocaleString()} m/s</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-[9px] text-gray-400">MAX BUDGET</div>
                    <div className="text-sm font-bold text-amber-400">${obj.maxBudget}M</div>
                  </div>
                </div>
              </div>

              {/* Bottom Real NASA Mission Reference Badge */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>Ref: <strong className="text-gray-200">{obj.nasaMissionContext.realMission}</strong></span>
                <span className="text-space-accent font-bold">Target Science: {obj.scienceTarget} pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Mission Summary Banner & Action CTA */}
      <div className="bg-gradient-to-r from-space-800 to-black p-5 rounded-3xl border border-space-accent/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-space-accent font-bold tracking-widest uppercase">
            TARGET CONFIRMED FOR LAUNCH PREPARATION
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
            <span>{currentObjective.icon}</span>
            <span>{currentObjective.name} · {currentObjective.codeName}</span>
          </div>
          <div className="text-xs text-gray-300 mt-1 max-w-xl">
            NASA Scientific Goal: {currentObjective.nasaMissionContext.scientificGoal}
          </div>
        </div>

        <button
          onClick={() => {
            playClick();
            if (onProceedToRocket) onProceedToRocket();
          }}
          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-space-accent text-black font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-space-accent/30 flex items-center justify-center gap-2"
        >
          <span>PROCEED TO ROCKET BUILDER</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}

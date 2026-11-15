// MISSIONVERSE Spacecraft Designer Module
// Modular customization across all 6 core subsystems with live 3D Three.js preview

import { useState } from 'react';
import { components, componentCategories } from '../data/spacecraft';
import ThreeSpacecraftViewer from './ThreeSpacecraftViewer';
import { playClick } from '../utils/sounds';

export default function SpacecraftDesigner({
  componentIds = [],
  onToggleComponent,
  metrics,
  validation,
  onProceedToLaunch
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [inspectComponent, setInspectComponent] = useState(null);
  const [hoveredComponentId, setHoveredComponentId] = useState(null);

  const filteredComponents = Object.values(components).filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title & Directive */}
      <div className="text-center max-w-2xl mx-auto space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-space-accent/20 border border-space-accent/40 text-space-accent text-xs font-mono font-bold tracking-widest">
          <span>SPACECRAFT SYSTEMS ENGINEERING & PAYLOAD INTEGRATION</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          SPACECRAFT MODULAR DESIGNER
        </h2>
        <p className="text-xs md:text-sm text-gray-400">
          Equip the 6 core systems: Fuel Tank, Solar Panels, Batteries, Communication, Instruments, and Navigation. Observe live 3D assembly in real time.
        </p>
      </div>

      {/* Top Split: Live 3D Spacecraft Canvas + Rapid Telemetry Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Three.js Interactive Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-black/60 border border-white/15 rounded-3xl p-3 backdrop-blur-md flex flex-col justify-between overflow-hidden shadow-2xl relative min-h-[360px]">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full border border-white/15 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-space-accent animate-ping" />
            <span className="text-[10px] font-mono text-gray-300 font-bold uppercase tracking-wider">
              3D Interactive Model · {componentIds.length} Modules Installed
            </span>
          </div>

          <ThreeSpacecraftViewer
            componentIds={componentIds}
            highlightedComponentId={hoveredComponentId}
            className="w-full h-[320px] md:h-[350px]"
          />
        </div>

        {/* Rapid Systems Integration HUD (5 cols) */}
        <div className="lg:col-span-5 bg-black/60 border border-white/15 rounded-3xl p-4 backdrop-blur-md flex flex-col justify-between shadow-2xl space-y-3">
          <div className="border-b border-white/10 pb-2">
            <div className="text-[10px] font-mono text-space-accent font-bold uppercase tracking-wider">
              SUBSYSTEM TELEMETRY SUMMARY
            </div>
            <div className="text-base font-bold text-white mt-0.5">Integration Specifications</div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Mass */}
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-gray-400">Payload Wet Mass:</span>
                <div className="text-sm font-bold text-white">{metrics.probeWetMassKg} kg / {metrics.maxPayloadKg} kg</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${metrics.payloadMarginKg >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {metrics.payloadMarginKg >= 0 ? `${metrics.payloadMarginKg}kg Margin` : 'OVERWEIGHT'}
              </span>
            </div>

            {/* Delta-V */}
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-gray-400">Calculated Delta-V:</span>
                <div className="text-sm font-bold text-green-400">{metrics.calculatedDeltaV} m/s / {metrics.deltaVRequired} m/s</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${metrics.deltaVMargin >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {metrics.deltaVMargin >= 0 ? `+${metrics.deltaVMargin} m/s` : 'DEFICIT'}
              </span>
            </div>

            {/* Power */}
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-gray-400">Power Generation / Load:</span>
                <div className="text-sm font-bold text-yellow-400">
                  {metrics.totalPowerGenW}W / {metrics.powerConsumptionW}W
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${metrics.netPowerW >= 0 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                {metrics.netPowerW >= 0 ? `+${metrics.netPowerW}W Surplus` : `${metrics.netPowerW}W Deficit`}
              </span>
            </div>

            {/* Science */}
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex justify-between items-center">
              <div>
                <span className="text-gray-400">Scientific Capability:</span>
                <div className="text-sm font-bold text-space-accent">{metrics.sciencePoints} pts / {metrics.scienceTarget} target</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${metrics.sciencePoints >= metrics.scienceTarget ? 'bg-space-accent/20 text-space-accent' : 'bg-amber-500/20 text-amber-300'}`}>
                {metrics.sciencePoints >= metrics.scienceTarget ? 'GOAL MET' : 'LOW YIELD'}
              </span>
            </div>
          </div>

          {/* Validation Warnings/Errors Callout */}
          {validation.errors.length > 0 ? (
            <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-[11px] font-mono text-red-300 space-y-1">
              <div className="font-bold text-red-400">⚠️ LAUNCH FORBIDDEN · {validation.errors.length} CRITICAL DEFECTS:</div>
              {validation.errors.slice(0, 2).map((err, i) => (
                <div key={i} className="truncate">• {err}</div>
              ))}
            </div>
          ) : validation.warnings.length > 0 ? (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-[11px] font-mono text-amber-300 space-y-1">
              <div className="font-bold text-amber-400">⚠️ LAUNCH ADVISORIES ({validation.warnings.length}):</div>
              {validation.warnings.slice(0, 2).map((w, i) => (
                <div key={i} className="truncate">• {w}</div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-green-950/40 border border-green-500/40 text-[11px] font-mono text-green-300">
              ✅ ALL SUBSYSTEMS NOMINAL: Ready for launch simulation!
            </div>
          )}
        </div>
      </div>

      {/* 6 Subsystem Category Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-between border-b border-white/10 pb-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              playClick();
              setActiveCategory('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-space-accent text-black shadow-lg shadow-space-accent/40'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            All Systems ({Object.keys(components).length})
          </button>
          {componentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playClick();
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-space-accent text-black shadow-lg shadow-space-accent/40'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-gray-400">
          Selected: <strong className="text-space-accent">{componentIds.length}</strong> modules
        </div>
      </div>

      {/* Components Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredComponents.map((comp) => {
          const isSelected = componentIds.includes(comp.id);
          return (
            <div
              key={comp.id}
              onClick={() => onToggleComponent(comp.id)}
              onMouseEnter={() => setHoveredComponentId(comp.id)}
              onMouseLeave={() => setHoveredComponentId(null)}
              className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-space-accent/15 border-space-accent shadow-xl shadow-space-accent/25'
                  : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.08]'
              }`}
            >
              <div>
                {/* Header: Icon + Name + Cost */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-white/10 border border-white/10 group-hover:scale-110 transition-transform">
                      {comp.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight group-hover:text-space-accent transition-colors">
                        {comp.name}
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400 capitalize">
                        {comp.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400">${comp.cost}M</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-snug mb-3">{comp.description}</p>
                <div className="text-[10px] font-mono text-space-accent bg-black/40 p-1.5 rounded-lg border border-white/10 mb-3">
                  {comp.techDetail}
                </div>

                {/* Metrics Badges */}
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">
                    Mass: {comp.dryMass + (comp.fuelMass || 0)}kg
                  </span>
                  {comp.power !== undefined && comp.power !== 0 && (
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        comp.power > 0
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}
                    >
                      {comp.power > 0 ? `+${comp.power}W Gen` : `${comp.power}W Draw`}
                    </span>
                  )}
                  {comp.science && (
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                      +{comp.science} Science
                    </span>
                  )}
                  {comp.deltaVContribution && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      +{comp.deltaVContribution} m/s Δv
                    </span>
                  )}
                </div>
              </div>

              {/* Install / Remove Action Indicator */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectComponent(comp);
                  }}
                  className="text-gray-400 hover:text-white underline text-[10px]"
                >
                  Inspect Specs
                </button>
                <span className={`font-bold ${isSelected ? 'text-space-accent' : 'text-gray-400'}`}>
                  {isSelected ? 'INSTALLED ✓' : '+ INSTALL'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Component Detailed Inspection Modal */}
      {inspectComponent && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setInspectComponent(null)}
        >
          <div
            className="bg-gray-900 border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{inspectComponent.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-base">{inspectComponent.name}</h3>
                  <span className="text-xs font-mono text-space-accent capitalize">{inspectComponent.category}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectComponent(null)}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{inspectComponent.description}</p>
            <div className="bg-black/50 p-3 rounded-2xl border border-white/10 text-xs font-mono space-y-1.5">
              <div className="text-[10px] text-gray-400 font-bold uppercase">Engineering Specifications:</div>
              <div>Dry Mass: <strong>{inspectComponent.dryMass} kg</strong></div>
              {inspectComponent.fuelMass > 0 && <div>Propellant Mass: <strong>{inspectComponent.fuelMass} kg</strong></div>}
              <div>Procurement Cost: <strong>${inspectComponent.cost}M</strong></div>
              <div>Electrical Rating: <strong>{inspectComponent.power || 0}W</strong></div>
              <div>Technical Details: <span className="text-space-accent">{inspectComponent.techDetail}</span></div>
            </div>
            <button
              onClick={() => {
                onToggleComponent(inspectComponent.id);
                setInspectComponent(null);
              }}
              className="w-full py-2.5 rounded-xl bg-space-accent text-black font-bold text-xs uppercase hover:brightness-110"
            >
              {componentIds.includes(inspectComponent.id) ? 'Remove From Craft' : 'Install On Spacecraft'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Launch Preparation Banner */}
      <div className="bg-gradient-to-r from-space-800 to-black p-5 rounded-3xl border border-space-accent/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-space-accent font-bold tracking-widest uppercase">
            DESIGN INTEGRATION READY
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
            <span>🚀</span>
            <span>Flight Readiness: {validation.isValid ? 'GO FOR LAUNCH' : 'INCOMPLETE VALIDATION'}</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Total Mass: <strong>{metrics.probeWetMassKg} kg</strong> · Total Budget: <strong>${metrics.totalCostM}M</strong> · Delta-V: <strong>{metrics.calculatedDeltaV} m/s</strong>
          </div>
        </div>

        <button
          onClick={() => {
            playClick();
            if (onProceedToLaunch) onProceedToLaunch();
          }}
          disabled={!validation.isValid}
          className={`w-full md:w-auto px-6 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
            validation.isValid
              ? 'bg-space-accent text-black hover:brightness-110 active:scale-95 shadow-space-accent/30 cursor-pointer'
              : 'bg-gray-800 text-gray-500 border border-white/10 cursor-not-allowed opacity-60'
          }`}
        >
          <span>IGNITION & LAUNCH SIMULATION</span>
          <span>🚀</span>
        </button>
      </div>
    </div>
  );
}

// MISSIONVERSE Rocket Builder & Staging Configurator Module
// Allows players to select launch vehicles and configure staging boosters, fairings, and nozzles

import { rockets, rocketConfigurations } from '../data/rockets';
import ThreeRocketViewer from './ThreeRocketViewer';
import { playClick } from '../utils/sounds';

export default function RocketBuilder({
  selectedRocketId,
  onSelectRocket,
  rocketConfig = {},
  onChangeRocketConfig,
  metrics,
  componentIds = [],
  onProceedToSpacecraft
}) {
  const currentRocket = rockets.find((r) => r.id === selectedRocketId) || rockets[0];
  const payloadCompatible = metrics.payloadMarginKg >= 0;

  const handleBoosterChange = (id) => {
    playClick();
    onChangeRocketConfig({ ...rocketConfig, boosterId: id });
  };

  const handleFairingChange = (id) => {
    playClick();
    onChangeRocketConfig({ ...rocketConfig, fairingId: id });
  };

  const handleUpperStageChange = (id) => {
    playClick();
    onChangeRocketConfig({ ...rocketConfig, upperStageId: id });
  };

  return (
    <div className="space-y-6">
      {/* Title & Staging Directive */}
      <div className="text-center max-w-2xl mx-auto space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-space-accent/20 border border-space-accent/40 text-space-accent text-xs font-mono font-bold tracking-widest">
          <span>PROPULSION & LAUNCH VEHICLE STAGING</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          ROCKET LAUNCHER CONFIGURATOR
        </h2>
        <p className="text-xs md:text-sm text-gray-400">
          Match launch vehicle thrust and delta-V to your mission destination. Ensure launchpad TWR exceeds 1.15 and payload capacity accommodates probe wet mass.
        </p>
      </div>

      {/* Physics Gauge Bar */}
      <div className="bg-black/50 border border-white/15 p-4 rounded-3xl backdrop-blur-md grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
          <div className="text-[10px] text-gray-400">LAUNCHPAD TWR</div>
          <div className={`text-xl font-bold ${metrics.twr >= 1.15 ? 'text-green-400' : 'text-red-400 animate-pulse'}`}>
            {metrics.twr}
          </div>
          <div className="text-[9px] text-gray-400 mt-0.5">
            {metrics.twr >= 1.15 ? 'Nominal Liftoff' : 'Stall: Cannot Lift Off!'}
          </div>
        </div>

        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
          <div className="text-[10px] text-gray-400">LIFTOFF THRUST</div>
          <div className="text-xl font-bold text-space-accent">{metrics.totalThrustKn.toLocaleString()} kN</div>
          <div className="text-[9px] text-gray-400 mt-0.5">Atmospheric thrust</div>
        </div>

        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
          <div className="text-[10px] text-gray-400">PAYLOAD CAPACITY</div>
          <div className={`text-xl font-bold ${metrics.payloadMarginKg >= 0 ? 'text-white' : 'text-red-400'}`}>
            {metrics.maxPayloadKg} kg
          </div>
          <div className="text-[9px] text-gray-400 mt-0.5">
            Craft Wet Mass: {metrics.probeWetMassKg} kg
          </div>
        </div>

        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
          <div className="text-[10px] text-gray-400">STAGE COST</div>
          <div className="text-xl font-bold text-amber-400">${currentRocket.cost}M</div>
          <div className="text-[9px] text-gray-400 mt-0.5">Launcher procurement</div>
        </div>
      </div>

      {/* 3D Launch Vehicle Showcase Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-black/60 border border-white/15 rounded-3xl p-5 backdrop-blur-md shadow-2xl items-center">
        {/* Left: 3D Rocket Model (6 cols) */}
        <div className="lg:col-span-6 bg-black/40 rounded-2xl border border-white/10 p-2 flex flex-col items-center justify-center relative min-h-[380px]">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full border border-white/15 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-space-accent animate-ping" />
            <span className="text-[10px] font-mono text-gray-300 font-bold uppercase tracking-wider">
              3D Staging View · {currentRocket.name}
            </span>
          </div>
          <ThreeRocketViewer
            rocketId={selectedRocketId}
            rocketConfig={rocketConfig}
            componentIds={componentIds}
            className="w-full h-[440px]"
          />
        </div>

        {/* Right: Compatibility Gauge & Vehicle Telemetry (6 cols) */}
        <div className="lg:col-span-6 space-y-4 font-mono">
          <div className="border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-space-accent/20 border border-space-accent/40 text-space-accent uppercase">
                {currentRocket.tier}
              </span>
              <span className="text-[10px] text-gray-400">Class: {currentRocket.realWorldRef}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mt-1">{currentRocket.name}</h3>
            <p className="text-xs text-gray-300 font-sans leading-relaxed mt-1">{currentRocket.description}</p>
          </div>

          {/* Payload Compatibility Barometer */}
          <div className={`p-4 rounded-2xl border ${
            payloadCompatible ? 'bg-green-950/30 border-green-500/40' : 'bg-red-950/40 border-red-500/50'
          }`}>
            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
              <span className="text-gray-300">PAYLOAD CAPACITY UTILIZATION</span>
              <span className={payloadCompatible ? 'text-green-400' : 'text-red-400'}>
                {metrics.probeWetMassKg} kg / {currentRocket.maxPayload} kg
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 ${
                  payloadCompatible ? 'bg-green-400' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (metrics.probeWetMassKg / currentRocket.maxPayload) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] flex justify-between">
              <span className="text-gray-400">Payload Margin:</span>
              <strong className={payloadCompatible ? 'text-green-400' : 'text-red-400'}>
                {payloadCompatible ? `+${metrics.payloadMarginKg} kg reserve capacity` : `⚠️ OVERLOAD: -${Math.abs(metrics.payloadMarginKg)} kg over limit!`}
              </strong>
            </div>
          </div>

          {/* Strengths & Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400">LIFTOFF THRUST</div>
              <div className="text-base font-bold text-space-accent">{currentRocket.thrustKn.toLocaleString()} kN</div>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400">VACUUM ISP</div>
              <div className="text-base font-bold text-green-400">{currentRocket.ispVacuum} seconds</div>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400">FLIGHT RELIABILITY</div>
              <div className="text-base font-bold text-amber-400">{Math.round(currentRocket.reliability * 100)}%</div>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-400">LAUNCH COST</div>
              <div className="text-base font-bold text-white">${currentRocket.cost}M</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Launch Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rockets.map((rkt) => {
          const isSelected = rkt.id === selectedRocketId;
          const payloadOk = rkt.maxPayload >= metrics.probeWetMassKg;
          return (
            <div
              key={rkt.id}
              onClick={() => {
                playClick();
                onSelectRocket(rkt.id);
              }}
              className={`p-4 rounded-3xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-space-accent/15 border-space-accent shadow-2xl shadow-space-accent/30 scale-[1.02]'
                  : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.07]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl p-2 rounded-2xl bg-white/10">{rkt.icon}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 border border-white/20 text-gray-300">
                    {rkt.tier}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base mt-1">{rkt.name}</h3>
                <div className="text-[10px] font-mono text-space-accent mb-2">{rkt.realWorldRef}</div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">{rkt.description}</p>

                <div className="space-y-1 text-[10px] font-mono bg-black/40 p-2.5 rounded-xl border border-white/10 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Payload:</span>
                    <strong className={payloadOk ? 'text-white' : 'text-red-400'}>{rkt.maxPayload} kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Thrust:</span>
                    <strong className="text-white">{rkt.thrustKn.toLocaleString()} kN</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vacuum Isp:</span>
                    <strong className="text-green-400">{rkt.ispVacuum}s</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost:</span>
                    <strong className="text-amber-400">${rkt.cost}M</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                <span className="text-gray-400">Reliability: {Math.round(rkt.reliability * 100)}%</span>
                {isSelected ? (
                  <span className="text-space-accent font-bold">SELECTED ✓</span>
                ) : (
                  <span className="text-gray-400 hover:text-white">SELECT</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Staging Accessories & Upgrades */}
      <div className="bg-white/5 border border-white/15 rounded-3xl p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <div>
              <h3 className="text-sm font-bold text-white">OPTIONAL STAGING ACCESSORIES</h3>
              <p className="text-[10px] text-gray-400">Tune strap-on boosters, payload fairing, and upper stage nozzle expansion</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Boosters */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-gray-300">1. STRAP-ON BOOSTERS</div>
            <div className="space-y-1.5">
              {rocketConfigurations.boosterOptions.map((b) => {
                const active = (rocketConfig.boosterId || 'standard') === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleBoosterChange(b.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all ${
                      active
                        ? 'bg-space-accent/20 border-space-accent text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>{b.name}</span>
                      <span className="text-amber-400">{b.cost > 0 ? `+$${b.cost}M` : 'Free'}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{b.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Payload Fairing */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-gray-300">2. PAYLOAD FAIRING</div>
            <div className="space-y-1.5">
              {rocketConfigurations.fairingOptions.map((f) => {
                const active = (rocketConfig.fairingId || 'fairing_std') === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleFairingChange(f.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all ${
                      active
                        ? 'bg-space-accent/20 border-space-accent text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>{f.name}</span>
                      <span className="text-amber-400">{f.cost > 0 ? `+$${f.cost}M` : 'Free'}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{f.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Upper Stage Optimization */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-gray-300">3. UPPER STAGE NOZZLE</div>
            <div className="space-y-1.5">
              {rocketConfigurations.upperStageOptions.map((u) => {
                const active = (rocketConfig.upperStageId || 'upper_std') === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleUpperStageChange(u.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all ${
                      active
                        ? 'bg-space-accent/20 border-space-accent text-white'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>{u.name}</span>
                      <span className="text-amber-400">{u.cost > 0 ? `+$${u.cost}M` : 'Free'}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{u.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Confirmation Action Banner */}
      <div className="bg-gradient-to-r from-space-800 to-black p-5 rounded-3xl border border-space-accent/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-space-accent font-bold tracking-widest uppercase">
            LAUNCH VEHICLE SELECTED
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
            <span>{currentRocket.icon}</span>
            <span>{currentRocket.name} · {currentRocket.tier}</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Pad TWR: <strong className={metrics.twr >= 1.15 ? 'text-green-400' : 'text-red-400'}>{metrics.twr}</strong> · Max Payload: <strong>{currentRocket.maxPayload} kg</strong>
          </div>
        </div>

        <button
          onClick={() => {
            playClick();
            if (onProceedToSpacecraft) onProceedToSpacecraft();
          }}
          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-space-accent text-black font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-space-accent/30 flex items-center justify-center gap-2"
        >
          <span>PROCEED TO SPACECRAFT DESIGNER</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}

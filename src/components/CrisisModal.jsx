// MISSIONVERSE Emergency Crisis & Anomaly Decision Modal
import { useState, useEffect } from 'react';
import { playEmergencyAlarm, playSuccess, playFailure, playClick } from '../utils/sounds';

export default function CrisisModal({ event, componentIds = [], onResolve }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [countdown, setCountdown] = useState(30);

  // Trigger emergency klaxon on mount
  useEffect(() => {
    playEmergencyAlarm();
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChoose = (opt) => {
    playClick();
    setSelectedOption(opt);

    // Check if required component is present
    const hasRequired = !opt.requiredComponent || componentIds.includes(opt.requiredComponent);
    const failureChance = hasRequired ? opt.riskPercent / 100 : Math.min(0.65, (opt.riskPercent + 45) / 100);
    const roll = Math.random();
    const success = roll > failureChance;

    const res = {
      option: opt,
      success,
      fuelCostKg: opt.fuelCostKg || 0,
      scienceDelta: success ? (opt.scienceDelta || 0) : -30,
      message: success
        ? opt.successMessage
        : `Resolution failed: Anomaly escalated! Emergency backup system intervened with science data loss.`
    };

    setOutcome(res);
    if (success) {
      playSuccess();
    } else {
      playFailure();
    }
  };

  const handleContinue = () => {
    playClick();
    if (onResolve && outcome) {
      onResolve(outcome);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-gray-900 to-black border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl shadow-red-500/30 overflow-hidden">
        {/* Flashing Alert Beacon Banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500 animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-red-500/30 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">{event.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/30 border border-red-500 text-red-400">
                  ⚠️ {event.severity} ANOMALY
                </span>
                <span className="text-[10px] text-gray-400 font-mono">MISSION ELAPSED TIME ALERT</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-wide mt-0.5">{event.title}</h2>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-gray-400 font-mono">DECISION TIMER</div>
            <div className={`text-xl font-mono font-bold ${countdown < 10 ? 'text-red-500 animate-ping' : 'text-amber-400'}`}>
              00:{countdown < 10 ? `0${countdown}` : countdown}
            </div>
          </div>
        </div>

        {/* Anomaly Description */}
        <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-4 mb-4 text-xs md:text-sm text-gray-200 leading-relaxed">
          <div className="text-red-400 font-mono font-bold text-[10px] uppercase mb-1">Telemetry Diagnostics:</div>
          {event.description}
        </div>

        {/* Resolution Options or Outcome */}
        {!outcome ? (
          <div>
            <div className="text-[11px] font-mono text-gray-400 mb-2 font-bold uppercase tracking-wider">
              Select Engineering Countermeasure:
            </div>
            <div className="space-y-2.5">
              {event.options.map((opt) => {
                const hasRequired = !opt.requiredComponent || componentIds.includes(opt.requiredComponent);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleChoose(opt)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-1 ${
                      hasRequired
                        ? 'bg-white/5 border-white/20 hover:border-space-accent hover:bg-space-accent/10 active:scale-[0.99]'
                        : 'bg-white/5 border-amber-500/30 opacity-75 hover:opacity-100 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white group-hover:text-space-accent">
                        {opt.title}
                      </span>
                      <div className="flex items-center gap-2">
                        {opt.fuelCostKg > 0 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            -{opt.fuelCostKg} kg Fuel
                          </span>
                        )}
                        {opt.scienceDelta !== 0 && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              opt.scienceDelta > 0
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {opt.scienceDelta > 0 ? `+${opt.scienceDelta}` : opt.scienceDelta} Science
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-gray-400">
                          Risk: {opt.riskPercent}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{opt.description}</p>
                    {opt.requiredComponent && (
                      <div className="mt-1 text-[10px] font-mono">
                        {hasRequired ? (
                          <span className="text-green-400">✓ Equipped: {opt.requiredComponent.replace(/_/g, ' ')}</span>
                        ) : (
                          <span className="text-amber-400">⚠️ Craft lacks {opt.requiredComponent.replace(/_/g, ' ')} (Higher Risk!)</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div
              className={`p-5 rounded-2xl border ${
                outcome.success
                  ? 'bg-green-950/40 border-green-500/50 text-green-200'
                  : 'bg-red-950/40 border-red-500/50 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2 text-base font-bold mb-1">
                <span>{outcome.success ? '✅ ANOMALY RESOLVED NOMINALLY' : '⚠️ RESOLUTION ENCOUNTERED ANOMALIES'}</span>
              </div>
              <p className="text-sm leading-relaxed">{outcome.message}</p>
              <div className="mt-3 flex items-center gap-3 text-xs font-mono">
                {outcome.fuelCostKg > 0 && <span>Fuel consumed: -{outcome.fuelCostKg} kg</span>}
                {outcome.scienceDelta !== 0 && (
                  <span>
                    Science impact: {outcome.scienceDelta > 0 ? `+${outcome.scienceDelta}` : outcome.scienceDelta} pts
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-2xl bg-space-accent text-black font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-space-accent/40"
            >
              CONTINUE FLIGHT SIMULATION ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

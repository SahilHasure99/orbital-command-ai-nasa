// MISSIONVERSE NASA Open Data Observatory & Planetary Science Hub
// Displays real space data from api.nasa.gov, NeoWs Asteroid tracking, and Mars Rover weather

import { useState, useEffect } from 'react';
import {
  fetchNasaAPOD,
  fetchNasaAsteroids,
  fallbackAPOD,
  fallbackAsteroids,
  realMarsAtmosphericData
} from '../services/nasaService';
import { playClick } from '../utils/sounds';

export default function NasaHub({ onClose, onLaunchFromHub }) {
  const [activeTab, setActiveTab] = useState('apod'); // apod, asteroids, mars
  const [apodData, setApodData] = useState(null);
  const [asteroidList, setAsteroidList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchNasaAPOD(), fetchNasaAsteroids()])
      .then(([apod, neo]) => {
        setApodData(apod);
        setAsteroidList(neo?.asteroids || fallbackAsteroids);
        setIsLoading(false);
      })
      .catch(() => {
        setApodData(fallbackAPOD[0]);
        setAsteroidList(fallbackAsteroids);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="fixed inset-0 z-[85] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-space-accent/50 rounded-3xl p-5 md:p-8 max-w-4xl w-full my-auto shadow-2xl shadow-space-accent/20 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-space-accent/20 border border-space-accent/40">
              🛰️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-500/20 text-green-300 border border-green-500/40">
                  [REAL NASA OPEN DATA]
                </span>
                <span className="text-[10px] text-gray-400 font-mono">api.nasa.gov Telemetry</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
                NASA PLANETARY SCIENCE OBSERVATORY
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

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-white/10 pb-3 font-mono text-xs font-bold">
          <button
            onClick={() => {
              playClick();
              setActiveTab('apod');
            }}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'apod'
                ? 'bg-space-accent text-black shadow-lg shadow-space-accent/40'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            🌌 Astronomy Picture of the Day
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('asteroids');
            }}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'asteroids'
                ? 'bg-space-accent text-black shadow-lg shadow-space-accent/40'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            ☄️ Near-Earth Asteroid Radar (NeoWs)
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('mars');
            }}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'mars'
                ? 'bg-space-accent text-black shadow-lg shadow-space-accent/40'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            🔴 Mars Weather (Perseverance MEDA)
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-16 text-center font-mono text-gray-400 animate-pulse text-sm">
            Downloading live astronomical packets from NASA Deep Space Network...
          </div>
        ) : (
          <div>
            {/* TAB 1: NASA APOD */}
            {activeTab === 'apod' && apodData && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-6 rounded-2xl overflow-hidden border border-white/15 bg-black">
                  <img
                    src={apodData.url}
                    alt={apodData.title}
                    className="w-full h-auto object-cover max-h-[380px]"
                    onError={(e) => {
                      e.target.src = fallbackAPOD[0].url;
                    }}
                  />
                  <div className="p-3 bg-black/70 text-[10px] font-mono text-gray-400 flex justify-between border-t border-white/10">
                    <span>Credit: {apodData.copyright || 'NASA/ESA'}</span>
                    <span>Date: {apodData.date}</span>
                  </div>
                </div>

                <div className="md:col-span-6 space-y-3">
                  <div className="text-[10px] font-mono text-space-accent font-bold uppercase tracking-wider">
                    {apodData.source}
                  </div>
                  <h3 className="text-xl font-bold text-white">{apodData.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed max-h-[220px] overflow-y-auto pr-2">
                    {apodData.explanation}
                  </p>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                    💡 <strong className="text-space-accent">Educational Note:</strong> Space telescopes like Hubble and James Webb use multispectral infrared detectors to penetrate cosmic dust lanes.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ASTEROIDS (NEOWS) */}
            {activeTab === 'asteroids' && (
              <div className="space-y-4">
                <div className="text-xs text-gray-300">
                  Near-Earth Objects (NEOs) tracked in real time by the NASA JPL Center for Near Earth Object Studies (CNEOS).
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {asteroidList.map((ast) => (
                    <div
                      key={ast.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{ast.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ast.is_potentially_hazardous
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-green-500/20 text-green-300 border border-green-500/30'
                          }`}
                        >
                          {ast.is_potentially_hazardous ? '⚠️ HAZARDOUS' : 'NOMINAL FLYBY'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/40 p-2.5 rounded-xl border border-white/10">
                        <div>
                          <span className="text-gray-400">Est. Diameter:</span>
                          <div className="text-amber-400 font-bold">{ast.estimated_diameter_km} km</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Miss Distance:</span>
                          <div className="text-white font-bold">{ast.miss_distance_km.toLocaleString()} km</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Velocity:</span>
                          <div className="text-space-accent font-bold">{ast.relative_velocity_km_h.toLocaleString()} km/h</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Approach Date:</span>
                          <div className="text-white font-bold">{ast.close_approach_date}</div>
                        </div>
                      </div>

                      <p className="text-[10px] text-gray-300 leading-tight italic">
                        {ast.realNasaNotes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MARS WEATHER */}
            {activeTab === 'mars' && (
              <div className="space-y-4 font-mono">
                <div className="flex items-center justify-between bg-red-950/30 p-3 rounded-2xl border border-red-500/30">
                  <div>
                    <div className="text-sm font-bold text-red-300">{realMarsAtmosphericData.station}</div>
                    <div className="text-[10px] text-gray-400">Mission: {realMarsAtmosphericData.source}</div>
                  </div>
                  <span className="text-sm font-bold text-amber-400">SOL {realMarsAtmosphericData.sol}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-gray-400">SURFACE PRESSURE</div>
                    <div className="text-lg font-bold text-white mt-1">{realMarsAtmosphericData.atmosphericPressurePascals} Pa</div>
                    <div className="text-[9px] text-gray-400">~0.7% Earth atmospheric density</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-gray-400">AIR TEMPERATURE</div>
                    <div className="text-lg font-bold text-cyan-400 mt-1">
                      {realMarsAtmosphericData.airTemperatureMinC}°C / {realMarsAtmosphericData.airTemperatureMaxC}°C
                    </div>
                    <div className="text-[9px] text-gray-400">Night chill to daytime high</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-gray-400">WIND VELOCITY</div>
                    <div className="text-lg font-bold text-green-400 mt-1">{realMarsAtmosphericData.windSpeedMps} m/s</div>
                    <div className="text-[9px] text-gray-400">Jezero crater delta breeze</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-gray-400">DUST OPACITY (TAU)</div>
                    <div className="text-lg font-bold text-yellow-400 mt-1">{realMarsAtmosphericData.dustOpticalDepthTau}</div>
                    <div className="text-[9px] text-gray-400">Reduces solar panel output</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-1">
                  <div className="font-bold text-space-accent text-[11px]">NASA Planetary Engineering Application:</div>
                  <p>
                    Because Mars atmospheric pressure is only 712 Pascals (less than 1% of Earth), incoming spacecraft require heavy heat shields for initial supersonic aerobraking followed by supersonic parachutes and skycranes or retro-thrusters to safely decelerate.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-[10px] font-mono text-gray-400">
            Source: NASA Open Data API Platform & Planetary Data System (PDS)
          </div>

          <button
            onClick={() => {
              playClick();
              if (onClose) onClose();
              if (onLaunchFromHub) onLaunchFromHub();
            }}
            className="px-5 py-2.5 rounded-xl bg-space-accent text-black font-extrabold text-xs hover:brightness-110 shadow-lg shadow-space-accent/30"
          >
            LAUNCH MISSION FROM OBSERVATORY ➔
          </button>
        </div>
      </div>
    </div>
  );
}

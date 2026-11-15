// ============================================================================
// ORBITAL COMMAND AI — Interactive 3D Space Mission Control Simulator
// Design. Launch. Survive. Discover.
// ============================================================================

import { useState, useMemo } from 'react';
import Starfield from './components/Starfield';
import MissionControlDashboard from './components/MissionControlDashboard';
import SolarSystemViewer from './components/SolarSystemViewer';
import MissionSelection from './components/MissionSelection';
import RocketBuilder from './components/RocketBuilder';
import SpacecraftDesigner from './components/SpacecraftDesigner';
import ResourceHUD from './components/ResourceHUD';
import ThreeMissionSimulator from './components/ThreeMissionSimulator';
import CinematicLaunch from './components/CinematicLaunch';
import ThreeJourneyAndLanding from './components/ThreeJourneyAndLanding';
import CrisisModal from './components/CrisisModal';
import MissionResults from './components/MissionResults';
import NasaHub from './components/NasaHub';
import StatisticsPage from './components/StatisticsPage';
import MissionHistory from './components/MissionHistory';
import AIAssistant from './components/AIAssistant';
import Leaderboard from './components/Leaderboard';
import AchievementsPage from './components/AchievementsPage';
import AchievementToast from './components/AchievementToast';
import LevelUpToast from './components/LevelUpToast';
import AuthScreen from './components/AuthScreen';

import { getObjective } from './data/objectives';
import { getRocket } from './data/rockets';
import { calculateSpacecraftMetrics, validateMissionDesign } from './engine/physics';
import { pickRandomCrisis } from './engine/randomEvents';
import { achievements } from './data/achievements';
import { calculateLevel, awardXP } from './data/levelSystem';
import {
  getCurrentUser,
  guestLogin,
  saveMission,
  getMissions,
  getUserXP,
  addXP,
  getUserAchievements,
  unlockAchievement
} from './utils/auth';
import {
  playClick,
  playSuccess,
  initAudio,
  startAmbientMusic,
  stopAmbientMusic,
  toggleMute
} from './utils/sounds';

export default function App() {
  const [user, setUser] = useState(() => getCurrentUser() || guestLogin('Commander Nova'));
  const [activeTab, setActiveTab] = useState('home'); // home, solar, mission, rocket, spacecraft, simulator, results
  const [simMode, setSimMode] = useState('cinematic_launch'); // cinematic_launch, space_journey, manual_sim
  const [objectiveId, setObjectiveId] = useState('moon');
  const [rocketId, setRocketId] = useState('heavy');
  const [rocketConfig, setRocketConfig] = useState({
    boosterId: 'standard',
    fairingId: 'fairing_std',
    upperStageId: 'upper_std'
  });
  const [componentIds, setComponentIds] = useState([
    'prop_biprop',
    'solar_deployable_wings',
    'battery_li_ion',
    'comm_x_band_dish',
    'inst_multispectral_cam',
    'nav_star_tracker'
  ]);

  // Modal overlays
  const [showNasaHub, setShowNasaHub] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeCrisis, setActiveCrisis] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Notification Toasts
  const [newAchievement, setNewAchievement] = useState(null);
  const [newLevel, setNewLevel] = useState(null);
  const [userAchievements, setUserAchievements] = useState(() => getUserAchievements());

  // Simulation execution results
  const [missionSimulationData, setMissionSimulationData] = useState(null);

  // Missions & Career stats from LocalStorage
  const [missionsList, setMissionsList] = useState(() => getMissions());

  // Dynamic Physics Calculation
  const design = useMemo(() => ({
    objectiveId,
    rocketId,
    rocketConfig,
    componentIds
  }), [objectiveId, rocketId, rocketConfig, componentIds]);

  const metrics = useMemo(() => calculateSpacecraftMetrics(design), [design]);
  const validation = useMemo(() => validateMissionDesign(metrics), [metrics]);

  const currentObjective = useMemo(() => getObjective(objectiveId), [objectiveId]);
  const currentRocket = useMemo(() => getRocket(rocketId), [rocketId]);

  // Component toggle handler
  const handleToggleComponent = (id) => {
    playClick();
    setComponentIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Launch button clicked -> Start Cinematic Launch Sequence
  const handleLaunchSimulation = () => {
    initAudio();
    playClick();
    if (validation.isValid) {
      setSimMode('cinematic_launch');
      setActiveTab('simulator');
    }
  };

  // Simulation finished (after journey/landing or manual sim)
  const handleSimulationComplete = (simData = {}) => {
    const finalScience = simData.finalScience || metrics.sciencePoints;
    const isSuccess = metrics.healthIndex >= 50;
    const finalScore = Math.round(finalScience * 1.5 + metrics.budgetRemainingM * 0.8);

    const finalData = {
      finalScience,
      fuelExpendedKg: Math.round(metrics.fuelMassKg * 0.85),
      crisisResolved: true
    };
    setMissionSimulationData(finalData);

    // Save to LocalStorage
    saveMission({
      objective: objectiveId,
      rocket: rocketId,
      parts: componentIds,
      science: finalScience,
      cost: metrics.totalCostM,
      status: isSuccess ? 'SUCCESS' : 'PARTIAL',
      score: finalScore
    });

    const updatedMissions = getMissions();
    setMissionsList(updatedMissions);

    // Award XP & Check Level-Up
    const xpEarned = awardXP({ objective: objectiveId, score: finalScore }, isSuccess ? 'SUCCESS' : 'PARTIAL');
    const prevXP = getUserXP();
    const oldLevel = calculateLevel(prevXP);
    const updatedXP = addXP(xpEarned);
    const updatedLevel = calculateLevel(updatedXP);
    if (updatedLevel > oldLevel) {
      setNewLevel(updatedLevel);
    }

    // Check Achievements
    const statsForCheck = {
      totalMissions: updatedMissions.length,
      successfulMissions: updatedMissions.filter((m) => m.status === 'SUCCESS').length,
      visitedPlanets: Array.from(new Set(updatedMissions.map((m) => m.objective || ''))),
      usedRockets: Array.from(new Set(updatedMissions.map((m) => m.rocket || '')))
    };

    achievements.forEach((ach) => {
      if (!userAchievements.includes(ach.id) && ach.condition(statsForCheck)) {
        if (unlockAchievement(ach.id)) {
          setUserAchievements((prev) => [...prev, ach.id]);
          setNewAchievement(ach);
        }
      }
    });

    setActiveTab('results');
  };

  // Career stats summary
  const careerStats = useMemo(() => {
    const total = missionsList.length;
    const successful = missionsList.filter((m) => m.status === 'SUCCESS').length;
    const bestScience = Math.max(0, ...missionsList.map((m) => m.science || 0));
    const bestScore = Math.max(0, ...missionsList.map((m) => m.score || 0));
    return {
      totalMissions: total,
      successfulMissions: successful,
      bestScience,
      bestScore
    };
  }, [missionsList]);

  // Audio Toggles
  const handleToggleMute = () => {
    const muted = toggleMute();
    setIsMuted(muted);
    playClick();
  };

  const handleToggleMusic = () => {
    initAudio();
    playClick();
    if (isMusicPlaying) {
      stopAmbientMusic();
      setIsMusicPlaying(false);
    } else {
      startAmbientMusic();
      setIsMusicPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white flex flex-col relative overflow-x-hidden select-none">
      {/* Dynamic Starfield Background */}
      <Starfield />

      {/* NASA / SpaceX Inspired Command Center Top Navigation Bar */}
      <header className="relative z-30 bg-black/80 backdrop-blur-md border-b border-white/15 px-4 py-2.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Agency Callsign */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClick();
                setActiveTab('home');
              }}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-space-accent/20 border border-space-accent flex items-center justify-center text-xl group-hover:scale-105 transition-transform shadow-lg shadow-space-accent/30">
                🚀
              </div>
              <div>
                <div className="text-sm font-black tracking-wider text-white flex items-center gap-1.5">
                  ORBITAL <span className="text-space-accent">COMMAND</span> AI
                  <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-space-accent/20 border border-space-accent/40 text-space-accent">
                    v2.0
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono tracking-tight">
                  Design. Launch. Survive. Discover.
                </div>
              </div>
            </button>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-mono">
            {[
              { id: 'home', icon: '🛰️', label: 'Dashboard' },
              { id: 'solar', icon: '🪐', label: 'Solar System' },
              { id: 'mission', icon: '🎯', label: '1. Mission' },
              { id: 'rocket', icon: '🚀', label: '2. Rocket' },
              { id: 'spacecraft', icon: '🔧', label: '3. Spacecraft' },
              { id: 'simulator', icon: '🌌', label: '4. Simulation' }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-space-accent text-black shadow-lg shadow-space-accent/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Audio, Tools & Career Controls */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {/* AI Assistant Button */}
            <button
              onClick={() => {
                playClick();
                setShowAI(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all flex items-center gap-1.5 text-[11px] font-bold"
              title="Open AI Flight Director Advisor"
            >
              <span>🤖</span>
              <span className="hidden lg:inline">AI Advisor</span>
            </button>

            {/* NASA Hub Button */}
            <button
              onClick={() => {
                playClick();
                setShowNasaHub(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-300 hover:bg-green-500/25 transition-all flex items-center gap-1.5 text-[11px] font-bold"
              title="Open Real NASA Space Data Hub"
            >
              <span>🛰️</span>
              <span className="hidden md:inline">NASA Data</span>
            </button>

            {/* Statistics Button */}
            <button
              onClick={() => {
                playClick();
                setShowStats(true);
              }}
              className="px-2 py-1.5 rounded-xl bg-white/10 border border-white/15 text-gray-300 hover:bg-white/20 transition-all flex items-center gap-1.5 text-[11px]"
              title="View Chart.js Telemetry Statistics"
            >
              <span>📊</span>
              <span className="hidden md:inline">Stats</span>
            </button>

            {/* Achievements Button */}
            <button
              onClick={() => {
                playClick();
                setShowAchievements(true);
              }}
              className="px-2 py-1.5 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/25 transition-all flex items-center gap-1 text-[11px]"
              title="View Achievements"
            >
              <span>🏆</span>
              <span className="hidden lg:inline">Awards</span>
            </button>

            {/* Leaderboard Button */}
            <button
              onClick={() => {
                playClick();
                setShowLeaderboard(true);
              }}
              className="px-2 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all flex items-center gap-1 text-[11px]"
              title="View Global Leaderboard"
            >
              <span>🥇</span>
              <span className="hidden lg:inline">Rankings</span>
            </button>

            {/* Ambient Sound Drone Toggle */}
            <button
              onClick={handleToggleMusic}
              className={`p-1.5 rounded-xl border text-sm transition-all ${
                isMusicPlaying
                  ? 'bg-space-accent/20 border-space-accent text-space-accent'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
              title="Toggle Synthesized Ambient Space Drone"
            >
              {isMusicPlaying ? '🎵' : '🔇'}
            </button>

            {/* Audio SFX Mute Toggle */}
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-xl border text-sm transition-all ${
                isMuted
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {isMuted ? '🔕' : '🔔'}
            </button>

            {/* Callsign profile & Auth modal opener */}
            <button
              onClick={() => {
                playClick();
                setShowAuth(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-space-accent transition-all cursor-pointer"
              title="Change Callsign / Login"
            >
              <span>👨‍🚀</span>
              <span className="font-bold hidden sm:inline">{user?.username || 'Commander'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Mission Content Area */}
      <main className="relative z-20 flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6">
        {/* Phase 3: Mission Control Dashboard */}
        {activeTab === 'home' && (
          <MissionControlDashboard
            objective={currentObjective}
            rocket={currentRocket}
            metrics={metrics}
            validation={validation}
            onStartMission={() => setActiveTab('mission')}
            onOpenSolarSystem={() => setActiveTab('solar')}
            onOpenSpacecraftBuilder={() => setActiveTab('spacecraft')}
            onOpenNasaHub={() => setShowNasaHub(true)}
            onOpenAI={() => setShowAI(true)}
            onOpenStats={() => setShowStats(true)}
            onOpenHistory={() => setShowHistory(true)}
            careerStats={careerStats}
          />
        )}

        {/* Phase 5: Interactive 3D Solar System Simulator */}
        {activeTab === 'solar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🪐</span>
                  <span>Interactive 3D Solar System Explorer</span>
                </h2>
                <p className="text-xs text-gray-400 font-mono">
                  Full 9-Body Simulation · Click any planet to inspect celestial metrics & NASA missions
                </p>
              </div>

              <button
                onClick={() => setActiveTab('home')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-gray-300 border border-white/20"
              >
                ← Return to Dashboard
              </button>
            </div>

            <div className="h-[650px] w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl relative">
              <SolarSystemViewer
                onSelectTargetMission={(bodyId) => {
                  if (bodyId === 'mars') setObjectiveId('mars');
                  else if (bodyId === 'moon' || bodyId === 'mercury') setObjectiveId('moon');
                  else if (bodyId === 'earth') setObjectiveId('satellite');
                  else setObjectiveId('asteroid');
                  setActiveTab('mission');
                }}
                onClose={() => setActiveTab('home')}
              />
            </div>
          </div>
        )}

        {/* Phase 1 / Mission Selection */}
        {activeTab === 'mission' && (
          <MissionSelection
            selectedId={objectiveId}
            onSelectMission={(id) => setObjectiveId(id)}
            onProceedToRocket={() => setActiveTab('rocket')}
          />
        )}

        {/* Phase 6: Rocket Builder with 3D Rocket Viewer */}
        {activeTab === 'rocket' && (
          <RocketBuilder
            selectedRocketId={rocketId}
            onSelectRocket={(id) => setRocketId(id)}
            rocketConfig={rocketConfig}
            onChangeRocketConfig={setRocketConfig}
            metrics={metrics}
            componentIds={componentIds}
            onProceedToSpacecraft={() => setActiveTab('spacecraft')}
          />
        )}

        {/* Phase 4: Spacecraft Designer with 3D Spacecraft Viewer & Zoom */}
        {activeTab === 'spacecraft' && (
          <div className="space-y-6">
            <SpacecraftDesigner
              componentIds={componentIds}
              onToggleComponent={handleToggleComponent}
              metrics={metrics}
              validation={validation}
              onProceedToLaunch={handleLaunchSimulation}
            />
          </div>
        )}

        {/* Persistent Dynamic Resource Management HUD */}
        {activeTab !== 'home' && activeTab !== 'results' && activeTab !== 'solar' && (
          <div className="mt-4">
            <ResourceHUD metrics={metrics} compact={true} />
          </div>
        )}

        {/* Phase 6 & 7: 3D Flight Simulation Modes */}
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            {/* Simulation Header with Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-black/60 p-3 rounded-2xl border border-white/15">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🌌</span>
                  <span>
                    {simMode === 'cinematic_launch'
                      ? 'Cinematic Rocket Launch Sequence'
                      : simMode === 'space_journey'
                      ? 'Deep Space Cruise & Planetary Exploration'
                      : 'Interactive 6-Phase Spaceflight Simulator'}
                  </span>
                </h2>
                <p className="text-xs text-gray-400 font-mono">
                  Mission Target: <strong>{currentObjective.name}</strong> · Launch Vehicle: <strong>{currentRocket.name}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                {/* Switch between Cinematic vs Step-by-step Manual */}
                <button
                  onClick={() => {
                    playClick();
                    setSimMode((m) => (m === 'manual_sim' ? 'cinematic_launch' : 'manual_sim'));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-space-accent/20 border border-space-accent text-space-accent hover:bg-space-accent/30 transition-all font-bold"
                >
                  {simMode === 'manual_sim' ? '🎬 Watch Cinematic Launch' : '🎛️ Manual 6-Phase Cockpit'}
                </button>

                <button
                  onClick={() => setActiveTab('spacecraft')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 border border-white/20"
                >
                  ← Designer
                </button>
              </div>
            </div>

            {/* Mode 1: Cinematic 10-Second Countdown & Liftoff */}
            {simMode === 'cinematic_launch' && (
              <div className="h-[620px] w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl relative">
                <CinematicLaunch
                  rocket={currentRocket}
                  objective={currentObjective}
                  metrics={metrics}
                  onLaunchComplete={() => {
                    playSuccess();
                    setSimMode('space_journey');
                  }}
                  onAbort={() => setActiveTab('home')}
                />
              </div>
            )}

            {/* Mode 2: Dedicated 3D Space Journey & Mars Landing / Rover Deployment */}
            {simMode === 'space_journey' && (
              <div className="h-[620px] w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl relative">
                <ThreeJourneyAndLanding
                  objective={currentObjective}
                  rocket={currentRocket}
                  metrics={metrics}
                  componentIds={componentIds}
                  onComplete={handleSimulationComplete}
                  onAbort={() => setActiveTab('home')}
                />
              </div>
            )}

            {/* Mode 3: Interactive 6-Phase Multi-Stage Simulator */}
            {simMode === 'manual_sim' && (
              <ThreeMissionSimulator
                objective={currentObjective}
                rocket={currentRocket}
                metrics={metrics}
                componentIds={componentIds}
                onTriggerCrisis={() => {
                  const crisis = pickRandomCrisis(design);
                  setActiveCrisis(crisis);
                }}
                onSimulationComplete={handleSimulationComplete}
                onAbort={() => setActiveTab('home')}
              />
            )}
          </div>
        )}

        {/* Phase 8: Mission Results & Final Debrief Report */}
        {activeTab === 'results' && (
          <MissionResults
            missionData={missionSimulationData}
            metrics={metrics}
            objective={currentObjective}
            rocket={currentRocket}
            onFlyAgain={() => {
              setActiveTab('mission');
            }}
            onViewLogs={() => setShowHistory(true)}
          />
        )}
      </main>

      {/* Random Crisis / In-Flight Anomaly Decision Modal */}
      {activeCrisis && (
        <CrisisModal
          event={activeCrisis}
          componentIds={componentIds}
          onResolve={(_outcome) => {
            setActiveCrisis(null);
          }}
        />
      )}

      {/* AI Flight Director Assistant Modal */}
      {showAI && (
        <AIAssistant
          design={design}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* Real NASA Open Data Hub Modal */}
      {showNasaHub && (
        <NasaHub
          onClose={() => setShowNasaHub(false)}
          onLaunchFromHub={() => {
            setShowNasaHub(false);
            setActiveTab('mission');
          }}
        />
      )}

      {/* Chart.js Statistics Page Modal */}
      {showStats && (
        <StatisticsPage onClose={() => setShowStats(false)} />
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <AchievementsPage
          unlockedIds={userAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard
          currentUser={user}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Flight Logs History Modal */}
      {showHistory && (
        <MissionHistory onClose={() => setShowHistory(false)} />
      )}

      {/* User Auth / Callsign Switch Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <AuthScreen
              onAuth={(loggedInUser) => {
                setUser(loggedInUser);
                setShowAuth(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Notification Toast: Achievement Unlocked */}
      {newAchievement && (
        <AchievementToast
          achievement={newAchievement}
          onClose={() => setNewAchievement(null)}
        />
      )}

      {/* Notification Toast: Level Up */}
      {newLevel && (
        <LevelUpToast
          level={newLevel}
          onClose={() => setNewLevel(null)}
        />
      )}

      {/* Footer */}
      <footer className="relative z-20 bg-black/80 border-t border-white/10 py-4 px-6 text-center text-xs font-mono text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-space-accent">ORBITAL COMMAND AI</strong> · NASA & SpaceX Inspired Space Mission Simulator
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Three.js 3D WebGL</span>
            <span>•</span>
            <span>Chart.js Telemetry</span>
            <span>•</span>
            <span className="text-green-400 font-bold">NASA Open APIs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

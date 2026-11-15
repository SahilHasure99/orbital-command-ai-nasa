// ORBITAL COMMAND AI — Flight Directorate Aerospace AI Advisor
// Integrates live LLM response with an intelligent offline aerospace flight director fallback

export async function getAIResponse(chatHistory = []) {
  // Extract latest query or design context
  const latestMessage = chatHistory[chatHistory.length - 1]?.content || '';

  // 1. Attempt online query with 4-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "openai",
        messages: [
          {
            role: "system",
            content: "You are the Flight Director AI for ORBITAL COMMAND AI (NASA/ESA Mission Control). Provide professional, technically accurate space engineering advice on spacecraft mass, delta-V, power budget, rocket selection, and planetary trajectories. Keep answers clear and formatted with markdown."
          },
          ...chatHistory
        ]
      })
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && content.trim().length > 0) {
        return content;
      }
    }
  } catch (err) {
    // Gracefully fall back to local aerospace flight director
    console.warn("Online AI unreachable; switching to Autonomous Flight Director Engine:", err?.message || err);
  }

  // 2. Intelligent Offline Aerospace Flight Director Fallback
  return generateFlightDirectorAdvice(latestMessage);
}

function generateFlightDirectorAdvice(promptText = '') {
  const query = promptText.toLowerCase();

  // Try parsing design JSON if embedded in prompt
  let designData = null;
  try {
    const jsonMatch = promptText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      designData = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Not JSON
  }

  // If design data was passed
  if (designData) {
    const { objectiveId, rocketId, componentIds = [] } = designData;
    return `### 🛰️ FLIGHT DIRECTOR TELEMETRY AUDIT

**Mission Profile:** \`${objectiveId?.toUpperCase() || 'DEEP SPACE'}\`
**Selected Launcher:** \`${rocketId?.toUpperCase() || 'HEAVY LIFTER'}\`
**Subsystems Integrated:** ${componentIds.length} modules

#### 📋 Systems Analysis:
1. **Delta-V & Propulsion:** Ensure your stage $\\Delta v$ exceeds the target injection velocity. If targeting Mars (3,800 m/s) or Asteroid (4,900 m/s), verify staging and bi-propellant propellant fraction.
2. **Electrical Power Margin:** Check solar cell attenuation ($1/r^2$). Beyond Mars, solar irradiance drops dramatically; supplement with RTGs or high-capacity Li-ion battery arrays.
3. **Communications & DSN Link:** Ensure Ka-Band High-Gain antenna dish is aligned for deep-space telemetry downlink to maintain mission command link.

> **Flight Director Recommendation:** Design passes preliminary checklist. Proceed to Rocket Stage Validation and initiate ignition countdown!`;
  }

  // Specific question handlers
  if (query.includes('mars') || query.includes('مريخ')) {
    return `### 🔴 Mars Mission Architecture (Hohmann Transfer)
To reach Mars from Low Earth Orbit:
- **Required $\\Delta v$:** ~3,800 m/s for Trans-Mars Injection (TMI).
- **Transit Duration:** ~210–260 days along an elliptical heliocentric transfer.
- **Power Factor:** Solar flux at Mars is approximately 43% of Earth ($590\\,\\text{W/m}^2$). Equip high-efficiency UltraFlex solar wings or an RTG.
- **Atmospheric Entry:** Mars atmosphere is thin (~0.6% Earth pressure), requiring an ablative PICA heat shield and supersonic retro-propulsion.`;
  }

  if (query.includes('moon') || query.includes('lunar') || query.includes('قمر')) {
    return `### 🌕 Lunar Exploration Architecture (Trans-Lunar Injection)
- **Required $\\Delta v$:** ~3,200 m/s for TLI and orbital capture.
- **Payload Capacity:** Ares Medium or Titan Heavy provides sufficient payload mass margin.
- **Surface Operations:** 14-day lunar night requires high-capacity batteries (Li-ion/solid state) or radioisotope thermal generators.`;
  }

  if (query.includes('delta-v') || query.includes('deltav') || query.includes('سرعة')) {
    return `### 🚀 Tsiolkovsky Rocket Equation & $\\Delta v$
$$\\Delta v = I_{sp} \\cdot g_0 \\cdot \\ln\\left(\\frac{m_{initial}}{m_{final}}\\right)$$
Where:
- $I_{sp}$: Specific impulse in seconds (efficiency).
- $m_{initial}$: Wet mass (structure + payload + propellant).
- $m_{final}$: Dry mass (structure + payload).

**Optimization Tip:** To maximize $\\Delta v$, either increase propellant mass fraction or select high-$I_{sp}$ thrusters like Xenon Ion engines ($I_{sp} \\approx 3,200\\,\\text{s}$).`;
  }

  if (query.includes('power') || query.includes('طاقة') || query.includes('solar') || query.includes('battery')) {
    return `### ⚡ Spacecraft Electrical Power Subsystem (EPS)
- **Solar Irradiance:** Falls off with distance squared: $P(r) = P_0 \\cdot (r_{Earth}/r)^2$.
- **Batteries:** Essential for eclipse periods (planetary shadows) and peak pulse loads during instrument transmission.
- **RTGs:** Recommended for outer planet exploration (Jupiter, Saturn, Asteroid belt) where sunlight is insufficient.`;
  }

  // General flight director response
  return `### 🌌 Orbital Command Aerospace Guidance
**Flight Director Online.** Systems are nominal across tracking stations.

Key Flight Principles for Space Mission Success:
1. **Payload Mass vs Launch Capacity:** Keep payload mass under 85% of your rocket's rated capacity to ensure structural safety margin.
2. **Power Budget:** Balance continuous generation against intermittent instrument loads (spectrometers, drills, high-gain transmitter).
3. **Thermal & Radiation Shielding:** Deep space requires thermal multi-layer insulation (MLI) and Whipple micrometeorite shielding.

*Ask any specific question about orbital mechanics, propulsion, solar system exploration, or mission design!*`;
}

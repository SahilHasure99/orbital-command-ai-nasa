# ORBITAL COMMAND AI — 3D Asset Repository & Pipeline

This directory organizes 3D assets, textures, and procedural models for the space mission control simulator.

## Directory Structure:
- `planets/`: Planetary geometries & LOD configurations (Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune).
- `rockets/`: Launch vehicle staging models (Scout-Lite, Ares Medium, Titan Heavy, Saturn-Omega).
- `spacecraft/`: Modular probe chassis, solar wings, high-gain antennas, RTGs, thrusters.
- `rovers/`: Mars Perseverance / Curiosity surface rover models & robotic arms.
- `satellites/`: Earth observation constellations, communication satellites, solar panels.
- `textures/`: Procedural high-resolution planetary albedo maps, bump maps, and solar flare shaders.

## Model Pipeline & Fallback Philosophy:
- High-efficiency procedural Three.js generators (`src/utils/proceduralAssets.js`) generate mathematical, artifact-free textures and geometries locally in-browser.
- Ensures 100% offline capability, zero network latency, zero broken asset URLs, and 60 FPS performance on standard laptop hardware.
- Fully compatible with NASA 3D Resources (https://science.nasa.gov/3d-resources/) and Smithsonian 3D GLTF formats.

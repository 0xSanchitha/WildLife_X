# WildLifeX Ecosystem Simulator - Technical Overview

This document provides a technical overview of the `SimulationEngine.js` architecture, the camera viewport system, and the recent feature upgrades added to the WildLifeX ecosystem simulator.

## 1. Simulation Engine Architecture (`SimulationEngine.js`)

The core ecosystem simulation logic is decoupled from React components into an object-oriented, pure Javascript module. This ensures high-performance physics and AI logic updates inside a `requestAnimationFrame` loop without triggering expensive React re-renders.

### Key Components

*   **`Simulation` (Main Controller)**
    *   Acts as the central orchestrator, managing the time system, entity arrays (`animals`, `plants`), grid spatial partitioning, and the procedural world map (ponds, rivers, obstacles, shelters).
    *   Exposes an `update(dt)` method called by the rendering loop. It orchestrates the ticks for the environment, plants, and animals, applying delta-time (`dt`) for consistent pacing regardless of frame rate.
*   **`AnimalAgent`**
    *   Represents individual faunal entities. Contains biological stats (hunger, water, energy, health, age) and AI states (`activity`, `targetEntity`).
    *   Features a state-machine AI (`_runAI`) that dictates decision-making based on sensory radii (vision, smell, hearing). Behaviors include hunting (`Hunt`), fleeing (`Flee`), foraging (`SeekFood`, `Eat`), resting (`Sleep`), and mating (`SeekMate`).
    *   Age, metabolism, and diurnal/nocturnal traits dictate speed and behavior dynamically based on the ecosystem time.
*   **`PlantAgent`**
    *   Represents flora with procedural growth rates (`growth`) modified by seasons and weather.
    *   Different ecosystem types utilize different plant definitions (e.g., `kelp` vs `tree`), but all share the underlying growth and consumption logic. Eaten plants enter a dormant state and regrow over time.
*   **`TimeSystem`**
    *   Simulates the day-night cycle, seasons, and weather patterns.
    *   Modulates ecosystem parameters such as temperature and plant growth multipliers. Different biomes (Forest vs. Ocean) feature entirely different seasonal systems (e.g., Winter/Spring vs. Wet/Dry Seasons).
*   **`SpatialHashGrid`**
    *   An optimized spatial partitioning data structure. Divides the canvas into grid cells to reduce $O(n^2)$ proximity checks (like predator/prey detection and flocking) to near $O(1)$.
    *   Entities re-insert themselves into the grid every tick to allow fast radius queries (`grid.query(x, y, radius)`).

## 2. Camera System and Rendering

The canvas rendering (`SimulationCanvas.jsx`) handles panning, tracking, and zooming using 2D context transformations (`ctx.translate`, `ctx.scale`).

### Camera Math (`handleWheel` & `handleMouseMove`)

*   **Zooming (`handleWheel`)**: 
    To zoom in directly onto the mouse cursor, the algorithm first captures the mouse coordinates relative to the canvas (`mouseX`, `mouseY`). It then translates these into world coordinates (`worldX`, `worldY`) using the *current* zoom and pan. After calculating the `newZoom` factor, it reverse-calculates what the pan *should* be so that the world coordinate remains exactly under the mouse coordinate.
    Zooming is gated by requiring `Ctrl` or `Meta/Cmd` to be held, preventing accidental canvas zooming while scrolling side panels.
*   **Panning (`handleMouseMove`)**:
    Click-and-drag panning adjusts the global `pan` state. Clamping logic is applied to restrict the pan boundaries, ensuring that the simulation map cannot be completely dragged off-screen. It requires that at least 20% of the simulated world remains within the canvas viewport bounds.

## 3. Recent Upgrade Spec Features

The ecosystem simulator has been recently upgraded with the following enhancements:

1.  **Independent Side Panels**: Collapsible Left (Fauna Placement) and Right (Dashboard) panels with independent scrolling that do not intersect with or trap the main window scroll.
2.  **Sprite Rendering**: Replaced static emoji rendering with dynamic image assets for animals (`ctx.drawImage`) with proportional scaling, diet-based colored shadows, and dynamic caching.
3.  **Fullscreen Mode**: Implemented a robust fullscreen toggle leveraging the `requestFullscreen` API on the canvas container for an immersive experience.
4.  **Constrained Camera**: Implemented Ctrl+Scroll zooming (centered on the cursor) and strict bounding boxes for click-and-drag panning.
5.  **Realistic Terrain Art**: Swapped procedural primitive backgrounds (like flat blue rivers and emoji plants) with rendered asset textures (`src/assets`) and procedural wavy terrain patterns.
6.  **Habitat Validation**: Real-time checking during animal placement. Placing an ocean animal in a forest biome flags it with an `incompatibleHabitat` boolean, causing rapid health degradation and eventual death, logged to the educational ticker.
7.  **Pack-finding Placement**: When placing a herd/school animal, the engine calculates the nearest living herd-mate using Euclidean distance and spawns the new animal dynamically within their vicinity rather than at the exact click coordinate.
8.  **Sex-based Reproduction**: Enforced strict biological prerequisites for mating. Animals now require a nearby living mate of the opposite sex (assigned at birth) to reproduce. If an animal is ready to mate but no opposite-sex partner exists, an educational warning is logged regarding potential population collapse.
9.  **Navigation Button**: Added a dedicated exit/back button to cleanly unmount the simulation loop and return to the main dashboard.

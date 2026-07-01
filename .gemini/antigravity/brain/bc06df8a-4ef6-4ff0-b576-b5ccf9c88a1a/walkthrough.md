# Ecosystem Simulator Implementation Walkthrough

We have successfully built the **core ecosystem simulation engine** and integrated it into the WildLifeX React + Flask + MongoDB web application. The simulator runs on a custom, high-performance HTML5 Canvas with detailed ecological, time, season, weather, and trophic food web mechanics.

---

## What Was Built

### 1. Backend Simulation REST Endpoints
Created simulation saving/loading APIs in the Flask backend under a new blueprint prefix `/api/simulations`:
- [simulation_routes.py](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/backend/routes/simulation_routes.py): Manages saving state, loading detail states, listing summaries, and deleting saves. Utilizes the database connection and locks data to the authenticated JWT `user_id`.
- [app.py](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/backend/app.py): Registered the new simulation blueprint routes.

### 2. Frontend Simulation Core Engine
Built a pure JavaScript physics/AI engine located in:
- [SimulationEngine.js](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/components/simulation/SimulationEngine.js):
  - **`SpatialHashGrid`**: Cuts distance check complexity from $O(N^2)$ to $O(N)$ by indexing entities in 2D cell hashes. This allows smooth handling of 200–500 entities.
  - **`TimeSystem` & `WeatherSystem`**: Operates on a configurable clock (e.g. 12 real minutes = 1 in-game day). Cycles seasons (Spring/Summer/Autumn/Winter for Forest; Dry/Wet/Storm for Ocean) and weather (Sunny, Rainy, Storm, Heatwave, Snowy, Foggy) that affect temperature and species metabolic rates.
  - **`WorldMap`**: Procedurally generates winding rivers, drinking ponds, coral reef zones, deep ocean zones, rocks, and breeding zones.
  - **`AnimalAgent` AI**: Implements state-machine logic where animals continuously track hunger, thirst, energy, health, age, gender, and pregnancy. Animals decide to eat (carnivores hunt prey; herbivores search plants), drink from water coordinates, sleep (recharging energy), run from predators (`Flee`), search for mates (`SeekMate`), and travel in cohesive groups (`flocking` for social species).
  - **`PlantAgent`**: Simulates plant germination, organic seed-spreading to adjacent coordinates, and growth cycles.
  - **`EducationalLogger`**: Triggers real-time alerts and explanations for students when ecosystems experience trophic collapses, overgrazing, droughts, or extinctions.

### 3. Visual Rendering & Dashboard Layer
- [SimulationCanvas.jsx](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/components/simulation/SimulationCanvas.jsx):
  - Renders the map, custom rivers, obstacles, and plant sprites.
  - Renders animals as styled emojis with status rings for selections, genders, pregnancy, and fleeing.
  - Implements smooth mouse dragging (pan), wheel scrolling (zoom), auto-focus camera tracking, and click-to-place tools.
  - Draws a floating Mini-map with colored blips and a viewport boundary indicator.
  - Applies a semi-transparent screen color mask overlay mapping sunrise, sunset, and dark night moonlight.
- [SimulationDashboard.jsx](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/components/simulation/SimulationDashboard.jsx):
  - Displays population counters and bar meters for trophic pyramids.
  - Generates custom, gorgeous **SVG area and line charts** displaying population trends, plant-to-herbivore balances, and temperature.
  - Renders the event logs with filter categories (predation, weather, extinction, reproduction).
  - Houses the **Educational Mode Explainer** panel describing active dynamics (e.g. predator starvation collapses).

### 4. Navigation & Profile Route Wiring
- [App.jsx](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/App.jsx): Added routing and imports for the Profile page `/profile`. When a user logs in, their profile icon/name appears in the Navbar, and clicking "Profile" opens their credentials, statistics, and history. Removed `<Layout>` wrapper on `/ecosystem/:type` to hide the global navbar/footer.
- [ecosystem.jsx](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/pages/ecosystem.jsx): Modified the start button handler to route to `/ecosystem/forest` or `/ecosystem/ocean` using `react-router-dom` navigation.
- [EcosystemBuilder.jsx](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/pages/EcosystemBuilder.jsx): Redesigned to serve as the unified workspace panel, implementing size configuration layouts (Small, Medium, Large maps), left toolbar lists, details panels (which let users feed or terminate selected animals), and save/load modals calling backend API handlers.

---

## Resolved Bug Fixes & Refinements

1. **Animal Placement & Metabolism**: Fixed fields in the backend projection, preventing `TypeError` on construction. Pushed safety fallbacks inside the agent constructor for all fields.
2. **Dynamic Tree Scaling**: Resized forest trees to a maximum growth scale of **52px** and kelp to **42px** (making them stand out).
3. **Rock Size Reductions**: Scaled down procedural rocks/coral obstacles and hand-placed rocks on the canvas to half their original sizes.
4. **Resolved Simulation Freeze (AI Crash)**: Fixed spatial grid scanning filters in [SimulationEngine.js](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/components/simulation/SimulationEngine.js). The scan functions were previously checking `entity.name.toLowerCase()` and calling `entity.isAdult()` on plants, which returned `undefined` and crashed the loop. Pushed `instanceof PlantAgent` filters to resolve this completely.
5. **Separated Drag vs. Click Placement**: Implemented drag distance trackers (`hasDraggedRef`, `dragStartPos`) in [SimulationCanvas.jsx](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/components/simulation/SimulationCanvas.jsx) to ignore placement clicks if the mouse dragged/panned more than 4px.
6. **Modern Card Layout on Canvas**: Wrapped animal icons inside rounded rectangle badges (`roundRect` background cards) with color-coded diet borders (red = carnivore, green = herbivore, blue = omnivore) and glassmorphism styling.
7. **Hiding Global Navbar/Footer in Simulator**: Removed Layout wrappers in router rules, preventing overlap with the full-screen simulator layout.
8. **Fixed Sidebar Scrolling**: Changed sidebar class in [EcosystemBuilder.jsx](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/pages/EcosystemBuilder.jsx) to fixed height and hidden overflow, scrolling only the animal list section.
9. **Added MongoDB Prey Species**: Inserted Deer, Rabbit, Mouse, and Small Fish into the MongoDB `animals` database collection. Updated all existing predator records (e.g. Bald Eagle, Amur Leopard, King Cobra, etc.) in the database so that their prey lists map to these new species, enabling the food web to function correctly.
10. **Updated Frontend Emoji Lookups**: Registered visual emojis (`🦌`, `🐇`, `🐭`, `🐟`) for the new prey species inside [SimulationCanvas.jsx](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/components/simulation/SimulationCanvas.jsx) and [EcosystemBuilder.jsx](file:///c:/Users/Sandun%20Shyamantha/Desktop/Ecosystem/WildLifeX/src/pages/EcosystemBuilder.jsx).

---

## Verification Results

- **Vite Production Bundler**: Compiles 100% cleanly in 17.52s without errors.
- **REST Endpoints**: Saved, listed, loaded, and deleted simulation states successfully.
- **Vite & Flask Servers**: Both servers are active in the background.

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Simulation, AnimalAgent, ACTIVITY_LABELS } from "../components/simulation/SimulationEngine";
import SimulationCanvas from "../components/simulation/SimulationCanvas";
import SimulationDashboard from "../components/simulation/SimulationDashboard";

const BACKEND_URL = "http://127.0.0.1:5000/api";

const ANIMAL_EMOJIS = {
  "snow-leopard": "🐆", "african-elephant": "🐘", "amur-leopard": "🐆",
  "arctic-fox": "🦊", "giant-panda": "🐼", "bald-eagle": "🦅",
  "emperor-penguin": "🐧", "barn-owl": "🦉", "scarlet-macaw": "🦜",
  "komodo-dragon": "🦎", "saltwater-crocodile": "🐊", "green-sea-turtle": "🐢",
  "king-cobra": "🐍", "galapagos-tortoise": "🐢", "great-white-shark": "🦈",
  "clownfish": "🐠", "manta-ray": "🐋", "atlantic-bluefin-tuna": "🐟",
  "poison-dart-frog": "🐸", "axolotl": "🦎", "fire-salamander": "🦎",
  "american-bullfrog": "🐸", "deer": "🦌", "rabbit": "🐇", "mouse": "🐭",
  "small-fish": "🐟", "squirrel": "🐿️", "boar": "🐗", "woodpecker": "🪶",
  "plankton": "🔬", "krill": "🦐", "sea-urchin": "🦔", "squid": "🦑", "seal": "🦭",
};

export default function EcosystemBuilder() {
  const { type } = useParams(); // "forest" or "ocean"
  const navigate = useNavigate();
  const loopRef = useRef(null);
  const lastTimeRef = useRef(0);

  // UI state
  const [worldSize, setWorldSize] = useState(null); // "small", "medium", "large"
  const [sim, setSim] = useState(null);
  const [tick, setTick] = useState(0); // Dummy state to trigger throttled React updates
  
  // Selection and tools state
  const [selectedTool, setSelectedTool] = useState(null); // "tree", "rock", or species id e.g. "amur-leopard"
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [trackedAnimal, setTrackedAnimal] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [selectedMode, setSelectedMode] = useState("sandbox");

  // Animal Definitions state
  const [fetchedAnimals, setFetchedAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);

  // Save / Load state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savedSimulations, setSavedSimulations] = useState([]);
  const [loadingSaves, setLoadingSaves] = useState(false);

  // Fetch animal definitions from MongoDB on mount
  useEffect(() => {
    setLoadingAnimals(true);
    fetch(`${BACKEND_URL}/animals/`)
      .then((r) => r.json())
      .then((data) => {
        // Filter definitions by habitat
        const isOcean = type === "ocean";
        const filtered = data.filter((item) => {
          const itemHabitat = item.habitat ? item.habitat.toLowerCase() : "";
          if (isOcean) {
            return itemHabitat === "ocean" || itemHabitat.includes("marine") || item.id === "clownfish" || item.id === "manta-ray" || item.id === "atlantic-bluefin-tuna" || item.id === "green-sea-turtle";
          } else {
            return itemHabitat !== "ocean" && !itemHabitat.includes("marine");
          }
        });
        setFetchedAnimals(filtered);
      })
      .catch((err) => {
        console.error("Error fetching animals from MongoDB:", err);
      })
      .finally(() => {
        setLoadingAnimals(false);
      });
  }, [type]);

  // Handle simulation initialization
  const handleCreateWorld = (size) => {
    setWorldSize(size);
    const newSim = new Simulation(type, size);
    newSim.mode = selectedMode;
    newSim.points = selectedMode === "challenge" ? 180 : Infinity;
    
    // Feed fetched animal definitions to the simulation dictionary
    fetchedAnimals.forEach((a) => {
      newSim.addAnimalDefinition(a);
    });

    newSim.placedSpecies = new Set();
    newSim.initializePlants();
    newSim.educationalLogger.logEvent(1, `Procedural ${type} map generated successfully. Size: ${size}. Mode: ${selectedMode}.`, "general");
    
    setSim(newSim);
  };

  // Simulation Update Loop (requestAnimationFrame)
  useEffect(() => {
    if (!sim || sim.isPaused) {
      if (loopRef.current) {
        cancelAnimationFrame(loopRef.current);
        loopRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();
    let accumTime = 0;

    const loop = (time) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Limit max delta time to prevent physics clipping on window tab switch
      const clampedDt = Math.min(dt, 0.1);

      sim.update(clampedDt);

      // Throttled React state updates (roughly 5 times a second)
      accumTime += clampedDt;
      if (accumTime >= 0.2) {
        accumTime = 0;
        setTick((t) => t + 1);
        
        // Keep selected animal state in sync with running simulation instance data
        if (selectedAnimal) {
          const fresh = sim.animals.find((a) => a.id === selectedAnimal.id);
          if (fresh) {
            setSelectedAnimal(fresh);
          } else {
            setSelectedAnimal(null);
            setTrackedAnimal(null);
          }
        }
      }

      loopRef.current = requestAnimationFrame(loop);
    };

    loopRef.current = requestAnimationFrame(loop);

    return () => {
      if (loopRef.current) {
        cancelAnimationFrame(loopRef.current);
      }
    };
  }, [sim, sim?.isPaused, selectedAnimal]);

  const getAnimalCost = (species) => {
    if (species.ecosystemPoints) return species.ecosystemPoints;
    const id = species.id.toLowerCase();
    if (["rabbit", "mouse", "squirrel", "plankton", "krill", "small-fish", "clownfish", "sea-urchin"].includes(id)) return 5;
    if (["deer", "boar", "scarlet-macaw", "woodpecker", "squid"].includes(id)) return 15;
    if (["giant-panda", "manta-ray", "atlantic-bluefin-tuna", "green-sea-turtle", "seal"].includes(id)) return 25;
    if (id === "african-elephant") return 40;
    if (species.diet?.toLowerCase() === "carnivore") {
      return ["great-white-shark", "snow-leopard", "amur-leopard"].includes(id) ? 50 : 20;
    }
    return 10;
  };

  // Place object click handler on Canvas
  const handlePlaceObject = (toolType, wx, wy) => {
    if (!sim) return;

    const forestPlants = ["tree", "bush", "flower", "grass"];
    const oceanPlants = ["kelp", "seagrass", "coral"];

    if (forestPlants.includes(toolType) || oceanPlants.includes(toolType)) {
      sim.spawnPlant(toolType, wx, wy);
    } else if (toolType === "rock") {
      sim.worldMap.obstacles.push({
        x: wx,
        y: wy,
        radius: 10 + Math.random() * 8
      });
    } else {
      // It is an animal species ID
      const speciesDef = fetchedAnimals.find((a) => a.id === toolType);
      if (speciesDef) {
        const cost = getAnimalCost(speciesDef);
        if (sim.mode === "challenge" && sim.points < cost) {
          alert(`Not enough ecosystem points! Placing a ${speciesDef.name} costs ${cost} points, but you only have ${sim.points} remaining.`);
          return;
        }

        // Spawn near existing herd members so groups form naturally
        let spawnX = wx;
        let spawnY = wy;
        const herdMates = sim.animals.filter((a) => a.speciesId === toolType && !a.isDead);
        if (herdMates.length > 0) {
          const mate = herdMates[Math.floor(Math.random() * herdMates.length)];
          spawnX = mate.x + (Math.random() - 0.5) * 70;
          spawnY = mate.y + (Math.random() - 0.5) * 70;
          spawnX = Math.max(30, Math.min(sim.width - 30, spawnX));
          spawnY = Math.max(30, Math.min(sim.height - 30, spawnY));
        }

        const animal = new AnimalAgent(Date.now(), speciesDef, spawnX, spawnY);
        animal.hunger = 50 + Math.random() * 20; // start hungry enough to seek food quickly
        sim.addAnimalInstance(animal);
        sim.placedSpecies.add(toolType); // Register that this species was placed
        
        if (sim.mode === "challenge") {
          sim.points -= cost;
        }

        sim.educationalLogger.logEvent(
          sim.timeSystem.day, 
          `Placed new ${speciesDef.name} into the ecosystem.`, 
          "general"
        );
      }
    }
  };

  // Backend Save handler
  const handleSaveSimulation = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication required. Please log in to save simulations.");
      return;
    }

    if (!saveName.trim()) {
      alert("Please enter a name for the simulation save.");
      return;
    }

    const state = sim.serialize();
    const payload = {
      name: saveName,
      ecosystem_type: type,
      world_size: worldSize,
      simulation_state: state
    };

    try {
      const res = await fetch(`${BACKEND_URL}/simulations/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not save simulation.");
        return;
      }
      alert("Simulation saved successfully!");
      setShowSaveModal(false);
      setSaveName("");
    } catch (err) {
      console.error(err);
      alert("Error saving simulation state to database.");
    }
  };

  // Backend Load dialog triggers
  const openLoadDialog = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication required. Please log in to load simulations.");
      return;
    }

    setShowLoadModal(true);
    setLoadingSaves(true);
    try {
      const res = await fetch(`${BACKEND_URL}/simulations/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Filter loaded simulations matching current ecosystem type
        const filtered = data.filter((s) => s.ecosystem_type === type);
        setSavedSimulations(filtered);
      } else {
        alert(data.error || "Could not fetch saves.");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading save list from server.");
    } finally {
      setLoadingSaves(false);
    }
  };

  const handleLoadSimulation = async (saveId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/simulations/${saveId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not load simulation.");
        return;
      }

      // Initialize loaded world
      const sState = data.simulation_state;
      const loadedSim = new Simulation(data.ecosystem_type, data.world_size);
      
      // Load animal definitions
      fetchedAnimals.forEach((a) => {
        loadedSim.addAnimalDefinition(a);
      });

      loadedSim.deserialize(sState);
      
      setWorldSize(data.world_size);
      setSim(loadedSim);
      setShowLoadModal(false);
      setSelectedAnimal(null);
      setTrackedAnimal(null);
    } catch (err) {
      console.error(err);
      alert("Error loading simulation state.");
    }
  };

  const handleDeleteSave = async (saveId, e) => {
    e.stopPropagation(); // Avoid triggering load
    if (!window.confirm("Are you sure you want to delete this simulation save?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/simulations/${saveId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSavedSimulations((prev) => prev.filter((s) => s._id !== saveId));
      } else {
        alert("Could not delete save.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clock formatter helper
  const getClockString = () => {
    if (!sim) return "00:00";
    const hrs = Math.floor(sim.timeSystem.timeOfDay);
    const mins = Math.floor((sim.timeSystem.timeOfDay % 1) * 60);
    const hrsStr = hrs.toString().padStart(2, "0");
    const minsStr = mins.toString().padStart(2, "0");
    return `${hrsStr}:${minsStr}`;
  };

  // Render Size Selection Screen first if world is not selected
  if (!sim) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-[#EEEBE4] pt-28 pb-12 flex flex-col justify-center items-center px-4 font-body">
        <div className="max-w-2xl w-full bg-neutral-900/60 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl flex flex-col text-center">
          
          <span className="text-[10px] font-heading font-semibold tracking-[0.22em] text-[#79AE6F] uppercase mb-3">
            Ecosystem Manager
          </span>
          <h2 className="text-3xl font-heading font-bold mb-3 capitalize">
            Configure {type} Simulator
          </h2>
          <p className="text-sm text-[#EEEBE4]/60 leading-[1.8] max-w-md mx-auto mb-8">
            Choose a world scale for your procedural {type} map. Larger scales generate massive ecosystems supporting complex food chains and high population sizes.
          </p>

          {loadingAnimals ? (
            <div className="py-12 flex flex-col justify-center items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#79AE6F] animate-spin" />
              <span className="text-xs text-[#EEEBE4]/40 animate-pulse">Loading MongoDB animal species definitions...</span>
            </div>
          ) : (
            <>
              {/* Mode Selection */}
              <div className="bg-white/3 border border-white/5 rounded-3xl p-5 mb-8 flex flex-col gap-3">
                <h3 className="font-heading font-semibold text-[#EEEBE4] text-xs uppercase tracking-wider text-center">
                  Select Simulation Mode
                </h3>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setSelectedMode("sandbox")}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-heading font-bold cursor-pointer transition
                      ${selectedMode === "sandbox"
                        ? "bg-[#79AE6F]/20 border-[#79AE6F] text-[#79AE6F]"
                        : "bg-black/35 border-white/5 hover:border-white/10 text-[#EEEBE4]/60"
                      }`}
                  >
                    🌍 Sandbox Mode
                    <p className="text-[9px] font-body text-[#EEEBE4]/45 font-normal mt-1 leading-normal">Unlimited budget, free animal placements.</p>
                  </button>
                  <button
                    onClick={() => setSelectedMode("challenge")}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-heading font-bold cursor-pointer transition
                      ${selectedMode === "challenge"
                        ? "bg-[#79AE6F]/20 border-[#79AE6F] text-[#79AE6F]"
                        : "bg-black/35 border-white/5 hover:border-white/10 text-[#EEEBE4]/60"
                      }`}
                  >
                    🏆 Challenge Mode
                    <p className="text-[9px] font-body text-[#EEEBE4]/45 font-normal mt-1 leading-normal">Survive 100 days, 80% biodiversity, or score 90+.</p>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5 mb-8">
                {[
                  { id: "small", title: "Small", dimensions: "800 x 600 px", max: 150, desc: "Quick cycles, ideal for fast class demonstrations." },
                  { id: "medium", title: "Medium", dimensions: "1200 x 900 px", max: 300, desc: "Balanced food webs and stable predator cycles." },
                  { id: "large", title: "Large", dimensions: "1600 x 1200 px", max: 500, desc: "Dense biome, massive schools, flocks, and territory wars." }
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => handleCreateWorld(opt.id)}
                    className="group bg-[#141414] border border-white/5 hover:border-[#79AE6F]/60 rounded-2xl p-5 cursor-pointer text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-lg flex flex-col gap-2"
                  >
                    <h3 className="font-heading font-bold text-[#EEEBE4] group-hover:text-[#79AE6F] transition text-base">
                      {opt.title}
                    </h3>
                    <span className="text-[10px] font-heading text-[#EEEBE4]/40 tracking-wider">
                      {opt.dimensions}
                    </span>
                    <div className="h-px bg-white/5 my-1" />
                    <span className="text-[11px] text-[#EEEBE4]/70 leading-relaxed font-body">
                      {opt.desc}
                    </span>
                    <span className="text-[10px] font-heading text-[#79AE6F]/80 uppercase mt-auto">
                      Max: {opt.max} animals
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/ecosystem")}
              className="text-[#EEEBE4]/50 hover:text-white text-xs border border-white/10 px-6 py-2.5 rounded-full cursor-pointer transition font-heading"
            >
              ← Back to World Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Simulation Viewport
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0c0c] text-[#EEEBE4] pt-20 font-body select-none">
      
      {/* ───────── TOP STATUS BAR / CLOCK / METRICS ───────── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between px-6 py-3 border-b border-white/5 bg-[#141414]/90 backdrop-blur z-20 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-lg">
            {type === "forest" ? "🌲" : "🌊"}
          </span>
          <div>
            <h1 className="text-sm font-heading font-bold tracking-wider capitalize text-[#EEEBE4]">
              {type} Ecosystem Simulator
            </h1>
            <p className="text-[10px] text-[#EEEBE4]/45 font-body mt-0.5">
              Scale: <strong className="uppercase text-[#79AE6F]">{worldSize}</strong>
            </p>
          </div>
        </div>

        {/* Live Simulation Clock & Climate details */}
        <div className="flex flex-wrap items-center gap-6 text-xs bg-black/30 border border-white/5 rounded-2xl px-5 py-2">
          <div className="flex flex-col">
            <span className="text-[9px] text-[#EEEBE4]/40 uppercase font-heading tracking-wider">
              Simulation Year
            </span>
            <span className="font-semibold text-xs text-[#EEEBE4]">
              Yr {sim.timeSystem.year}, Day {sim.timeSystem.day}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[9px] text-[#EEEBE4]/40 uppercase font-heading tracking-wider">
              Current Season
            </span>
            <span className="font-semibold text-xs text-[#79AE6F]">
              {sim.timeSystem.getSeason()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[#EEEBE4]/40 uppercase font-heading tracking-wider">
              Clock
            </span>
            <span className="font-bold text-xs font-heading text-sky-400">
              {getClockString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[#EEEBE4]/40 uppercase font-heading tracking-wider">
              Period
            </span>
            <span className="font-semibold text-xs text-purple-300">
              {sim.timeSystem.getPeriodOfDay()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[#EEEBE4]/40 uppercase font-heading tracking-wider">
              Weather / Temp
            </span>
            <span className="font-semibold text-xs capitalize flex items-center gap-1">
              <span>
                {sim.timeSystem.currentWeather === "Sunny" || sim.timeSystem.currentWeather === "Heatwave" ? "☀️" : 
                 sim.timeSystem.currentWeather === "Rainy" || sim.timeSystem.currentWeather === "Stormy" ? "🌧️" : 
                 sim.timeSystem.currentWeather === "Snowy" ? "❄️" : "☁️"}
              </span>
              <span>
                {sim.timeSystem.currentWeather} ({sim.timeSystem.temperature}°C)
              </span>
            </span>
          </div>

          {sim.mode === "challenge" && (
            <div className="flex flex-col border-l border-white/10 pl-5">
              <span className="text-[9px] text-[#EEEBE4]/40 uppercase font-heading tracking-wider">
                Ecosystem Budget
              </span>
              <span className="font-bold text-xs text-yellow-400 font-heading">
                🪙 {sim.points} pts
              </span>
            </div>
          )}
        </div>

        {/* Simulation Execution Controls */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-white/10 rounded-full p-1 self-start md:self-auto shadow">
          <button
            onClick={() => {
              sim.isPaused = !sim.isPaused;
              setTick((t) => t + 1);
            }}
            className={`px-3 py-1.5 rounded-full text-[10px] font-heading font-semibold uppercase tracking-wider cursor-pointer transition
              ${sim.isPaused 
                ? "bg-[#79AE6F] text-[#0c0c0c] font-bold" 
                : "text-[#EEEBE4]/70 hover:bg-white/5 hover:text-white"
              }`}
          >
            {sim.isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
          
          {["1", "2", "4", "10"].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                sim.speed = parseInt(spd);
                sim.isPaused = false;
                setTick((t) => t + 1);
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-heading font-semibold cursor-pointer transition
                ${sim.speed === parseInt(spd) && !sim.isPaused
                  ? "bg-white/10 text-white font-bold border border-white/20"
                  : "text-[#EEEBE4]/40 hover:text-white"
                }`}
            >
              x{spd}
            </button>
          ))}
        </div>
      </header>

      {/* ─── MAIN SIMULATION VIEWPORT LAYOUT ─── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ───── LEFT SIDEBAR: TERRAINS AND ANIMAL SPAWNERS ───── */}
        <aside className="w-56 md:w-64 border-r border-white/5 bg-[#141414] h-full overflow-hidden shrink-0 flex flex-col p-4 gap-6 select-none z-10">
          
          {/* TERRAIN BRUSH BRUSHES */}
          <div>
            <h3 className="font-heading text-xs font-semibold tracking-wider text-[#EEEBE4]/50 uppercase mb-3">
              Terrain Brushes
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                ...(type === "forest" 
                  ? [
                      { id: "tree", label: "Tree", emoji: "🌳" },
                      { id: "bush", label: "Bush", emoji: "🌿" },
                      { id: "flower", label: "Flower", emoji: "🌸" },
                      { id: "grass", label: "Grass", emoji: "🌱" }
                    ]
                  : [
                      { id: "kelp", label: "Kelp", emoji: "🪸" },
                      { id: "seagrass", label: "Seaweed", emoji: "🌱" },
                      { id: "coral", label: "Coral Reef", emoji: "🪸" }
                    ]
                ),
                { id: "rock", label: type === "forest" ? "Rock" : "Reef Rock", emoji: "⛰️" }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedTool(selectedTool === item.id ? null : item.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border cursor-pointer transition duration-200
                    ${selectedTool === item.id 
                      ? "bg-[#79AE6F]/20 border-[#79AE6F] text-[#79AE6F]" 
                      : "bg-[#0c0c0c] border-white/5 hover:border-white/15 text-[#EEEBE4]/85"
                    }`}
                >
                  <span className="text-xl mb-1">{item.emoji}</span>
                  <span className="text-[10px] font-medium text-center truncate w-full capitalize">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ANIMAL SPAWNERS */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="font-heading text-xs font-semibold tracking-wider text-[#EEEBE4]/50 uppercase mb-3 shrink-0">
              Fauna Species ({fetchedAnimals.length})
            </h3>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
              {fetchedAnimals.map((animal) => {
                const emoji = ANIMAL_EMOJIS[animal.id] || "🐾";

                return (
                  <div
                    key={animal.id}
                    onClick={() => setSelectedTool(selectedTool === animal.id ? null : animal.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition duration-200
                      ${selectedTool === animal.id 
                        ? "bg-[#79AE6F]/20 border-[#79AE6F] text-[#79AE6F]" 
                        : "bg-[#0c0c0c] border-white/5 hover:border-white/15 text-[#EEEBE4]/85"
                      }`}
                  >
                    <span className="text-xl shrink-0">{emoji}</span>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-1.5 justify-between">
                        <p className="text-[11px] font-heading font-semibold truncate leading-tight">
                          {animal.name}
                        </p>
                        {sim.mode === "challenge" && (
                          <span className="text-[8px] font-heading text-yellow-400 font-bold whitespace-nowrap bg-yellow-400/5 px-1.5 py-0.5 rounded-full border border-yellow-400/10 shrink-0">
                            🪙 {getAnimalCost(animal)}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-[#EEEBE4]/40 capitalize font-medium mt-0.5">
                        {animal.diet} • {animal.category}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CLEAR SELECTED TOOL BUTTON */}
          {selectedTool && (
            <button
              onClick={() => setSelectedTool(null)}
              className="w-full py-2 bg-red-500/10 border border-red-500/35 hover:bg-red-500 hover:text-black rounded-xl text-[10px] uppercase tracking-wider font-heading font-bold cursor-pointer transition shrink-0"
            >
              Clear Placement Tool
            </button>
          )}
        </aside>

        {/* ───── CENTER WORKSPACE: CANVAS MAP ───── */}
        <main className="flex-1 relative overflow-hidden bg-neutral-955 flex flex-col">
          <div className="flex-1 relative">
            {sim.currentEvent && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-950/80 border border-red-500/35 backdrop-blur-md text-red-400 text-[10px] font-heading font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 z-10 select-none max-w-sm text-center">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span>
                  {sim.currentEvent === "forest_fire" && "🔥 WILDFIRE: Fire spreading! Flora and fauna taking damage!"}
                  {sim.currentEvent === "drought" && "☀️ DROUGHT: Water supplies evaporating! Dehydration speeds are high!"}
                  {sim.currentEvent === "disease" && "🦠 OUTBREAK: Infectious disease spreading! Health decaying!"}
                  {sim.currentEvent === "heavy_rain" && "🌧️ MONSOON: Heavy rain falls! Vegetation is thriving!"}
                  {sim.currentEvent === "oil_spill" && "🛢️ OIL SPILL: Sea life toxicity is rising!"}
                  {sim.currentEvent === "plastic_pollution" && "🗑️ PLASTIC DRIFT: Marine ecosystems clogged!"}
                  {sim.currentEvent === "storm_surge" && "⛈️ STORM SURGE: Hurricane surge draining energy!"}
                  {sim.currentEvent === "flood" && "🌊 FLOOD: Rising waters destroying low plants!"}
                  {sim.currentEvent === "cold_wave" && "🥶 COLD WAVE: Animals need more food to survive!"}
                </span>
              </div>
            )}
          {sim.challengeComplete && (
            <div className="absolute top-4 right-4 bg-green-950/80 border border-green-500/35 text-green-400 text-[10px] font-heading font-bold px-4 py-2 rounded-2xl z-10">
              🏆 Challenge Complete!
            </div>
          )}
          {sim.challengeFailed && (
            <div className="absolute top-4 right-4 bg-red-950/80 border border-red-500/35 text-red-400 text-[10px] font-heading font-bold px-4 py-2 rounded-2xl z-10">
              ❌ Challenge Failed — Too many extinctions
            </div>
          )}
            <SimulationCanvas
              sim={sim}
              selectedAnimal={selectedAnimal}
              setSelectedAnimal={setSelectedAnimal}
              selectedTool={selectedTool}
              onPlaceObject={handlePlaceObject}
              trackedAnimal={trackedAnimal}
              setTrackedAnimal={setTrackedAnimal}
            />
          </div>

          {/* Educational marquee news bar at the bottom */}
          <div className="h-9 border-t border-white/5 bg-[#141414] px-4 flex items-center shrink-0 overflow-hidden text-xs text-[#EEEBE4]/50 select-none">
            <div className="font-heading text-[9px] font-bold text-[#79AE6F] tracking-widest uppercase mr-3 border border-[#79AE6F]/25 px-2 py-0.5 rounded shrink-0">
              Live Monitor
            </div>
            <div className="flex-1 truncate font-body text-[11px] italic">
              {sim.educationalLogger.logs.length > 0
                ? sim.educationalLogger.logs[0].message
                : `Observation mode active. Place flora and fauna to stimulate food chain activity.`}
            </div>
          </div>
        </main>

        {/* ───── RIGHT PANEL: DASHBOARD PANELS & SELECTION DETAILS ───── */}
        <aside className="w-80 md:w-96 border-l border-white/5 bg-[#141414] overflow-y-auto shrink-0 flex flex-col z-10 select-none">
          
          {/* Main Dashboard Stats/Charts */}
          <div className="flex-1 min-h-[300px]">
            <SimulationDashboard
              sim={sim}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* SELECTED ANIMAL DETAILS PANEL */}
          {selectedAnimal && (
            <div className="border-t border-white/10 bg-black/45 p-4 flex flex-col gap-4 shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <span className="text-3xl">{ANIMAL_EMOJIS[selectedAnimal.speciesId] || "🐾"}</span>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white capitalize leading-tight">
                      {selectedAnimal.name}
                    </h3>
                    <p className="text-[10px] text-[#EEEBE4]/40 capitalize font-medium mt-0.5">
                      Gender: <strong className={selectedAnimal.gender === "Male" ? "text-sky-400" : "text-pink-400"}>{selectedAnimal.gender}</strong> • Age: {selectedAnimal.ageYears.toFixed(1)} / {selectedAnimal.maxAgeYears} yrs
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedAnimal(null);
                    setTrackedAnimal(null);
                  }}
                  className="text-[#EEEBE4]/40 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Progress bars metrics */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[10px] text-[#EEEBE4]/60 mb-0.5">
                    <span>Health Points</span>
                    <span>{Math.round(selectedAnimal.health)}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${selectedAnimal.health}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-[#EEEBE4]/60 mb-0.5">
                    <span>Satiation (Hunger)</span>
                    <span>{Math.round(selectedAnimal.hunger)}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${selectedAnimal.hunger}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-[#EEEBE4]/60 mb-0.5">
                    <span>Energy</span>
                    <span>{Math.round(selectedAnimal.energy)}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${selectedAnimal.energy}%` }} />
                  </div>
                </div>

                {selectedAnimal.pregnant && (
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-2 flex items-center justify-between text-[10px]">
                    <span className="text-pink-400 font-semibold animate-pulse"> Pregnant ♀</span>
                    <span className="text-[#EEEBE4]/60">
                      Birth in: {Math.round(selectedAnimal.gestationPeriod - selectedAnimal.gestationTimer || 0)}s
                    </span>
                  </div>
                )}
              </div>

              <div className="h-px bg-white/5" />

              {/* Current activity behavior */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#EEEBE4]/60 font-body">
                <div>
                  State: <strong className="text-white">{ACTIVITY_LABELS[selectedAnimal.activity] || selectedAnimal.activity}</strong>
                </div>
                <div>
                  Life Stage: <strong className="text-white">{selectedAnimal.getLifeStage()}</strong>
                </div>
                <div>
                  Speed: <strong className="text-white">{selectedAnimal.baseSpeed.toFixed(1)}</strong>
                </div>
                <div>
                  Kills: <strong className="text-white">{selectedAnimal.lifetimeKills}</strong>
                </div>
                <div>
                  Distance: <strong className="text-white">{Math.round(selectedAnimal.distanceTravelled)}px</strong>
                </div>
                <div>
                  Last Meal: <strong className="text-white">{Math.round(selectedAnimal.timeSinceLastMeal)}s ago</strong>
                </div>
                <div className="truncate col-span-2">
                  Target:{" "}
                  <strong className="text-white capitalize">
                    {selectedAnimal.targetEntity 
                      ? (selectedAnimal.targetEntity.name || selectedAnimal.targetEntity.type || "seeking")
                      : "none"}
                  </strong>
                </div>
              </div>

              {/* Operations */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    selectedAnimal.hunger = 100;
                    selectedAnimal.energy = 100;
                    selectedAnimal.health = 100;
                    setTick((t) => t + 1);
                  }}
                  className="flex-1 py-1.5 bg-green-500/15 border border-green-500/20 hover:bg-green-500 hover:text-black rounded-lg text-[10px] font-heading font-bold cursor-pointer transition"
                >
                  🍒 Feed Agent
                </button>
                <button
                  onClick={() => {
                    selectedAnimal.die("Eradicated by user");
                    setSelectedAnimal(null);
                    setTrackedAnimal(null);
                    setTick((t) => t + 1);
                  }}
                  className="flex-1 py-1.5 bg-red-500/15 border border-red-500/20 hover:bg-red-500 hover:text-black rounded-lg text-[10px] font-heading font-bold cursor-pointer transition"
                >
                  💀 Terminate
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ───────── BOTTOM CONTROL PANEL: SAVE, LOAD, RESET ───────── */}
      <footer className="h-12 border-t border-white/5 bg-[#141414] px-6 flex items-center justify-between shrink-0 select-none z-20">
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to reset this world? All placed plants and animals will be lost.")) {
              handleCreateWorld(worldSize);
            }
          }}
          className="text-xs text-red-400/80 hover:text-red-400 font-heading cursor-pointer transition font-semibold"
        >
          ♻ Restart Simulation
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-5 py-1.5 bg-[#79AE6F] text-[#0c0c0c] rounded-full text-xs font-heading font-bold cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition"
          >
            💾 Save World
          </button>
          <button
            onClick={openLoadDialog}
            className="px-5 py-1.5 border border-[#79AE6F] text-[#79AE6F] hover:bg-[#79AE6F] hover:text-[#0c0c0c] rounded-full text-xs font-heading font-bold cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition"
          >
            📂 Load World
          </button>
          <button
            onClick={() => navigate("/ecosystem")}
            className="px-5 py-1.5 border border-white/10 hover:border-white/20 text-[#EEEBE4]/60 hover:text-white rounded-full text-xs font-heading font-semibold cursor-pointer transition"
          >
            Exit Workspace
          </button>
        </div>
      </footer>

      {/* ───────── SAVE DIALOG MODAL ───────── */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-neutral-900 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="font-heading font-bold text-lg text-white">Save Current World</h3>
            <p className="text-xs text-[#EEEBE4]/50 leading-relaxed font-body">
              Save your simulation state. All active animal coords, plants growth sizes, event logs, stats history charts, and times will be stored in your profile on MongoDB.
            </p>
            <input
              type="text"
              placeholder="Name your simulation save... (e.g. My Amazon forest)"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-[#79AE6F]/65 transition"
            />
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleSaveSimulation}
                className="flex-1 py-2 bg-[#79AE6F] text-[#0c0c0c] rounded-xl text-xs font-heading font-bold cursor-pointer transition"
              >
                Confirm Save
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-heading font-semibold cursor-pointer hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── LOAD DIALOG MODAL ───────── */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-neutral-900 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
            <h3 className="font-heading font-bold text-lg text-white">Load Saved Simulation</h3>
            
            {loadingSaves ? (
              <div className="py-12 flex flex-col justify-center items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#79AE6F] animate-spin" />
                <span className="text-xs text-[#EEEBE4]/40">Fetching saved simulations...</span>
              </div>
            ) : savedSimulations.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#EEEBE4]/30 border border-dashed border-white/10 rounded-2xl p-6 flex flex-col gap-2">
                <span>📁 No simulations found</span>
                <span className="text-[10px]">
                  You have not saved any {type} simulation states under this account.
                </span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[45vh] pr-1">
                {savedSimulations.map((save) => (
                  <div
                    key={save._id}
                    onClick={() => handleLoadSimulation(save._id)}
                    className="flex items-center justify-between p-3.5 bg-[#141414] hover:bg-white/5 border border-white/5 hover:border-white/15 rounded-2xl cursor-pointer transition duration-200"
                  >
                    <div>
                      <h4 className="font-heading font-bold text-xs text-white">{save.name}</h4>
                      <p className="text-[9px] text-[#EEEBE4]/40 capitalize font-medium mt-0.5">
                        Size: {save.world_size} • Saved on: {new Date(save.updated_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteSave(save._id, e)}
                      className="text-[#E55] hover:bg-red-500/10 p-1.5 rounded-lg border border-transparent hover:border-red-500/20 cursor-pointer transition text-[10px] font-heading font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex mt-2">
              <button
                onClick={() => setShowLoadModal(false)}
                className="w-full py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-heading font-semibold cursor-pointer hover:bg-white/10 transition"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
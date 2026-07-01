import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Play, Pause, RotateCcw, Search, Trash2, 
  ChevronLeft, ChevronRight, Info, AlertTriangle, BookOpen, BarChart2 
} from "lucide-react";

// ─── STYLES & THEME DEFINITIONS ──────────────────────────────────────────────
const THEMES = {
  forest: {
    bg: "linear-gradient(to bottom, #2b4c2d 0%, #132415 100%)",
    accent: "#79AE6F",
    accentGlow: "rgba(121,174,111,0.3)",
    title: "🌲 Forest Ecosystem",
    waterType: "pond",
    waterX: 80, waterY: 80,
    decorations: ["tree_pine", "tree_round", "bush", "rock", "log", "flower"]
  },
  ocean: {
    bg: "linear-gradient(to bottom, #112d42 0%, #06121c 100%)",
    accent: "#7AAACE",
    accentGlow: "rgba(122,170,206,0.3)",
    title: "🌊 Ocean Ecosystem",
    waterType: "depths", // entire canvas is water, gather at center reefs
    waterX: 50, waterY: 50,
    decorations: ["kelp", "coral_pink", "coral_orange", "reef_rock"]
  },
  desert: {
    bg: "linear-gradient(to bottom, #593e1b 0%, #211506 100%)",
    accent: "#D4A84B",
    accentGlow: "rgba(212,168,75,0.3)",
    title: "🏜️ Desert Ecosystem",
    waterType: "oasis",
    waterX: 50, waterY: 50,
    decorations: ["cactus_saguaro", "cactus_prickly", "dry_shrub", "sand_rock"]
  },
  grassland: {
    bg: "linear-gradient(to bottom, #4f4722 0%, #1c190b 100%)",
    accent: "#C8B860",
    accentGlow: "rgba(200,184,96,0.3)",
    title: "🌾 Grassland Savanna",
    waterType: "waterhole",
    waterX: 25, waterY: 75,
    decorations: ["acacia_tree", "dry_grass", "boulder", "termite_mound"]
  },
  arctic: {
    bg: "linear-gradient(to bottom, #415563 0%, #151d24 100%)",
    accent: "#9AB5CC",
    accentGlow: "rgba(154,181,204,0.3)",
    title: "❄️ Arctic Wilderness",
    waterType: "icehole",
    waterX: 75, waterY: 30,
    decorations: ["iceberg", "snow_drift", "frost_rock"]
  },
  wetland: {
    bg: "linear-gradient(to bottom, #203f33 0%, #0d1c16 100%)",
    accent: "#52A388",
    accentGlow: "rgba(82,163,136,0.3)",
    title: "🐊 Wetland Swamp",
    waterType: "swamp",
    waterX: 50, waterY: 70, // bottom half is waterlogged
    decorations: ["lilypad", "cypress_tree", "reeds", "root_log"]
  },
  mountain: {
    bg: "linear-gradient(to bottom, #42403c 0%, #1c1b19 100%)",
    accent: "#B2A69A",
    accentGlow: "rgba(178,166,154,0.3)",
    title: "⛰️ Alpine Mountain",
    waterType: "stream",
    waterX: 15, waterY: 85,
    decorations: ["pine_small", "cliff_face", "scree_pile", "alpine_flower"]
  },
  rainforest: {
    bg: "linear-gradient(to bottom, #16361a 0%, #071409 100%)",
    accent: "#4ade80",
    accentGlow: "rgba(74,222,128,0.3)",
    title: "🌳 Tropical Rainforest",
    waterType: "river",
    waterX: 50, waterY: 50,
    decorations: ["fern", "palm_tree", "kapok_tree", "vines"]
  }
};

const getAnimalEmoji = (id) => {
  const emojis = {
    wolf: "🐺", deer: "🦌", bear: "🐻", fox: "🦊", rabbit: "🐇",
    shark: "🦈", fish: "🐟", dolphin: "🐬", whale: "🐋", turtle: "🐢",
    camel: "🐪", kangaroo_rat: "🐀", scorpion: "🦂", rattlesnake: "🐍", coyote: "🦊",
    lion: "🦁", zebra: "🦓", cheetah: "🐆", bison: "🦬", elephant: "🐘",
    polar_bear: "🐻‍❄️", seal: "🦭", arctic_fox: "🦊", lemming: "🐀", snowy_owl: "🦉",
    alligator: "🐊", heron: "🪶", beaver: "🦫", frog: "🐸",
    snow_leopard: "🐆", ibex: "🐐", mountain_goat: "🏔️", marmot: "🐿️", eagle: "🦅",
    jaguar: "🐆", tapir: "🐖", sloth: "🦥", harpy_eagle: "🦅", poison_dart_frog: "🐸"
  };
  return emojis[id] || "🐾";
};

const API_BASE = "http://localhost:5000";

export default function EcosystemBuilder() {
  const { type } = useParams();
  const navigate = useNavigate();
  
  const envType = type ? type.toLowerCase() : "forest";
  const theme = THEMES[envType] || THEMES.forest;

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  
  // Simulator State variables
  const [sessionId, setSessionId] = useState(null);
  const [day, setDay] = useState(1);
  const [season, setSeason] = useState("Spring");
  const [weather, setWeather] = useState("Sunny");
  const [status, setStatus] = useState("paused");
  const [speed, setSpeed] = useState(1);
  const [health, setHealth] = useState(100);
  const [animals, setAnimals] = useState([]);
  const [learningLogs, setLearningLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [extinctList, setExtinctList] = useState([]);
  
  // Controls/UI
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDiet, setFilterDiet] = useState("All");
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [hoveredAnimal, setHoveredAnimal] = useState(null);
  const [placedIcons, setPlacedIcons] = useState([]);
  const [staticDecorations, setStaticDecorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [rightTab, setRightTab] = useState("details"); // details | learning | web
  const [attackVisuals, setAttackVisuals] = useState([]); // Array of {x, y, expiry}

  // Canvas surface boundaries
  const canvasRef = useRef(null);

  // Initialize Session
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/ecosystem/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ environment: envType })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to initialize session");
        return res.json();
      })
      .then(data => {
        setSessionId(data.session_id);
        setAnimals(data.animals);
        
        // Generate random visual decorations for this ecosystem
        const decs = [];
        for (let i = 0; i < 18; i++) {
          const typeDec = theme.decorations[i % theme.decorations.length];
          decs.push({
            id: i,
            type: typeDec,
            x: 8 + Math.random() * 84, // 8% to 92%
            y: 8 + Math.random() * 84,
            scale: 0.75 + Math.random() * 0.5
          });
        }
        setStaticDecorations(decs);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setErrorMsg("Failed to start session. Ensure the Python Flask server runs on port 5000.");
        setLoading(false);
      });
  }, [envType]);

  // Polling simulation ticks
  useEffect(() => {
    if (status !== "running" || !sessionId) return;

    const interval = setInterval(() => {
      fetch(`${API_BASE}/simulation/status?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setDay(data.day);
          setSeason(data.season);
          setWeather(data.weather);
          setHealth(data.health);
          setAnimals(data.animals);
          setLearningLogs(data.learning_logs);
          setNotifications(data.notifications);
          setExtinctList(data.extinct_species || []);
        })
        .catch(err => console.error("Status check fail:", err));

      fetch(`${API_BASE}/simulation/stats?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setHistory(data.history || []);
        })
        .catch(err => console.error("Stats check fail:", err));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, sessionId]);

  // Sync canvas wanderers with population cohorts
  useEffect(() => {
    setPlacedIcons(prev => {
      const updated = [...prev];
      animals.forEach(a => {
        const currentCount = updated.filter(i => i.animalId === a.id).length;
        const targetCount = a.population;

        if (currentCount < targetCount) {
          // Spawn new animals
          const diff = targetCount - currentCount;
          const maxSpawn = Math.min(diff, 18 - currentCount); // Cap icons to prevent canvas lag
          for (let i = 0; i < maxSpawn; i++) {
            const ageGroup = i % 3 === 0 ? "Juvenile" : i % 3 === 1 ? "Adult" : "Elder";
            updated.push({
              id: a.id + "_" + Math.random(),
              animalId: a.id,
              name: a.name,
              diet: a.diet,
              emoji: getAnimalEmoji(a.id),
              prey: a.prey || [],
              predators: a.predators || [],
              ageGroup: ageGroup,
              x: 10 + Math.random() * 80,
              y: 10 + Math.random() * 80,
              vx: (Math.random() - 0.5) * 0.3,
              vy: (Math.random() - 0.5) * 0.3,
              state: "wandering", // wandering, seeking_water, chasing, fleeing, resting
              stateTimer: 0,
              actionEmoji: ""
            });
          }
        } else if (currentCount > targetCount) {
          // Despawn excess
          const diff = currentCount - targetCount;
          let removed = 0;
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].animalId === a.id) {
              updated.splice(i, 1);
              removed++;
              if (removed >= diff) break;
            }
          }
        }
      });
      return updated;
    });
  }, [animals]);

  // AI Steering and Physics Animation Loop
  useEffect(() => {
    let frameId;
    const updatePhysics = () => {
      // Clean expired attack flashes
      const nowMs = Date.now();
      setAttackVisuals(prev => prev.filter(v => v.expiry > nowMs));

      setPlacedIcons(prev => {
        const updated = prev.map(icon => {
          let nx = icon.x + icon.vx;
          let ny = icon.y + icon.vy;
          let nvx = icon.vx;
          let nvy = icon.vy;
          let currentState = icon.state;
          let stateTimer = icon.stateTimer - 1;
          let actionEmoji = icon.actionEmoji;

          // state machine checks
          if (stateTimer <= 0) {
            stateTimer = 50 + Math.floor(Math.random() * 100); // Reset timer
            // Check needs
            const meta = animals.find(a => a.id === icon.animalId);
            const energy = meta ? meta.energy : 80;

            if (energy < 40 && Math.random() < 0.4) {
              currentState = "resting";
              actionEmoji = "💤";
              stateTimer = 60; // rest for 60 frames
            } else if (energy < 75 && Math.random() < 0.5 && theme.waterType !== "depths") {
              currentState = "seeking_water";
              actionEmoji = "💧";
            } else if (icon.diet === "Carnivore" && Math.random() < 0.6) {
              currentState = "chasing";
              actionEmoji = "⚔️";
            } else {
              currentState = "wandering";
              actionEmoji = "";
            }
          }

          // Apply behaviors
          if (currentState === "resting") {
            nvx = 0;
            nvy = 0;
          } else if (currentState === "seeking_water") {
            // Steering force toward waterhole coordinates
            const dx = theme.waterX - icon.x;
            const dy = theme.waterY - icon.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 3) {
              nvx += (dx / dist) * 0.03;
              nvy += (dy / dist) * 0.03;
            } else {
              // Arrived at water! Drink and exit seeking
              currentState = "wandering";
              actionEmoji = "💧";
              stateTimer = 30; // show drinking emoji
            }
          } else if (currentState === "chasing") {
            // Find closest active prey icon
            const preys = prev.filter(p => icon.prey.includes(p.animalId) && p.state !== "resting");
            if (preys.length > 0) {
              let closestPrey = null;
              let minDist = 999;
              preys.forEach(p => {
                const dx = p.x - icon.x;
                const dy = p.y - icon.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < minDist) {
                  minDist = d;
                  closestPrey = p;
                }
              });

              if (closestPrey && minDist < 25) {
                // Steer toward prey
                const dx = closestPrey.x - icon.x;
                const dy = closestPrey.y - icon.y;
                nvx += (dx / minDist) * 0.04;
                nvy += (dy / minDist) * 0.04;

                // Check catch distance (under 2.5%)
                if (minDist < 2.5) {
                  // Trigger attack clash
                  setAttackVisuals(visuals => [
                    ...visuals,
                    { x: closestPrey.x, y: closestPrey.y, expiry: Date.now() + 800 }
                  ]);
                  // Shift states
                  currentState = "wandering";
                  actionEmoji = "🍖";
                  stateTimer = 40;
                }
              } else {
                currentState = "wandering";
                actionEmoji = "";
              }
            } else {
              currentState = "wandering";
              actionEmoji = "";
            }
          } else if (currentState === "fleeing") {
            // Steer away from closest predator
            const predators = prev.filter(p => p.prey.includes(icon.animalId));
            if (predators.length > 0) {
              let closestPred = null;
              let minDist = 999;
              predators.forEach(p => {
                const dx = p.x - icon.x;
                const dy = p.y - icon.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < minDist) {
                  minDist = d;
                  closestPred = p;
                }
              });

              if (closestPred && minDist < 15) {
                // Steer opposite
                const dx = icon.x - closestPred.x;
                const dy = icon.y - closestPred.y;
                nvx += (dx / minDist) * 0.05;
                nvy += (dy / minDist) * 0.05;
              } else {
                currentState = "wandering";
                actionEmoji = "";
              }
            } else {
              currentState = "wandering";
              actionEmoji = "";
            }
          } else {
            // Wandering/Flocking force
            // Pack cohesion for wolves and herd for deer
            if (icon.animalId === "wolf" || icon.animalId === "coyote") {
              // Pack cohesion: steer towards pack centroid
              const pack = prev.filter(p => p.animalId === icon.animalId && p.id !== icon.id);
              if (pack.length > 0) {
                let cx = 0; let cy = 0;
                pack.forEach(p => { cx += p.x; cy += p.y; });
                cx /= pack.length; cy /= pack.length;
                const dx = cx - icon.x; const dy = cy - icon.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 5) {
                  nvx += (dx / dist) * 0.015;
                  nvy += (dy / dist) * 0.015;
                }
              }
            } else if (icon.animalId === "deer" || icon.animalId === "zebra" || icon.animalId === "fish") {
              // Schooling/Herd: keep close distance but avoid colliding
              const neighbors = prev.filter(n => n.animalId === icon.animalId && n.id !== icon.id);
              let sx = 0; let sy = 0;
              neighbors.forEach(n => {
                const dx = icon.x - n.x;
                const dy = icon.y - n.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 5 && dist > 0.1) {
                  sx += (dx / dist) * 0.025;
                  sy += (dy / dist) * 0.025;
                }
              });
              nvx += sx; nvy += sy;
            }

            // Normal random wander walk
            if (Math.random() < 0.05) {
              nvx += (Math.random() - 0.5) * 0.1;
              nvy += (Math.random() - 0.5) * 0.1;
            }
          }

          // Speed limiters
          const currentSpeed = Math.sqrt(nvx * nvx + nvy * nvy);
          let speedLimit = 0.35;
          if (icon.ageGroup === "Elder") speedLimit = 0.22; // Elders move slower
          if (icon.ageGroup === "Juvenile") speedLimit = 0.30;
          if (currentState === "chasing" || currentState === "fleeing") speedLimit *= 1.5; // Sprint

          if (currentSpeed > speedLimit) {
            nvx = (nvx / currentSpeed) * speedLimit;
            nvy = (nvy / currentSpeed) * speedLimit;
          }

          // Boundary constraints (bounce)
          if (nx < 8 || nx > 92) {
            nvx = -nvx;
            nx = Math.max(8, Math.min(92, nx));
          }
          if (ny < 8 || ny > 92) {
            nvy = -nvy;
            ny = Math.max(8, Math.min(92, ny));
          }

          return { 
            ...icon, 
            x: nx, y: ny, 
            vx: nvx, vy: nvy, 
            state: currentState, 
            stateTimer: stateTimer,
            actionEmoji: actionEmoji
          };
        });

        // Trigger fleeing behaviors dynamically on close range predators
        return updated.map(icon => {
          if (icon.diet === "Herbivore" && icon.state !== "resting") {
            const danger = updated.some(p => p.diet === "Carnivore" && p.state === "chasing" && Math.sqrt(Math.pow(p.x - icon.x, 2) + Math.pow(p.y - icon.y, 2)) < 12);
            if (danger) {
              return { ...icon, state: "fleeing", stateTimer: 30, actionEmoji: "🏃" };
            }
          }
          return icon;
        });
      });

      frameId = requestAnimationFrame(updatePhysics);
    };

    frameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(frameId);
  }, [animals]);

  // API Call wrapper triggers
  const handleStart = (newSpeed = speed) => {
    if (!sessionId) return;
    setStatus("running");
    setSpeed(newSpeed);
    fetch(`${API_BASE}/simulation/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, speed: newSpeed })
    }).catch(err => console.error(err));
  };

  const handlePause = () => {
    if (!sessionId) return;
    setStatus("paused");
    fetch(`${API_BASE}/simulation/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId })
    }).catch(err => console.error(err));
  };

  const handleReset = () => {
    if (!sessionId) return;
    setStatus("paused");
    fetch(`${API_BASE}/simulation/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId })
    })
      .then(res => res.json())
      .then(data => {
        setDay(data.day);
        setSeason(data.season);
        setHealth(data.health);
        setAnimals(data.animals);
        setLearningLogs(data.learning_logs);
        setNotifications(data.notifications);
        setHistory([]);
        setExtinctList(data.extinct_species || []);
      })
      .catch(err => console.error(err));
  };

  const handleSetPopulation = (animalId, newPop) => {
    if (!sessionId) return;
    fetch(`${API_BASE}/ecosystem/add-animal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        animal_id: animalId,
        population: newPop
      })
    })
      .then(res => res.json())
      .then(data => {
        setAnimals(data.animals);
        setHealth(data.health);
      })
      .catch(err => console.error(err));
  };

  // Filtered lists
  const filteredAnimals = animals.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiet = filterDiet === "All" || a.diet === filterDiet;
    return matchesSearch && matchesDiet;
  });

  const activeAnimal = animals.find(a => a.id === selectedAnimalId);

  // SVG Chart Render Helpers
  const renderLineChart = () => {
    if (history.length < 2) {
      return <div className="flex items-center justify-center h-full text-[10px] text-[#EEEBE4]/30">Accumulating history ticks...</div>;
    }

    const margin = { top: 12, right: 10, bottom: 20, left: 32 };
    const width = 360;
    const height = 110;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxDay = Math.max(...history.map(d => d.day), 15);
    const allPops = history.flatMap(hPoint => Object.values(hPoint.species || {}));
    const maxPop = Math.max(...allPops, 25);

    const getX = (d) => margin.left + ((d - 1) / (maxDay - 1)) * chartWidth;
    const getY = (val) => margin.top + chartHeight - (val / maxPop) * chartHeight;

    const speciesIds = Object.keys(history[0].species || {});
    const colors = ["#79AE6F", "#7AAACE", "#D4A84B", "#E07050", "#B2A69A", "#4ade80", "#C8B860"];

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
          <line
            key={idx}
            x1={margin.left}
            y1={margin.top + p * chartHeight}
            x2={width - margin.right}
            y2={margin.top + p * chartHeight}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="2 2"
          />
        ))}

        {speciesIds.map((sid, sIdx) => {
          let pathD = "";
          history.forEach((hPoint, idx) => {
            const val = hPoint.species[sid] || 0;
            const x = getX(hPoint.day);
            const y = getY(val);
            if (idx === 0) pathD = `M ${x} ${y}`;
            else pathD += ` L ${x} ${y}`;
          });

          const color = colors[sIdx % colors.length];
          return (
            <g key={sid}>
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 2px 4px ${color}20)` }}
              />
            </g>
          );
        })}

        <line x1={margin.left} y1={margin.top + chartHeight} x2={width - margin.right} y2={margin.top + chartHeight} stroke="rgba(255,255,255,0.12)" />
        <text x={margin.left - 5} y={margin.top + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="7">{maxPop}</text>
        <text x={margin.left - 5} y={margin.top + chartHeight} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="7">0</text>
        <text x={margin.left} y={height - 2} fill="rgba(255,255,255,0.25)" fontSize="7">Day 1</text>
        <text x={width - margin.right} y={height - 2} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="7">Day {maxDay}</text>
      </svg>
    );
  };

  const renderBarChart = () => {
    const activeSpecies = animals.filter(a => a.population > 0);
    if (activeSpecies.length === 0) {
      return <div className="flex items-center justify-center h-full text-[10px] text-[#EEEBE4]/30">Ecosystem unpopulated.</div>;
    }

    const maxVal = Math.max(...activeSpecies.map(a => a.population), 10);
    const colors = ["#79AE6F", "#7AAACE", "#D4A84B", "#E07050", "#B2A69A"];

    return (
      <div className="flex items-end justify-around h-[80px] px-2 pt-2">
        {activeSpecies.map((a, idx) => {
          const pct = (a.population / maxVal) * 80;
          const color = colors[idx % colors.length];
          return (
            <div key={a.id} className="flex flex-col items-center w-8">
              <span className="text-[8px] font-semibold mb-0.5 text-white/50">{a.population}</span>
              <div 
                className="w-3 rounded-t-sm transition-all duration-500" 
                style={{ 
                  height: `${pct}%`, 
                  background: `linear-gradient(to top, ${color}20, ${color})`,
                  border: `1px solid ${color}35`
                }}
              />
              <span className="text-[10px] mt-1">{getAnimalEmoji(a.id)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDonutChart = () => {
    let carn = 0; let herb = 0; let omni = 0;
    animals.forEach(a => {
      if (a.diet === "Carnivore") carn += a.population;
      else if (a.diet === "Herbivore" || a.diet === "Filter Feeder") herb += a.population;
      else if (a.diet === "Omnivore") omni += a.population;
    });

    const total = carn + herb + omni;
    if (total === 0) {
      return <div className="flex items-center justify-center h-full text-[10px] text-[#EEEBE4]/30">Populate species for diet metrics.</div>;
    }

    const r = 22;
    const circ = 2 * Math.PI * r;
    const herbPct = (herb / total) * 100;
    const omniPct = (omni / total) * 100;
    const carnPct = (carn / total) * 100;

    return (
      <div className="flex items-center gap-2 h-full px-1">
        <svg viewBox="0 0 60 60" className="w-14 h-14 transform -rotate-90">
          <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle cx="30" cy="30" r={r} fill="none" stroke="#79AE6F" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - (herbPct / 100) * circ} className="transition-all duration-700" />
          <circle cx="30" cy="30" r={r} fill="none" stroke="#D4A84B" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - (omniPct / 100) * circ} transform={`rotate(${(herbPct / 100) * 360} 30 30)`} className="transition-all duration-700" />
          <circle cx="30" cy="30" r={r} fill="none" stroke="#E07050" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - (carnPct / 100) * circ} transform={`rotate(${((herbPct + omniPct) / 100) * 360} 30 30)`} className="transition-all duration-700" />
        </svg>

        <div className="flex flex-col gap-0.5 text-[8.5px]">
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#79AE6F]" /><span className="text-white/60">Herb ({Math.round(herbPct)}%)</span></div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#D4A84B]" /><span className="text-white/60">Omni ({Math.round(omniPct)}%)</span></div>
          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#E07050]" /><span className="text-white/60">Carn ({Math.round(carnPct)}%)</span></div>
        </div>
      </div>
    );
  };

  const getHealthColor = (score) => {
    if (score >= 85) return "#79AE6F"; // Excellent
    if (score >= 65) return "#7AAACE"; // Healthy
    if (score >= 45) return "#C8B860"; // Moderate
    if (score >= 25) return "#C4956A"; // Unstable
    return "#E07050"; // Collapsed
  };

  const getHealthLabel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 65) return "Healthy";
    if (score >= 45) return "Moderate";
    if (score >= 25) return "Unstable";
    return "Collapsed";
  };

  const getWeatherIcon = (w) => {
    const icons = {
      Sunny: "☀️", Rain: "🌧️", Storm: "⛈️", Snow: "❄️", Heatwave: "🌡️", Drought: "🏜️"
    };
    return icons[w] || "☀️";
  };

  // Render SVG Node-and-Link Food Web Diagram
  const renderFoodWeb = () => {
    const carnivores = animals.filter(a => a.diet === "Carnivore" || (a.diet === "Omnivore" && a.prey.length > 0));
    const herbivores = animals.filter(a => a.diet === "Herbivore" || a.diet === "Filter Feeder");
    
    // Y coordinates: Top = 15, Middle = 60, Bottom = 105
    const width = 280;
    const height = 150;

    // Distribute X coordinates
    const getX = (idx, total) => {
      if (total <= 1) return width / 2;
      const step = (width - 40) / (total - 1);
      return 20 + idx * step;
    };

    // Construct Node layout positions
    const nodes = [];
    
    // Add Plants base node
    nodes.push({ id: "plants", name: "Plants/Plankton", emoji: "🌱", x: width / 2, y: 110, isExtinct: false });

    // Add Herbivores
    herbivores.forEach((h, idx) => {
      nodes.push({ 
        id: h.id, 
        name: h.name, 
        emoji: getAnimalEmoji(h.id), 
        x: getX(idx, herbivores.length), 
        y: 65,
        isExtinct: h.population === 0
      });
    });

    // Add Predators
    carnivores.forEach((c, idx) => {
      nodes.push({ 
        id: c.id, 
        name: c.name, 
        emoji: getAnimalEmoji(c.id), 
        x: getX(idx, carnivores.length), 
        y: 20,
        isExtinct: c.population === 0
      });
    });

    // Node coordinate map
    const nodeCoords = {};
    nodes.forEach(n => { nodeCoords[n.id] = { x: n.x, y: n.y, isExtinct: n.isExtinct }; });

    // Draw Links
    const links = [];
    animals.forEach(pred => {
      if (pred.diet === "Carnivore" || (pred.diet === "Omnivore" && pred.prey.length > 0)) {
        pred.prey.forEach(pId => {
          if (nodeCoords[pred.id] && nodeCoords[pId]) {
            links.push({
              id: `${pId}_to_${pred.id}`,
              from: nodeCoords[pId],
              to: nodeCoords[pred.id],
              isBroken: nodeCoords[pId].isExtinct || nodeCoords[pred.id].isExtinct
            });
          }
        });
      } else if (pred.diet === "Herbivore" || pred.diet === "Filter Feeder") {
        if (nodeCoords[pred.id]) {
          links.push({
            id: `plants_to_${pred.id}`,
            from: nodeCoords["plants"],
            to: nodeCoords[pred.id],
            isBroken: nodeCoords[pred.id].isExtinct
          });
        }
      }
    });

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full border border-white/5 bg-black/35 rounded-2xl overflow-visible p-2">
        {/* Draw Link lines */}
        {links.map(l => (
          <line
            key={l.id}
            x1={l.from.x}
            y1={l.from.y}
            x2={l.to.x}
            y2={l.to.y}
            stroke={l.isBroken ? "rgba(224,64,64,0.3)" : "rgba(121,174,111,0.4)"}
            strokeDasharray={l.isBroken ? "3 3" : "none"}
            strokeWidth="1.2"
          />
        ))}

        {/* Draw Node circles */}
        {nodes.map(n => (
          <g key={n.id} transform={`translate(${n.x}, ${n.y})`} className="cursor-default">
            <circle
              r="10"
              fill={n.isExtinct ? "#222" : "rgba(255,255,255,0.06)"}
              stroke={n.isExtinct ? "#E04040" : "rgba(255,255,255,0.15)"}
              strokeWidth="1.2"
            />
            {/* Emoji */}
            <text textAnchor="middle" y="3.5" fontSize="10">{n.isExtinct ? "☠" : n.emoji}</text>
            
            {/* Hover name text */}
            <text 
              textAnchor="middle" 
              y={n.y > 70 ? "17" : "-13"} 
              fontSize="6" 
              fill={n.isExtinct ? "#888" : "#ccc"} 
              className="font-bold opacity-0 hover:opacity-100 transition-opacity"
            >
              {n.name}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Render SVG dynamic visual decorations based on type
  const renderTerrainDecoration = (dec) => {
    const scale = dec.scale || 1.0;
    
    // Pine tree SVG
    if (dec.type === "tree_pine" || dec.type === "pine_small" || dec.type === "cypress_tree") {
      return (
        <svg viewBox="0 0 30 50" className="w-8 h-10 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <polygon points="15,5 3,25 27,25" fill="#1e3f20" />
          <polygon points="15,15 5,35 25,35" fill="#2d5e30" />
          <polygon points="15,25 7,45 23,45" fill="#3c7d40" />
          <rect x="13" y="45" width="4" height="5" fill="#5c4033" />
        </svg>
      );
    }

    // Round tree SVG
    if (dec.type === "tree_round" || dec.type === "acacia_tree" || dec.type === "kapok_tree") {
      return (
        <svg viewBox="0 0 40 50" className="w-10 h-12 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <circle cx="20" cy="20" r="14" fill="#387a3b" />
          <circle cx="14" cy="16" r="8" fill="#4fa353" />
          <circle cx="26" cy="18" r="9" fill="#2c5c2e" />
          <rect x="18" y="34" width="4" height="16" fill="#4d321d" />
        </svg>
      );
    }

    // Palm tree SVG
    if (dec.type === "palm_tree") {
      return (
        <svg viewBox="0 0 40 60" className="w-12 h-16 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <path d="M 18,60 Q 22,30 20,15" fill="none" stroke="#5d4037" strokeWidth="4" strokeLinecap="round" />
          <path d="M 20,15 Q 10,12 2,20 M 20,15 Q 30,12 38,20 M 20,15 Q 15,5 12,0 M 20,15 Q 25,5 28,0" fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    }

    // Cactus Saguaro SVG
    if (dec.type === "cactus_saguaro") {
      return (
        <svg viewBox="0 0 20 40" className="w-6 h-10 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <rect x="8" y="5" width="4" height="35" rx="2" fill="#325a2e" />
          <path d="M 8,20 H 4 V 12" fill="none" stroke="#325a2e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 12,25 H 16 V 17" fill="none" stroke="#325a2e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    // Cactus Prickly Pear SVG
    if (dec.type === "cactus_prickly") {
      return (
        <svg viewBox="0 0 30 30" className="w-8 h-8 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <ellipse cx="15" cy="22" rx="6" ry="8" fill="#2e7d32" />
          <ellipse cx="9" cy="14" rx="4" ry="6" fill="#388e3c" transform="rotate(-20 9 14)" />
          <ellipse cx="21" cy="15" rx="4" ry="5" fill="#388e3c" transform="rotate(25 21 15)" />
          <circle cx="8" cy="8" r="1.5" fill="#e91e63" />
          <circle cx="23" cy="10" r="1.5" fill="#e91e63" />
        </svg>
      );
    }

    // Dry Shrub
    if (dec.type === "dry_shrub") {
      return (
        <svg viewBox="0 0 35 30" className="w-8 h-8 overflow-visible animate-pulse" style={{ transform: `scale(${scale})`, animationDuration: "5s" }}>
          <path d="M 5,28 Q 15,15 10,5 M 15,28 Q 10,12 25,8 M 25,28 Q 20,18 30,12 M 18,28 Q 18,5 15,2" fill="none" stroke="#8b5a2b" strokeWidth="1.5" />
        </svg>
      );
    }

    // Rock/Boulder
    if (
      dec.type === "rock" || 
      dec.type === "sand_rock" || 
      dec.type === "boulder" || 
      dec.type === "cliff_face" || 
      dec.type === "scree_pile" || 
      dec.type === "frost_rock" ||
      dec.type === "reef_rock"
    ) {
      let color = "#555";
      if (dec.type === "sand_rock") color = "#8c6f4a";
      else if (dec.type === "frost_rock") color = "#cbd2d6";
      else if (dec.type === "boulder") color = "#6d6d6d";
      else if (dec.type === "reef_rock") color = "#3d4c5c";
      
      return (
        <svg viewBox="0 0 30 20" className="w-6 h-5 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <polygon points="3,18 8,5 18,3 27,18" fill={color} />
          <polygon points="7,18 12,9 22,8 26,18" fill="rgba(255,255,255,0.08)" />
        </svg>
      );
    }

    // Kelp/Seaweed (swinging using CSS)
    if (dec.type === "kelp") {
      return (
        <svg viewBox="0 0 20 60" className="w-4 h-12 overflow-visible origin-bottom animate-pulse" style={{ transform: `scale(${scale})`, animationDuration: "3.5s" }}>
          <path d="M 10,60 Q 5,45 10,30 T 10,0" fill="none" stroke="#2c7c59" strokeWidth="3" strokeLinecap="round" />
          <path d="M 10,50 Q 15,38 10,25" fill="none" stroke="#1e543c" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    }

    // Corals
    if (dec.type === "coral_pink" || dec.type === "coral_orange") {
      const color = dec.type === "coral_pink" ? "#e56b6f" : "#e07a5f";
      return (
        <svg viewBox="0 0 30 30" className="w-6 h-6 overflow-visible origin-bottom" style={{ transform: `scale(${scale})` }}>
          <path d="M 15,30 V 15 M 15,20 H 7 V 10 M 15,15 H 23 V 8" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    }

    // Fallen Log / Swamp Root Log
    if (dec.type === "log" || dec.type === "root_log") {
      const color = dec.type === "root_log" ? "#2d1a10" : "#5c4033";
      return (
        <svg viewBox="0 0 40 20" className="w-10 h-5 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <path d="M 5,10 C 15,5 25,5 35,10 L 33,16 C 25,12 15,12 7,16 Z" fill={color} />
          <ellipse cx="5" cy="13" rx="2" ry="3" fill="#3e2723" />
          <ellipse cx="35" cy="13" rx="2" ry="3" fill="#795548" />
        </svg>
      );
    }

    // Flower / Alpine Flower
    if (dec.type === "flower" || dec.type === "alpine_flower") {
      const color = dec.type === "alpine_flower" ? "#81d4fa" : "#e91e63";
      return (
        <svg viewBox="0 0 20 30" className="w-5 h-8 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <line x1="10" y1="30" x2="10" y2="12" stroke="#4caf50" strokeWidth="2" />
          <circle cx="10" cy="12" r="4" fill="#ffeb3b" />
          <circle cx="6" cy="12" r="3" fill={color} />
          <circle cx="14" cy="12" r="3" fill={color} />
          <circle cx="10" cy="8" r="3" fill={color} />
          <circle cx="10" cy="16" r="3" fill={color} />
        </svg>
      );
    }

    // Lilypad
    if (dec.type === "lilypad") {
      return (
        <svg viewBox="0 0 20 20" className="w-6 h-6 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <path d="M 10,10 L 18,6 A 9,9 0 1,1 18,14 Z" fill="#2e7d32" opacity="0.85" />
          <circle cx="12" cy="7" r="1.5" fill="#f8bbd0" />
        </svg>
      );
    }

    // Reeds
    if (dec.type === "reeds") {
      return (
        <svg viewBox="0 0 20 40" className="w-5 h-10 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <path d="M 5,40 Q 3,25 7,10 M 10,40 Q 12,20 8,5 M 15,40 Q 13,30 16,15" fill="none" stroke="#558b2f" strokeWidth="1.8" />
          <path d="M 7,10 L 7,16 M 8,5 L 8,13 M 16,15 L 16,21" stroke="#8d6e63" strokeWidth="2.2" />
        </svg>
      );
    }

    // Dry Grass
    if (dec.type === "dry_grass") {
      return (
        <svg viewBox="0 0 20 30" className="w-5 h-8 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <path d="M 3,30 Q 1,15 8,5 M 10,30 Q 11,10 15,3 M 17,30 Q 14,20 12,8" fill="none" stroke="#c8b860" strokeWidth="1.5" />
        </svg>
      );
    }

    // Termite Mound
    if (dec.type === "termite_mound") {
      return (
        <svg viewBox="0 0 30 40" className="w-8 h-10 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <path d="M 5,40 C 5,30 10,10 15,5 C 20,10 25,30 25,40 Z" fill="#a0522d" />
          <path d="M 10,40 C 11,35 13,20 15,18 C 17,20 19,35 20,40 Z" fill="#8b4513" />
        </svg>
      );
    }

    // Iceberg
    if (dec.type === "iceberg") {
      return (
        <svg viewBox="0 0 50 40" className="w-12 h-10 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <polygon points="5,38 15,10 32,5 45,38" fill="#e0f7fa" stroke="#b2ebf2" strokeWidth="1" />
          <polygon points="15,38 25,12 32,5 45,38" fill="#ffffff" opacity="0.65" />
        </svg>
      );
    }

    // Snow Drift
    if (dec.type === "snow_drift") {
      return (
        <svg viewBox="0 0 40 15" className="w-10 h-4 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <path d="M 0,15 Q 15,3 30,10 T 40,15 Z" fill="#ffffff" opacity="0.85" />
        </svg>
      );
    }

    // Fern
    if (dec.type === "fern") {
      return (
        <svg viewBox="0 0 30 30" className="w-8 h-8 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <path d="M 15,30 Q 15,15 5,5 M 15,30 Q 16,16 25,8 M 15,30 Q 10,20 3,15 M 15,30 Q 20,20 27,15" fill="none" stroke="#1b5e20" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    }

    // Vines
    if (dec.type === "vines") {
      return (
        <svg viewBox="0 0 20 40" className="w-6 h-12 overflow-visible" style={{ transform: `scale(${scale})` }}>
          <path d="M 10,0 Q 5,15 15,25 T 10,40" fill="none" stroke="#1b5e20" strokeWidth="1.5" />
          <circle cx="6" cy="10" r="2" fill="#2e7d32" />
          <circle cx="14" cy="20" r="2.5" fill="#388e3c" />
        </svg>
      );
    }

    // General Bush/Scrub
    return (
      <svg viewBox="0 0 20 20" className="w-6 h-6 overflow-visible" style={{ transform: `scale(${scale})` }}>
        <circle cx="10" cy="10" r="8" fill="rgba(121,174,111,0.25)" />
        <circle cx="7" cy="9" r="5" fill="rgba(121,174,111,0.35)" />
      </svg>
    );
  };

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-[#EEEBE4] flex items-center justify-center p-6">
        <div className="p-8 rounded-3xl border border-red-500/20 bg-neutral-900/40 backdrop-blur-md max-w-md text-center">
          <AlertTriangle className="mx-auto w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-xl font-heading font-bold mb-2">Backend Connection Error</h2>
          <p className="text-sm opacity-60 mb-6">{errorMsg}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-400/20 border border-red-400/40 text-red-300 rounded-full text-xs font-semibold hover:bg-red-400/30 transition">Retry Connection</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-[#EEEBE4] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#79AE6F]/20 border-t-[#79AE6F] rounded-full animate-spin" />
          <p className="font-heading text-xs uppercase tracking-widest opacity-60 mt-2">Loading advanced simulator...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col pt-20 overflow-hidden text-[#EEEBE4] bg-[#0c0c0c]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Dynamic weather animations overlays */}
      <style>{`
        .glass-card { background: rgba(20, 20, 20, 0.65); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .canvas-bg { background: ${theme.bg}; }
        .grid-overlay { background-image: linear-gradient(${theme.grid || "rgba(255,255,255,0.02)"} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid || "rgba(255,255,255,0.02)"} 1px, transparent 1px); background-size: 32px 32px; }
        
        /* Weather Overlays */
        .weather-rain-overlay {
          background: linear-gradient(to bottom, rgba(20,40,80,0.1), rgba(0,0,0,0.0));
          pointer-events: none;
        }
        .weather-rain-overlay::after {
          content: ""; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: rainFalling 0.8s linear infinite;
        }
        @keyframes rainFalling {
          0% { background-position: 0px 0px; }
          100% { background-position: 20px 200px; }
        }

        .weather-snow-overlay::after {
          content: ""; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: snowFalling 3.5s linear infinite;
        }
        @keyframes snowFalling {
          0% { background-position: 0px 0px; }
          100% { background-position: 50px 150px; }
        }

        .weather-haze-overlay {
          animation: heatDistortion 3s ease-in-out infinite alternate;
          filter: blur(0.3px);
          pointer-events: none;
        }
        @keyframes heatDistortion {
          0% { transform: scale(1.0); filter: skewX(0deg) blur(0.3px); }
          100% { transform: scale(1.01); filter: skewX(1.5deg) blur(0.5px); }
        }

        /* Leaves falling */
        .leaves-overlay::after {
          content: "🍂"; position: absolute; font-size: 10px; opacity: 0.15;
          animation: leavesDrift 8s linear infinite;
          top: -20px; left: 30%;
        }
        @keyframes leavesDrift {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          100% { transform: translateY(400px) translateX(80px) rotate(360deg); opacity: 0; }
        }

        /* Forest Light Rays */
        .forest-light-rays {
          background: repeating-linear-gradient(
            -45deg,
            rgba(255, 253, 220, 0.12) 0px,
            rgba(255, 253, 220, 0.12) 40px,
            transparent 40px,
            transparent 120px
          );
          filter: blur(8px);
          animation: lightRaysMove 8s ease-in-out infinite alternate;
        }
        @keyframes lightRaysMove {
          0% { transform: translateY(-10px) translateX(-10px); opacity: 0.15; }
          100% { transform: translateY(10px) translateX(10px); opacity: 0.3; }
        }

        /* Morning Fog */
        .morning-fog {
          background: linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 100%);
          filter: blur(15px);
          animation: fogDrift 20s linear infinite;
          transform: scale(1.5);
        }
        @keyframes fogDrift {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        /* Underwater Light Caustics */
        .ocean-caustics {
          background: repeating-linear-gradient(
            25deg,
            rgba(122, 170, 206, 0.08) 0px,
            rgba(122, 170, 206, 0.08) 30px,
            transparent 30px,
            transparent 90px
          );
          filter: blur(8px);
          animation: causticsWiggle 4s ease-in-out infinite alternate;
        }
        @keyframes causticsWiggle {
          0% { transform: scale(1) rotate(0deg); opacity: 0.2; }
          100% { transform: scale(1.05) rotate(2deg); opacity: 0.4; }
        }

        /* Bubbles */
        .bubble-particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          border: 0.5px solid rgba(255, 255, 255, 0.3);
          bottom: -15px;
          animation: bubbleRise 6s infinite linear;
          pointer-events: none;
        }
        @keyframes bubbleRise {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-450px) translateX(25px) scale(1.2); opacity: 0; }
        }

        /* Currents */
        .ocean-current {
          position: absolute;
          height: 1.5px;
          background: linear-gradient(to right, transparent, rgba(122, 170, 206, 0.25), transparent);
          width: 180px;
          animation: currentFlow 8s infinite linear;
          pointer-events: none;
        }
        @keyframes currentFlow {
          0% { left: -200px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }

        /* Wind-blown Sand */
        .sand-dust-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(212, 168, 75, 0.25);
          border-radius: 50%;
          animation: sandDrift 4s infinite linear;
          pointer-events: none;
        }
        @keyframes sandDrift {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translate(450px, 40px) scale(1.5); opacity: 0; }
        }

        /* Heat Haze */
        .desert-heat-haze {
          animation: heatDistortion 2.5s ease-in-out infinite alternate;
          filter: blur(0.2px);
          pointer-events: none;
        }

        /* Snowflake particles */
        .snow-particle {
          position: absolute;
          background: #fff;
          border-radius: 50%;
          animation: snowFall 6s infinite linear;
          pointer-events: none;
        }
        @keyframes snowFall {
          0% { transform: translate(0, -10px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translate(120px, 450px) rotate(360deg); opacity: 0; }
        }

        /* Fireflies for Wetland/Swamp */
        .swamp-firefly {
          position: absolute;
          width: 3.5px;
          height: 3.5px;
          border-radius: 50%;
          background: #d4e157;
          box-shadow: 0 0 5px #d4e157;
          animation: fireflyGlow 6s infinite ease-in-out;
          pointer-events: none;
        }
        @keyframes fireflyGlow {
          0%, 100% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          50% { opacity: 0.9; transform: translate(20px, -20px) scale(1.2); }
        }

        /* Mountain Mist */
        .mountain-mist {
          background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%);
          filter: blur(15px);
          animation: mistDrift 15s linear infinite;
          pointer-events: none;
        }
        @keyframes mistDrift {
          0% { transform: translateX(-10%) translateY(0); }
          50% { transform: translateX(10%) translateY(-5px); }
          100% { transform: translateX(-10%) translateY(0); }
        }
      `}</style>

      {/* ───────── TOP CONTROLS BAR ───────── */}
      <header className="flex flex-col md:flex-row items-center justify-between px-6 py-3.5 glass-card border-b border-white/5 z-20 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/ecosystem")}
            className="p-2.5 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-heading font-bold flex items-center gap-2">
              {theme.title}
            </h1>
            <p className="text-[9px] uppercase tracking-widest text-white/40">
              Interactive Living Sandbox Simulator
            </p>
          </div>
        </div>

        {/* Dynamic Weather & Season display widgets */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02]">
            <span className="text-xs">{getWeatherIcon(weather)}</span>
            <span className="text-[10px] font-semibold text-white/70">{weather}</span>
          </div>

          <div className="flex items-center gap-6 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02]">
            <div className="text-center">
              <span className="block text-[8px] uppercase tracking-wider text-white/40">Day</span>
              <span className="text-xs font-bold text-white font-mono">{day}</span>
            </div>
            <div className="h-5 w-px bg-white/5" />
            <div className="text-center">
              <span className="block text-[8px] uppercase tracking-wider text-white/40">Season</span>
              <span className="text-xs font-semibold" style={{ color: theme.accent }}>{season}</span>
            </div>
          </div>
        </div>

        {/* Timeline controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-full border border-white/10 overflow-hidden bg-neutral-900/60 p-0.5">
            <button
              onClick={() => status === "running" ? handlePause() : handleStart()}
              className={`p-2 rounded-full cursor-pointer transition ${
                status === "running" 
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                  : "bg-[#79AE6F]/20 text-[#79AE6F] hover:bg-[#79AE6F]/30"
              }`}
            >
              {status === "running" ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            
            <button
              onClick={handleReset}
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center rounded-full border border-white/10 overflow-hidden bg-neutral-900/40 p-0.5">
            {[1, 2, 5, 10].map(s => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  if (status === "running") handleStart(s);
                }}
                className={`px-2 py-0.5 text-[8.5px] font-bold rounded-full transition ${
                  speed === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ───────── MAIN SANDBOX LAYOUT ───────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ───── LEFT SIDEBAR (BUILDER PANEL) ───── */}
        <aside className={`flex flex-col border-r border-white/5 glass-card transition-all duration-300 z-10 ${leftOpen ? "w-72" : "w-0"}`}>
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-[10px] uppercase tracking-widest">Ecosystem Builder</h2>
            <Search className="w-3 h-3 opacity-40" />
          </div>

          <div className="p-3 border-b border-white/5 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search species..."
                className="w-full text-[10px] bg-black/40 border border-white/5 rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-white/20 focus:outline-none"
              />
              <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-white/20" />
            </div>

            <div className="flex rounded-lg border border-white/5 overflow-hidden p-0.5 bg-black/20">
              {["All", "Carnivore", "Herbivore", "Omnivore"].map(d => (
                <button
                  key={d}
                  onClick={() => setFilterDiet(d)}
                  className={`flex-1 text-[8.5px] font-medium py-1 rounded transition ${
                    filterDiet === d ? "bg-white/5 text-white" : "text-white/40 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Builder animals list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {filteredAnimals.map(a => (
              <div 
                key={a.id} 
                className={`p-2.5 rounded-2xl border transition-all duration-300 ${
                  a.population > 0 ? "bg-white/[0.02] border-white/15" : "bg-black/10 border-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getAnimalEmoji(a.id)}</span>
                    <div>
                      <h3 className="font-heading font-bold text-[11px] text-white flex items-center gap-1.5">
                        {a.name}
                        {a.population > 0 && (
                          <span className="text-[9px]" title={`Population Trend: ${a.trend}`}>
                            {a.trend === "increasing" ? "↑" : a.trend === "declining" ? "↓" : a.trend === "extinct" ? "☠" : "→"}
                          </span>
                        )}
                      </h3>
                      <p className="text-[8.5px] italic text-white/30">{a.scientificName}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-semibold uppercase px-1 py-0.5 rounded-full border border-white/5 bg-white/[0.01]">
                    {a.diet}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] text-white/40">Pop:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSetPopulation(a.id, a.population - 5)}
                      disabled={a.population === 0}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition cursor-pointer text-xs"
                    >
                      -
                    </button>
                    <span className="text-[10px] font-bold font-mono w-6 text-center">{a.population}</span>
                    <button
                      onClick={() => handleSetPopulation(a.id, a.population + 5)}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Sidebar Collapse Left Toggle */}
        <button
          onClick={() => setLeftOpen(!leftOpen)}
          className="absolute left-1 top-4 w-6 h-6 rounded-full flex items-center justify-center glass-card border border-white/10 text-white z-20 cursor-pointer shadow-md"
          style={{ transform: leftOpen ? "translateX(282px)" : "translateX(0px)", transition: "transform 0.3s" }}
        >
          {leftOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* ───── VISUAL MAP CANVAS ───── */}
        <main className="flex-1 relative overflow-hidden canvas-bg flex flex-col justify-between">
          <div className="absolute inset-0 grid-overlay opacity-25 pointer-events-none" />

          {/* Environmental animations based on weather */}
          {weather === "Rain" && <div className="absolute inset-0 weather-rain-overlay z-10" />}
          {weather === "Storm" && <div className="absolute inset-0 weather-rain-overlay z-10 animate-pulse" style={{ animationDuration: "1s" }} />}
          {weather === "Snow" && <div className="absolute inset-0 weather-snow-overlay z-10" />}
          {weather === "Heatwave" && <div className="absolute inset-0 weather-haze-overlay z-10" />}
          {weather === "Drought" && <div className="absolute inset-0 bg-[#3a200a]/15 z-10 pointer-events-none" />}
          {envType === "forest" && <div className="absolute inset-0 leaves-overlay z-10 pointer-events-none" />}

          {/* Environment-specific animated overlays */}
          {envType === "forest" && (
            <>
              <div className="absolute inset-0 forest-light-rays pointer-events-none opacity-30 z-10" />
              <div className="absolute inset-0 morning-fog pointer-events-none opacity-20 z-10" />
            </>
          )}
          {envType === "ocean" && (
            <>
              <div className="absolute inset-0 ocean-caustics pointer-events-none opacity-40 z-10" />
              {/* Currents */}
              <div className="ocean-current z-10" style={{ top: "25%", animationDelay: "0s", animationDuration: "10s" }} />
              <div className="ocean-current z-10" style={{ top: "60%", animationDelay: "3s", animationDuration: "14s" }} />
              {/* Rising Bubbles */}
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="bubble-particle z-10" 
                  style={{ 
                    left: `${10 + i * 9}%`, 
                    width: `${3 + (i % 3) * 2.5}px`, 
                    height: `${3 + (i % 3) * 2.5}px`, 
                    animationDelay: `${i * 0.6}s`,
                    animationDuration: `${5.5 + (i % 2) * 2}s`
                  }} 
                />
              ))}
            </>
          )}
          {envType === "desert" && (
            <>
              <div className="absolute inset-0 desert-heat-haze pointer-events-none opacity-25 z-10" />
              {/* Wind-blown sand dust */}
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="sand-dust-particle z-10" 
                  style={{ 
                    left: `${5 + (i % 4) * 25}%`, 
                    top: `${15 + (i % 3) * 25}%`, 
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: `${3 + (i % 2) * 1.5}s`
                  }} 
                />
              ))}
            </>
          )}
          {envType === "arctic" && (
            <>
              {/* Falling snow particles */}
              {[...Array(14)].map((_, i) => (
                <div 
                  key={i} 
                  className="snow-particle z-10" 
                  style={{ 
                    left: `${3 + i * 7}%`, 
                    top: "-10px", 
                    width: `${2 + (i % 3) * 1.2}px`, 
                    height: `${2 + (i % 3) * 1.2}px`, 
                    animationDelay: `${i * 0.45}s`,
                    animationDuration: `${4.5 + (i % 2) * 2}s`
                  }} 
                />
              ))}
            </>
          )}
          {envType === "wetland" && (
            <>
              {/* Glowing fireflies */}
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="swamp-firefly z-10" 
                  style={{ 
                    left: `${8 + i * 11}%`, 
                    top: `${35 + (i % 4) * 13}%`, 
                    animationDelay: `${i * 0.5}s`
                  }} 
                />
              ))}
            </>
          )}
          {envType === "mountain" && (
            <div className="absolute inset-0 mountain-mist pointer-events-none opacity-35 z-10" />
          )}

          {/* Random Event Toasts */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 max-w-xs pointer-events-none">
            {notifications.slice(-2).map((note, idx) => (
              <div 
                key={idx} 
                className="glass-card border border-amber-500/20 bg-neutral-950/85 px-3 py-2 rounded-xl flex gap-2.5 items-start animate-fade-in shadow-xl"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[9px] text-white/70 leading-relaxed font-body">{note}</p>
              </div>
            ))}
          </div>

          {/* Map Surface */}
          <div ref={canvasRef} className="flex-1 relative overflow-hidden">
            {/* Draw Sandy Ocean Bed Floor (if Ocean) */}
            {envType === "ocean" && (
              <svg viewBox="0 0 100 20" className="absolute bottom-0 left-0 w-full h-[15%] pointer-events-none z-10" preserveAspectRatio="none">
                <path d="M 0,20 L 0,8 Q 25,14 50,7 T 100,10 L 100,20 Z" fill="#b09b7c" opacity="0.6" />
                <path d="M 0,20 L 0,12 Q 35,6 70,15 T 100,14 L 100,20 Z" fill="#9c8768" opacity="0.4" />
              </svg>
            )}

            {/* Draw Sandy Desert Dunes (if Desert) */}
            {envType === "desert" && (
              <svg viewBox="0 0 100 25" className="absolute bottom-0 left-0 w-full h-[22%] pointer-events-none z-10" preserveAspectRatio="none">
                <path d="M 0,25 L 0,15 C 20,5 30,5 50,18 C 70,8 80,8 100,12 L 100,25 Z" fill="#bd9146" opacity="0.75" />
                <path d="M 0,25 L 0,20 C 15,14 35,12 60,22 C 80,18 90,14 100,19 L 100,25 Z" fill="#9e742c" opacity="0.85" />
              </svg>
            )}

            {/* Draw Themed Water Bodies (Centered exactly on theme coordinates) */}
            {theme.waterType === "pond" && (
              <div 
                className="absolute w-28 h-20 rounded-[50%] bg-[#225075]/40 border-2 border-[#52A388]/30 backdrop-blur-sm pointer-events-none"
                style={{ left: `${theme.waterX}%`, top: `${theme.waterY}%`, transform: "translate(-50%, -50%)", boxShadow: "0 0 30px rgba(34,80,117,0.3)" }}
              />
            )}
            {theme.waterType === "oasis" && (
              <div 
                className="absolute w-24 h-24 rounded-full bg-[#1b5d6a]/40 border-2 border-[#D4A84B]/30 backdrop-blur-sm pointer-events-none flex items-center justify-center"
                style={{ left: `${theme.waterX}%`, top: `${theme.waterY}%`, transform: "translate(-50%, -50%)", boxShadow: "0 0 40px rgba(27,93,106,0.3)" }}
              >
                <span className="text-lg opacity-60">🌴</span>
              </div>
            )}
            {theme.waterType === "swamp" && (
              <div 
                className="absolute w-full h-[35%] bg-[#1a382e]/30 border-t border-[#52A388]/20 backdrop-blur-[1px] pointer-events-none"
                style={{ bottom: 0, left: 0 }}
              />
            )}
            {theme.waterType === "waterhole" && (
              <div 
                className="absolute w-28 h-16 rounded-[45%] bg-[#1c484f]/45 border border-[#C8B860]/20 pointer-events-none"
                style={{ left: `${theme.waterX}%`, top: `${theme.waterY}%`, transform: "translate(-50%, -50%)" }}
              />
            )}
            {theme.waterType === "stream" && (
              <div 
                className="absolute w-[220px] h-[40px] bg-[#225075]/35 border border-white/5 pointer-events-none"
                style={{ left: `${theme.waterX}%`, top: `${theme.waterY}%`, transform: "translate(-50%, -50%) rotate(12deg)", borderRadius: "40%" }}
              />
            )}

            {/* Static visual decorations */}
            {staticDecorations.map(dec => (
              <div
                key={dec.id}
                className="absolute pointer-events-none origin-bottom opacity-65"
                style={{ left: `${dec.x}%`, top: `${dec.y}%`, transform: "translate(-50%, -100%)" }}
              >
                {renderTerrainDecoration(dec)}
              </div>
            ))}

            {/* Attack visual slashes */}
            {attackVisuals.map((visual, idx) => (
              <div
                key={idx}
                className="absolute text-xl z-30 font-bold text-red-500 scale-[2.0] animate-bounce select-none pointer-events-none"
                style={{ left: `${visual.x}%`, top: `${visual.y}%`, transform: "translate(-50%, -50%)" }}
              >
                💥
              </div>
            ))}

            {/* Animal wanderer icons */}
            {placedIcons.map(icon => (
              <div
                key={icon.id}
                onMouseEnter={() => {
                  const anim = animals.find(a => a.id === icon.animalId);
                  setHoveredAnimal(anim);
                }}
                onMouseLeave={() => setHoveredAnimal(null)}
                onClick={() => {
                  setSelectedAnimalId(icon.animalId);
                  if (!rightOpen) setRightOpen(true);
                }}
                className="wandering-icon absolute text-2xl select-none leading-none select-none transition-transform duration-[150ms] z-20"
                style={{
                  left: `${icon.x}%`,
                  top: `${icon.y}%`,
                  transform: "translate(-50%, -50%)",
                  filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.5))"
                }}
              >
                <div className="relative">
                  {icon.emoji}
                  {/* Action states indicator bubble */}
                  {icon.actionEmoji && (
                    <span className="absolute -top-3 -right-2 text-[10px] bg-neutral-900/80 px-1 rounded-full border border-white/10">
                      {icon.actionEmoji}
                    </span>
                  )}
                  {/* Age size scale indicator */}
                  <span className="absolute -bottom-2.5 left-1 text-[7px] opacity-40 font-mono font-bold">
                    {icon.ageGroup[0]}
                  </span>
                </div>
              </div>
            ))}

            {/* Hover Tooltip */}
            {hoveredAnimal && (
              <div 
                className="absolute glass-card px-2.5 py-2 rounded-xl z-30 pointer-events-none flex flex-col gap-0.5 text-[9px] shadow-2xl border border-white/10"
                style={{
                  left: `${placedIcons.find(i => i.animalId === hoveredAnimal.id)?.x || 50}%`,
                  top: `${(placedIcons.find(i => i.animalId === hoveredAnimal.id)?.y || 50) - 12}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="font-heading font-semibold text-white">{hoveredAnimal.name} ({hoveredAnimal.trend === "increasing" ? "↑" : hoveredAnimal.trend === "declining" ? "↓" : "→"})</div>
                <div className="opacity-60">Pop: <strong className="text-white">{hoveredAnimal.population}</strong></div>
                <div className="opacity-60">Energy: <strong className="text-white">{Math.round(hoveredAnimal.energy)}%</strong></div>
                <div className="opacity-60">Health: <strong className="text-white font-semibold" style={{ color: getHealthColor(hoveredAnimal.health) }}>{Math.round(hoveredAnimal.health)}%</strong></div>
              </div>
            )}

            {placedIcons.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center p-4 glass-card rounded-2xl border border-white/5 max-w-xs">
                  <span className="text-2xl block mb-1">🌱</span>
                  <p className="text-[10px] text-white/50 leading-relaxed font-body">
                    Ecosystem empty. Add compatible animals in the Left panel to start.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ───── BOTTOM SIMULATION DASHBOARD ───── */}
          <footer className="glass-card border-t border-white/5 p-3.5 z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            
            {/* Health stability score circular meter */}
            <div className="flex items-center gap-3 bg-white/[0.01] border border-white/5 p-2.5 rounded-2xl h-[90px]">
              <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle 
                    cx="18" cy="18" r="15.9" fill="none" 
                    stroke={getHealthColor(health)} 
                    strokeWidth="3" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - health} 
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-heading font-bold text-xs text-white">
                  {health}%
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-[9px] font-heading uppercase tracking-widest text-white/35">Stability index</h3>
                <p className="text-xs font-bold mt-0.5" style={{ color: getHealthColor(health) }}>
                  {getHealthLabel(health)}
                </p>
                <p className="text-[8px] text-white/30 mt-0.5 leading-tight font-body">
                  Evaluates biodiversity, species counts, starvation risk and ratios.
                </p>
              </div>
            </div>

            {/* Population curves Line chart */}
            <div className="bg-white/[0.01] border border-white/5 p-2.5 rounded-2xl h-[90px] flex flex-col justify-between">
              <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-white/35">
                <span>Population trends</span>
                <span className="flex items-center gap-1 font-semibold text-[#79AE6F]"><BarChart2 className="w-2.5 h-2.5" /> History</span>
              </div>
              <div className="flex-1 mt-1 overflow-hidden">
                {renderLineChart()}
              </div>
            </div>

            {/* Relative Abundance bar chart */}
            <div className="bg-white/[0.01] border border-white/5 p-2.5 rounded-2xl h-[90px] flex flex-col justify-between">
              <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-white/35">
                <span>Species counts</span>
                <span className="opacity-55">Live densities</span>
              </div>
              <div className="flex-1 overflow-hidden">
                {renderBarChart()}
              </div>
            </div>

            {/* Donut Trophic ratio balance chart */}
            <div className="bg-white/[0.01] border border-white/5 p-2.5 rounded-2xl h-[90px] flex flex-col justify-between">
              <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-white/35">
                <span>Trophic layers</span>
                <span className="opacity-55">Diet partitions</span>
              </div>
              <div className="flex-1 overflow-hidden">
                {renderDonutChart()}
              </div>
            </div>

          </footer>
        </main>

        {/* ───── RIGHT SIDEBAR (SPECIES, LOGS & FOOD WEB) ───── */}
        <aside className={`flex flex-col border-l border-white/5 glass-card transition-all duration-300 z-10 ${rightOpen ? "w-72" : "w-0"}`}>
          {/* Header tabs */}
          <div className="border-b border-white/5 flex p-1.5 gap-0.5">
            <button
              onClick={() => setRightTab("details")}
              className={`flex-1 py-1 rounded-lg font-heading text-[8px] uppercase tracking-wider font-semibold transition ${
                rightTab === "details" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              Inspection
            </button>
            <button
              onClick={() => setRightTab("learning")}
              className={`flex-1 py-1 rounded-lg font-heading text-[8px] uppercase tracking-wider font-semibold transition ${
                rightTab === "learning" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              Explanations
            </button>
            <button
              onClick={() => setRightTab("web")}
              className={`flex-1 py-1 rounded-lg font-heading text-[8px] uppercase tracking-wider font-semibold transition ${
                rightTab === "web" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              Food Web
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-thin">
            {rightTab === "details" ? (
              // INSPECTION TAB
              activeAnimal ? (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden h-28 bg-black/40 border border-white/5">
                    <img src={activeAnimal.images[0]} alt={activeAnimal.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <span className="text-xl">{getAnimalEmoji(activeAnimal.id)}</span>
                      <h3 className="font-heading font-bold text-white text-xs mt-0.5 flex items-center gap-1.5">
                        {activeAnimal.name}
                        <span className="text-[9.5px] uppercase" style={{ color: getHealthColor(activeAnimal.health) }}>
                          ({activeAnimal.trend === "increasing" ? "↑" : activeAnimal.trend === "declining" ? "↓" : activeAnimal.trend === "extinct" ? "☠" : "→"})
                        </span>
                      </h3>
                      <p className="text-[8px] italic text-white/40">{activeAnimal.scientificName}</p>
                    </div>
                  </div>

                  {/* Cohort splits */}
                  <div className="bg-white/[0.01] border border-white/5 p-2.5 rounded-2xl space-y-1.5 text-[9px]">
                    <h4 className="text-[8px] uppercase tracking-widest text-white/35 font-heading">Age groups</h4>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="flex items-center gap-1">🐣 Juveniles</span>
                      <span className="font-bold font-mono text-white">{activeAnimal.juveniles}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="flex items-center gap-1 font-medium">🦌 Active Breeders</span>
                      <span className="font-bold font-mono text-white">{activeAnimal.adults}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="flex items-center gap-1 text-white/50">🧓 Elders (Slow)</span>
                      <span className="font-bold font-mono text-white/70">{activeAnimal.elders}</span>
                    </div>
                  </div>

                  {/* Metabolic bar graphs */}
                  <div className="bg-white/[0.01] border border-white/5 p-2.5 rounded-2xl space-y-2">
                    <h4 className="text-[8px] uppercase tracking-widest text-white/35 font-heading">Energy stats</h4>
                    
                    <div>
                      <div className="flex justify-between text-[8px] mb-0.5">
                        <span className="opacity-55">Metabolic energy</span>
                        <span className="font-bold">{Math.round(activeAnimal.energy)}%</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${activeAnimal.energy}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[8px] mb-0.5">
                        <span className="opacity-55">Body condition</span>
                        <span className="font-bold">{Math.round(activeAnimal.health)}%</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${activeAnimal.health}%`, backgroundColor: getHealthColor(activeAnimal.health) }} />
                      </div>
                    </div>
                  </div>

                  {/* Food Web cards */}
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="bg-red-500/[0.01] border border-red-500/10 p-2.5 rounded-2xl">
                      <span className="block text-[8px] uppercase font-bold text-red-400 mb-1.5">Predators</span>
                      {activeAnimal.predators.length === 0 ? (
                        <span className="text-white/20 italic">No predators</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {activeAnimal.predators.map(p => (
                            <span key={p} className="bg-red-500/10 px-1.5 py-0.5 rounded text-[8px] text-red-300 capitalize">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#79AE6F]/[0.01] border border-[#79AE6F]/10 p-2.5 rounded-2xl">
                      <span className="block text-[8px] uppercase font-bold text-[#79AE6F] mb-1.5">Prey</span>
                      {activeAnimal.prey.length === 0 ? (
                        <span className="text-white/20 italic">Forages vegetation</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {activeAnimal.prey.map(p => (
                            <span key={p} className="bg-[#79AE6F]/10 px-1.5 py-0.5 rounded text-[8px] text-[#A8D4A0] capitalize">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-[10px] text-white/30">
                  Select a species node or map icon to inspect details.
                </div>
              )
            ) : rightTab === "learning" ? (
              // EDUCATIONAL EXPLANATIONS LOGS
              <div className="space-y-3">
                <h4 className="text-[8px] uppercase tracking-widest text-white/35 font-heading">Real-Time Insights</h4>
                {learningLogs.length === 0 ? (
                  <p className="text-center text-[9px] text-white/20 py-10 italic">
                    Start simulation to observe educational insights.
                  </p>
                ) : (
                  learningLogs.slice().reverse().map((log, idx) => (
                    <div 
                      key={idx} 
                      className="p-2 rounded-xl bg-white/[0.01] border border-white/5 text-[9px] leading-relaxed text-white/60 font-body"
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            ) : (
              // FOOD WEB DIAGRAM
              <div className="space-y-4">
                <h4 className="text-[8px] uppercase tracking-widest text-white/35 font-heading">Live Food Web</h4>
                <div className="h-44">
                  {renderFoodWeb()}
                </div>
                <div className="p-2.5 bg-white/[0.01] border border-white/5 rounded-2xl text-[8.5px] leading-relaxed text-white/40">
                  <p className="font-semibold text-white/60 mb-1">Trophic Cascade:</p>
                  If a species goes extinct, its node turns into <span className="text-red-400 font-bold">☠ Extinct</span>. Lines representing hunt dependencies break, showing you how changes ripple across the food chain in real-time.
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Sidebar Collapse Right Toggle */}
        <button
          onClick={() => setRightOpen(!rightOpen)}
          className="absolute right-1 top-4 w-6 h-6 rounded-full flex items-center justify-center glass-card border border-white/10 text-white z-20 cursor-pointer shadow-md"
          style={{ transform: rightOpen ? "translateX(-282px)" : "translateX(0px)", transition: "transform 0.3s" }}
        >
          {rightOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

      </div>
    </div>
  );
}
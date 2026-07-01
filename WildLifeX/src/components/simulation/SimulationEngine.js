// SimulationEngine.js
// Decoupled core simulation logic for the HNDIT Educational Ecosystem Simulator.

export function normalizeSpeciesKey(key) {
  return (key || "").toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
}

export function isPreyMatch(preyList, speciesId, speciesName) {
  const id = normalizeSpeciesKey(speciesId);
  const name = normalizeSpeciesKey(speciesName);
  return preyList.some((p) => {
    const norm = normalizeSpeciesKey(p);
    return norm === id || norm === name || id.includes(norm) || norm.includes(id);
  });
}

export const ACTIVITY_LABELS = {
  Roam: "Walking",
  SeekFood: "Searching Food",
  SeekWater: "Searching Water",
  SeekMate: "Mating",
  Sleep: "Sleeping",
  Flee: "Running Away",
  Hunt: "Hunting",
  Eat: "Eating",
  Drink: "Drinking",
  GiveBirth: "Giving Birth",
  Dead: "Dead",
  Idle: "Idle",
};

// Species that prefer solitude (most others move in groups)
const SOLITARY_SPECIES = new Set([
  "snow-leopard", "amur-leopard", "komodo-dragon", "king-cobra",
  "great-white-shark", "barn-owl", "bald-eagle",
]);

// Strong herd/school cohesion
const HERD_SPECIES = new Set([
  "deer", "rabbit", "mouse", "squirrel", "boar", "african-elephant",
  "giant-panda", "scarlet-macaw", "emperor-penguin",
  "small-fish", "clownfish", "plankton", "krill", "atlantic-bluefin-tuna",
  "green-sea-turtle", "seal",
]);

export class SpatialHashGrid {
  constructor(width, height, cellSize = 80) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.cells = Array.from({ length: this.cols * this.rows }, () => []);
  }

  clear() {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].length = 0;
    }
  }

  _hash(x, y) {
    const col = Math.max(0, Math.min(this.cols - 1, Math.floor(x / this.cellSize)));
    const row = Math.max(0, Math.min(this.rows - 1, Math.floor(y / this.cellSize)));
    return row * this.cols + col;
  }

  insert(entity) {
    const idx = this._hash(entity.x, entity.y);
    this.cells[idx].push(entity);
  }

  query(x, y, radius, filterFn = null) {
    const results = [];
    const minCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));

    const r2 = radius * radius;

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const idx = r * this.cols + c;
        const cellEntities = this.cells[idx];
        for (let i = 0; i < cellEntities.length; i++) {
          const entity = cellEntities[i];
          const dx = entity.x - x;
          const dy = entity.y - y;
          if (dx * dx + dy * dy <= r2) {
            if (!filterFn || filterFn(entity)) {
              results.push(entity);
            }
          }
        }
      }
    }
    return results;
  }
}

export class TimeSystem {
  constructor(ecosystemType = "forest") {
    this.ecosystemType = ecosystemType;
    this.dayDurationSeconds = 30; // 30 real seconds = 1 simulation day
    this.timeOfDay = 8.0; // 0-24 hour scale. Starts at 8:00 AM
    this.day = 1;
    this.year = 1;
    
    // Seasons
    this.seasons = ecosystemType === "forest" 
      ? ["Spring", "Summer", "Autumn", "Winter"]
      : ["Dry Season", "Wet Season", "Storm Season"];
    this.seasonIndex = 0;
    this.daysPerSeason = ecosystemType === "forest" ? 20 : 14;
    
    // Weather
    this.weatherList = ["Sunny", "Cloudy", "Rainy", "Windy", "Foggy"];
    if (ecosystemType === "ocean") {
      this.weatherList = ["Calm", "Waves", "Stormy", "Overcast"];
    }
    this.currentWeather = "Sunny";
    this.weatherTimer = 0; // days remaining for current weather
    
    this.temperature = 22; // In Celsius
  }

  update(dtSeconds) {
    // Advance in-game hours.
    // dtSeconds is real-world elapsed seconds.
    const hoursPerSecond = 24 / this.dayDurationSeconds;
    this.timeOfDay += dtSeconds * hoursPerSecond;

    if (this.timeOfDay >= 24) {
      this.timeOfDay -= 24;
      this.day++;
      this.weatherTimer--;
      
      // Update seasons
      const totalDays = this.day - 1;
      const newSeasonIdx = Math.floor(totalDays / this.daysPerSeason) % this.seasons.length;
      if (newSeasonIdx !== this.seasonIndex) {
        this.seasonIndex = newSeasonIdx;
      }

      const totalCycles = Math.floor(totalDays / (this.daysPerSeason * this.seasons.length));
      this.year = totalCycles + 1;

      // Update weather
      if (this.weatherTimer <= 0) {
        this._generateWeather();
      }
    }

    this._updateTemperature();
  }

  getSeason() {
    return this.seasons[this.seasonIndex];
  }

  getPeriodOfDay() {
    const hour = this.timeOfDay;
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  }

  _generateWeather() {
    this.weatherTimer = 1 + Math.floor(Math.random() * 2); // 1-2 days of same weather
    const rand = Math.random();
    const season = this.getSeason();

    if (this.ecosystemType === "forest") {
      if (season === "Winter") {
        this.currentWeather = rand < 0.5 ? "Snowy" : rand < 0.8 ? "Foggy" : "Cloudy";
      } else if (season === "Summer") {
        this.currentWeather = rand < 0.6 ? "Sunny" : rand < 0.8 ? "Heatwave" : "Cloudy";
      } else if (season === "Autumn") {
        this.currentWeather = rand < 0.4 ? "Windy" : rand < 0.7 ? "Rainy" : "Foggy";
      } else { // Spring
        this.currentWeather = rand < 0.5 ? "Sunny" : rand < 0.8 ? "Rainy" : "Cloudy";
      }
    } else { // Ocean
      if (season === "Storm Season") {
        this.currentWeather = rand < 0.6 ? "Stormy" : rand < 0.9 ? "Waves" : "Overcast";
      } else if (season === "Wet Season") {
        this.currentWeather = rand < 0.5 ? "Overcast" : rand < 0.8 ? "Waves" : "Calm";
      } else { // Dry Season
        this.currentWeather = rand < 0.7 ? "Calm" : rand < 0.9 ? "Overcast" : "Waves";
      }
    }
  }

  _updateTemperature() {
    const season = this.getSeason();
    const hour = this.timeOfDay;
    
    // Base temperature depending on season
    let baseTemp = 20;
    if (this.ecosystemType === "forest") {
      if (season === "Spring") baseTemp = 18;
      else if (season === "Summer") baseTemp = 28;
      else if (season === "Autumn") baseTemp = 12;
      else if (season === "Winter") baseTemp = -2;
    } else { // Ocean water temperature
      if (season === "Dry Season") baseTemp = 26;
      else if (season === "Wet Season") baseTemp = 24;
      else if (season === "Storm Season") baseTemp = 22;
    }

    // Weather impact
    if (this.currentWeather === "Heatwave" || this.currentWeather === "Sunny") baseTemp += 4;
    if (this.currentWeather === "Rainy" || this.currentWeather === "Stormy") baseTemp -= 3;
    if (this.currentWeather === "Snowy") baseTemp -= 6;

    // Daily cycle temperature variation (warmest at 2 PM, coldest at 4 AM)
    const dailyOffset = Math.sin((hour - 8) / 24 * 2 * Math.PI) * 4;
    this.temperature = parseFloat((baseTemp + dailyOffset).toFixed(1));
  }

  getLightingAlpha() {
    // Return overlay transparency for night/day transition.
    // 0 = full daylight, 0.75 = midnight dark
    const hour = this.timeOfDay;
    if (hour >= 6 && hour < 8) {
      // Sunrise transition
      return 0.7 * (1 - (hour - 6) / 2);
    } else if (hour >= 8 && hour < 18) {
      // Full daylight
      return 0.0;
    } else if (hour >= 18 && hour < 20) {
      // Sunset transition
      return 0.7 * ((hour - 18) / 2);
    } else {
      // Night
      return 0.7;
    }
  }

  getLightingColor() {
    const hour = this.timeOfDay;
    if (hour >= 6 && hour < 8) {
      return "rgba(255, 120, 50, 0.25)"; // Orange glow
    } else if (hour >= 18 && hour < 20) {
      return "rgba(230, 80, 120, 0.25)"; // Pink/purple glow
    } else if (hour >= 20 || hour < 6) {
      return "rgba(10, 15, 45, 0.75)"; // Moonlight blue-black
    }
    return "transparent";
  }
}

export class WorldMap {
  constructor(ecosystemType, width, height) {
    this.ecosystemType = ecosystemType;
    this.width = width;
    this.height = height;
    this.waterBodies = []; // Rivers/ponds [{x, y, radius, isRiver}]
    this.shelters = [];    // Rock caves/nest spots [{x, y, radius}]
    this.obstacles = [];   // Impassable rocks/cliffs [{x, y, radius}]
    this.zones = [];       // Deep vs shallow water for ocean [{x, y, w, h, depthType}]
    
    this.generate();
  }

  generate() {
    const center = { x: this.width / 2, y: this.height / 2 };
    
    if (this.ecosystemType === "forest") {
      // 1. Procedural river winding through map
      const riverPoints = [];
      const isVertical = Math.random() > 0.5;
      const segments = 10;
      
      let startX = isVertical ? this.width * 0.4 + Math.random() * this.width * 0.2 : 0;
      let startY = isVertical ? 0 : this.height * 0.4 + Math.random() * this.height * 0.2;
      
      riverPoints.push({ x: startX, y: startY });
      
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        let x, y;
        if (isVertical) {
          x = startX + Math.sin(t * Math.PI * 2) * 80 + (Math.random() - 0.5) * 50;
          y = this.height * t;
        } else {
          x = this.width * t;
          y = startY + Math.sin(t * Math.PI * 2) * 80 + (Math.random() - 0.5) * 50;
        }
        riverPoints.push({ x, y });
      }
      this.riverPoints = riverPoints;
      
      // Populate waterBodies array with points along the river for animal drinking
      for (let pt of riverPoints) {
        this.waterBodies.push({ x: pt.x, y: pt.y, radius: 45, isRiver: true });
      }

      // Add a couple of ponds
      for (let i = 0; i < 2; i++) {
        this.waterBodies.push({
          x: Math.random() * this.width * 0.8 + this.width * 0.1,
          y: Math.random() * this.height * 0.8 + this.height * 0.1,
          radius: 35 + Math.random() * 20,
          isRiver: false
        });
      }

      // 2. Obstacles (rocks/cliffs)
      const obstacleCount = 6 + Math.floor(Math.random() * 6);
      for (let i = 0; i < obstacleCount; i++) {
        this.obstacles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: 10 + Math.random() * 14
        });
      }

      // 3. Shelters (caves/hollow logs) near rocks
      for (let i = 0; i < 3; i++) {
        const obs = this.obstacles[i % this.obstacles.length];
        this.shelters.push({
          x: obs.x + (Math.random() - 0.5) * 60,
          y: obs.y + (Math.random() - 0.5) * 60,
          radius: 30
        });
      }
      
    } else { // Ocean
      // 1. Procedural Deep Ocean vs Shallow coral reef zones
      // Split the map into shallow shelf and deep drop-off
      const splitX = this.width * 0.35 + Math.random() * this.width * 0.2;
      this.reefSplitX = splitX;
      
      this.zones.push({
        x: 0,
        y: 0,
        w: splitX,
        h: this.height,
        depthType: "shallow"
      });
      this.zones.push({
        x: splitX,
        y: 0,
        w: this.width - splitX,
        h: this.height,
        depthType: "deep"
      });

      // Rock formations (coral structures) on shallow side
      const structuresCount = 8 + Math.floor(Math.random() * 8);
      for (let i = 0; i < structuresCount; i++) {
        this.obstacles.push({
          x: Math.random() * splitX * 0.9,
          y: Math.random() * this.height,
          radius: 12 + Math.random() * 16
        });
      }

      // Breeding grounds (sheltered coral structures)
      for (let i = 0; i < 3; i++) {
        this.shelters.push({
          x: Math.random() * splitX * 0.7 + 50,
          y: Math.random() * this.height * 0.8 + this.height * 0.1,
          radius: 40
        });
      }
    }
  }

  isColliding(x, y, radius = 5) {
    // Avoid running into hard obstacles
    for (let obs of this.obstacles) {
      const dx = obs.x - x;
      const dy = obs.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < obs.radius + radius) {
        return { colliding: true, pushX: dx / dist, pushY: dy / dist };
      }
    }
    return { colliding: false };
  }

  getNearestWater(x, y) {
    if (this.ecosystemType === "ocean") {
      // Marine animals are in water, they don't get thirsty or satisfy it instantly
      return { x, y, dist: 0 };
    }
    let nearest = null;
    let minDist = Infinity;
    for (let wb of this.waterBodies) {
      const dx = wb.x - x;
      const dy = wb.y - y;
      const d = Math.sqrt(dx * dx + dy * dy) - wb.radius;
      if (d < minDist) {
        minDist = d;
        nearest = wb;
      }
    }
    
    if (!nearest) return null;
    return { x: nearest.x, y: nearest.y, dist: Math.max(0, minDist) };
  }
}

export class PlantAgent {
  constructor(id, type, x, y) {
    this.id = id;
    this.type = type; // tree, bush, flower, grass, kelp, seagrass, coral, reef
    this.x = x;
    this.y = y;
    this.growth = 0.2 + Math.random() * 0.3; // Starts young (Seed/Small)
    this.health = 100;
    this.isDead = false;
    this.regrowDaysLeft = 0;
    this.colorHue = Math.floor(Math.random() * 40) + 80; // random green tint
    this.sizeScale = 0.7 + Math.random() * 0.6;
  }

  getGrowthStage() {
    if (this.growth < 0.25) return "Seed";
    if (this.growth < 0.5) return "Small";
    if (this.growth < 0.75) return "Medium";
    return "Large";
  }

  update(dt, timeSystem) {
    if (this.isDead) return;

    // Growth rates based on seasons/weather
    const season = timeSystem.getSeason();
    const weather = timeSystem.currentWeather;
    
    let rate = 0.005; // Base growth per step
    
    if (timeSystem.ecosystemType === "forest") {
      if (season === "Winter") rate *= 0.1; // Barely grows
      else if (season === "Spring") rate *= 1.5; // Quick bloom
      else if (season === "Summer") rate *= 1.2;
      
      if (weather === "Rainy") rate *= 1.8;
      if (weather === "Heatwave") rate *= 0.3; // Drought dries out plants
    } else { // Ocean plants
      if (season === "Wet Season") rate *= 1.3; // runoff nutrients
      if (weather === "Stormy") rate *= 0.5; // torn up by currents
    }

    this.growth = Math.min(1.0, this.growth + rate * dt);
  }

  eat(amount) {
    this.growth -= amount;
    if (this.growth <= 0.05) {
      this.isDead = true;
      this.regrowDaysLeft = 3; // regrow after 3 simulation days
      this.growth = 0;
    }
  }
}

export class AnimalAgent {
  constructor(id, speciesData, x, y) {
    this.id = id;
    this.speciesId = speciesData.id;
    this.name = speciesData.name;
    this.category = speciesData.category;
    this.diet = (speciesData.diet || "herbivore").toLowerCase(); // carnivore, herbivore, omnivore
    this.preyList = Array.isArray(speciesData.prey) ? speciesData.prey.map((p) => normalizeSpeciesKey(p)) : [];
    this.predatorsList = Array.isArray(speciesData.predators) ? speciesData.predators.map((p) => normalizeSpeciesKey(p)) : [];
    this.ecosystemPoints = speciesData.ecosystemPoints || speciesData.pointCost || 10;
    
    // Parse lifespan
    let rawLifespan = speciesData.lifespan || "10 years";
    const lifespanMatch = rawLifespan.match(/\d+/);
    this.maxAgeYears = lifespanMatch ? parseInt(lifespanMatch[0]) : 12;
    
    // Parse speed
    let rawSpeed = speciesData.speed || "40 km/h";
    const speedMatch = rawSpeed.match(/\d+/);
    const numericSpeed = speedMatch ? parseInt(speedMatch[0]) : 40;
    this.baseSpeed = 0.5 + (numericSpeed / 100) * 1.5; // Map to canvas scale (0.5 to 2.5)

    // Positions
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * this.baseSpeed;
    this.vy = (Math.random() - 0.5) * this.baseSpeed;
    this.heading = Math.random() * Math.PI * 2;

    // AI Stats
    this.gender = Math.random() > 0.5 ? "Male" : "Female";
    this.ageYears = 0.1; // Start as young/placed
    this.health = 100;
    this.hunger = 80 + Math.random() * 20; // 0-100 (0=dead, 100=full)
    this.water = 80 + Math.random() * 20;  // 0-100
    this.energy = 80 + Math.random() * 20; // 0-100
    this.fear = 0;
    
    // AI Sensory Radii
    this.visionRadius = 150;
    this.smellRadius = 250;
    this.hearingRadius = 200;

    // Reproduction
    this.pregnant = false;
    this.gestationTimer = 0;
    this.gestationPeriod = 45; // Real seconds of pregnancy
    this.reproductionCooldown = 60; // Wait 60s between children
    this.mateCooldownTimer = 0;

    // AI States
    this.activity = "Roam"; // Roam, SeekFood, SeekWater, SeekMate, Sleep, Flee, Hunt, Eat, Drink, Dead
    this.targetEntity = null;
    this.isDead = false;
    this.deathReason = "";
    this.timeAliveSeconds = 0;
    this.timeSinceLastMeal = 0;
    this.lifetimeKills = 0;
    this.distanceTravelled = 0;
    this.parentIds = [];
    this.childrenIds = [];
    this.decayTimer = 45;
    this.wasScavenged = false;

    // Visual / interaction state
    this.eatTimer = 0;
    this.drinkTimer = 0;
    this.beingHuntedBy = null;
    this.chaseTarget = null;

    // Grouping — most species stay together
    this.socialGroup = !SOLITARY_SPECIES.has(speciesData.id);
    this.herdSpecies = HERD_SPECIES.has(speciesData.id);
    this.personalSpace = this.herdSpecies ? 28 : 34;
    this.herdRadius = this.herdSpecies ? 140 : 100;
  }

  getLifeStage() {
    const ratio = this.ageYears / this.maxAgeYears;
    if (ratio < 0.15) return "Juvenile";
    if (ratio < 0.35) return "Teen";
    if (ratio < 0.8) return "Adult";
    return "Old";
  }

  isAdult() {
    const stage = this.getLifeStage();
    return stage === "Adult" || stage === "Old";
  }

  update(dt, simulation, grid, worldMap) {
    if (this.isDead) {
      this.decayTimer -= dt;
      if (this.decayTimer <= 0) {
        simulation.removeEntity(this);
      }
      return;
    }

    this.timeAliveSeconds += dt;
    this.timeSinceLastMeal += dt;
    this.mateCooldownTimer = Math.max(0, this.mateCooldownTimer - dt);

    // Showcase eating/drinking — pause AI while visibly feeding
    if (this.eatTimer > 0) {
      this.eatTimer -= dt;
      this.activity = "Eat";
      this.vx *= 0.6;
      this.vy *= 0.6;
      this._applySeparation(grid);
      if (this.eatTimer <= 0) {
        this.activity = "Roam";
        this.targetEntity = null;
      }
      return;
    }
    if (this.drinkTimer > 0) {
      this.drinkTimer -= dt;
      this.activity = "Drink";
      this.vx *= 0.6;
      this.vy *= 0.6;
      this._applySeparation(grid);
      if (this.drinkTimer <= 0) {
        this.activity = "Roam";
        this.targetEntity = null;
      }
      return;
    }

    // Clear stale hunt markers (only when prey dies)
    if (this.chaseTarget?.isDead) {
      if (this.chaseTarget.beingHuntedBy === this) this.chaseTarget.beingHuntedBy = null;
      this.chaseTarget = null;
    }
    if (this.beingHuntedBy?.isDead) {
      this.beingHuntedBy = null;
    }

    // 1. Biological clock ticking down stats (per game-hour depletion)
    const season = simulation.timeSystem.getSeason();
    const weather = simulation.timeSystem.currentWeather;
    const hoursPerSecond = 24 / simulation.timeSystem.dayDurationSeconds;
    const gameHours = dt * hoursPerSecond;

    // Hunger -= 3, Thirst -= 4, Energy -= 2 per game hour
    let hungerLoss = 3 * gameHours;
    let waterLoss = 4 * gameHours;
    let energyLoss = 2 * gameHours;

    // Weather/Season impact on metabolic rates
    if (weather === "Heatwave") {
      waterLoss *= 2.0;
      energyLoss *= 1.4;
    }
    if (weather === "Stormy" || weather === "Snowy") {
      energyLoss *= 1.6;
      if (this.activity !== "Sleep" && Math.random() < 0.02) {
        this.activity = "Sleep"; // Animals hide during storms
      }
    }
    if (season === "Winter" && simulation.timeSystem.ecosystemType === "forest") {
      hungerLoss *= 1.3; // Cold — animals eat more
      energyLoss *= 1.2;
    }
    if (season === "Summer" && simulation.timeSystem.ecosystemType === "forest") {
      waterLoss *= 1.4; // More water loss in summer
    }
    if (season === "Spring") {
      // handled in plant growth
    }
    if (this.activity === "Sleep") {
      energyLoss = -3.0 * dt; // Regain energy
      hungerLoss *= 0.3;
      waterLoss *= 0.3;
    }
    if (this.activity === "Flee") {
      energyLoss *= 1.5;
    }

    // Apply loss
    this.hunger = Math.max(0, this.hunger - hungerLoss);
    this.energy = Math.max(0, Math.min(100, this.energy - energyLoss));
    if (simulation.timeSystem.ecosystemType !== "ocean") {
      this.water = Math.max(0, this.water - waterLoss);
    } else {
      this.water = 100; // Marine animals always fully hydrated
    }

    // Aging
    // Let's say 1 year = 1 in-game day (dayDurationSeconds).
    const yearsPerSecond = 1 / simulation.timeSystem.dayDurationSeconds;
    this.ageYears += dt * yearsPerSecond;

    // Health effects
    if (this.hunger <= 0 || this.water <= 0 || this.energy <= 0) {
      const dmgRate = (this.hunger <= 0 ? 5 : 0) + (this.water <= 0 ? 8 : 0) + (this.energy <= 0 ? 2 : 0);
      this.health = Math.max(0, this.health - dmgRate * dt);
      if (this.health <= 0) {
        const reason = this.hunger <= 0 ? "Starvation" : this.water <= 0 ? "Dehydration" : "Exhaustion";
        this.die(reason, simulation);
        return;
      }
    } else if (this.health < 100) {
      // Heal if well-fed
      this.health = Math.min(100, this.health + 1.0 * dt);
    }

    // Old Age death check
    if (this.ageYears >= this.maxAgeYears) {
      const deathChance = 0.02 * dt;
      if (Math.random() < deathChance) {
        this.die("Old Age", simulation);
        return;
      }
    }

    // Gestation
    if (this.pregnant) {
      this.gestationTimer += dt;
      if (this.gestationTimer >= this.gestationPeriod) {
        this.giveBirth(simulation);
      }
    }

    // Diurnal / Nocturnal speed and sleep modifiers
    const isNight = simulation.timeSystem.timeOfDay >= 18 || simulation.timeSystem.timeOfDay < 6;
    let diurnalSpeedMult = 1.0;
    
    const nocturnalSpecies = ["barn-owl", "snow-leopard", "amur-leopard", "arctic-fox", "king-cobra"];
    const diurnalSpecies = ["african-elephant", "giant-panda", "scarlet-macaw", "galapagos-tortoise"];
    
    if (isNight) {
      if (nocturnalSpecies.includes(this.speciesId)) {
        diurnalSpeedMult = 1.3; // Night hunter active boost
      } else if (diurnalSpecies.includes(this.speciesId)) {
        diurnalSpeedMult = 0.3; // Sleepy diurnal species
        if (this.energy < 75 && this.activity !== "Sleep") {
          this.activity = "Sleep";
        }
      }
    } else {
      if (nocturnalSpecies.includes(this.speciesId)) {
        diurnalSpeedMult = 0.5; // Rest during daylight
      }
    }
    this.diurnalSpeedMult = diurnalSpeedMult;

    // 2. AI Decision Making
    this._runAI(dt, simulation, grid, worldMap);

    // 3. Movement execution
    this._move(dt, worldMap, grid);
  }

  die(reason, simulation = null) {
    this.isDead = true;
    this.deathReason = reason;
    this.activity = "Dead";
    this.vx = 0;
    this.vy = 0;
    if (simulation) {
      simulation.populationStats.deaths++;
      simulation.populationStats.deathsByReason[reason] = (simulation.populationStats.deathsByReason[reason] || 0) + 1;
    }
  }

  giveBirth(simulation) {
    this.pregnant = false;
    this.gestationTimer = 0;
    this.mateCooldownTimer = this.reproductionCooldown;

    // Spawn 1-2 offspring nearby
    const spawnCount = (this.speciesId === "clownfish" || this.category === "Amphibians") 
      ? 2 + Math.floor(Math.random() * 3) 
      : 1;

    for (let i = 0; i < spawnCount; i++) {
      const ox = this.x + (Math.random() - 0.5) * 40;
      const oy = this.y + (Math.random() - 0.5) * 40;
      
      const child = new AnimalAgent(Date.now() + i, simulation.animalDefinitions[this.speciesId], ox, oy);
      child.ageYears = 0.05;
      child.hunger = 90;
      child.water = 90;
      child.energy = 90;
      child.parentIds = [this.id];
      this.childrenIds.push(child.id);
      child.baseSpeed *= 0.6; // Babies move slower
      
      simulation.addAnimalInstance(child);
      simulation.populationStats.births++;
    }

    simulation.educationalLogger.logEvent(
      simulation.timeSystem.day, 
      `${this.name} gave birth to offspring due to abundant resources.`,
      "reproduction"
    );
  }

  _runAI(dt, simulation, grid, worldMap) {
    // Simple state-machine AI (diploma project approach)
    if (this.isDead) return;

    // 1. Flee only when predator is close (not from across the map)
    const predators = grid.query(this.x, this.y, this.visionRadius, (entity) => {
      if (entity.isDead || entity.id === this.id) return false;
      if (entity instanceof PlantAgent) return false;
      const isMyPredator = isPreyMatch(this.predatorsList, entity.speciesId, entity.name) ||
                           (entity.preyList && isPreyMatch(entity.preyList, this.speciesId, this.name));
      return isMyPredator;
    });

    if (predators.length > 0) {
      let nearestPred = null;
      let minDist = Infinity;
      for (let p of predators) {
        const d = Math.hypot(p.x - this.x, p.y - this.y);
        if (d < minDist) { minDist = d; nearestPred = p; }
      }
      const fleeRange = nearestPred.activity === "Hunt" && nearestPred.chaseTarget === this ? 180 : 110;
      if (nearestPred && minDist < fleeRange) {
        this.activity = "Flee";
        this.beingHuntedBy = nearestPred;
        this.targetEntity = nearestPred;
        const hideSpot = this._findHideSpot(worldMap, nearestPred);
        if (hideSpot) this.targetEntity = { ...hideSpot, isHideSpot: true, predator: nearestPred };
        return;
      }
    }

    // 2. Sleep when tired (not while very hungry)
    if (this.energy < 20 && this.hunger > 35 && this.activity !== "Sleep") {
      this.activity = "Sleep";
      const shelter = this._findNearestShelter(worldMap);
      this.targetEntity = shelter || null;
      return;
    }
    if (this.activity === "Sleep") {
      if (this.energy >= 95) {
        this.activity = "Roam";
        this.targetEntity = null;
      } else {
        return;
      }
    }

    // 3. Thirst (terrestrial)
    if (simulation.timeSystem.ecosystemType !== "ocean" && this.water < 40 && this.hunger > 25) {
      this.activity = "SeekWater";
      const wInfo = worldMap.getNearestWater(this.x, this.y);
      if (wInfo) {
        this.targetEntity = { x: wInfo.x, y: wInfo.y, type: "water" };
        if (wInfo.dist < 22) {
          this.activity = "Drink";
          this.drinkTimer = 2.5;
          this.water = Math.min(100, this.water + 50);
          this.energy = Math.min(100, this.energy + 8);
        }
        return;
      }
    }

    // 4. Hunger — seek food early so behaviour is visible (threshold 55)
    const needsFood = this.hunger < 55;
    if (needsFood) {
      let foundFood = false;

      // Carnivores / omnivores: hunt live prey or scavenge
      if (this.diet === "carnivore" || this.diet === "omnivore") {
        const carcasses = grid.query(this.x, this.y, this.smellRadius, (entity) =>
          entity instanceof AnimalAgent && entity.isDead && !entity.wasScavenged
        );
        if (carcasses.length > 0) {
          let nearest = carcasses[0];
          let minD = Infinity;
          for (let c of carcasses) {
            const d = Math.hypot(c.x - this.x, c.y - this.y);
            if (d < minD) { minD = d; nearest = c; }
          }
          this.targetEntity = nearest;
          this.activity = "SeekFood";
          if (minD < 18) {
            nearest.wasScavenged = true;
            this.hunger = Math.min(100, this.hunger + 45);
            this.energy = Math.min(100, this.energy + 12);
            this.timeSinceLastMeal = 0;
            this.eatTimer = 2.5;
            simulation.educationalLogger.logEvent(simulation.timeSystem.day, `${this.name} scavenged a carcass.`, "predation");
            return;
          }
          foundFood = true;
        }

        if (!foundFood) {
          const preys = grid.query(this.x, this.y, this.smellRadius, (entity) => {
            if (entity.isDead || entity.id === this.id) return false;
            if (entity instanceof PlantAgent) return false;
            return isPreyMatch(this.preyList, entity.speciesId, entity.name);
          });

          if (preys.length > 0) {
            let nearestPrey = preys[0];
            let minDist = Infinity;
            for (let prey of preys) {
              const d = Math.hypot(prey.x - this.x, prey.y - this.y);
              if (d < minDist) { minDist = d; nearestPrey = prey; }
            }
            this.targetEntity = nearestPrey;
            if (this.chaseTarget && this.chaseTarget !== nearestPrey && this.chaseTarget.beingHuntedBy === this) {
              this.chaseTarget.beingHuntedBy = null;
            }
            this.chaseTarget = nearestPrey;
            nearestPrey.beingHuntedBy = this;
            this.activity = "Hunt";

            if (minDist < 18) {
              nearestPrey.die("Predator attack", simulation);
              nearestPrey.beingHuntedBy = null;
              this.chaseTarget = null;
              this.hunger = Math.min(100, this.hunger + 65);
              this.energy = Math.min(100, this.energy + 22);
              this.timeSinceLastMeal = 0;
              this.lifetimeKills++;
              this.eatTimer = 3;
              this.targetEntity = null;
              simulation.educationalLogger.logEvent(
                simulation.timeSystem.day,
                `${this.name} hunted and ate a ${nearestPrey.name}!`,
                "predation"
              );
              return;
            }
            foundFood = true;
          } else {
            if (this.chaseTarget?.beingHuntedBy === this) this.chaseTarget.beingHuntedBy = null;
            this.chaseTarget = null;
            this.energy = Math.max(0, this.energy - 0.8 * dt);
          }
        }
      }

      // Herbivores / omnivores: graze plants
      if ((this.diet === "herbivore" || this.diet === "omnivore") && this.hunger < 55) {
        const plants = grid.query(this.x, this.y, this.visionRadius * 1.2, (entity) =>
          entity instanceof PlantAgent && !entity.isDead && entity.growth > 0.12
        );

        if (plants.length > 0) {
          let nearestPlant = plants[0];
          let minDist = Infinity;
          for (let pl of plants) {
            const d = Math.hypot(pl.x - this.x, pl.y - this.y);
            if (d < minDist) { minDist = d; nearestPlant = pl; }
          }
          this.targetEntity = nearestPlant;
          this.activity = "SeekFood";

          if (minDist < 20) {
            this.activity = "Eat";
            nearestPlant.eat(0.35);
            this.hunger = Math.min(100, this.hunger + 35);
            this.energy = Math.min(100, this.energy + 8);
            this.timeSinceLastMeal = 0;
            this.eatTimer = 2.5;
            // keep targetEntity for eating animation
            return;
          }
          foundFood = true;
        }
      }

      if (foundFood) return;
      this.activity = "SeekFood";
      this.targetEntity = null;
      return;
    }

    // 5. Mating logic
    if (this.isAdult() && !this.pregnant && this.hunger > 65 && this.water > 65 && this.energy > 60 && this.mateCooldownTimer <= 0) {
      const currentSeason = simulation.timeSystem.getSeason();
      let correctSeason = true;
      if (simulation.timeSystem.ecosystemType === "forest" && currentSeason === "Winter") {
        correctSeason = false;
      }

      if (correctSeason) {
        this.activity = "SeekMate";
        
        const mates = grid.query(this.x, this.y, this.smellRadius, (entity) => {
          if (entity.isDead || entity.id === this.id) return false;
          if (entity instanceof PlantAgent) return false;
          return entity.speciesId === this.speciesId && 
                 entity.gender !== this.gender && 
                 entity.isAdult() && 
                 !entity.pregnant && 
                 entity.mateCooldownTimer <= 0 &&
                 entity.health > 60;
        });

        if (mates.length > 0) {
          let nearestMate = mates[0];
          let minDist = Infinity;
          for (let m of mates) {
            const d = Math.hypot(m.x - this.x, m.y - this.y);
            if (d < minDist) { minDist = d; nearestMate = m; }
          }
          this.targetEntity = nearestMate;
          
          if (minDist < 15) {
            if (this.gender === "Female") {
              this.pregnant = true;
              this.gestationTimer = 0;
            } else {
              nearestMate.pregnant = true;
              nearestMate.gestationTimer = 0;
            }
            this.mateCooldownTimer = this.reproductionCooldown;
            nearestMate.mateCooldownTimer = nearestMate.reproductionCooldown;
            this.activity = "Roam";
            this.targetEntity = null;
          }
          return;
        } else {
          this.targetEntity = null;
        }
      }
    }

    // 6. Wander randomly
    this.activity = "Roam";
    this.targetEntity = null;
  }

  _findNearestShelter(worldMap) {
    let nearest = null;
    let minDist = Infinity;
    for (let s of worldMap.shelters) {
      const d = Math.hypot(s.x - this.x, s.y - this.y);
      if (d < minDist) { minDist = d; nearest = s; }
    }
    return nearest;
  }

  _findHideSpot(worldMap, predator) {
    let best = null;
    let bestScore = -Infinity;
    for (let obs of worldMap.obstacles) {
      const distToMe = Math.hypot(obs.x - this.x, obs.y - this.y);
      const distToPred = Math.hypot(obs.x - predator.x, obs.y - predator.y);
      if (distToMe < 120 && distToMe < distToPred) {
        const score = distToPred - distToMe;
        if (score > bestScore) { bestScore = score; best = obs; }
      }
    }
    return best;
  }

  _computeFlockForce(grid) {
    if (!this.socialGroup) return { x: 0, y: 0 };
    const radius = this.herdRadius;
    const neighbors = grid.query(this.x, this.y, radius, (e) =>
      e instanceof AnimalAgent && e.speciesId === this.speciesId && e.id !== this.id && !e.isDead
    );
    if (neighbors.length === 0) return { x: 0, y: 0 };

    let avgX = 0, avgY = 0, avoidX = 0, avoidY = 0, alignX = 0, alignY = 0;
    for (let n of neighbors) {
      avgX += n.x;
      avgY += n.y;
      const dx = this.x - n.x;
      const dy = this.y - n.y;
      const d = Math.hypot(dx, dy);
      if (d < this.personalSpace && d > 0) {
        avoidX += (dx / d) * ((this.personalSpace - d) / this.personalSpace);
        avoidY += (dy / d) * ((this.personalSpace - d) / this.personalSpace);
      }
      alignX += n.vx;
      alignY += n.vy;
    }
    avgX /= neighbors.length;
    avgY /= neighbors.length;
    const cohStrength = this.herdSpecies ? 0.9 : 0.55;
    return {
      x: ((avgX - this.x) / radius) * cohStrength + avoidX * 1.2 + (alignX / neighbors.length) * 0.35,
      y: ((avgY - this.y) / radius) * cohStrength + avoidY * 1.2 + (alignY / neighbors.length) * 0.35,
    };
  }

  _applySeparation(grid) {
    const space = this.personalSpace;
    const neighbors = grid.query(this.x, this.y, space + 8, (e) =>
      e instanceof AnimalAgent && e.id !== this.id && !e.isDead
    );
    for (let n of neighbors) {
      const dx = this.x - n.x;
      const dy = this.y - n.y;
      const d = Math.hypot(dx, dy);
      if (d < space && d > 0.1) {
        const push = ((space - d) / space) * 12;
        this.x += (dx / d) * push;
        this.y += (dy / d) * push;
      }
    }
  }

  _move(dt, worldMap, grid) {
    if (this.activity === "Sleep") {
      this.vx *= 0.8;
      this.vy *= 0.8;
      this._applySeparation(grid);
      return;
    }

    let desireX = 0;
    let desireY = 0;
    let speedMult = 1.0;
    const flock = this._computeFlockForce(grid);
    const flockWeight = this.socialGroup ? (this.herdSpecies ? 0.45 : 0.3) : 0;

    if (this.activity === "Flee" && this.targetEntity) {
      if (this.targetEntity.isHideSpot) {
        const dx = this.targetEntity.x - this.x;
        const dy = this.targetEntity.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
          desireX = dx / dist;
          desireY = dy / dist;
        } else {
          const pdx = this.x - (this.targetEntity.predator?.x || this.x);
          const pdy = this.y - (this.targetEntity.predator?.y || this.y);
          const pd = Math.hypot(pdx, pdy) || 1;
          desireX = pdx / pd;
          desireY = pdy / pd;
        }
      } else {
        const dx = this.x - this.targetEntity.x;
        const dy = this.y - this.targetEntity.y;
        const dist = Math.hypot(dx, dy) || 1;
        desireX = dx / dist;
        desireY = dy / dist;
      }
      speedMult = 1.75;
    } else if (this.targetEntity && this.targetEntity.x != null) {
      const dx = this.targetEntity.x - this.x;
      const dy = this.targetEntity.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      desireX = dx / dist;
      desireY = dy / dist;
      if (this.activity === "Hunt") speedMult = 1.65;
      else if (this.activity === "SeekFood") speedMult = 1.15;
      else if (this.activity === "SeekWater") speedMult = 1.0;
      else if (this.activity === "SeekMate") speedMult = 0.85;
    } else {
      if (Math.random() < 0.04) {
        this.heading += (Math.random() - 0.5) * 1.2;
      }
      desireX = Math.cos(this.heading) * 0.4;
      desireY = Math.sin(this.heading) * 0.4;
      speedMult = 0.65;
    }

    desireX = desireX * (1 - flockWeight) + flock.x * flockWeight;
    desireY = desireY * (1 - flockWeight) + flock.y * flockWeight;
    const dLen = Math.hypot(desireX, desireY) || 1;
    desireX /= dLen;
    desireY /= dLen;

    const targetVx = desireX * this.baseSpeed * speedMult;
    const targetVy = desireY * this.baseSpeed * speedMult;
    this.vx += (targetVx - this.vx) * 0.12;
    this.vy += (targetVy - this.vy) * 0.12;

    const speed = Math.hypot(this.vx, this.vy);
    const maxSpeed = this.baseSpeed * speedMult;
    if (speed > maxSpeed && speed > 0) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    const nextX = this.x + this.vx * dt * 45;
    const nextY = this.y + this.vy * dt * 45;
    const coll = worldMap.isColliding(nextX, nextY, 12);
    if (coll.colliding) {
      this.vx = (this.vx + coll.pushX * this.baseSpeed) * 0.5;
      this.vy = (this.vy + coll.pushY * this.baseSpeed) * 0.5;
    }

    const prevX = this.x;
    const prevY = this.y;
    this.x += this.vx * dt * 45 * (this.diurnalSpeedMult || 1.0);
    this.y += this.vy * dt * 45 * (this.diurnalSpeedMult || 1.0);
    this.distanceTravelled += Math.hypot(this.x - prevX, this.y - prevY);
    this._applySeparation(grid);

    const border = 20;
    if (this.x < border) { this.x = border; this.vx *= -0.5; }
    if (this.x > worldMap.width - border) { this.x = worldMap.width - border; this.vx *= -0.5; }
    if (this.y < border) { this.y = border; this.vy *= -0.5; }
    if (this.y > worldMap.height - border) { this.y = worldMap.height - border; this.vy *= -0.5; }
    this.heading = Math.atan2(this.vy, this.vx);
  }
}

export class EducationalLogger {
  constructor() {
    this.logs = []; // Array of {day, message, category}
    this.explanations = []; // Queue of current educational warnings/explanations
  }

  logEvent(day, message, category = "general") {
    this.logs.unshift({
      day,
      timeString: `Day ${day}`,
      message,
      category
    });
    if (this.logs.length > 50) this.logs.pop();
  }

  triggerExplanation(title, desc, priority = "medium") {
    // Avoid duplicates
    if (this.explanations.some(e => e.title === title)) return;
    this.explanations.push({ title, desc, priority, id: Date.now() });
  }

  dismissExplanation(id) {
    this.explanations = this.explanations.filter(e => e.id !== id);
  }
}

export class Simulation {
  constructor(ecosystemType, worldSizeName) {
    this.ecosystemType = ecosystemType;
    this.worldSizeName = worldSizeName;

    // Set sizes
    let w = 1200;
    let h = 900;
    this.maxAnimals = 300;
    
    if (worldSizeName === "small") {
      w = 800; h = 600;
      this.maxAnimals = 150;
    } else if (worldSizeName === "large") {
      w = 1600; h = 1200;
      this.maxAnimals = 500;
    }

    this.width = w;
    this.height = h;

    this.timeSystem = new TimeSystem(ecosystemType);
    this.worldMap = new WorldMap(ecosystemType, w, h);
    this.grid = new SpatialHashGrid(w, h, 80);
    this.educationalLogger = new EducationalLogger();

    this.animals = [];
    this.plants = [];
    this.animalDefinitions = {}; // Lookup by id

    this.isPaused = false;
    this.speed = 1; // 1, 2, 4, 10

    // Budget, Modes and Events
    this.points = 180;
    this.mode = "sandbox"; // "sandbox" or "challenge"
    this.challengeComplete = false;
    this.challengeFailed = false;
    this.extinctSpecies = [];
    this.currentEvent = null;
    this.eventDuration = 0;
    this.eventChanceTimer = 0;

    // Carrying capacity by world size
    this.carryingCapacity = {
      herbivores: worldSizeName === "small" ? 30 : worldSizeName === "large" ? 80 : 50,
      predators: worldSizeName === "small" ? 8 : worldSizeName === "large" ? 20 : 15,
    };

    // Population tracking
    this.populationStats = {
      births: 0,
      deaths: 0,
      deathsByReason: {},
      males: 0,
      females: 0,
      juveniles: 0,
      adults: 0,
    };

    // Procedural terrain generation variables
    this.plantsSpawnTimer = 0;
    this.placedSpecies = new Set();
    
    // Stats history for graphs
    this.statsHistory = [];
    this.statsTimer = 0;
  }

  addAnimalDefinition(species) {
    this.animalDefinitions[species.id] = species;
  }

  addAnimalInstance(animal) {
    if (this.animals.length >= this.maxAnimals) return;
    this.animals.push(animal);
  }

  removeEntity(entity) {
    if (entity instanceof AnimalAgent) {
      this.animals = this.animals.filter(a => a.id !== entity.id);
    } else if (entity instanceof PlantAgent) {
      this.plants = this.plants.filter(p => p.id !== entity.id);
    }
  }

  spawnPlant(type, x, y) {
    const id = Date.now() + Math.random();
    const p = new PlantAgent(id, type, x, y);
    this.plants.push(p);
  }

  initializePlants() {
    const initialCount = this.worldSizeName === "small" ? 40 : this.worldSizeName === "large" ? 120 : 70;
    const types = this.ecosystemType === "forest" 
      ? ["tree", "bush", "flower", "grass"] 
      : ["kelp", "seagrass", "coral"];
    
    for (let i = 0; i < initialCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      let x, y;
      
      if (this.ecosystemType === "forest") {
        x = Math.random() * this.width;
        y = Math.random() * this.height;
        // Avoid placing on river center
        const nearestWater = this.worldMap.getNearestWater(x, y);
        if (nearestWater && nearestWater.dist < 15) continue;
      } else { // Ocean
        // Place mostly in shallow water reef shelf
        const isReef = Math.random() < 0.75;
        x = isReef ? Math.random() * this.worldMap.reefSplitX : Math.random() * this.width;
        y = Math.random() * this.height;
      }

      this.spawnPlant(type, x, y);
    }
  }

  update(dtSeconds) {
    if (this.isPaused) return;

    const scaledDt = dtSeconds * this.speed;
    const prevDay = this.timeSystem.day;
    this.timeSystem.update(scaledDt);
    const currDay = this.timeSystem.day;
    
    if (currDay > prevDay) {
      // Plant regrowth after 3 days
      for (let p of this.plants) {
        if (p.isDead && p.regrowDaysLeft > 0) {
          p.regrowDaysLeft--;
          if (p.regrowDaysLeft <= 0) {
            p.isDead = false;
            p.growth = 0.2;
            p.health = 100;
          }
        }
      }

      // Day changed! Reward ecosystem points in challenge mode
      if (this.mode === "challenge") {
        const { score } = this.getEcosystemScore();
        if (score >= 70) {
          this.points += 15;
          this.educationalLogger.logEvent(this.timeSystem.day, `🏆 Day ${currDay}: Earned +15 Ecosystem Points for maintaining positive balance.`, "general");
        } else {
          this.points += 5;
          this.educationalLogger.logEvent(this.timeSystem.day, `⚠️ Day ${currDay}: Earned +5 Ecosystem Points. Health score is low.`, "general");
        }
      }

      this._checkChallengeObjectives();
    }

    // Random Events rolling (every 45 simulation seconds)
    this.eventChanceTimer += scaledDt;
    if (this.eventChanceTimer >= 45) {
      this.eventChanceTimer = 0;
      if (!this.currentEvent && Math.random() < 0.12) { // 12% chance of event starting
        const forestEvents = ["forest_fire", "drought", "disease", "heavy_rain", "flood", "cold_wave"];
        const oceanEvents = ["oil_spill", "plastic_pollution", "storm_surge", "cold_wave"];
        const pool = this.ecosystemType === "forest" ? forestEvents : oceanEvents;
        this.currentEvent = pool[Math.floor(Math.random() * pool.length)];
        this.eventDuration = 30 + Math.random() * 30; // 30-60 simulation seconds
        
        let msg = "";
        if (this.currentEvent === "forest_fire") msg = "🚨 Wildfire alert! Dry foliage sparked a forest fire. Plants are burning!";
        else if (this.currentEvent === "drought") msg = "☀️ Drought alert! Temperatures are soaring, accelerating dehydration.";
        else if (this.currentEvent === "disease") msg = "🦠 Outbreak alert! Pathogens are draining animal health randomly.";
        else if (this.currentEvent === "heavy_rain") msg = "🌧️ Monsoon alert! Heavy rains are rapidly boosting plant growth.";
        else if (this.currentEvent === "oil_spill") msg = "🛢️ Ecological hazard! An oil spill is poisoning marine life.";
        else if (this.currentEvent === "plastic_pollution") msg = "🗑️ Plastic waste accumulation is choking ocean habitats.";
        else if (this.currentEvent === "storm_surge") msg = "⛈️ Hurricane storm surge! Heavy currents drain predator energy.";
        else if (this.currentEvent === "flood") msg = "🌊 Flood alert! Water levels rising, drowning low-ground plants.";
        else if (this.currentEvent === "cold_wave") msg = "🥶 Cold wave! Animals need more food to survive the chill.";

        this.educationalLogger.logEvent(this.timeSystem.day, msg, "general");
      }
    }

    if (this.currentEvent) {
      this.eventDuration -= scaledDt;
      if (this.eventDuration <= 0) {
        this.educationalLogger.logEvent(this.timeSystem.day, `☀️ The environmental event (${this.currentEvent.replace("_", " ")}) has ended.`, "general");
        this.currentEvent = null;
      } else {
        // Apply event continuous effects
        if (this.currentEvent === "forest_fire") {
          if (Math.random() < 0.15 * scaledDt) {
            const living = this.plants.filter(p => !p.isDead);
            if (living.length > 0) {
              living[Math.floor(Math.random() * living.length)].isDead = true;
            }
          }
          for (let a of this.animals) {
            if (!a.isDead && Math.random() < 0.08) {
              a.health = Math.max(0, a.health - 8 * scaledDt);
            }
          }
        } else if (this.currentEvent === "drought") {
          for (let a of this.animals) {
            if (!a.isDead) a.water = Math.max(0, a.water - 8 * scaledDt);
          }
        } else if (this.currentEvent === "disease") {
          for (let a of this.animals) {
            if (!a.isDead && Math.random() < 0.25) {
              a.health = Math.max(0, a.health - 5 * scaledDt);
            }
          }
        } else if (this.currentEvent === "heavy_rain") {
          for (let p of this.plants) {
            p.growth = Math.min(1.0, p.growth + 0.05 * scaledDt);
          }
        } else if (this.currentEvent === "oil_spill" || this.currentEvent === "plastic_pollution") {
          for (let a of this.animals) {
            if (!a.isDead) {
              a.health = Math.max(0, a.health - 2.5 * scaledDt);
              a.energy = Math.max(0, a.energy - 3 * scaledDt);
            }
          }
        } else if (this.currentEvent === "flood") {
          for (let p of this.plants) {
            if (!p.isDead && Math.random() < 0.1 * scaledDt) p.isDead = true;
          }
        } else if (this.currentEvent === "cold_wave") {
          for (let a of this.animals) {
            if (!a.isDead) {
              a.hunger = Math.max(0, a.hunger - 3 * scaledDt);
              a.energy = Math.max(0, a.energy - 2 * scaledDt);
            }
          }
        }
      }
    }

    // 2. Rebuild spatial hash grid
    this.grid.clear();
    for (let a of this.animals) this.grid.insert(a);
    for (let p of this.plants) this.grid.insert(p);

    // 3. Update plants
    for (let p of this.plants) {
      p.update(scaledDt, this.timeSystem);
    }
    this.plants = this.plants.filter(p => !p.isDead || p.regrowDaysLeft > 0);

    // Update population demographics
    this._updatePopulationDemographics();

    // Carrying capacity warning
    this._checkCarryingCapacity();

    // Spawning new plants organically
    this.plantsSpawnTimer += scaledDt;
    if (this.plantsSpawnTimer >= 15) {
      this.plantsSpawnTimer = 0;
      this._spreadPlantsOrganic();
    }

    // 4. Update animals
    for (let a of this.animals) {
      a.update(scaledDt, this, this.grid, this.worldMap);
    }

    // 5. Track statistics history (every 5 simulation seconds)
    this.statsTimer += scaledDt;
    if (this.statsTimer >= 5) {
      this.statsTimer = 0;
      this._recordStats();
    }

    // 6. Educational checks
    this._runEducationalEvaluator();
  }

  _updatePopulationDemographics() {
    let males = 0, females = 0, juveniles = 0, adults = 0;
    for (let a of this.animals) {
      if (a.isDead) continue;
      if (a.gender === "Male") males++; else females++;
      if (a.isAdult()) adults++; else juveniles++;
    }
    this.populationStats.males = males;
    this.populationStats.females = females;
    this.populationStats.juveniles = juveniles;
    this.populationStats.adults = adults;
  }

  _checkCarryingCapacity() {
    let herbivores = 0, carnivores = 0;
    for (let a of this.animals) {
      if (a.isDead) continue;
      if (a.diet === "herbivore" || a.diet === "omnivore") herbivores++;
      if (a.diet === "carnivore") carnivores++;
    }
    if (herbivores > this.carryingCapacity.herbivores) {
      this.educationalLogger.triggerExplanation(
        "Carrying Capacity Exceeded: Herbivores",
        `This forest can support ~${this.carryingCapacity.herbivores} herbivores. With ${herbivores} present, food shortage is imminent.`,
        "medium"
      );
    }
    if (carnivores > this.carryingCapacity.predators) {
      this.educationalLogger.triggerExplanation(
        "Carrying Capacity Exceeded: Predators",
        `Too many predators (${carnivores}) for available prey. Predator starvation will follow.`,
        "medium"
      );
    }
  }

  _checkChallengeObjectives() {
    if (this.mode !== "challenge" || this.challengeComplete || this.challengeFailed) return;

    const day = this.timeSystem.day;
    const { score } = this.getEcosystemScore();
    const bio = this.getBiodiversityScore();

    if (day >= 100 && score >= 30) {
      this.challengeComplete = true;
      this.educationalLogger.triggerExplanation(
        "🏆 Challenge Complete!",
        `You kept the ecosystem alive for 100 days with a health score of ${score}%.`,
        "high"
      );
    }
    if (bio.pct >= 80 && this.placedSpecies.size >= 4) {
      this.challengeComplete = true;
      this.educationalLogger.triggerExplanation(
        "🏆 Biodiversity Victory!",
        `Maintained ${bio.pct}% biodiversity across ${bio.count} species.`,
        "high"
      );
    }
    if (score >= 90) {
      this.challengeComplete = true;
      this.educationalLogger.triggerExplanation(
        "🏆 Ecosystem Excellence!",
        `Achieved an ecosystem health score of ${score}% — Excellent balance!`,
        "high"
      );
    }
    if (this.extinctSpecies.length >= 3) {
      this.challengeFailed = true;
      this.educationalLogger.triggerExplanation(
        "❌ Challenge Failed",
        `${this.extinctSpecies.length} species went extinct. The ecosystem collapsed.`,
        "high"
      );
    }
  }

  catchUp(elapsedSeconds) {
    if (this.isPaused) return;
    
    // Limit catch up to a maximum of 900 seconds (15 minutes of real time) to avoid browser freeze
    const limit = Math.min(elapsedSeconds, 900);
    const stepSize = 0.5; // Run in 0.5s ticks
    const steps = Math.floor(limit / stepSize);
    
    for (let i = 0; i < steps; i++) {
      this.update(stepSize);
    }
  }

  getEcosystemScore() {
    let activeAnimals = this.animals.filter(a => !a.isDead).length;
    if (activeAnimals === 0) return { score: 0, status: "Collapsed" };
    
    let herbivores = this.animals.filter(a => !a.isDead && a.diet === "herbivore").length;
    let carnivores = this.animals.filter(a => !a.isDead && a.diet === "carnivore").length;
    let plantsCount = this.plants.filter(p => !p.isDead).length;
    
    let predatorHerbivoreRatio = herbivores > 0 ? (carnivores / herbivores) : 0;
    let plantHerbivoreRatio = herbivores > 0 ? (plantsCount / herbivores) : 0;
    
    let score = 100;
    
    // Penalize improper ratios
    if (predatorHerbivoreRatio > 0.4) score -= 30; // Overabundance of predators
    if (predatorHerbivoreRatio === 0) score -= 25; // Complete absence of predators
    if (plantHerbivoreRatio < 1.0) score -= 30; // Defoliation/starvation warnings
    if (plantsCount === 0) score -= 40;
    
    // Health factors
    let totalHealth = 0;
    for (let a of this.animals) {
      if (!a.isDead) totalHealth += a.health;
    }
    let avgHealth = totalHealth / activeAnimals;
    if (avgHealth < 75) score -= (75 - avgHealth) * 1.2;
    
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    let status = "Balanced";
    if (score >= 85) status = "Excellent";
    else if (score >= 60) status = "Balanced";
    else if (score >= 30) status = "Unstable";
    else status = "Collapsed";
    
    return { score, status };
  }

  getBiodiversityScore() {
    const species = new Set();
    for (let a of this.animals) {
      if (!a.isDead) species.add(a.speciesId);
    }
    const count = species.size;
    
    let pct = 0;
    if (count >= 7) pct = 98;
    else if (count === 6) pct = 90;
    else if (count === 5) pct = 80;
    else if (count === 4) pct = 65;
    else if (count === 3) pct = 45;
    else if (count === 2) pct = 25;
    else if (count === 1) pct = 10;
    
    return { count, pct };
  }

  _spreadPlantsOrganic() {
    if (this.plants.length > this.maxAnimals * 2.5) return; // Cap plants
    
    const count = this.plants.length;
    for (let i = 0; i < Math.min(count, 5); i++) {
      const parent = this.plants[Math.floor(Math.random() * count)];
      if (parent && parent.growth > 0.75) {
        // Spread seed nearby
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 60;
        const sx = parent.x + Math.cos(angle) * dist;
        const sy = parent.y + Math.sin(angle) * dist;
        
        if (sx > 10 && sx < this.width - 10 && sy > 10 && sy < this.height - 10) {
          const coll = this.worldMap.isColliding(sx, sy, 5);
          if (!coll.colliding) {
            this.spawnPlant(parent.type, sx, sy);
          }
        }
      }
    }
  }

  _recordStats() {
    let herbivores = 0;
    let carnivores = 0;
    let omnivores = 0;
    let totalAge = 0;
    let totalHealth = 0;
    let activeAnimals = 0;

    for (let a of this.animals) {
      if (a.isDead) continue;
      activeAnimals++;
      totalAge += a.ageYears;
      totalHealth += a.health;
      
      if (a.diet === "herbivore") herbivores++;
      else if (a.diet === "carnivore") carnivores++;
      else omnivores++;
    }

    const stat = {
      day: this.timeSystem.day,
      time: parseFloat(this.timeSystem.timeOfDay.toFixed(1)),
      period: this.timeSystem.getPeriodOfDay(),
      herbivores,
      carnivores,
      omnivores,
      animalsCount: activeAnimals,
      plantsCount: this.plants.filter(p => !p.isDead).length,
      births: this.populationStats.births,
      deaths: this.populationStats.deaths,
      males: this.populationStats.males,
      females: this.populationStats.females,
      juveniles: this.populationStats.juveniles,
      adults: this.populationStats.adults,
      averageAge: activeAnimals > 0 ? parseFloat((totalAge / activeAnimals).toFixed(1)) : 0,
      averageHealth: activeAnimals > 0 ? Math.round(totalHealth / activeAnimals) : 0,
      averageHunger: activeAnimals > 0 ? Math.round(this.animals.filter(a => !a.isDead).reduce((s, a) => s + a.hunger, 0) / activeAnimals) : 0,
      temperature: this.timeSystem.temperature,
      weather: this.timeSystem.currentWeather,
      season: this.timeSystem.getSeason(),
      ecosystemScore: this.getEcosystemScore().score,
      biodiversity: this.getBiodiversityScore().pct,
    };

    this.statsHistory.push(stat);
    if (this.statsHistory.length > 100) {
      this.statsHistory.shift(); // keep last 100 data points
    }
  }

  _runEducationalEvaluator() {
    // Collect active animals
    let herbivoreCount = 0;
    let carnivoreCount = 0;
    let speciesCounts = {};

    for (let a of this.animals) {
      if (a.isDead) continue;
      speciesCounts[a.speciesId] = (speciesCounts[a.speciesId] || 0) + 1;
      if (a.diet === "herbivore") herbivoreCount++;
      else if (a.diet === "carnivore") carnivoreCount++;
    }

    // 1. Trophic Cascade warnings
    if (this.animals.length > 10) {
      if (herbivoreCount === 0 && carnivoreCount > 0) {
        this.educationalLogger.triggerExplanation(
          "Trophic Collapse: Predator Starvation",
          "There are no herbivores in the ecosystem, leaving carnivores with no food source. Predators will struggle to survive and starves.",
          "high"
        );
      }
      if (carnivoreCount === 0 && herbivoreCount > 15) {
        this.educationalLogger.triggerExplanation(
          "Overpopulation Cascade: Absence of Predators",
          "Without predators to control the population, herbivores are reproducing unchecked. They will soon overgraze and eat all the plants, leading to a food supply collapse.",
          "high"
        );
      }
    }

    // 2. Overgrazing warning
    if (this.plants.length < 5 && herbivoreCount > 10) {
      this.educationalLogger.triggerExplanation(
        "Overgrazing Disaster",
        "Herbivores have consumed almost all vegetation. A severe famine is beginning, which will cause a mass population crash due to starvation.",
        "high"
      );
    }

    // 3. Weather impact logging
    const weather = this.timeSystem.currentWeather;
    const day = this.timeSystem.day;
    if (weather === "Heatwave" && Math.random() < 0.005) {
      this.educationalLogger.logEvent(
        day,
        "A severe heatwave is causing water sources to deplete faster. Watch for dehydration.",
        "weather"
      );
      this.educationalLogger.triggerExplanation(
        "Climatic Stress: Drought",
        "Extreme heat triggers rapid water loss in terrestrial animals. Herbivore birth rates fall, and animals must travel frequently to rivers and lakes to avoid dehydration.",
        "medium"
      );
    }

    if (weather === "Stormy" && Math.random() < 0.005) {
      this.educationalLogger.logEvent(
        day,
        "Heavy storm currents have increased energy loss in ocean swimming.",
        "weather"
      );
    }

    // Check for extinctions
    // We check species definitions present in the world
    const activeSpecies = Object.keys(speciesCounts);
    
    // If we had a species but now it's 0, it went extinct
    // To make this robust, we only check species that have been placed at least once.
    // We can track this using placed flags, or check if we had them in statsHistory.
    if (this.statsHistory.length > 5) {
      const prevStats = this.statsHistory[0]; // some baseline earlier
      // We look at all registered species definitions
      for (let sId in this.animalDefinitions) {
        const def = this.animalDefinitions[sId];
        // If it's matching our ecosystem type (ocean vs land)
        const isOceanSpecies = def.habitat === "Ocean";
        const matchesEco = (this.ecosystemType === "ocean" && isOceanSpecies) || (this.ecosystemType === "forest" && !isOceanSpecies);
        if (!matchesEco) continue;

        const count = speciesCounts[sId] || 0;
        // Check if we previously had this species in the simulation
        const hadItBefore = this.statsHistory.some(h => {
          // Check if species was alive in any past frame (we can check statsHistory or define an activeSpecies set)
          return this.animals.some(a => a.speciesId === sId); // if it was added
        });

        // Let's track placed species directly
        if (this.placedSpecies && this.placedSpecies.has(sId) && count === 0) {
          this.placedSpecies.delete(sId);
          this.extinctSpecies.push(def.name);
          this.educationalLogger.logEvent(
            day,
            `⚠ ${def.name} became extinct. Reason: No prey available or habitat collapse.`,
            "extinction"
          );
          
          let reason = "absence of prey, over-predation, habitat size limits, or severe climate cycles";
          if (herbivoreCount === 0 && carnivoreCount > 0 && def.diet?.toLowerCase() === "carnivore") {
            reason = "no prey available — predators depend on prey populations";
          } else if (this.plants.filter(p => !p.isDead).length < 5 && def.diet?.toLowerCase() === "herbivore") {
            reason = "food shortage caused by plant depletion";
          }

          this.educationalLogger.triggerExplanation(
            `Extinction: ${def.name}`,
            `The ${def.name} population collapsed to zero. ${reason.charAt(0).toUpperCase() + reason.slice(1)}.`,
            "high"
          );
        }
      }
    }
  }

  // ─── SAVE / LOAD SERIALIZATION ─────────────────────────────────────────────
  serialize() {
    return {
      ecosystem_type: this.ecosystemType,
      world_size: this.worldSizeName,
      mode: this.mode,
      points: this.points,
      populationStats: this.populationStats,
      extinctSpecies: this.extinctSpecies,
      challengeComplete: this.challengeComplete,
      challengeFailed: this.challengeFailed,
      time: {
        timeOfDay: this.timeSystem.timeOfDay,
        day: this.timeSystem.day,
        year: this.timeSystem.year,
        seasonIndex: this.timeSystem.seasonIndex,
        currentWeather: this.timeSystem.currentWeather,
        weatherTimer: this.timeSystem.weatherTimer,
        temperature: this.timeSystem.temperature
      },
      animals: this.animals.map(a => ({
        speciesId: a.speciesId,
        x: a.x,
        y: a.y,
        vx: a.vx,
        vy: a.vy,
        heading: a.heading,
        gender: a.gender,
        ageYears: a.ageYears,
        health: a.health,
        hunger: a.hunger,
        water: a.water,
        energy: a.energy,
        pregnant: a.pregnant,
        gestationTimer: a.gestationTimer,
        activity: a.activity,
        isDead: a.isDead,
        deathReason: a.deathReason,
        timeAliveSeconds: a.timeAliveSeconds,
        timeSinceLastMeal: a.timeSinceLastMeal,
        lifetimeKills: a.lifetimeKills,
        distanceTravelled: a.distanceTravelled,
        parentIds: a.parentIds,
        childrenIds: a.childrenIds,
        decayTimer: a.decayTimer,
        wasScavenged: a.wasScavenged,
      })),
      plants: this.plants.map(p => ({
        type: p.type,
        x: p.x,
        y: p.y,
        growth: p.growth,
        health: p.health,
        isDead: p.isDead,
        regrowDaysLeft: p.regrowDaysLeft,
      })),
      worldObstacles: this.worldMap.obstacles,
      placedSpeciesList: Array.from(this.placedSpecies || []),
      statsHistory: this.statsHistory,
      logs: this.educationalLogger.logs
    };
  }

  deserialize(state) {
    // Load Time
    this.timeSystem.timeOfDay = state.time.timeOfDay;
    this.timeSystem.day = state.time.day;
    this.timeSystem.year = state.time.year;
    this.timeSystem.seasonIndex = state.time.seasonIndex;
    this.timeSystem.currentWeather = state.time.currentWeather;
    this.timeSystem.weatherTimer = state.time.weatherTimer;
    this.timeSystem.temperature = state.time.temperature;

    // Load mode & stats
    this.mode = state.mode || "sandbox";
    this.points = state.points ?? this.points;
    this.populationStats = state.populationStats || this.populationStats;
    this.extinctSpecies = state.extinctSpecies || [];
    this.challengeComplete = state.challengeComplete || false;
    this.challengeFailed = state.challengeFailed || false;

    // Load Placed Species Set
    this.placedSpecies = new Set(state.placedSpeciesList || []);

    // Restore world obstacles
    if (state.worldObstacles) {
      this.worldMap.obstacles = state.worldObstacles;
    }

    // Load Plants
    this.plants = state.plants.map(pData => {
      const p = new PlantAgent(Date.now() + Math.random(), pData.type, pData.x, pData.y);
      p.growth = pData.growth;
      p.health = pData.health;
      p.isDead = pData.isDead;
      p.regrowDaysLeft = pData.regrowDaysLeft || 0;
      return p;
    });

    // Load Animals
    this.animals = state.animals.map(aData => {
      const def = this.animalDefinitions[aData.speciesId];
      if (!def) return null;
      const a = new AnimalAgent(Date.now() + Math.random(), def, aData.x, aData.y);
      a.vx = aData.vx;
      a.vy = aData.vy;
      a.heading = aData.heading;
      a.gender = aData.gender;
      a.ageYears = aData.ageYears;
      a.health = aData.health;
      a.hunger = aData.hunger;
      a.water = aData.water;
      a.energy = aData.energy;
      a.pregnant = aData.pregnant;
      a.gestationTimer = aData.gestationTimer;
      a.activity = aData.activity;
      a.isDead = aData.isDead;
      a.deathReason = aData.deathReason;
      a.timeAliveSeconds = aData.timeAliveSeconds;
      a.decayTimer = aData.decayTimer;
      a.timeSinceLastMeal = aData.timeSinceLastMeal || 0;
      a.lifetimeKills = aData.lifetimeKills || 0;
      a.distanceTravelled = aData.distanceTravelled || 0;
      a.parentIds = aData.parentIds || [];
      a.childrenIds = aData.childrenIds || [];
      a.wasScavenged = aData.wasScavenged || false;
      return a;
    }).filter(Boolean);

    // Load history
    this.statsHistory = state.statsHistory || [];
    this.educationalLogger.logs = state.logs || [];
  }
}

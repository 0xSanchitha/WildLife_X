import os
import re

app_path = r"c:\Users\Sandun Shyamantha\Desktop\Project\backend\app.py"

# Read original app.py
with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

# Define the new SEED_ANIMALS list (80 items)
seed_animals_code = """SEED_ANIMALS = [
    # --- FOREST (10 items) ---
    {
        "id": "wolf",
        "name": "Wolf",
        "scientificName": "Canis lupus",
        "category": "Mammals",
        "habitat": "Forest",
        "conservationStatus": "Least Concern",
        "description": "A highly social predator that hunts in structured family packs, keeping herbivore populations healthy.",
        "diet": "Carnivore",
        "lifespan": "6–8 years wild",
        "speed": "60 km/h",
        "weight": "30–50 kg",
        "population": 100,
        "predators": ["bear"],
        "prey": ["deer", "rabbit"],
        "images": ["https://images.unsplash.com/photo-1590424753858-3b661986c10b?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 60, "strength": 70,
            "defense": 50, "reproductionRate": 0.25, "intelligence": 80, "aggression": 65
        }
    },
    {
        "id": "deer",
        "name": "Deer",
        "scientificName": "Odocoileus virginianus",
        "category": "Mammals",
        "habitat": "Forest",
        "conservationStatus": "Least Concern",
        "description": "An elegant herbivorous mammal that grazes on foliage, reproducing quickly and serving as staple prey.",
        "diet": "Herbivore",
        "lifespan": "6–14 years",
        "speed": "48 km/h",
        "weight": "50–100 kg",
        "population": 100,
        "predators": ["wolf", "bear"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1484406566174-9da000fda645?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 55, "strength": 30,
            "defense": 40, "reproductionRate": 0.40, "intelligence": 50, "aggression": 5
        }
    },
    {
        "id": "bear",
        "name": "Bear",
        "scientificName": "Ursus arctos",
        "category": "Mammals",
        "habitat": "Forest",
        "conservationStatus": "Least Concern",
        "description": "A massive, powerful omnivore that eats fish, berries, and small to large mammals.",
        "diet": "Omnivore",
        "lifespan": "20–25 years",
        "speed": "40 km/h",
        "weight": "150–350 kg",
        "population": 100,
        "predators": [],
        "prey": ["deer"],
        "images": ["https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 75, "hunger": 25, "speed": 40, "strength": 90,
            "defense": 80, "reproductionRate": 0.15, "intelligence": 75, "aggression": 50
        }
    },
    {
        "id": "fox",
        "name": "Fox",
        "scientificName": "Vulpes vulpes",
        "category": "Mammals",
        "habitat": "Forest",
        "conservationStatus": "Least Concern",
        "description": "An intelligent, adaptive predator that hunts small rodents and rabbits with resourcefulness.",
        "diet": "Carnivore",
        "lifespan": "2–5 years",
        "speed": "50 km/h",
        "weight": "5–10 kg",
        "population": 100,
        "predators": ["wolf"],
        "prey": ["rabbit"],
        "images": ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 85, "hunger": 15, "speed": 50, "strength": 35,
            "defense": 30, "reproductionRate": 0.35, "intelligence": 85, "aggression": 40
        }
    },
    {
        "id": "rabbit",
        "name": "Rabbit",
        "scientificName": "Sylvilagus floridanus",
        "category": "Mammals",
        "habitat": "Forest",
        "conservationStatus": "Least Concern",
        "description": "A small herbivorous prey animal that is highly fertile. Relies on speed to escape predators.",
        "diet": "Herbivore",
        "lifespan": "2–3 years",
        "speed": "35 km/h",
        "weight": "1–2 kg",
        "population": 100,
        "predators": ["wolf", "fox", "owl"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 95, "hunger": 5, "speed": 45, "strength": 10,
            "defense": 15, "reproductionRate": 0.65, "intelligence": 45, "aggression": 2
        }
    },
    {
        "id": "owl",
        "name": "Owl",
        "scientificName": "Bubo virginianus",
        "category": "Birds",
        "habitat": "Forest",
        "conservationStatus": "Least Concern",
        "description": "A nocturnal bird of prey with silent flight and excellent night vision.",
        "diet": "Carnivore",
        "lifespan": "5–15 years",
        "speed": "65 km/h",
        "weight": "1–2 kg",
        "population": 100,
        "predators": ["bear"],
        "prey": ["rabbit"],
        "images": ["https://images.unsplash.com/photo-1509909756405-be0199881695?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 85, "hunger": 15, "speed": 60, "strength": 30,
            "defense": 20, "reproductionRate": 0.25, "intelligence": 75, "aggression": 40
        }
    },
    {
        "id": "squirrel",
        "name": "Squirrel",
        "scientificName": "Sciurus vulgaris",
        "category": "Mammals",
        "habitat": "Forest",
        "conservationStatus": "Least Concern",
        "description": "A small rodent that builds nests in trees, hoarding acorns and seeds.",
        "diet": "Herbivore",
        "lifespan": "3–6 years",
        "speed": "20 km/h",
        "weight": "0.3–0.5 kg",
        "population": 100,
        "predators": ["wolf", "fox", "owl"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 35, "strength": 10,
            "defense": 15, "reproductionRate": 0.50, "intelligence": 60, "aggression": 5
        }
    },
    {
        "id": "woodpecker",
        "name": "Woodpecker",
        "scientificName": "Dryocopus martius",
        "category": "Birds",
        "habitat": "Forest",
        "conservationStatus": "Least Concern",
        "description": "Pecks wood to extract insects, drumming on tree trunks to communicate.",
        "diet": "Omnivore",
        "lifespan": "4–11 years",
        "speed": "25 km/h",
        "weight": "0.2–0.3 kg",
        "population": 100,
        "predators": ["fox", "owl"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 88, "hunger": 12, "speed": 30, "strength": 15,
            "defense": 20, "reproductionRate": 0.35, "intelligence": 50, "aggression": 10
        }
    },
    {
        "id": "boar",
        "name": "Wild Boar",
        "scientificName": "Sus scrofa",
        "category": "Mammals",
        "habitat": "Forest",
        "conservationStatus": "Least Concern",
        "description": "A bulky forest mammal that digs roots and eats both plants and insects.",
        "diet": "Omnivore",
        "lifespan": "10–14 years",
        "speed": "40 km/h",
        "weight": "60–100 kg",
        "population": 100,
        "predators": ["wolf", "bear"],
        "prey": ["rabbit"],
        "images": ["https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 40, "strength": 60,
            "defense": 50, "reproductionRate": 0.30, "intelligence": 55, "aggression": 35
        }
    },
    {
        "id": "lynx",
        "name": "Lynx",
        "scientificName": "Lynx lynx",
        "category": "Mammals",
        "habitat": "Forest",
        "conservationStatus": "Least Concern",
        "description": "A medium-sized wild cat with tufted ears, hunting forest rabbits and deer.",
        "diet": "Carnivore",
        "lifespan": "10–12 years",
        "speed": "50 km/h",
        "weight": "15–30 kg",
        "population": 100,
        "predators": ["wolf", "bear"],
        "prey": ["rabbit", "deer"],
        "images": ["https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 82, "hunger": 18, "speed": 55, "strength": 55,
            "defense": 40, "reproductionRate": 0.22, "intelligence": 75, "aggression": 60
        }
    },
    # --- OCEAN (10 items) ---
    {
        "id": "shark",
        "name": "Shark",
        "scientificName": "Carcharodon carcharias",
        "category": "Fish",
        "habitat": "Ocean",
        "conservationStatus": "Vulnerable",
        "description": "The ocean's ultimate apex predator. Hunts fish, dolphins, and sea turtles.",
        "diet": "Carnivore",
        "lifespan": "30–70 years",
        "speed": "40 km/h",
        "weight": "600–1100 kg",
        "population": 100,
        "predators": [],
        "prey": ["fish", "dolphin", "turtle", "sea_lion", "octopus"],
        "images": ["https://images.unsplash.com/photo-1504595403659-9088ce801e29?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 55, "strength": 85,
            "defense": 70, "reproductionRate": 0.12, "intelligence": 60, "aggression": 80
        }
    },
    {
        "id": "fish",
        "name": "Fish",
        "scientificName": "Thunnus albacares",
        "category": "Fish",
        "habitat": "Ocean",
        "conservationStatus": "Least Concern",
        "description": "Small and medium schooling fish that consume zooplankton and form the base of marine webs.",
        "diet": "Herbivore",
        "lifespan": "5–9 years",
        "speed": "70 km/h",
        "weight": "2–20 kg",
        "population": 100,
        "predators": ["shark", "dolphin", "whale", "sea_lion", "seagull", "octopus"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 60, "strength": 15,
            "defense": 20, "reproductionRate": 0.60, "intelligence": 30, "aggression": 5
        }
    },
    {
        "id": "dolphin",
        "name": "Dolphin",
        "scientificName": "Tursiops truncatus",
        "category": "Mammals",
        "habitat": "Ocean",
        "conservationStatus": "Least Concern",
        "description": "Extremely intelligent marine mammals. Hunt fish in cooperative pods.",
        "diet": "Carnivore",
        "lifespan": "40 years",
        "speed": "35 km/h",
        "weight": "150–300 kg",
        "population": 100,
        "predators": ["shark"],
        "prey": ["fish", "octopus"],
        "images": ["https://images.unsplash.com/photo-1570481662006-a3a13746fe4e?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 85, "hunger": 15, "speed": 50, "strength": 50,
            "defense": 45, "reproductionRate": 0.20, "intelligence": 90, "aggression": 30
        }
    },
    {
        "id": "whale",
        "name": "Whale",
        "scientificName": "Megaptera novaeangliae",
        "category": "Mammals",
        "habitat": "Ocean",
        "conservationStatus": "Least Concern",
        "description": "Giant marine filter feeders that travel vast paths, consuming krill and small fish.",
        "diet": "Filter Feeder",
        "lifespan": "45–90 years",
        "speed": "15 km/h",
        "weight": "25,000–30,000 kg",
        "population": 100,
        "predators": ["shark"],
        "prey": ["fish"],
        "images": ["https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 20, "strength": 95,
            "defense": 90, "reproductionRate": 0.08, "intelligence": 80, "aggression": 10
        }
    },
    {
        "id": "turtle",
        "name": "Sea Turtle",
        "scientificName": "Chelonia mydas",
        "category": "Reptiles",
        "habitat": "Ocean",
        "conservationStatus": "Endangered",
        "description": "An ancient marine reptile feeding mainly on seagrass. Shell offers massive defense.",
        "diet": "Herbivore",
        "lifespan": "60–80 years",
        "speed": "10 km/h",
        "weight": "100–190 kg",
        "population": 100,
        "predators": ["shark"],
        "prey": ["jellyfish"],
        "images": ["https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 25, "strength": 35,
            "defense": 75, "reproductionRate": 0.18, "intelligence": 45, "aggression": 5
        }
    },
    {
        "id": "octopus",
        "name": "Octopus",
        "scientificName": "Octopus vulgaris",
        "category": "Invertebrates",
        "habitat": "Ocean",
        "conservationStatus": "Least Concern",
        "description": "An intelligent, soft-bodied invertebrate with eight arms capable of camouflage.",
        "diet": "Carnivore",
        "lifespan": "1–3 years",
        "speed": "40 km/h",
        "weight": "5–10 kg",
        "population": 100,
        "predators": ["shark", "dolphin"],
        "prey": ["fish"],
        "images": ["https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 85, "hunger": 15, "speed": 35, "strength": 40,
            "defense": 45, "reproductionRate": 0.35, "intelligence": 95, "aggression": 20
        }
    },
    {
        "id": "crab",
        "name": "Crab",
        "scientificName": "Cancer pagurus",
        "category": "Invertebrates",
        "habitat": "Ocean",
        "conservationStatus": "Least Concern",
        "description": "Decapod crustacean armored with a thick exoskeleton and formidable claws.",
        "diet": "Omnivore",
        "lifespan": "5–10 years",
        "speed": "6 km/h",
        "weight": "0.5–1 kg",
        "population": 100,
        "predators": ["shark", "octopus"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 92, "hunger": 8, "speed": 10, "strength": 30,
            "defense": 65, "reproductionRate": 0.45, "intelligence": 40, "aggression": 15
        }
    },
    {
        "id": "jellyfish",
        "name": "Jellyfish",
        "scientificName": "Aurelia aurita",
        "category": "Invertebrates",
        "habitat": "Ocean",
        "conservationStatus": "Least Concern",
        "description": "Gelatinous drifting sea creature equipped with stinging tentacles to catch fish.",
        "diet": "Carnivore",
        "lifespan": "1 year",
        "speed": "5 km/h",
        "weight": "0.1–0.5 kg",
        "population": 100,
        "predators": ["turtle", "whale"],
        "prey": ["fish"],
        "images": ["https://images.unsplash.com/photo-1504595403659-9088ce801e29?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 8, "strength": 20,
            "defense": 30, "reproductionRate": 0.55, "intelligence": 10, "aggression": 40
        }
    },
    {
        "id": "sea_lion",
        "name": "Sea Lion",
        "scientificName": "Zalophus californianus",
        "category": "Mammals",
        "habitat": "Ocean",
        "conservationStatus": "Least Concern",
        "description": "Playful, agile marine mammal that hunts fish and dodges sharks.",
        "diet": "Carnivore",
        "lifespan": "20–30 years",
        "speed": "40 km/h",
        "weight": "100–300 kg",
        "population": 100,
        "predators": ["shark"],
        "prey": ["fish"],
        "images": ["https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 86, "hunger": 14, "speed": 45, "strength": 50,
            "defense": 35, "reproductionRate": 0.22, "intelligence": 80, "aggression": 30
        }
    },
    {
        "id": "seagull",
        "name": "Seagull",
        "scientificName": "Larus argentatus",
        "category": "Birds",
        "habitat": "Ocean",
        "conservationStatus": "Least Concern",
        "description": "Coastal bird with loud calls, gliding over the sea to catch fish and crabs.",
        "diet": "Omnivore",
        "lifespan": "10–15 years",
        "speed": "60 km/h",
        "weight": "1–1.5 kg",
        "population": 100,
        "predators": ["shark"],
        "prey": ["fish", "crab"],
        "images": ["https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 88, "hunger": 12, "speed": 55, "strength": 20,
            "defense": 20, "reproductionRate": 0.32, "intelligence": 70, "aggression": 25
        }
    },
    # --- DESERT (10 items) ---
    {
        "id": "camel",
        "name": "Camel",
        "scientificName": "Camelus dromedarius",
        "category": "Mammals",
        "habitat": "Desert",
        "conservationStatus": "Least Concern",
        "description": "Adapted for arid conditions, storing fat in humps to survive drought.",
        "diet": "Herbivore",
        "lifespan": "40 years",
        "speed": "40 km/h",
        "weight": "300–600 kg",
        "population": 100,
        "predators": ["coyote"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 95, "hunger": 5, "speed": 35, "strength": 60,
            "defense": 55, "reproductionRate": 0.15, "intelligence": 65, "aggression": 10
        }
    },
    {
        "id": "kangaroo_rat",
        "name": "Kangaroo Rat",
        "scientificName": "Dipodomys",
        "category": "Mammals",
        "habitat": "Desert",
        "conservationStatus": "Least Concern",
        "description": "Small desert rodents that survive without drinking, getting moisture from dry seeds.",
        "diet": "Herbivore",
        "lifespan": "2–5 years",
        "speed": "10 km/h",
        "weight": "0.1 kg",
        "population": 100,
        "predators": ["rattlesnake", "coyote", "scorpion", "fennec_fox", "meerkat", "vulture", "gila_monster"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1548679905-f373516541f4?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 40, "strength": 5,
            "defense": 10, "reproductionRate": 0.55, "intelligence": 50, "aggression": 2
        }
    },
    {
        "id": "scorpion",
        "name": "Scorpion",
        "scientificName": "Hadrurus arizonensis",
        "category": "Reptiles",
        "habitat": "Desert",
        "conservationStatus": "Least Concern",
        "description": "Nocturnal desert arachnids that sting insects and small kangaroo rats.",
        "diet": "Carnivore",
        "lifespan": "6 years",
        "speed": "8 km/h",
        "weight": "0.05 kg",
        "population": 100,
        "predators": ["coyote", "rattlesnake", "fennec_fox", "meerkat"],
        "prey": ["kangaroo_rat"],
        "images": ["https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 20, "strength": 25,
            "defense": 45, "reproductionRate": 0.40, "intelligence": 40, "aggression": 70
        }
    },
    {
        "id": "rattlesnake",
        "name": "Rattlesnake",
        "scientificName": "Crotalus cerastes",
        "category": "Reptiles",
        "habitat": "Desert",
        "conservationStatus": "Least Concern",
        "description": "Venomous pit viper that senses heat and hunts kangaroo rats and scorpions.",
        "diet": "Carnivore",
        "lifespan": "10–20 years",
        "speed": "12 km/h",
        "weight": "1–3 kg",
        "population": 100,
        "predators": ["coyote"],
        "prey": ["kangaroo_rat", "scorpion"],
        "images": ["https://images.unsplash.com/photo-1531842477197-54fac12f7166?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 85, "hunger": 15, "speed": 30, "strength": 40,
            "defense": 30, "reproductionRate": 0.30, "intelligence": 50, "aggression": 65
        }
    },
    {
        "id": "coyote",
        "name": "Coyote",
        "scientificName": "Canis latrans",
        "category": "Mammals",
        "habitat": "Desert",
        "conservationStatus": "Least Concern",
        "description": "Highly adaptable hunter that eats rodents, lizards, cacti fruit and scorpions.",
        "diet": "Omnivore",
        "lifespan": "10–14 years",
        "speed": "65 km/h",
        "weight": "10–20 kg",
        "population": 100,
        "predators": [],
        "prey": ["kangaroo_rat", "rattlesnake", "scorpion", "camel", "fennec_fox", "meerkat", "gila_monster", "desert_tortoise"],
        "images": ["https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 60, "strength": 55,
            "defense": 40, "reproductionRate": 0.35, "intelligence": 80, "aggression": 55
        }
    },
    {
        "id": "fennec_fox",
        "name": "Fennec Fox",
        "scientificName": "Vulpes zerda",
        "category": "Mammals",
        "habitat": "Desert",
        "conservationStatus": "Least Concern",
        "description": "Small nocturnal desert fox with huge ears that radiate body heat.",
        "diet": "Omnivore",
        "lifespan": "10 years",
        "speed": "40 km/h",
        "weight": "1–1.5 kg",
        "population": 100,
        "predators": ["coyote"],
        "prey": ["kangaroo_rat", "scorpion"],
        "images": ["https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 86, "hunger": 14, "speed": 42, "strength": 25,
            "defense": 20, "reproductionRate": 0.40, "intelligence": 80, "aggression": 30
        }
    },
    {
        "id": "meerkat",
        "name": "Meerkat",
        "scientificName": "Suricata suricatta",
        "category": "Mammals",
        "habitat": "Desert",
        "conservationStatus": "Least Concern",
        "description": "Social desert mammal that stands on hind legs as sentinel, foraging for scorpions.",
        "diet": "Omnivore",
        "lifespan": "8–12 years",
        "speed": "32 km/h",
        "weight": "0.7–1 kg",
        "population": 100,
        "predators": ["coyote", "rattlesnake"],
        "prey": ["scorpion"],
        "images": ["https://images.unsplash.com/photo-1548679905-f373516541f4?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 88, "hunger": 12, "speed": 35, "strength": 20,
            "defense": 25, "reproductionRate": 0.42, "intelligence": 75, "aggression": 20
        }
    },
    {
        "id": "vulture",
        "name": "Vulture",
        "scientificName": "Cathartes aura",
        "category": "Birds",
        "habitat": "Desert",
        "conservationStatus": "Least Concern",
        "description": "Scavenging bird of prey that circles high in search of deceased animals.",
        "diet": "Carnivore",
        "lifespan": "15–20 years",
        "speed": "60 km/h",
        "weight": "1.5–2.5 kg",
        "population": 100,
        "predators": [],
        "prey": ["kangaroo_rat"],
        "images": ["https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 84, "hunger": 16, "speed": 50, "strength": 30,
            "defense": 25, "reproductionRate": 0.20, "intelligence": 65, "aggression": 35
        }
    },
    {
        "id": "gila_monster",
        "name": "Gila Monster",
        "scientificName": "Heloderma suspectum",
        "category": "Reptiles",
        "habitat": "Desert",
        "conservationStatus": "Near Threatened",
        "description": "Heavy, venomous orange-and-black lizard that walks slowly through gravel dunes.",
        "diet": "Carnivore",
        "lifespan": "20–30 years",
        "speed": "5 km/h",
        "weight": "1.5–2 kg",
        "population": 100,
        "predators": ["coyote"],
        "prey": ["kangaroo_rat"],
        "images": ["https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 82, "hunger": 18, "speed": 12, "strength": 35,
            "defense": 50, "reproductionRate": 0.22, "intelligence": 50, "aggression": 45
        }
    },
    {
        "id": "desert_tortoise",
        "name": "Desert Tortoise",
        "scientificName": "Gopherus agassizii",
        "category": "Reptiles",
        "habitat": "Desert",
        "conservationStatus": "Vulnerable",
        "description": "A slow-moving desert reptile that spends most of its life in underground burrows.",
        "diet": "Herbivore",
        "lifespan": "50–80 years",
        "speed": "1 km/h",
        "weight": "4–7 kg",
        "population": 100,
        "predators": ["coyote"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 94, "hunger": 6, "speed": 5, "strength": 25,
            "defense": 80, "reproductionRate": 0.15, "intelligence": 45, "aggression": 2
        }
    },
    # --- GRASSLAND (10 items) ---
    {
        "id": "lion",
        "name": "Lion",
        "scientificName": "Panthera leo",
        "category": "Mammals",
        "habitat": "Grassland",
        "conservationStatus": "Vulnerable",
        "description": "Apex predator living in prides. Hunts zebras, bisons, and elephant calves.",
        "diet": "Carnivore",
        "lifespan": "10–14 years",
        "speed": "80 km/h",
        "weight": "150–250 kg",
        "population": 100,
        "predators": [],
        "prey": ["zebra", "bison", "elephant", "giraffe", "hyena", "warthog", "gazelle", "ostrich"],
        "images": ["https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 75, "hunger": 25, "speed": 65, "strength": 85,
            "defense": 65, "reproductionRate": 0.20, "intelligence": 75, "aggression": 75
        }
    },
    {
        "id": "zebra",
        "name": "Zebra",
        "scientificName": "Equus quagga",
        "category": "Mammals",
        "habitat": "Grassland",
        "conservationStatus": "Least Concern",
        "description": "Striped herbivore traveling in herds. Striped patterns confuse pursuit predators.",
        "diet": "Herbivore",
        "lifespan": "20 years",
        "speed": "65 km/h",
        "weight": "200–350 kg",
        "population": 100,
        "predators": ["lion", "cheetah", "hyena"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1501705388883-4ed8a543392c?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 58, "strength": 40,
            "defense": 35, "reproductionRate": 0.35, "intelligence": 55, "aggression": 10
        }
    },
    {
        "id": "cheetah",
        "name": "Cheetah",
        "scientificName": "Acinonyx jubatus",
        "category": "Mammals",
        "habitat": "Grassland",
        "conservationStatus": "Vulnerable",
        "description": "The fastest land mammal, built for rapid acceleration to hunt zebras and gazelles.",
        "diet": "Carnivore",
        "lifespan": "10–12 years",
        "speed": "110 km/h",
        "weight": "35–60 kg",
        "population": 100,
        "predators": ["lion"],
        "prey": ["zebra", "gazelle", "warthog"],
        "images": ["https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 70, "hunger": 30, "speed": 95, "strength": 60,
            "defense": 30, "reproductionRate": 0.28, "intelligence": 70, "aggression": 60
        }
    },
    {
        "id": "bison",
        "name": "Bison",
        "scientificName": "Bison bison",
        "category": "Mammals",
        "habitat": "Grassland",
        "conservationStatus": "Least Concern",
        "description": "Massive grazers that feed in grass fields, using bulk and horns for pack defense.",
        "diet": "Herbivore",
        "lifespan": "15–20 years",
        "speed": "55 km/h",
        "weight": "400–900 kg",
        "population": 100,
        "predators": ["lion"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1490237014491-822aee911b99?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 92, "hunger": 8, "speed": 45, "strength": 80,
            "defense": 70, "reproductionRate": 0.22, "intelligence": 50, "aggression": 20
        }
    },
    {
        "id": "elephant",
        "name": "African Elephant",
        "scientificName": "Loxodonta africana",
        "category": "Mammals",
        "habitat": "Grassland",
        "conservationStatus": "Endangered",
        "description": "Immense herbivores with strong social bonds. Only calves face lion predation threats.",
        "diet": "Herbivore",
        "lifespan": "60–70 years",
        "speed": "40 km/h",
        "weight": "4000–6000 kg",
        "population": 100,
        "predators": ["lion"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 88, "hunger": 12, "speed": 30, "strength": 98,
            "defense": 95, "reproductionRate": 0.07, "intelligence": 95, "aggression": 15
        }
    },
    {
        "id": "giraffe",
        "name": "Giraffe",
        "scientificName": "Giraffa camelopardalis",
        "category": "Mammals",
        "habitat": "Grassland",
        "conservationStatus": "Vulnerable",
        "description": "The tallest land mammal, using long necks to forage acacia leaves high up.",
        "diet": "Herbivore",
        "lifespan": "25 years",
        "speed": "50 km/h",
        "weight": "800–1200 kg",
        "population": 100,
        "predators": ["lion"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1501705388883-4ed8a543392c?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 45, "strength": 75,
            "defense": 50, "reproductionRate": 0.18, "intelligence": 60, "aggression": 5
        }
    },
    {
        "id": "hyena",
        "name": "Hyena",
        "scientificName": "Crocuta crocuta",
        "category": "Mammals",
        "habitat": "Grassland",
        "conservationStatus": "Least Concern",
        "description": "A social, vocal predator and scavenger with bone-crushing jaws.",
        "diet": "Carnivore",
        "lifespan": "12–20 years",
        "speed": "60 km/h",
        "weight": "40–80 kg",
        "population": 100,
        "predators": ["lion"],
        "prey": ["zebra", "gazelle", "warthog"],
        "images": ["https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 84, "hunger": 16, "speed": 58, "strength": 65,
            "defense": 45, "reproductionRate": 0.28, "intelligence": 80, "aggression": 65
        }
    },
    {
        "id": "warthog",
        "name": "Warthog",
        "scientificName": "Phacochoerus africanus",
        "category": "Mammals",
        "habitat": "Grassland",
        "conservationStatus": "Least Concern",
        "description": "Wild African pig with prominent tusks, foraging on grasslands.",
        "diet": "Omnivore",
        "lifespan": "15 years",
        "speed": "48 km/h",
        "weight": "60–120 kg",
        "population": 100,
        "predators": ["lion", "cheetah", "hyena"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 88, "hunger": 12, "speed": 48, "strength": 40,
            "defense": 35, "reproductionRate": 0.32, "intelligence": 62, "aggression": 20
        }
    },
    {
        "id": "gazelle",
        "name": "Gazelle",
        "scientificName": "Eudorcas thomsonii",
        "category": "Mammals",
        "habitat": "Grassland",
        "conservationStatus": "Least Concern",
        "description": "Extremely fast, agile herbivore that uses speed to flee cheetahs and lions.",
        "diet": "Herbivore",
        "lifespan": "10–12 years",
        "speed": "90 km/h",
        "weight": "15–30 kg",
        "population": 100,
        "predators": ["lion", "cheetah", "hyena"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1484406566174-9da000fda645?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 92, "hunger": 8, "speed": 80, "strength": 20,
            "defense": 20, "reproductionRate": 0.45, "intelligence": 50, "aggression": 2
        }
    },
    {
        "id": "ostrich",
        "name": "Ostrich",
        "scientificName": "Struthio camelus",
        "category": "Birds",
        "habitat": "Grassland",
        "conservationStatus": "Least Concern",
        "description": "Large, flightless bird with powerful legs that can deliver lethal kicks.",
        "diet": "Omnivore",
        "lifespan": "30–45 years",
        "speed": "70 km/h",
        "weight": "90–130 kg",
        "population": 100,
        "predators": ["lion", "cheetah"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 65, "strength": 50,
            "defense": 40, "reproductionRate": 0.25, "intelligence": 45, "aggression": 15
        }
    },
    # --- ARCTIC (10 items) ---
    {
        "id": "polar_bear",
        "name": "Polar Bear",
        "scientificName": "Ursus maritimus",
        "category": "Mammals",
        "habitat": "Arctic",
        "conservationStatus": "Vulnerable",
        "description": "Massive arctic carnivore. Stalks seals on ocean ice packs.",
        "diet": "Carnivore",
        "lifespan": "20–25 years",
        "speed": "40 km/h",
        "weight": "350–700 kg",
        "population": 100,
        "predators": [],
        "prey": ["seal", "arctic_fox", "narwhal", "arctic_hare", "muskox", "walrus"],
        "images": ["https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 40, "strength": 90,
            "defense": 85, "reproductionRate": 0.12, "intelligence": 70, "aggression": 65
        }
    },
    {
        "id": "seal",
        "name": "Seal",
        "scientificName": "Pusa hispida",
        "category": "Mammals",
        "habitat": "Arctic",
        "conservationStatus": "Least Concern",
        "description": "Blubber-insulated mammals that live in icy waters. Prime prey for polar bears.",
        "diet": "Carnivore",
        "lifespan": "25–30 years",
        "speed": "30 km/h",
        "weight": "50–100 kg",
        "population": 100,
        "predators": ["polar_bear", "walrus"],
        "prey": ["fish"],
        "images": ["https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 35, "strength": 30,
            "defense": 30, "reproductionRate": 0.30, "intelligence": 60, "aggression": 10
        }
    },
    {
        "id": "arctic_fox",
        "name": "Arctic Fox",
        "scientificName": "Vulpes lagopus",
        "category": "Mammals",
        "habitat": "Arctic",
        "conservationStatus": "Least Concern",
        "description": "Small canine predator that changes coat color to blend into winter snow. Hunts lemmings.",
        "diet": "Carnivore",
        "lifespan": "3–6 years",
        "speed": "50 km/h",
        "weight": "3–8 kg",
        "population": 100,
        "predators": ["polar_bear"],
        "prey": ["lemming", "arctic_hare"],
        "images": ["https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 85, "hunger": 15, "speed": 48, "strength": 20,
            "defense": 20, "reproductionRate": 0.45, "intelligence": 75, "aggression": 35
        }
    },
    {
        "id": "lemming",
        "name": "Lemming",
        "scientificName": "Lemmus lemmus",
        "category": "Mammals",
        "habitat": "Arctic",
        "conservationStatus": "Least Concern",
        "description": "Tiny plant-eating rodents tunneling under winter snow drifts. High birth rate.",
        "diet": "Herbivore",
        "lifespan": "1–2 years",
        "speed": "12 km/h",
        "weight": "0.05–0.1 kg",
        "population": 100,
        "predators": ["arctic_fox", "snowy_owl", "puffin"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1603203042745-9b122c6e6c1e?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 95, "hunger": 5, "speed": 25, "strength": 5,
            "defense": 8, "reproductionRate": 0.70, "intelligence": 40, "aggression": 2
        }
    },
    {
        "id": "snowy_owl",
        "name": "Snowy Owl",
        "scientificName": "Bubo scandiacus",
        "category": "Birds",
        "habitat": "Arctic",
        "conservationStatus": "Vulnerable",
        "description": "White tundra owl. Highly active daytime hunter of lemmings.",
        "diet": "Carnivore",
        "lifespan": "9–10 years",
        "speed": "80 km/h",
        "weight": "1.5–3 kg",
        "population": 100,
        "predators": [],
        "prey": ["lemming", "arctic_hare", "puffin"],
        "images": ["https://images.unsplash.com/photo-1509909756405-be0199881695?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 88, "hunger": 12, "speed": 65, "strength": 40,
            "defense": 30, "reproductionRate": 0.28, "intelligence": 70, "aggression": 50
        }
    },
    {
        "id": "narwhal",
        "name": "Narwhal",
        "scientificName": "Monodon monoceros",
        "category": "Mammals",
        "habitat": "Arctic",
        "conservationStatus": "Least Concern",
        "description": "Marine mammal famous for its long, spiral tusk, swimming in icy waters.",
        "diet": "Carnivore",
        "lifespan": "30–50 years",
        "speed": "30 km/h",
        "weight": "800–1600 kg",
        "population": 100,
        "predators": ["polar_bear"],
        "prey": ["fish"],
        "images": ["https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 85, "hunger": 15, "speed": 30, "strength": 75,
            "defense": 60, "reproductionRate": 0.10, "intelligence": 78, "aggression": 10
        }
    },
    {
        "id": "arctic_hare",
        "name": "Arctic Hare",
        "scientificName": "Lepus arcticus",
        "category": "Mammals",
        "habitat": "Arctic",
        "conservationStatus": "Least Concern",
        "description": "Hare adapted to polar conditions with thick white fur and compact limbs.",
        "diet": "Herbivore",
        "lifespan": "3–5 years",
        "speed": "60 km/h",
        "weight": "3–5 kg",
        "population": 100,
        "predators": ["arctic_fox", "snowy_owl"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 94, "hunger": 6, "speed": 55, "strength": 15,
            "defense": 15, "reproductionRate": 0.55, "intelligence": 50, "aggression": 2
        }
    },
    {
        "id": "muskox",
        "name": "Muskox",
        "scientificName": "Ovibos moschatus",
        "category": "Mammals",
        "habitat": "Arctic",
        "conservationStatus": "Least Concern",
        "description": "Large arctic mammal with long, shaggy hair, forming protective defensive circles.",
        "diet": "Herbivore",
        "lifespan": "12–20 years",
        "speed": "25 km/h",
        "weight": "200–400 kg",
        "population": 100,
        "predators": ["polar_bear"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1490237014491-822aee911b99?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 92, "hunger": 8, "speed": 22, "strength": 75,
            "defense": 70, "reproductionRate": 0.18, "intelligence": 50, "aggression": 15
        }
    },
    {
        "id": "puffin",
        "name": "Puffin",
        "scientificName": "Fratercula arctica",
        "category": "Birds",
        "habitat": "Arctic",
        "conservationStatus": "Vulnerable",
        "description": "Colorful sea bird nesting in arctic cliffs, diving deep to hunt small fish.",
        "diet": "Carnivore",
        "lifespan": "20 years",
        "speed": "80 km/h",
        "weight": "0.3–0.5 kg",
        "population": 100,
        "predators": ["snowy_owl"],
        "prey": ["fish"],
        "images": ["https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 86, "hunger": 14, "speed": 55, "strength": 15,
            "defense": 15, "reproductionRate": 0.35, "intelligence": 60, "aggression": 10
        }
    },
    {
        "id": "walrus",
        "name": "Walrus",
        "scientificName": "Odobenus rosmarus",
        "category": "Mammals",
        "habitat": "Arctic",
        "conservationStatus": "Vulnerable",
        "description": "Large flippered marine mammal with long tusks and whiskers, resting on ice packs.",
        "diet": "Carnivore",
        "lifespan": "30–40 years",
        "speed": "35 km/h",
        "weight": "800–1500 kg",
        "population": 100,
        "predators": ["polar_bear"],
        "prey": ["seal", "fish"],
        "images": ["https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 88, "hunger": 12, "speed": 28, "strength": 85,
            "defense": 80, "reproductionRate": 0.12, "intelligence": 68, "aggression": 40
        }
    },
    # --- WETLAND (10 items) ---
    {
        "id": "alligator",
        "name": "Alligator",
        "scientificName": "Alligator mississippiensis",
        "category": "Reptiles",
        "habitat": "Wetland",
        "conservationStatus": "Least Concern",
        "description": "Armored ambush predator lurking in fresh marshes. Snaps up frogs, herons and beavers.",
        "diet": "Carnivore",
        "lifespan": "35–50 years",
        "speed": "32 km/h",
        "weight": "100–450 kg",
        "population": 100,
        "predators": [],
        "prey": ["frog", "heron", "beaver", "otter", "duck", "water_snake", "catfish"],
        "images": ["https://images.unsplash.com/photo-1604608678051-64d46d8d0ffe?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 35, "strength": 80,
            "defense": 80, "reproductionRate": 0.15, "intelligence": 50, "aggression": 70
        }
    },
    {
        "id": "heron",
        "name": "Heron",
        "scientificName": "Ardea herodias",
        "category": "Birds",
        "habitat": "Wetland",
        "conservationStatus": "Least Concern",
        "description": "Tall wading hunter that spears frogs and fish along shallow banks.",
        "diet": "Carnivore",
        "lifespan": "15 years",
        "speed": "48 km/h",
        "weight": "2–3 kg",
        "population": 100,
        "predators": ["alligator"],
        "prey": ["frog", "fish", "dragonfly", "mosquito", "catfish"],
        "images": ["https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 85, "hunger": 15, "speed": 40, "strength": 35,
            "defense": 25, "reproductionRate": 0.35, "intelligence": 65, "aggression": 45
        }
    },
    {
        "id": "beaver",
        "name": "Beaver",
        "scientificName": "Castor canadensis",
        "category": "Mammals",
        "habitat": "Wetland",
        "conservationStatus": "Least Concern",
        "description": "Architects that construct log dams. Eat bark, wood and roots.",
        "diet": "Herbivore",
        "lifespan": "10–20 years",
        "speed": "12 km/h",
        "weight": "11–32 kg",
        "population": 100,
        "predators": ["alligator"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 20, "strength": 40,
            "defense": 50, "reproductionRate": 0.25, "intelligence": 75, "aggression": 15
        }
    },
    {
        "id": "frog",
        "name": "Frog",
        "scientificName": "Lithobates catesbeianus",
        "category": "Amphibians",
        "habitat": "Wetland",
        "conservationStatus": "Least Concern",
        "description": "Prolific marsh breeders that form vital food links for waders and reptiles.",
        "diet": "Herbivore",
        "lifespan": "4–9 years",
        "speed": "8 km/h",
        "weight": "0.5 kg",
        "population": 100,
        "predators": ["alligator", "heron", "otter", "duck", "water_snake"],
        "prey": ["mosquito", "dragonfly"],
        "images": ["https://images.unsplash.com/photo-1579380656108-f98e4df8ea62?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 95, "hunger": 5, "speed": 30, "strength": 10,
            "defense": 15, "reproductionRate": 0.60, "intelligence": 35, "aggression": 5
        }
    },
    {
        "id": "otter",
        "name": "River Otter",
        "scientificName": "Lontra canadensis",
        "category": "Mammals",
        "habitat": "Wetland",
        "conservationStatus": "Least Concern",
        "description": "Sleek, playful semi-aquatic mammal hunting fish and frogs in marshes.",
        "diet": "Carnivore",
        "lifespan": "8–15 years",
        "speed": "25 km/h",
        "weight": "5–10 kg",
        "population": 100,
        "predators": ["alligator"],
        "prey": ["fish", "frog"],
        "images": ["https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 86, "hunger": 14, "speed": 35, "strength": 35,
            "defense": 30, "reproductionRate": 0.32, "intelligence": 80, "aggression": 30
        }
    },
    {
        "id": "duck",
        "name": "Duck",
        "scientificName": "Anas platyrhynchos",
        "category": "Birds",
        "habitat": "Wetland",
        "conservationStatus": "Least Concern",
        "description": "Common wetland waterfowl diving for aquatic plants, insects, and frogs.",
        "diet": "Omnivore",
        "lifespan": "5–10 years",
        "speed": "40 km/h",
        "weight": "1–1.5 kg",
        "population": 100,
        "predators": ["alligator", "heron"],
        "prey": ["frog"],
        "images": ["https://images.unsplash.com/photo-1579380656108-f98e4df8ea62?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 30, "strength": 15,
            "defense": 15, "reproductionRate": 0.50, "intelligence": 50, "aggression": 5
        }
    },
    {
        "id": "dragonfly",
        "name": "Dragonfly",
        "scientificName": "Anax junius",
        "category": "Invertebrates",
        "habitat": "Wetland",
        "conservationStatus": "Least Concern",
        "description": "A highly agile flying insect that feeds on mosquitoes and small flies.",
        "diet": "Carnivore",
        "lifespan": "1 year",
        "speed": "48 km/h",
        "weight": "0.001 kg",
        "population": 100,
        "predators": ["frog", "heron"],
        "prey": ["mosquito"],
        "images": ["https://images.unsplash.com/photo-1579380656108-f98e4df8ea62?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 88, "hunger": 12, "speed": 50, "strength": 10,
            "defense": 10, "reproductionRate": 0.60, "intelligence": 45, "aggression": 15
        }
    },
    {
        "id": "mosquito",
        "name": "Mosquito",
        "scientificName": "Anopheles",
        "category": "Invertebrates",
        "habitat": "Wetland",
        "conservationStatus": "Least Concern",
        "description": "Small swarming insect breeding in stagnant swamp water, serving as prey base.",
        "diet": "Herbivore",
        "lifespan": "1 month",
        "speed": "2 km/h",
        "weight": "0.0001 kg",
        "population": 100,
        "predators": ["frog", "dragonfly", "heron"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1579380656108-f98e4df8ea62?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 96, "hunger": 4, "speed": 15, "strength": 2,
            "defense": 5, "reproductionRate": 0.75, "intelligence": 25, "aggression": 5
        }
    },
    {
        "id": "water_snake",
        "name": "Water Snake",
        "scientificName": "Nerodia sipedon",
        "category": "Reptiles",
        "habitat": "Wetland",
        "conservationStatus": "Least Concern",
        "description": "Non-venomous semi-aquatic snake swimming through reeds to hunt frogs and small fish.",
        "diet": "Carnivore",
        "lifespan": "8–10 years",
        "speed": "10 km/h",
        "weight": "0.5–1.5 kg",
        "population": 100,
        "predators": ["alligator", "heron"],
        "prey": ["frog", "fish"],
        "images": ["https://images.unsplash.com/photo-1531842477197-54fac12f7166?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 84, "hunger": 16, "speed": 28, "strength": 30,
            "defense": 25, "reproductionRate": 0.35, "intelligence": 50, "aggression": 40
        }
    },
    {
        "id": "catfish",
        "name": "Catfish",
        "scientificName": "Ictalurus punctatus",
        "category": "Fish",
        "habitat": "Wetland",
        "conservationStatus": "Least Concern",
        "description": "Bottom-dwelling marsh fish with whisker-like barbels, scavenging swamp mud.",
        "diet": "Omnivore",
        "lifespan": "15–20 years",
        "speed": "15 km/h",
        "weight": "2–8 kg",
        "population": 100,
        "predators": ["alligator", "heron", "otter"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 20, "strength": 25,
            "defense": 45, "reproductionRate": 0.40, "intelligence": 45, "aggression": 10
        }
    },
    # --- MOUNTAIN (10 items) ---
    {
        "id": "snow_leopard",
        "name": "Snow Leopard",
        "scientificName": "Panthera uncia",
        "category": "Mammals",
        "habitat": "Mountain",
        "conservationStatus": "Vulnerable",
        "description": "Elusive mountain predator adapted for freezing rocky peak zones.",
        "diet": "Carnivore",
        "lifespan": "10–12 years wild",
        "speed": "64 km/h",
        "weight": "22–55 kg",
        "population": 100,
        "predators": [],
        "prey": ["ibex", "mountain_goat", "marmot", "pika", "bighorn_sheep"],
        "images": ["https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 60, "strength": 75,
            "defense": 60, "reproductionRate": 0.20, "intelligence": 80, "aggression": 60
        }
    },
    {
        "id": "ibex",
        "name": "Ibex",
        "scientificName": "Capra sibirica",
        "category": "Mammals",
        "habitat": "Mountain",
        "conservationStatus": "Least Concern",
        "description": "Alpine goats that graze on vertical cliffs, avoiding mountain leopards.",
        "diet": "Herbivore",
        "lifespan": "10–16 years",
        "speed": "50 km/h",
        "weight": "60–130 kg",
        "population": 100,
        "predators": ["snow_leopard", "eagle", "cougar"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1544474737-fcc37a85e4fc?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 45, "strength": 45,
            "defense": 45, "reproductionRate": 0.32, "intelligence": 55, "aggression": 15
        }
    },
    {
        "id": "mountain_goat",
        "name": "Mountain Goat",
        "scientificName": "Oreamnos americanus",
        "category": "Mammals",
        "habitat": "Mountain",
        "conservationStatus": "Least Concern",
        "description": "Sure-footed climbers grazing above the tree line on slopes.",
        "diet": "Herbivore",
        "lifespan": "12–15 years",
        "speed": "40 km/h",
        "weight": "45–140 kg",
        "population": 100,
        "predators": ["snow_leopard"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 92, "hunger": 8, "speed": 40, "strength": 50,
            "defense": 50, "reproductionRate": 0.30, "intelligence": 50, "aggression": 15
        }
    },
    {
        "id": "marmot",
        "name": "Marmot",
        "scientificName": "Marmota flaviventris",
        "category": "Mammals",
        "habitat": "Mountain",
        "conservationStatus": "Least Concern",
        "description": "Burrowing alpine squirrels that whistle alerts and hibernate in colonies.",
        "diet": "Herbivore",
        "lifespan": "13–15 years",
        "speed": "16 km/h",
        "weight": "2–5 kg",
        "population": 100,
        "predators": ["snow_leopard", "eagle", "condor", "mountain_bear"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1582236357022-de9669527ec5?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 95, "hunger": 5, "speed": 22, "strength": 10,
            "defense": 20, "reproductionRate": 0.45, "intelligence": 45, "aggression": 5
        }
    },
    {
        "id": "eagle",
        "name": "Golden Eagle",
        "scientificName": "Aquila chrysaetos",
        "category": "Birds",
        "habitat": "Mountain",
        "conservationStatus": "Least Concern",
        "description": "Cliff-nesting raptor that swoops down to hunt marmots and young ibexes.",
        "diet": "Carnivore",
        "lifespan": "15–20 years",
        "speed": "240 km/h",
        "weight": "3–6 kg",
        "population": 100,
        "predators": [],
        "prey": ["marmot", "ibex", "pika"],
        "images": ["https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 85, "hunger": 15, "speed": 85, "strength": 55,
            "defense": 35, "reproductionRate": 0.22, "intelligence": 70, "aggression": 55
        }
    },
    {
        "id": "condor",
        "name": "Andean Condor",
        "scientificName": "Vultur gryphus",
        "category": "Birds",
        "habitat": "Mountain",
        "conservationStatus": "Vulnerable",
        "description": "Massive bird of prey soaring high over peaks in search of sheep and pika carcass.",
        "diet": "Carnivore",
        "lifespan": "50 years",
        "speed": "90 km/h",
        "weight": "8–15 kg",
        "population": 100,
        "predators": [],
        "prey": ["marmot", "pika"],
        "images": ["https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 86, "hunger": 14, "speed": 70, "strength": 55,
            "defense": 35, "reproductionRate": 0.12, "intelligence": 70, "aggression": 30
        }
    },
    {
        "id": "pika",
        "name": "Pika",
        "scientificName": "Ochotona princeps",
        "category": "Mammals",
        "habitat": "Mountain",
        "conservationStatus": "Least Concern",
        "description": "Small mountain mammal related to rabbits, drying grass stacks on scree rocks.",
        "diet": "Herbivore",
        "lifespan": "3–7 years",
        "speed": "15 km/h",
        "weight": "0.1–0.2 kg",
        "population": 100,
        "predators": ["snow_leopard", "eagle", "condor"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1582236357022-de9669527ec5?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 94, "hunger": 6, "speed": 30, "strength": 10,
            "defense": 15, "reproductionRate": 0.50, "intelligence": 50, "aggression": 2
        }
    },
    {
        "id": "mountain_bear",
        "name": "Grizzly Bear",
        "scientificName": "Ursus arctos horribilis",
        "category": "Mammals",
        "habitat": "Mountain",
        "conservationStatus": "Least Concern",
        "description": "Large alpine bear foraging berries, roots, marmots, and mountain sheep.",
        "diet": "Omnivore",
        "lifespan": "20–25 years",
        "speed": "48 km/h",
        "weight": "180–360 kg",
        "population": 100,
        "predators": [],
        "prey": ["bighorn_sheep", "marmot"],
        "images": ["https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 42, "strength": 92,
            "defense": 82, "reproductionRate": 0.15, "intelligence": 76, "aggression": 55
        }
    },
    {
        "id": "cougar",
        "name": "Cougar",
        "scientificName": "Puma concolor",
        "category": "Mammals",
        "habitat": "Mountain",
        "conservationStatus": "Least Concern",
        "description": "Elusive mountain lion that stalks bighorn sheep and mountain ibexes.",
        "diet": "Carnivore",
        "lifespan": "8–13 years",
        "speed": "80 km/h",
        "weight": "50–90 kg",
        "population": 100,
        "predators": [],
        "prey": ["ibex", "bighorn_sheep"],
        "images": ["https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 82, "hunger": 18, "speed": 62, "strength": 76,
            "defense": 55, "reproductionRate": 0.20, "intelligence": 78, "aggression": 65
        }
    },
    {
        "id": "bighorn_sheep",
        "name": "Bighorn Sheep",
        "scientificName": "Ovis canadensis",
        "category": "Mammals",
        "habitat": "Mountain",
        "conservationStatus": "Least Concern",
        "description": "Sheep with large curved horns that fight for dominance on rocky peaks.",
        "diet": "Herbivore",
        "lifespan": "10–14 years",
        "speed": "48 km/h",
        "weight": "70–130 kg",
        "population": 100,
        "predators": ["snow_leopard", "cougar", "mountain_bear"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1544474737-fcc37a85e4fc?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 40, "strength": 48,
            "defense": 50, "reproductionRate": 0.28, "intelligence": 50, "aggression": 15
        }
    },
    # --- RAINFOREST (10 items) ---
    {
        "id": "jaguar",
        "name": "Jaguar",
        "scientificName": "Panthera onca",
        "category": "Mammals",
        "habitat": "Rainforest",
        "conservationStatus": "Near Threatened",
        "description": "Massive big cat of the Amazon. Powerful jaws crunch tapirs and sloths.",
        "diet": "Carnivore",
        "lifespan": "12–15 years",
        "speed": "80 km/h",
        "weight": "56–96 kg",
        "population": 100,
        "predators": [],
        "prey": ["tapir", "sloth", "capybara"],
        "images": ["https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 80, "hunger": 20, "speed": 62, "strength": 80,
            "defense": 65, "reproductionRate": 0.22, "intelligence": 80, "aggression": 70
        }
    },
    {
        "id": "tapir",
        "name": "Tapir",
        "scientificName": "Tapirus terrestris",
        "category": "Mammals",
        "habitat": "Rainforest",
        "conservationStatus": "Vulnerable",
        "description": "Rainforest browser with trunk-like snout, foraging for forest fruits and roots.",
        "diet": "Herbivore",
        "lifespan": "25–30 years",
        "speed": "30 km/h",
        "weight": "150–250 kg",
        "population": 100,
        "predators": ["jaguar", "anaconda"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 35, "strength": 60,
            "defense": 55, "reproductionRate": 0.20, "intelligence": 50, "aggression": 10
        }
    },
    {
        "id": "sloth",
        "name": "Sloth",
        "scientificName": "Bradypus tridactylus",
        "category": "Mammals",
        "habitat": "Rainforest",
        "conservationStatus": "Least Concern",
        "description": "Slow arboreal herbivore eating low-calorie leaves in the high canopy.",
        "diet": "Herbivore",
        "lifespan": "20 years",
        "speed": "0.2 km/h",
        "weight": "4–6 kg",
        "population": 100,
        "predators": ["jaguar", "harpy_eagle", "anaconda"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 95, "hunger": 5, "speed": 5, "strength": 15,
            "defense": 25, "reproductionRate": 0.18, "intelligence": 40, "aggression": 2
        }
    },
    {
        "id": "harpy_eagle",
        "name": "Harpy Eagle",
        "scientificName": "Harpia harpyja",
        "category": "Birds",
        "habitat": "Rainforest",
        "conservationStatus": "Vulnerable",
        "description": "Massive jungle eagle hunting sloths and monkeys in the upper canopy layers.",
        "diet": "Carnivore",
        "lifespan": "25–35 years",
        "speed": "80 km/h",
        "weight": "5–9 kg",
        "population": 100,
        "predators": [],
        "prey": ["sloth", "toucan", "macaw"],
        "images": ["https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 86, "hunger": 14, "speed": 75, "strength": 60,
            "defense": 35, "reproductionRate": 0.20, "intelligence": 72, "aggression": 60
        }
    },
    {
        "id": "poison_dart_frog",
        "name": "Poison Dart Frog",
        "scientificName": "Dendrobates auratus",
        "category": "Amphibians",
        "habitat": "Rainforest",
        "conservationStatus": "Least Concern",
        "description": "Bright jungle frogs whose skin toxins ward off almost all predators.",
        "diet": "Herbivore",
        "lifespan": "3–15 years",
        "speed": "5 km/h",
        "weight": "0.01 kg",
        "population": 100,
        "predators": [],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1496112576525-8b31e9ce5b0e?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 96, "hunger": 4, "speed": 15, "strength": 5,
            "defense": 60, "reproductionRate": 0.50, "intelligence": 40, "aggression": 5
        }
    },
    {
        "id": "toucan",
        "name": "Toucan",
        "scientificName": "Ramphastos toco",
        "category": "Birds",
        "habitat": "Rainforest",
        "conservationStatus": "Least Concern",
        "description": "Loud jungle bird with a massive orange bill, feeding on forest fruits.",
        "diet": "Herbivore",
        "lifespan": "12–20 years",
        "speed": "48 km/h",
        "weight": "0.5–0.8 kg",
        "population": 100,
        "predators": ["harpy_eagle", "anaconda"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 90, "hunger": 10, "speed": 40, "strength": 15,
            "defense": 20, "reproductionRate": 0.38, "intelligence": 65, "aggression": 5
        }
    },
    {
        "id": "macaw",
        "name": "Scarlet Macaw",
        "scientificName": "Ara macao",
        "category": "Birds",
        "habitat": "Rainforest",
        "conservationStatus": "Least Concern",
        "description": "Vibrant, highly social parrot flying through jungle tree canopies.",
        "diet": "Herbivore",
        "lifespan": "40–50 years",
        "speed": "55 km/h",
        "weight": "1 kg",
        "population": 100,
        "predators": ["harpy_eagle"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 92, "hunger": 8, "speed": 45, "strength": 15,
            "defense": 20, "reproductionRate": 0.25, "intelligence": 80, "aggression": 10
        }
    },
    {
        "id": "anaconda",
        "name": "Green Anaconda",
        "scientificName": "Eunectes murinus",
        "category": "Reptiles",
        "habitat": "Rainforest",
        "conservationStatus": "Least Concern",
        "description": "Massive constrictor snake lurking in swampy pools of the Amazon to trap tapirs.",
        "diet": "Carnivore",
        "lifespan": "10–12 years",
        "speed": "8 km/h",
        "weight": "100–250 kg",
        "population": 100,
        "predators": ["jaguar"],
        "prey": ["tapir", "sloth", "capybara"],
        "images": ["https://images.unsplash.com/photo-1531842477197-54fac12f7166?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 84, "hunger": 16, "speed": 20, "strength": 80,
            "defense": 60, "reproductionRate": 0.18, "intelligence": 50, "aggression": 55
        }
    },
    {
        "id": "capybara",
        "name": "Capybara",
        "scientificName": "Hydrochoerus hydrochaeris",
        "category": "Mammals",
        "habitat": "Rainforest",
        "conservationStatus": "Least Concern",
        "description": "The largest living rodent, highly social and semi-aquatic, resting near water edges.",
        "diet": "Herbivore",
        "lifespan": "8–10 years",
        "speed": "35 km/h",
        "weight": "35–66 kg",
        "population": 100,
        "predators": ["jaguar", "anaconda"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 94, "hunger": 6, "speed": 30, "strength": 35,
            "defense": 35, "reproductionRate": 0.40, "intelligence": 60, "aggression": 2
        }
    },
    {
        "id": "tree_frog",
        "name": "Red-Eyed Tree Frog",
        "scientificName": "Agalychnis callidryas",
        "category": "Amphibians",
        "habitat": "Rainforest",
        "conservationStatus": "Least Concern",
        "description": "Green canopy frog with red eyes that sleep under leaves during the day.",
        "diet": "Herbivore",
        "lifespan": "5 years",
        "speed": "10 km/h",
        "weight": "0.015 kg",
        "population": 100,
        "predators": ["harpy_eagle", "anaconda"],
        "prey": [],
        "images": ["https://images.unsplash.com/photo-1496112576525-8b31e9ce5b0e?w=600&q=80"],
        "simulationStats": {
            "health": 100, "energy": 95, "hunger": 5, "speed": 22, "strength": 5,
            "defense": 15, "reproductionRate": 0.52, "intelligence": 40, "aggression": 5
        }
    }
]"""

# Locate SEED_ANIMALS start and end in content
# We will find the pattern SEED_ANIMALS = [ ... ]
pattern = r"SEED_ANIMALS\s*=\s*\[.*?\]"
match = re.search(pattern, content, re.DOTALL)
if match:
    # Replace the match with the new code block
    new_content = content[:match.start()] + seed_animals_code + content[match.end():]
else:
    print("Could not find SEED_ANIMALS definition automatically. Appending or replacing failed.")
    exit(1)

# Add auth routes at the bottom of the file
auth_routes_code = """
# ─── USER AUTHENTICATION ROUTES ──────────────────────────────────────────────
import hashlib

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json or {}
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            return jsonify({"error": "All fields (name, email, password) are required."}), 400

        # Check if user already exists
        if db.users.find_one({"email": email}):
            return jsonify({"error": "A user with this email already exists."}), 400

        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        user_doc = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "createdAt": time.time()
        }
        db.users.insert_one(user_doc)
        return jsonify({"message": "User registered successfully.", "user": {"name": name, "email": email}}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required."}), 400

        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "Invalid email or password."}), 401

        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        if user["password"] != hashed_password:
            return jsonify({"error": "Invalid email or password."}), 401

        return jsonify({
            "message": "Login successful.",
            "user": {
                "name": user["name"],
                "email": user["email"]
            }
        }), 200

@app.route('/google-auth', methods=['POST'])
def google_auth():
    try:
        data = request.json or {}
        email = data.get("email", "").strip().lower()
        name = data.get("name", "").strip()

        if not email or not name:
            return jsonify({"error": "Email and name are required from Google auth."}), 400

        user = db.users.find_one({"email": email})
        if not user:
            # Auto-register Google user
            random_pw = random.getrandbits(128)
            hashed_password = hashlib.sha256(str(random_pw).encode()).hexdigest()
            user_doc = {
                "name": name,
                "email": email,
                "password": hashed_password,
                "createdAt": time.time(),
                "googleAuth": True
            }
            db.users.insert_one(user_doc)
            user = user_doc

        return jsonify({
            "message": "Google authentication successful.",
            "user": {
                "name": user["name"],
                "email": user["email"]
            }
        }), 200
"""

# Append routes right before the name == main block or at the end
main_block_index = new_content.rfind("if __name__ == '__main__':")
if main_block_index != -1:
    final_content = new_content[:main_block_index] + auth_routes_code + "\n" + new_content[main_block_index:]
else:
    final_content = new_content + "\n" + auth_routes_code

# Write updated app.py
with open(app_path, "w", encoding="utf-8") as f:
    f.write(final_content)

print("Successfully updated app.py with 80 animals and auth routes.")

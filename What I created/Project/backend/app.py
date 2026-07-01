import time
import random
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymongo
from bson import ObjectId
import hashlib

app = Flask(__name__)
CORS(app)

# ─── DATABASE CONFIGURATION ──────────────────────────────────────────────────
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "wildlifex_sim"

try:
    mongo_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    db = mongo_client[DB_NAME]
    mongo_client.server_info()
    print("Successfully connected to MongoDB.")
except Exception as e:
    print(f"MongoDB connection failed: {e}.")

# Seed data containing 80 animals (10 per habitat)
SEED_ANIMALS = [
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
        "predators": ["bear", "lynx"],
        "prey": ["deer", "rabbit", "squirrel", "boar"],
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
        "predators": ["wolf", "bear", "lynx"],
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
        "prey": ["deer", "boar", "squirrel"],
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
        "prey": ["rabbit", "squirrel", "woodpecker"],
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
        "predators": ["wolf", "fox", "owl", "lynx"],
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
        "prey": ["rabbit", "squirrel"],
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
        "predators": ["wolf", "fox", "owl", "lynx"],
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
        "description": "Extremely intelligent marine mammals. Hunt fish in cooperative pools.",
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
]

def seed_database():
    try:
        count = db.animals.count_documents({})
        if count == 0:
            db.animals.insert_many(SEED_ANIMALS)
            print(f"Seeded database with {len(SEED_ANIMALS)} animals.")
        else:
            print(f"Database already contains {count} animals. Skipping seeding.")
    except Exception as e:
        print("Database seeding error:", e)

try:
    seed_database()
except Exception as e:
    print("Database check failed, skipping startup seeding:", e)

# ─── ACTIVE SIMULATION DICTIONARY & DAEMON ────────────────────────────────────
active_sessions = {}
sessions_lock = threading.Lock()

def calculate_ecosystem_health(animals, extinct_list):
    health_score = 100
    health_score -= len(extinct_list) * 8

    active_species_count = sum(1 for a in animals if a.get("population", 0) > 0)
    if len(animals) > 0:
        biodiversity_pct = active_species_count / len(animals)
        if biodiversity_pct < 0.4:
            health_score -= 25
        elif biodiversity_pct < 0.7:
            health_score -= 12

    carn_pop = 0
    herb_pop = 0
    for a in animals:
        pop = a.get("population", 0)
        diet = a.get("diet", "Herbivore")
        if pop > 0:
            if diet == "Carnivore":
                carn_pop += pop
            else:
                herb_pop += pop

    if carn_pop > 0 and herb_pop > 0:
        ratio = herb_pop / carn_pop
        if ratio < 1.3:
            health_score -= 15
        elif ratio > 10.0:
            health_score -= 10
            
    for a in animals:
        pop = a.get("population", 0)
        if pop > 120:
            health_score -= 8
            
    return max(0, min(100, health_score))

def get_season(day):
    cycle = (day - 1) % 60
    if cycle < 15: return "Spring"
    elif cycle < 30: return "Summer"
    elif cycle < 45: return "Autumn"
    else: return "Winter"

def pick_weather_for_env(env):
    choices = {
        "forest": ["Sunny", "Rain", "Storm", "Drought"],
        "ocean": ["Sunny", "Storm"],
        "desert": ["Sunny", "Heatwave", "Drought"],
        "grassland": ["Sunny", "Rain", "Heatwave", "Drought"],
        "arctic": ["Sunny", "Snow", "Storm"],
        "wetland": ["Sunny", "Rain", "Storm", "Drought"],
        "mountain": ["Sunny", "Snow", "Storm"],
        "rainforest": ["Sunny", "Rain", "Storm"]
    }
    env_choices = choices.get(env.lower(), ["Sunny", "Rain", "Storm"])
    return random.choice(env_choices)

def run_simulation_tick(session):
    day = session.get("day", 1)
    day += 1
    
    season = get_season(day)
    env = session.get("environment", "forest")
    animals = session.get("animals", [])
    learning_logs = session.get("learning_logs", [])
    notifications = session.get("notifications", [])
    history = session.get("history", [])
    extinct_species = session.get("extinct_species", [])

    learning_logs = learning_logs[-20:]
    notifications = notifications[-20:]

    weather = session.get("weather", "Sunny")
    weather_dur = session.get("weather_duration", 5)
    weather_dur -= 1
    if weather_dur <= 0:
        weather = pick_weather_for_env(env)
        weather_dur = random.randint(6, 12)
        notifications.append(f"Day {day}: Weather shifted to {weather}.")
        
    energy_loss_multiplier = 1.0
    herbivore_mortality = 0
    plant_food_boost = 0
    water_scarcity = False
    
    if weather == "Drought":
        energy_loss_multiplier = 1.4
        herbivore_mortality = 0.05
        water_scarcity = True
        learning_logs.append(f"Drought dried up mudholes. Animals are losing energy 40% faster.")
    elif weather == "Heatwave":
        energy_loss_multiplier = 1.25
        learning_logs.append(f"Extreme Heatwave. Animal body temps rising, energy drain accelerated.")
    elif weather == "Rain":
        plant_food_boost = 15
        learning_logs.append(f"Rainfall triggered a growth burst of mosses and aquatic grasses.")
    elif weather == "Snow":
        energy_loss_multiplier = 1.2
        learning_logs.append(f"Snow and freezing temperatures are taxing warm-blooded energy reserves.")

    reprod_multiplier = 1.0
    hibernating = False
    
    if season == "Spring":
        reprod_multiplier = 1.5
        learning_logs.append("Spring season active. Birthing cohorts receive +50% breeding success boost.")
    elif season == "Summer":
        plant_food_boost += 8
    elif season == "Autumn":
        if day % 60 == 31:
            for a in animals:
                if a["id"] in ["whale", "eagle", "condor"]:
                    a["population"] = 0
                    a["juveniles"] = 0
                    a["adults"] = 0
                    a["elders"] = 0
                    notifications.append(f"Day {day}: Migratory {a['name']}s left the area heading south.")
                    learning_logs.append(f"{a['name']}s started their autumn migration route.")
    elif season == "Winter":
        hibernating = True
        reprod_multiplier = 0.2
        learning_logs.append("Winter hibernation active. Movement rates slowed, births reduced by 80%.")
        if day % 60 == 1:
            for a in animals:
                if a["id"] in ["whale", "eagle", "condor"]:
                    a["population"] = 25
                    a["adults"] = 20
                    a["elders"] = 5
                    notifications.append(f"Day {day}: Migratory {a['name']}s returned to the environment.")

    animal_map = {a["id"]: a for a in animals}

    if random.random() < 0.10:
        events = ["Wildfire", "Flood", "Disease Outbreak", "Pollution Spill", "Conservation Program"]
        chosen_event = random.choice(events)
        
        if chosen_event == "Wildfire" and env.lower() not in ["ocean"]:
            notifications.append(f"Day {day}: Wildfire swept the landscape, burning 20% of shelters!")
            for a in animals:
                if a["diet"] == "Herbivore" and a["population"] > 0:
                    kills = int(a["population"] * 0.20)
                    a["population"] -= kills
                    for c_type in ["juveniles", "adults", "elders"]:
                        a[c_type] = int(a[c_type] * 0.8)
                    a["health"] = max(0, a["health"] - 20)
                    
        elif chosen_event == "Flood":
            notifications.append(f"Day {day}: River burst its banks! Floodwaters submerged lower grasslands.")
            for a in animals:
                if a["id"] in ["alligator", "frog", "fish", "turtle", "otter", "duck", "catfish"]:
                    a["population"] = int(a["population"] * 1.1)
                    a["energy"] = min(100, a["energy"] + 15)
                else:
                    a["population"] = int(a["population"] * 0.88)
                    a["energy"] = max(0, a["energy"] - 15)
                    for c in ["juveniles", "adults", "elders"]: a[c] = int(a[c] * 0.88)
                    
        elif chosen_event == "Disease Outbreak":
            active = [a for a in animals if a["population"] > 0]
            if active:
                target = random.choice(active)
                dec = int(target["population"] * 0.25)
                target["population"] -= dec
                for c in ["juveniles", "adults", "elders"]: target[c] = int(target[c] * 0.75)
                target["health"] = max(0, target["health"] - 40)
                notifications.append(f"Day {day}: Disease outbreak reduced {target['name']} population by 25%.")
                
        elif chosen_event == "Pollution Spill":
            notifications.append(f"Day {day}: Environmental pollution detected! Health values fell.")
            for a in animals:
                a["health"] = max(0, a["health"] - 25)
                a["population"] = int(a["population"] * 0.9)
                for c in ["juveniles", "adults", "elders"]: a[c] = int(a[c] * 0.9)
                
        elif chosen_event == "Conservation Program":
            at_risk = [a for a in animals if 0 < a["population"] < 25]
            if at_risk:
                target = random.choice(at_risk)
                boost = int(target["population"] * 0.3) + 2
                target["population"] += boost
                target["adults"] += boost
                target["health"] = 100
                notifications.append(f"Day {day}: Conservation program restored {target['name']} population (+{boost}).")

    for a in animals:
        pop = a.get("population", 0)
        if pop <= 0:
            a["population"] = 0
            a["juveniles"] = 0
            a["adults"] = 0
            a["elders"] = 0
            continue

        juv = a.get("juveniles", 0)
        ad = a.get("adults", 0)
        eld = a.get("elders", 0)

        matured = int(juv * 0.10)
        juv -= matured
        ad += matured

        aged = int(ad * 0.08)
        ad -= aged
        eld += aged

        aged_deaths = int(eld * 0.15)
        if eld > 0 and aged_deaths == 0 and random.random() < 0.35:
            aged_deaths = 1
        eld = max(0, eld - aged_deaths)

        loss = 10 * energy_loss_multiplier
        if hibernating:
            loss = 5
        a["energy"] = max(0, a["energy"] - int(loss))

        a["juveniles"] = juv
        a["adults"] = ad
        a["elders"] = eld
        a["population"] = juv + ad + eld

    for a in animals:
        pop = a["population"]
        if pop <= 0: continue
        
        diet = a["diet"]
        prey_list = a.get("prey", [])
        
        if diet == "Carnivore" or (diet == "Omnivore" and prey_list):
            active_preys = [p_id for p_id in prey_list if p_id in animal_map and animal_map[p_id]["population"] > 0]
            
            if active_preys:
                target_id = max(active_preys, key=lambda k: animal_map[k]["population"])
                target_prey = animal_map[target_id]
                
                ad_ratio = a["adults"] / pop if pop > 0 else 0.5
                hunt_success = 0.5 + (a["simulationStats"]["speed"] - target_prey["simulationStats"]["speed"]) / 100.0
                hunt_success *= (0.5 + 0.5 * ad_ratio)
                
                if hibernating:
                    hunt_success *= 0.6
                
                hunt_success = max(0.15, min(1.0, hunt_success))
                
                hunted = int(a["population"] * 0.28 * hunt_success)
                hunted = min(hunted, target_prey["population"], int(target_prey["population"] * 0.5))
                
                if hunted > 0:
                    t_pop = target_prey["population"]
                    j_ratio = target_prey["juveniles"] / t_pop
                    a_ratio = target_prey["adults"] / t_pop
                    
                    j_deaths = int(hunted * j_ratio)
                    a_deaths = int(hunted * a_ratio)
                    e_deaths = hunted - j_deaths - a_deaths
                    
                    target_prey["juveniles"] = max(0, target_prey["juveniles"] - j_deaths)
                    target_prey["adults"] = max(0, target_prey["adults"] - a_deaths)
                    target_prey["elders"] = max(0, target_prey["elders"] - e_deaths)
                    target_prey["population"] = target_prey["juveniles"] + target_prey["adults"] + target_prey["elders"]
                    
                    energy_boost = int((hunted / a["population"]) * 45)
                    a["energy"] = min(100, a["energy"] + max(20, energy_boost))
                    
                    learning_logs.append(f"{a['name']} pack successfully chased and hunted {hunted} {target_prey['name']}(s).")
                else:
                    a["energy"] = max(0, a["energy"] - 8)
                    learning_logs.append(f"{a['name']}s failed to corner and hunt {target_prey['name']}s.")
            else:
                a["energy"] = max(0, a["energy"] - 18)
                learning_logs.append(f"{a['name']}s are starving! No primary prey species exist.")
                if a["population"] > 0:
                    notifications.append(f"COLLAPSE WARNING: {a['name']} food source has collapsed!")

        elif diet in ["Herbivore", "Filter Feeder"]:
            if water_scarcity:
                a["energy"] = max(0, a["energy"] - 10)
            
            if a["population"] > 90:
                a["energy"] = max(0, a["energy"] - 8)
                a["health"] = max(0, a["health"] - 10)
                learning_logs.append(f"{a['name']} population exceeds habitat carrying capacity. Grazing fields exhausted.")
            else:
                a["energy"] = min(100, a["energy"] + 15 + plant_food_boost)

    for a in animals:
        if a["population"] <= 0: continue
        
        if a["energy"] == 0:
            a["health"] = max(0, a["health"] - 25)
            starved = max(1, int(a["population"] * 0.16))
            
            t_pop = a["population"]
            j_ratio = a["juveniles"] / t_pop
            a_ratio = a["adults"] / t_pop
            
            j_deaths = int(starved * j_ratio)
            a_deaths = int(starved * a_ratio)
            e_deaths = starved - j_deaths - a_deaths
            
            a["juveniles"] = max(0, a["juveniles"] - j_deaths)
            a["adults"] = max(0, a["adults"] - a_deaths)
            a["elders"] = max(0, a["elders"] - e_deaths)
            a["population"] = a["juveniles"] + a["adults"] + a["elders"]
            
            learning_logs.append(f"Starvation! {a['name']} lost {starved} population due to malnutrition.")
            if a["population"] > 0:
                notifications.append(f"WARNING: {a['name']} population is starving!")
        elif a["energy"] > 60:
            a["health"] = min(100, a["health"] + 12)

    for a in animals:
        if a["population"] <= 0: continue
        
        reprod_rate = a["simulationStats"]["reproductionRate"] * reprod_multiplier
        
        if a["energy"] > 65 and a["health"] > 65 and a["adults"] > 1:
            births = int(a["adults"] * reprod_rate * (a["energy"] / 100.0))
            births = max(1, births)
            
            a["juveniles"] += births
            a["population"] = a["juveniles"] + a["adults"] + a["elders"]
            
            a["energy"] = max(20, a["energy"] - 15)
            
            learning_logs.append(f"{births} Juvenile {a['name']}(s) were born into the environment.")

    for a in animals:
        if a["population"] <= 0 and a["id"] not in extinct_species:
            a["population"] = 0
            a["juveniles"] = 0
            a["adults"] = 0
            a["elders"] = 0
            
            extinct_species.append(a["id"])
            notifications.append(f"ALERT: {a['name']} population has gone extinct.")
            learning_logs.append(f"CRITICAL COLLAPSE: {a['name']} is now extinct.")
            
            for other in animals:
                if other["population"] > 0 and a["id"] in other.get("prey", []):
                    active_prey = [p_id for p_id in other.get("prey", []) if p_id in animal_map and animal_map[p_id]["population"] > 0]
                    if not active_prey:
                        notifications.append(f"COLLAPSE CASCADE: {other['name']} population is at risk due to prey extinction!")

    prev_species_pops = {}
    if history:
        prev_species_pops = history[-1].get("species", {})

    for a in animals:
        curr_pop = a["population"]
        if curr_pop == 0:
            a["trend"] = "extinct"
        else:
            prev_pop = prev_species_pops.get(a["id"], curr_pop)
            if curr_pop > prev_pop:
                a["trend"] = "increasing"
            elif curr_pop < prev_pop:
                a["trend"] = "declining"
            else:
                a["trend"] = "stable"

    ecosystem_health = calculate_ecosystem_health(animals, extinct_species)

    history_point = {
        "day": day,
        "health": ecosystem_health,
        "species": {a["id"]: a["population"] for a in animals}
    }
    history.append(history_point)

    session["day"] = day
    session["season"] = season
    session["weather"] = weather
    session["weather_duration"] = weather_dur
    session["health"] = ecosystem_health
    session["animals"] = animals
    session["learning_logs"] = learning_logs
    session["notifications"] = notifications
    session["history"] = history
    session["extinct_species"] = extinct_species

    return session

def simulation_background_loop():
    print("Simulation background daemon thread active.")
    while True:
        try:
            running_sessions = db.simulation_sessions.find({"status": "running"})
            for session in running_sessions:
                session_id = str(session["_id"])
                
                with sessions_lock:
                    if session_id not in active_sessions:
                        active_sessions[session_id] = {
                            "speed": session.get("speed", 1),
                            "last_tick_time": time.time()
                        }
                    speed = active_sessions[session_id]["speed"]
                    last_tick = active_sessions[session_id]["last_tick_time"]
                
                tick_interval = 5.0 / speed
                now = time.time()

                if now - last_tick >= tick_interval:
                    updated_session = run_simulation_tick(session)
                    
                    db.simulation_sessions.update_one(
                        {"_id": session["_id"]},
                        {"$set": {
                            "day": updated_session["day"],
                            "season": updated_session["season"],
                            "weather": updated_session["weather"],
                            "weather_duration": updated_session["weather_duration"],
                            "health": updated_session["health"],
                            "animals": updated_session["animals"],
                            "learning_logs": updated_session["learning_logs"],
                            "notifications": updated_session["notifications"],
                            "history": updated_session["history"],
                            "extinct_species": updated_session["extinct_species"]
                        }}
                    )

                    with sessions_lock:
                        active_sessions[session_id]["last_tick_time"] = now
                        
        except Exception as e:
            print("Error in simulation daemon loop:", e)
            
        time.sleep(0.2)

# Start background thread
daemon_thread = threading.Thread(target=simulation_background_loop, daemon=True)
daemon_thread.start()

# ─── API ROUTES ──────────────────────────────────────────────────────────────

@app.route('/animals', methods=['GET'])
def get_animals():
    try:
        animals = list(db.animals.find({}, {"_id": 0}))
        return jsonify(animals), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/animals/<animal_id>', methods=['GET'])
def get_animal_by_id(animal_id):
    try:
        animal = db.animals.find_one({"id": animal_id}, {"_id": 0})
        if animal:
            return jsonify(animal), 200
        else:
            fallback = next((a for a in SEED_ANIMALS if a["id"] == animal_id), None)
            if fallback:
                return jsonify(fallback), 200
            return jsonify({"error": "Animal not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ecosystem/create', methods=['POST'])
def create_ecosystem():
    try:
        data = request.json or {}
        environment = data.get("environment", "").lower()
        if not environment:
            return jsonify({"error": "Environment selection is required"}), 400

        query_env = environment.capitalize()
        if environment == "rainforest": query_env = "Rainforest"
        elif environment == "grassland": query_env = "Grassland"

        compatible_animals = list(db.animals.find({"habitat": query_env}, {"_id": 0}))
        
        session_animals = []
        for anim in compatible_animals:
            session_animals.append({
                "id": anim["id"],
                "name": anim["name"],
                "scientificName": anim.get("scientificName", anim.get("scientific", "")),
                "category": anim["category"],
                "habitat": anim["habitat"],
                "diet": anim["diet"],
                "population": 0,
                "juveniles": 0,
                "adults": 0,
                "elders": 0,
                "trend": "stable",
                "prey": anim.get("prey", []),
                "predators": anim.get("predators", []),
                "images": anim["images"],
                "simulationStats": anim["simulationStats"],
                "energy": anim["simulationStats"]["energy"],
                "health": anim["simulationStats"]["health"],
                "extinct": False
            })

        session_doc = {
            "environment": environment,
            "status": "paused",
            "speed": 1,
            "day": 1,
            "season": "Spring",
            "weather": "Sunny",
            "weather_duration": 8,
            "health": 100,
            "animals": session_animals,
            "extinct_species": [],
            "learning_logs": ["Ecosystem sandbox created. Configure animal populations in the left panel to populate the map."],
            "notifications": ["Ecosystem Sandbox Created."],
            "history": [{
                "day": 1,
                "health": 100,
                "species": {a["id"]: 0 for a in session_animals}
            }]
        }

        result = db.simulation_sessions.insert_one(session_doc)
        session_id = str(result.inserted_id)

        return jsonify({
            "session_id": session_id,
            "environment": environment,
            "animals": session_animals,
            "message": "Ecosystem session created successfully."
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ecosystem/add-animal', methods=['POST'])
def add_animal_to_ecosystem():
    try:
        data = request.json or {}
        session_id = data.get("session_id")
        animal_id = data.get("animal_id")
        population = data.get("population", 0)

        if not session_id or not animal_id:
            return jsonify({"error": "session_id and animal_id are required"}), 400

        session = db.simulation_sessions.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Session not found"}), 404

        animals = session.get("animals", [])
        extinct_species = session.get("extinct_species", [])
        animal_found = False
        
        for a in animals:
            if a["id"] == animal_id:
                a["population"] = max(0, population)
                
                if a["population"] > 0:
                    a["juveniles"] = int(a["population"] * 0.20)
                    a["elders"] = int(a["population"] * 0.20)
                    a["adults"] = a["population"] - a["juveniles"] - a["elders"]
                    
                    a["health"] = 100
                    a["energy"] = 100
                    a["trend"] = "stable"
                    if a["id"] in extinct_species:
                        extinct_species.remove(a["id"])
                else:
                    a["juveniles"] = 0
                    a["adults"] = 0
                    a["elders"] = 0
                    a["trend"] = "extinct"
                    if a["id"] not in extinct_species:
                        extinct_species.append(a["id"])
                        
                animal_found = True
                break

        if not animal_found:
            return jsonify({"error": f"Animal {animal_id} is not compatible with this environment."}), 400

        new_health = calculate_ecosystem_health(animals, extinct_species)

        history = session.get("history", [])
        if history:
            history[0]["species"] = {a["id"]: a["population"] for a in animals}
            history[0]["health"] = new_health

        db.simulation_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {
                "animals": animals,
                "health": new_health,
                "history": history,
                "extinct_species": extinct_species
            }}
        )

        return jsonify({
            "message": "Animal population updated.",
            "animals": animals,
            "health": new_health
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/simulation/start', methods=['POST'])
def start_simulation():
    try:
        data = request.json or {}
        session_id = data.get("session_id")
        speed = data.get("speed", 1)

        if not session_id:
            return jsonify({"error": "session_id is required"}), 400

        session = db.simulation_sessions.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Session not found"}), 404

        with sessions_lock:
            active_sessions[session_id] = {
                "speed": speed,
                "last_tick_time": time.time()
            }

        db.simulation_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {
                "status": "running",
                "speed": speed
            }}
        )

        return jsonify({
            "message": "Simulation started/resumed.",
            "session_id": session_id,
            "status": "running",
            "speed": speed
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/simulation/pause', methods=['POST'])
def pause_simulation():
    try:
        data = request.json or {}
        session_id = data.get("session_id")

        if not session_id:
            return jsonify({"error": "session_id is required"}), 400

        with sessions_lock:
            if session_id in active_sessions:
                del active_sessions[session_id]

        db.simulation_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"status": "paused"}}
        )

        return jsonify({
            "message": "Simulation paused.",
            "session_id": session_id,
            "status": "paused"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/simulation/reset', methods=['POST'])
def reset_simulation():
    try:
        data = request.json or {}
        session_id = data.get("session_id")

        if not session_id:
            return jsonify({"error": "session_id is required"}), 400

        session = db.simulation_sessions.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Session not found"}), 404

        with sessions_lock:
            if session_id in active_sessions:
                del active_sessions[session_id]

        animals = session.get("animals", [])
        extinct_species = []
        for a in animals:
            a["energy"] = 100
            a["health"] = 100
            a["trend"] = "stable" if a["population"] > 0 else "extinct"
            
            if a["population"] > 0:
                a["juveniles"] = int(a["population"] * 0.20)
                a["elders"] = int(a["population"] * 0.20)
                a["adults"] = a["population"] - a["juveniles"] - a["elders"]
            else:
                a["juveniles"] = 0
                a["adults"] = 0
                a["elders"] = 0
                extinct_species.append(a["id"])

        new_health = calculate_ecosystem_health(animals, extinct_species)

        reset_doc = {
            "status": "paused",
            "day": 1,
            "season": "Spring",
            "weather": "Sunny",
            "weather_duration": 8,
            "health": new_health,
            "animals": animals,
            "extinct_species": extinct_species,
            "learning_logs": ["Ecosystem simulation reset to initial builder state."],
            "notifications": ["Simulation Reset."],
            "history": [{
                "day": 1,
                "health": new_health,
                "species": {a["id"]: a["population"] for a in animals}
            }]
        }

        db.simulation_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": reset_doc}
        )

        return jsonify({
            "message": "Simulation reset successfully.",
            "session_id": session_id,
            "status": "paused",
            "health": new_health,
            "animals": animals
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/simulation/status', methods=['GET'])
def get_simulation_status():
    try:
        session_id = request.args.get("session_id")
        if not session_id:
            return jsonify({"error": "session_id parameter is required"}), 400

        session = db.simulation_sessions.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Session not found"}), 404

        return jsonify({
            "session_id": str(session["_id"]),
            "environment": session["environment"],
            "status": session["status"],
            "speed": session.get("speed", 1),
            "day": session["day"],
            "season": session["season"],
            "weather": session.get("weather", "Sunny"),
            "health": session["health"],
            "animals": session["animals"],
            "extinct_species": session.get("extinct_species", []),
            "learning_logs": session.get("learning_logs", []),
            "notifications": session.get("notifications", [])
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/simulation/stats', methods=['GET'])
def get_simulation_stats():
    try:
        session_id = request.args.get("session_id")
        if not session_id:
            return jsonify({"error": "session_id parameter is required"}), 400

        session = db.simulation_sessions.find_one({"_id": ObjectId(session_id)})
        if not session:
            return jsonify({"error": "Session not found"}), 404

        history = session.get("history", [])
        animals = session.get("animals", [])
        
        total_animals = sum(a["population"] for a in animals)
        species_count = len(animals)
        predators_count = sum(1 for a in animals if a.get("diet") == "Carnivore" and a["population"] > 0)
        prey_count = sum(1 for a in animals if a.get("diet") in ["Herbivore", "Filter Feeder"] and a["population"] > 0)
        extinct_count = len(session.get("extinct_species", []))

        return jsonify({
            "session_id": str(session["_id"]),
            "total_animals": total_animals,
            "species_count": species_count,
            "predators_count": predators_count,
            "prey_count": prey_count,
            "extinct_count": extinct_count,
            "ecosystem_health": session["health"],
            "history": history,
            "species_meta": [{
                "id": a["id"],
                "name": a["name"],
                "diet": a["diet"],
                "population": a["population"],
                "trend": a.get("trend", "stable"),
                "juveniles": a.get("juveniles", 0),
                "adults": a.get("adults", 0),
                "elders": a.get("elders", 0)
            } for a in animals]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── USER AUTHENTICATION ROUTES ──────────────────────────────────────────────

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
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

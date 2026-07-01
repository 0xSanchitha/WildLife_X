from flask import Blueprint, jsonify
from bson import ObjectId, errors as bson_errors
from database.db import db

animal_bp = Blueprint("animals", __name__)

animals_col = db["animals"]


def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc


# ── GET /api/animals/  →  list (card data) ───────────────────────────────────
@animal_bp.route("/", methods=["GET"])
def list_animals():
    projection = {
        "id": 1,
        "name": 1,
        "category": 1,
        "habitat": 1,
        "status": 1,
        "description": 1,
        "image": 1,
        "images": 1,
        "diet": 1,
        "prey": 1,
        "predators": 1,
        "lifespan": 1,
        "speed": 1,
        "weight": 1,
        "ecosystemPoints": 1,
    }
    docs = list(animals_col.find({}, projection))
    for d in docs:
        d["_id"] = str(d["_id"])
        # normalise: always expose a top-level "image" for AnimalCard
        if not d.get("image") and d.get("images"):
            d["image"] = d["images"][0]
    return jsonify(docs), 200


# ── GET /api/animals/<id>  →  full detail ────────────────────────────────────
@animal_bp.route("/<animal_id>", methods=["GET"])
def get_animal(animal_id):
    doc = None

    # 1. Try as MongoDB ObjectId
    try:
        doc = animals_col.find_one({"_id": ObjectId(animal_id)})
    except (bson_errors.InvalidId, Exception):
        pass

    # 2. Try as string slug id field e.g. "snow-leopard"
    if not doc:
        doc = animals_col.find_one({"id": animal_id})

    # 3. Try as numeric id
    if not doc:
        try:
            doc = animals_col.find_one({"id": int(animal_id)})
        except (ValueError, TypeError):
            pass

    if not doc:
        return jsonify({"error": f"Animal not found for id: {animal_id}"}), 404

    return jsonify(serialize(doc)), 200


# ── POST /api/animals/seed  →  seed simulation animals (dev/setup) ───────────
@animal_bp.route("/seed", methods=["POST"])
def seed_animals():
    from data.simulation_animals import SIMULATION_ANIMALS

    inserted = 0
    updated = 0
    for animal in SIMULATION_ANIMALS:
        result = animals_col.update_one(
            {"id": animal["id"]},
            {"$set": animal},
            upsert=True,
        )
        if result.upserted_id:
            inserted += 1
        elif result.modified_count:
            updated += 1

    return jsonify({
        "message": "Simulation animals seeded",
        "inserted": inserted,
        "updated": updated,
        "total": animals_col.count_documents({}),
        "forest_prey": ["rabbit", "mouse", "squirrel", "deer", "boar"],
        "ocean_prey": ["plankton", "krill", "small-fish", "clownfish", "sea-urchin"],
    }), 200
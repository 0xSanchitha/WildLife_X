import datetime
from flask import Blueprint, request, jsonify
from bson import ObjectId, errors as bson_errors
from database.db import db
import jwt

SECRET_KEY = "wildlifex_secret"
simulation_bp = Blueprint("simulations", __name__)
simulations_col = db["simulations"]

def get_current_user_id():
    """
    Helper function to validate the JWT and return user_id.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload.get("user_id")
    except Exception:
        return None

def serialize_sim(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# ── POST /api/simulations/save  →  save/update simulation ─────────────────────
@simulation_bp.route("/save", methods=["POST"])
def save_simulation():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized. Please sign in."}), 401

    data = request.json
    if not data:
        return jsonify({"error": "Missing payload"}), 400

    sim_id = data.get("id")  # Can be a unique string or MongoDB ID
    name = data.get("name", "Unnamed Simulation")
    ecosystem_type = data.get("ecosystem_type")
    world_size = data.get("world_size", "medium")
    simulation_state = data.get("simulation_state")

    if not ecosystem_type or not simulation_state:
        return jsonify({"error": "ecosystem_type and simulation_state are required"}), 400

    # Look for existing simulation
    existing = None
    if sim_id:
        try:
            existing = simulations_col.find_one({"_id": ObjectId(sim_id), "user_id": user_id})
        except (bson_errors.InvalidId, Exception):
            existing = simulations_col.find_one({"id": sim_id, "user_id": user_id})

    # Prepare document
    doc = {
        "user_id": user_id,
        "name": name,
        "ecosystem_type": ecosystem_type,
        "world_size": world_size,
        "simulation_state": simulation_state,
        "updated_at": datetime.datetime.utcnow()
    }

    if existing:
        simulations_col.update_one({"_id": existing["_id"]}, {"$set": doc})
        doc["_id"] = str(existing["_id"])
        return jsonify({"message": "Simulation updated successfully", "simulation": doc}), 200
    else:
        doc["created_at"] = datetime.datetime.utcnow()
        result = simulations_col.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return jsonify({"message": "Simulation saved successfully", "simulation": doc}), 201


# ── GET /api/simulations  →  list user's simulations ─────────────────────────
@simulation_bp.route("/", methods=["GET"])
def list_simulations():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized. Please sign in."}), 401

    # Return summary information (no heavy state arrays) to avoid slow page load
    projection = {
        "name": 1,
        "ecosystem_type": 1,
        "world_size": 1,
        "updated_at": 1,
        "created_at": 1,
    }

    docs = list(simulations_col.find({"user_id": user_id}, projection).sort("updated_at", -1))
    for d in docs:
        d["_id"] = str(d["_id"])
    return jsonify(docs), 200


# ── GET /api/simulations/<sim_id>  →  load full simulation ───────────────────
@simulation_bp.route("/<sim_id>", methods=["GET"])
def get_simulation(sim_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized. Please sign in."}), 401

    doc = None
    try:
        doc = simulations_col.find_one({"_id": ObjectId(sim_id), "user_id": user_id})
    except (bson_errors.InvalidId, Exception):
        doc = simulations_col.find_one({"id": sim_id, "user_id": user_id})

    if not doc:
        return jsonify({"error": "Simulation not found"}), 404

    return jsonify(serialize_sim(doc)), 200


# ── DELETE /api/simulations/<sim_id>  →  delete simulation ─────────────────────
@simulation_bp.route("/<sim_id>", methods=["DELETE"])
def delete_simulation(sim_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized. Please sign in."}), 401

    result = None
    try:
        result = simulations_col.delete_one({"_id": ObjectId(sim_id), "user_id": user_id})
    except (bson_errors.InvalidId, Exception):
        result = simulations_col.delete_one({"id": sim_id, "user_id": user_id})

    if not result or result.deleted_count == 0:
        return jsonify({"error": "Simulation not found"}), 404

    return jsonify({"message": "Simulation deleted successfully"}), 200

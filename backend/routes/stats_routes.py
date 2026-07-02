from flask import Blueprint, jsonify
from database.db import db

stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/", methods=["GET"])
def get_platform_stats():
    users_col = db["user"]
    animals_col = db["animals"]
    simulations_col = db["simulations"]
    reviews_col = db["reviews"]

    users_count = users_col.count_documents({})
    animals_count = animals_col.count_documents({})
    ecosystems_count = simulations_col.count_documents({})
    reviews_count = reviews_col.count_documents({})

    forest_sims = simulations_col.count_documents({"ecosystem_type": "forest"})
    ocean_sims = simulations_col.count_documents({"ecosystem_type": "ocean"})

    return jsonify({
        "users": users_count,
        "animals": animals_count,
        "ecosystems": ecosystems_count,
        "reviews": reviews_count,
        "forest_ecosystems": forest_sims,
        "ocean_ecosystems": ocean_sims,
        "ecosystem_types": 2,
        "simulation_modes": 2,
    }), 200

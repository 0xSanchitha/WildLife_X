import datetime
from flask import Blueprint, request, jsonify
from database.db import db

review_bp = Blueprint("reviews", __name__)
reviews_col = db["reviews"]


def serialize_review(doc):
    return {
        "_id": str(doc["_id"]),
        "name": doc.get("name", "Anonymous"),
        "text": doc.get("text", ""),
        "rating": doc.get("rating", 5),
        "created_at": doc.get("created_at", datetime.datetime.utcnow()).isoformat(),
    }


@review_bp.route("/", methods=["GET"])
def list_reviews():
    limit = min(int(request.args.get("limit", 10)), 50)
    docs = list(
        reviews_col.find({})
        .sort("created_at", -1)
        .limit(limit)
    )
    return jsonify([serialize_review(d) for d in docs]), 200


@review_bp.route("/", methods=["POST"])
def submit_review():
    data = request.json or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    text = (data.get("text") or "").strip()
    rating = data.get("rating", 5)

    if not name or not text:
        return jsonify({"error": "Name and review text are required."}), 400

    if len(text) < 10:
        return jsonify({"error": "Review must be at least 10 characters."}), 400

    try:
        rating = max(1, min(5, int(rating)))
    except (TypeError, ValueError):
        rating = 5

    doc = {
        "name": name,
        "email": email,
        "text": text,
        "rating": rating,
        "created_at": datetime.datetime.utcnow(),
    }
    result = reviews_col.insert_one(doc)

    return jsonify({
        "message": "Thank you! Your review has been published on the home page.",
        "review": serialize_review({**doc, "_id": result.inserted_id}),
    }), 201

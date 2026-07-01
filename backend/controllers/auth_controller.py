from flask import request, jsonify
from models.user_model import users_collection
from utils.password_utils import hash_password, verify_password

import jwt
import datetime

SECRET_KEY = "wildlifex_secret"


def register():
    data = request.json

    username = data.get("username")
    email    = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        return jsonify({"message": "Email already exists"}), 400

    users_collection.insert_one({
        "username": username,
        "email":    email,
        "password": hash_password(password),
    })

    return jsonify({"message": "User created successfully"}), 201


def login():
    data = request.json

    email    = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not verify_password(password, user["password"]):
        return jsonify({"message": "Wrong password"}), 401

    token = jwt.encode(
        {
            "user_id": str(user["_id"]),
            "exp":     datetime.datetime.utcnow() + datetime.timedelta(days=7),
        },
        SECRET_KEY,
        algorithm="HS256",
    )

    return jsonify({
        "message":  "Login successful",
        "token":    token,
        "username": user["username"],   # returned so the frontend can dispatch auth-change immediately
    })


def me():
    """
    GET /api/auth/me
    Reads the JWT from the Authorization header and returns the user's
    username and email. Used by the Navbar to display the logged-in user.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"message": "Missing token"}), 401

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    from bson import ObjectId
    user = users_collection.find_one({"_id": ObjectId(payload["user_id"])})
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "username": user["username"],
        "email":    user["email"],
    })
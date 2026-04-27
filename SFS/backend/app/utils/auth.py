import jwt
import bcrypt
from flask import current_app, jsonify, request
from functools import wraps
from ..models import get_user_collection

def register_user(data):
    users = get_user_collection(current_app)

    hashed_pw = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt())

    new_user = {
        "username": data["username"],
        "email": data["email"],
        "password": hashed_pw,
    }

    users.insert_one(new_user)
    return jsonify({"msg": "User registered"}), 201


def login_user(data):
    users = get_user_collection(current_app)
    user = users.find_one({"email": data["email"]})

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.checkpw(data["password"].encode(), user["password"]):
        return jsonify({"error": "Wrong password"}), 401

    token = jwt.encode(
        {"email": user["email"]},
        current_app.config["JWT_SECRET"],
        algorithm="HS256"
    )
    return jsonify({"token": token})


def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            data = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
            users = get_user_collection(current_app)
            user = users.find_one({"email": data["email"]})
        except:
            return jsonify({"error": "Token invalid"}), 401

        return f(user, *args, **kwargs)

    return wrapper

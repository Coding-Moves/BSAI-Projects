from flask import Blueprint, request, jsonify
from .models import get_user_collection, get_file_collection
from .utils.auth import register_user, login_user, token_required
from .utils.storage import upload_to_cloud, download_from_cloud
from .utils.encryption import encrypt_file, decrypt_file

routes_bp = Blueprint("routes", __name__)

@routes_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    return register_user(data)

@routes_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    return login_user(data)

@routes_bp.route("/upload", methods=["POST"])
@token_required
def upload(user):
    file = request.files["file"]
    encrypted_file_path, encrypted_key = encrypt_file(file)

    cloud_url = upload_to_cloud(encrypted_file_path)

    files = get_file_collection(routes_bp.app)
    files.insert_one({
        "owner": user["_id"],
        "filename": file.filename,
        "cloud_url": cloud_url,
        "encrypted_key": encrypted_key
    })

    return jsonify({"msg": "File uploaded securely"}), 200

@routes_bp.route("/download/<file_id>", methods=["GET"])
@token_required
def download(user, file_id):
    files = get_file_collection(routes_bp.app)
    file_data = files.find_one({"_id": file_id})

    cloud_file = download_from_cloud(file_data["cloud_url"])
    decrypted = decrypt_file(cloud_file, file_data["encrypted_key"])

    return decrypted

import firebase_admin
from firebase_admin import credentials, storage

cred = credentials.Certificate("firebase-service.json")
firebase_admin.initialize_app(cred, {"storageBucket": "your-bucket"})

def upload_to_cloud(filepath):
    bucket = storage.bucket()
    blob = bucket.blob(filepath)
    blob.upload_from_filename(filepath)
    return blob.public_url

def download_from_cloud(url):
    # simplified for demonstration
    import requests
    return requests.get(url).content

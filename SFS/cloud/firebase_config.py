import firebase_admin
from firebase_admin import credentials, storage

def initialize_firebase():
    # Load your Firebase Admin SDK key
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred, {
        "storageBucket": "your-bucket-name.appspot.com"
    })

def get_bucket():
    if not firebase_admin._apps:
        initialize_firebase()

    bucket = storage.bucket()
    return bucket

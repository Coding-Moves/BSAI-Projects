import os

class Config:
    SECRET_KEY = "YOUR_SECRET_KEY"
    JWT_SECRET = "JWT_SECRET_KEY"
    
    MONGO_URI = "mongodb://localhost:27017/"
    DB_NAME = "SecureFileStore"

    # Firebase or AWS keys
    CLOUD_BUCKET = "your-bucket"

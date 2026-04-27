def get_user_collection(app):
    return app.db["users"]

def get_file_collection(app):
    return app.db["files"]

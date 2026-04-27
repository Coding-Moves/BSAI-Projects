import uuid
from firebase_config import get_bucket

def upload_file_to_firebase(encrypted_file_path):
    bucket = get_bucket()

    unique_filename = str(uuid.uuid4())

    blob = bucket.blob(f"SecureFiles/{unique_filename}")
    blob.upload_from_filename(encrypted_file_path)

    blob.make_public()  # optional

    return blob.public_url  # URL stored in MongoDB


def download_file_from_firebase(file_url, output_path):
    bucket = get_bucket()

    # Extract file name from URL
    file_name = file_url.split("/")[-1]

    blob = bucket.blob(f"SecureFiles/{file_name}")
    blob.download_to_filename(output_path)

    return output_path

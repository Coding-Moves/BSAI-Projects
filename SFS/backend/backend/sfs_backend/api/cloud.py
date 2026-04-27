import os
from django.conf import settings

STORAGE_BASE = getattr(settings, 'STORAGE_ROOT', settings.BASE_DIR / 'storage')


def ensure_user_dir(user_id: int):
    path = os.path.join(STORAGE_BASE, str(user_id))
    os.makedirs(path, exist_ok=True)
    return path


def upload_to_local(owner_id: int, stored_filename: str, data: bytes) -> str:
    user_dir = ensure_user_dir(owner_id)
    path = os.path.join(user_dir, stored_filename)
    with open(path, 'wb') as f:
        f.write(data)
    return path


def download_from_local(owner_id: int, stored_filename: str) -> bytes:
    path = os.path.join(STORAGE_BASE, str(owner_id), stored_filename)
    with open(path, 'rb') as f:
        return f.read()


def delete_from_local(owner_id: int, stored_filename: str) -> None:
    path = os.path.join(STORAGE_BASE, str(owner_id), stored_filename)
    try:
        os.remove(path)
    except FileNotFoundError:
        pass


# NOTE: firebase and s3 implementations are placeholders that show how to extend

def upload_to_firebase(owner_id: int, stored_filename: str, data: bytes) -> str:
    raise NotImplementedError('Firebase upload not implemented in this example')


def download_from_firebase(owner_id: int, stored_filename: str) -> bytes:
    raise NotImplementedError('Firebase download not implemented in this example')


def upload_to_s3(owner_id: int, stored_filename: str, data: bytes) -> str:
    raise NotImplementedError('S3 upload not implemented in this example')


def download_from_s3(owner_id: int, stored_filename: str) -> bytes:
    raise NotImplementedError('S3 download not implemented in this example')

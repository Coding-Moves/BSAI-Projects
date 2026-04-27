from django.conf import settings
from ..models import UserKeyPair
from . import encryption


def create_and_store_user_keys(user):
    priv, pub = encryption.generate_rsa_keypair()
    master = settings.SECRET_KEY.encode('utf-8')
    enc_priv = encryption.encrypt_private_key(priv, master)
    UserKeyPair.objects.create(user=user, public_key=pub.decode('utf-8'), encrypted_private_key=enc_priv)
    return pub.decode('utf-8')


def get_user_private_key(user):
    try:
        kp = user.keypair
    except UserKeyPair.DoesNotExist:
        return None
    master = settings.SECRET_KEY.encode('utf-8')
    return encryption.decrypt_private_key(kp.encrypted_private_key, master)


def get_user_public_key(user):
    try:
        return user.keypair.public_key.encode('utf-8')
    except UserKeyPair.DoesNotExist:
        return None

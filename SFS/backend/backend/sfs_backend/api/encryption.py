from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Hash import HMAC, SHA256
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad
import base64

# ---- Helpers ----

def _derive_key(key_material: bytes) -> bytes:
    # Ensure 32 bytes AES key using SHA256
    h = SHA256.new()
    h.update(key_material)
    return h.digest()


# ---- RSA keypair ----

def generate_rsa_keypair(bits: int = 2048):
    key = RSA.generate(bits)
    private_pem = key.export_key(format='PEM')
    public_pem = key.publickey().export_key(format='PEM')
    return private_pem, public_pem


# ---- Private key protection (encrypted by server master key) ----

def encrypt_private_key(private_pem: bytes, master_key: bytes) -> bytes:
    # Encrypt private_pem using AES-256-CBC and add HMAC-SHA256 for integrity.
    key = _derive_key(master_key)
    iv = get_random_bytes(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ciphertext = cipher.encrypt(pad(private_pem, AES.block_size))
    # HMAC over iv + ciphertext
    h = HMAC.new(key, digestmod=SHA256)
    h.update(iv + ciphertext)
    tag = h.digest()
    # store as: tag || iv || ciphertext (bytes)
    return tag + iv + ciphertext


def decrypt_private_key(package: bytes, master_key: bytes) -> bytes:
    key = _derive_key(master_key)
    tag = package[:32]
    iv = package[32:48]
    ciphertext = package[48:]
    h = HMAC.new(key, digestmod=SHA256)
    h.update(iv + ciphertext)
    h.verify(tag)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    plain = unpad(cipher.decrypt(ciphertext), AES.block_size)
    return plain


# ---- File encryption (AES-256-CBC + HMAC-SHA256) ----

def encrypt_file_bytes(plain: bytes) -> tuple[bytes, bytes, bytes, bytes]:
    # returns (aes_key, iv, ciphertext, hmac_tag)
    aes_key = get_random_bytes(32)  # AES-256
    iv = get_random_bytes(16)
    cipher = AES.new(aes_key, AES.MODE_CBC, iv)
    ciphertext = cipher.encrypt(pad(plain, AES.block_size))
    h = HMAC.new(aes_key, digestmod=SHA256)
    h.update(iv + ciphertext)
    tag = h.digest()
    return aes_key, iv, ciphertext, tag


def decrypt_file_bytes(aes_key: bytes, iv: bytes, ciphertext: bytes, tag: bytes) -> bytes:
    h = HMAC.new(aes_key, digestmod=SHA256)
    h.update(iv + ciphertext)
    h.verify(tag)
    cipher = AES.new(aes_key, AES.MODE_CBC, iv)
    plain = unpad(cipher.decrypt(ciphertext), AES.block_size)
    return plain


# ---- RSA wrap/unwrap for AES keys ----

def rsa_encrypt_key(aes_key: bytes, public_pem: bytes) -> bytes:
    pub = RSA.import_key(public_pem)
    cipher = PKCS1_OAEP.new(pub, hashAlgo=SHA256)
    return cipher.encrypt(aes_key)


def rsa_decrypt_key(encrypted_key: bytes, private_pem: bytes) -> bytes:
    priv = RSA.import_key(private_pem)
    cipher = PKCS1_OAEP.new(priv, hashAlgo=SHA256)
    return cipher.decrypt(encrypted_key)


# ---- Utilities ----

def b64encode(data: bytes) -> str:
    return base64.b64encode(data).decode('utf-8')


def b64decode(s: str) -> bytes:
    return base64.b64decode(s.encode('utf-8'))

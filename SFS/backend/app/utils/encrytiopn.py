from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes
import base64
import os

def encrypt_file(file):
    aes_key = get_random_bytes(32)

    cipher_aes = AES.new(aes_key, AES.MODE_EAX)
    ciphertext, tag = cipher_aes.encrypt_and_digest(file.read())

    encrypted_file_path = "encrypted_" + file.filename
    
    with open(encrypted_file_path, "wb") as f:
        f.write(cipher_aes.nonce + tag + ciphertext)

    rsa_key = RSA.generate(2048)
    cipher_rsa = PKCS1_OAEP.new(rsa_key.publickey())
    encrypted_key = cipher_rsa.encrypt(aes_key)

    return encrypted_file_path, base64.b64encode(encrypted_key).decode()

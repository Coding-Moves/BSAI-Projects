from django.test import TestCase
from . import encryption

class EncryptionTests(TestCase):
    def test_rsa_wrap_unwrap(self):
        priv, pub = encryption.generate_rsa_keypair()
        aes_key = b'secretkey1234567890123456abcd'  # 32 bytes
        enc = encryption.rsa_encrypt_key(aes_key, pub)
        dec = encryption.rsa_decrypt_key(enc, priv)
        self.assertEqual(dec, aes_key)

    def test_aes_encrypt_decrypt(self):
        data = b'hello world' * 50
        aes_key, iv, ciphertext, tag = encryption.encrypt_file_bytes(data)
        out = encryption.decrypt_file_bytes(aes_key, iv, ciphertext, tag)
        self.assertEqual(out, data)

    def test_private_key_protection(self):
        priv, pub = encryption.generate_rsa_keypair()
        master = b'master-secret-key-should-be-32bytes'
        package = encryption.encrypt_private_key(priv, master)
        decrypted = encryption.decrypt_private_key(package, master)
        self.assertEqual(decrypted, priv)

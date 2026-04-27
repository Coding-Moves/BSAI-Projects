import os, sys
import unittest
sys.path.insert(0, os.path.abspath('backend/backend/sfs_backend'))
from api.utils import encryption

class TestEncryption(unittest.TestCase):
    def test_aes_encrypt_decrypt(self):
        data = b'Hello SFS' * 10
        aes_key, iv, ciphertext, tag = encryption.encrypt_file_bytes(data)
        out = encryption.decrypt_file_bytes(aes_key, iv, ciphertext, tag)
        self.assertEqual(out, data)

    def test_rsa_wrap_unwrap(self):
        priv, pub = encryption.generate_rsa_keypair()
        aes_key = b'0'*32
        enc = encryption.rsa_encrypt_key(aes_key, pub)
        dec = encryption.rsa_decrypt_key(enc, priv)
        self.assertEqual(dec, aes_key)

if __name__ == '__main__':
    unittest.main()

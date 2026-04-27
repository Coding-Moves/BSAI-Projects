import unittest
from app.utils.encryption import (
    generate_aes_key,
    encrypt_file_aes,
    decrypt_file_aes,
    rsa_encrypt_key,
    rsa_decrypt_key
)

class TestEncryption(unittest.TestCase):

    def test_aes_key_generation(self):
        key1 = generate_aes_key()
        key2 = generate_aes_key()
        self.assertNotEqual(key1, key2)

    def test_aes_encryption_decryption(self):
        key = generate_aes_key()
        input_file = "sample.txt"
        encrypted_file = "sample.enc"
        decrypted_file = "sample_out.txt"

        with open(input_file, "w") as f:
            f.write("Hello SecureFileStore")

        encrypt_file_aes(input_file, encrypted_file, key)
        decrypt_file_aes(encrypted_file, decrypted_file, key)

        with open(decrypted_file, "r") as f:
            result = f.read()

        self.assertEqual(result, "Hello SecureFileStore")

    def test_rsa_key_encryption_decryption(self):
        aes_key = generate_aes_key()
        encrypted_key = rsa_encrypt_key(aes_key)
        decrypted_key = rsa_decrypt_key(encrypted_key)
        self.assertEqual(aes_key, decrypted_key)


if __name__ == "__main__":
    unittest.main()

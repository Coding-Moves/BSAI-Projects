import unittest
from app.utils.auth import create_jwt_token, verify_jwt_token

class TestAuth(unittest.TestCase):

    def test_jwt_creation_and_verification(self):
        token = create_jwt_token({"user_id": "123"})
        decoded = verify_jwt_token(token)
        self.assertEqual(decoded["user_id"], "123")


if __name__ == "__main__":
    unittest.main()

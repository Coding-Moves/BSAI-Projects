import unittest
from cloud.upload_download import upload_file_to_firebase

class TestFileOperations(unittest.TestCase):

    def test_file_upload(self):
        test_file = "test_upload.txt"
        with open(test_file, "w") as f:
            f.write("Test file")

        url = upload_file_to_firebase(test_file)
        self.assertIn("https://", url)


if __name__ == "__main__":
    unittest.main()

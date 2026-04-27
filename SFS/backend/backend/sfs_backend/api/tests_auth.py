from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_token(self):
        url = reverse('register')
        resp = self.client.post(url, {'username': 'tester', 'password': 'pass1234', 'email': 't@example.com'})
        self.assertEqual(resp.status_code, 201)
        token_url = reverse('token_obtain_pair')
        resp = self.client.post(token_url, {'username': 'tester', 'password': 'pass1234'})
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data)

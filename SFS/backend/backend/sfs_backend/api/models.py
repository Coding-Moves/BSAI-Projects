import os
import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

STORAGE_CHOICES = (("local", "Local"), ("firebase", "Firebase"), ("s3", "S3"))


def user_storage_path(instance, filename):
    # stored files will be placed under storage/<user_id>/<uuid>
    return os.path.join(str(instance.owner.id), instance.stored_filename)


def generate_stored_filename():
    return uuid.uuid4().hex


class UserKeyPair(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='keypair')
    public_key = models.TextField()
    encrypted_private_key = models.BinaryField()

    def __str__(self):
        return f"KeyPair({self.user.username})"


class FileMetadata(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    original_filename = models.CharField(max_length=1024)
    stored_filename = models.CharField(max_length=64, unique=True, default=generate_stored_filename)
    content_type = models.CharField(max_length=255, blank=True)
    size = models.BigIntegerField(default=0)
    encrypted_key = models.BinaryField()  # AES key encrypted with user's RSA public key
    hmac = models.CharField(max_length=128)
    storage_backend = models.CharField(max_length=20, choices=STORAGE_CHOICES, default='local')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted = models.BooleanField(default=False)

    def get_local_path(self, base_dir):
        return os.path.join(base_dir, str(self.owner.id), self.stored_filename)

    def __str__(self):
        return f"File({self.original_filename}) by {self.owner.username}"


class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ('UPLOAD', 'Upload'),
        ('DOWNLOAD', 'Download'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=16, choices=ACTION_CHOICES)
    file = models.ForeignKey(FileMetadata, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        who = self.user.username if self.user else 'system'
        return f"{self.action} by {who} at {self.timestamp}"

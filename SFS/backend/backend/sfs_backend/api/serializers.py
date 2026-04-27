from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FileMetadata, ActivityLog, UserKeyPair
from . import encryption
from django.conf import settings

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        username = validated_data['username']
        password = validated_data['password']
        email = validated_data.get('email', '')
        user = User.objects.create_user(username=username, email=email, password=password)
        # generate RSA keypair
        priv, pub = encryption.generate_rsa_keypair()
        master_key = settings.SECRET_KEY.encode('utf-8')
        enc_priv = encryption.encrypt_private_key(priv, master_key)
        UserKeyPair.objects.create(user=user, public_key=pub.decode('utf-8'), encrypted_private_key=enc_priv)
        ActivityLog.objects.create(user=user, action='LOGIN')
        return user


class FileMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileMetadata
        fields = ('id', 'original_filename', 'content_type', 'size', 'created_at', 'storage_backend')


class UploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    storage_backend = serializers.ChoiceField(choices=[('local', 'Local'), ('firebase','Firebase'), ('s3','S3')], default='local')

    def validate_file(self, f):
        if f.size <= 0:
            raise serializers.ValidationError('Empty file')
        return f

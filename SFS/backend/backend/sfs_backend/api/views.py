import os
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db import models
from django.http import HttpResponse, FileResponse
from .models import FileMetadata, ActivityLog, UserKeyPair
from .serializers import RegisterSerializer, FileMetadataSerializer, UploadSerializer
from .utils import encryption as encryption_utils
from .utils import storage as storage_utils
from .utils.rsa_keys import get_user_private_key


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({'username': user.username}, status=status.HTTP_201_CREATED)


class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileMetadataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = FileMetadata.objects.filter(owner=self.request.user, deleted=False)
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(
                models.Q(original_filename__icontains=q) |
                models.Q(content_type__icontains=q)
            )
        return qs

    def create(self, request, *args, **kwargs):
        upload_serializer = UploadSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)
        f = upload_serializer.validated_data['file']
        backend = upload_serializer.validated_data.get('storage_backend', 'local')
        # Read file bytes
        data = f.read()
        # Encrypt file
        aes_key, iv, ciphertext, tag = encryption_utils.encrypt_file_bytes(data)
        # Wrap AES key with user's RSA public key
        try:
            keypair = request.user.keypair
        except UserKeyPair.DoesNotExist:
            return Response({'detail': 'User has no keypair'}, status=status.HTTP_400_BAD_REQUEST)
        enc_aes_key = encryption_utils.rsa_encrypt_key(aes_key, keypair.public_key.encode('utf-8'))
        # Store ciphertext as iv + ciphertext
        stored_blob = iv + ciphertext
        stored_filename = FileMetadata._meta.get_field('stored_filename').get_default()  # uuid
        # Save to storage
        if backend == 'local':
            storage_utils.upload_to_local(request.user.id, stored_filename, stored_blob)
        else:
            # placeholders: currently using local for simplicity
            storage_utils.upload_to_local(request.user.id, stored_filename, stored_blob)
        # Create metadata
        meta = FileMetadata.objects.create(
            owner=request.user,
            original_filename=f.name,
            stored_filename=stored_filename,
            content_type=f.content_type if hasattr(f, 'content_type') else 'application/octet-stream',
            size=len(data),
            encrypted_key=enc_aes_key,
            hmac=tag.hex(),
            storage_backend=backend,
        )
        ActivityLog.objects.create(user=request.user, action='UPLOAD', file=meta)
        return Response(FileMetadataSerializer(meta).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        meta = get_object_or_404(FileMetadata, pk=pk, deleted=False)
        if meta.owner != request.user:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        # Retrieve stored file
        blob = storage_utils.download_from_local(request.user.id, meta.stored_filename)
        iv = blob[:16]
        ciphertext = blob[16:]
        tag = bytes.fromhex(meta.hmac)
        # Decrypt AES key using user's private key
        try:
            keypair = request.user.keypair
        except UserKeyPair.DoesNotExist:
            return Response({'detail': 'User has no keypair'}, status=status.HTTP_400_BAD_REQUEST)
        priv_pem = get_user_private_key(request.user)
        if priv_pem is None:
            return Response({'detail': 'User private key not found'}, status=status.HTTP_400_BAD_REQUEST)
        aes_key = encryption_utils.rsa_decrypt_key(meta.encrypted_key.tobytes(), priv_pem)
        # Decrypt file bytes
        plain = encryption_utils.decrypt_file_bytes(aes_key, iv, ciphertext, tag)
        ActivityLog.objects.create(user=request.user, action='DOWNLOAD', file=meta)
        response = HttpResponse(plain, content_type=meta.content_type)
        response['Content-Disposition'] = f'attachment; filename="{meta.original_filename}"'
        return response

    def destroy(self, request, *args, **kwargs):
        meta = self.get_object()
        if meta.owner != request.user:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        meta.deleted = True
        meta.save()
        # delete file from storage
        cloud.delete_from_local(request.user.id, meta.stored_filename)
        ActivityLog.objects.create(user=request.user, action='DELETE', file=meta)
        return Response(status=status.HTTP_204_NO_CONTENT)

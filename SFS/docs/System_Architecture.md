# SFS System Architecture

Overview:

- Django REST Framework backend provides secure file storage and management.
- Encryption:
  - AES-256 (CBC) for file contents
  - RSA-2048 for per-user key pair used to wrap AES keys
  - HMAC-SHA256 for integrity of encrypted blobs
- Storage options:
  - Local filesystem under `backend/storage/` (default)
  - Firebase Storage (optional)
  - AWS S3 (optional)

Components:

- `api` app: models for FileMetadata, UserKeyPair, ActivityLog and endpoints for auth and file operations
- `frontend` templates: simple Bootstrap UI using Axios
- `encryption.py`: cryptographic primitives and helpers

Security considerations:

- Private keys are encrypted at rest with a server master key (see `.env`) and never returned to the client
- All file operations require JWT authentication

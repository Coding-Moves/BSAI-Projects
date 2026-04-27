<<<<<<< HEAD
# Secure File System (SFS)

This repository contains a Django + DRF backend for a Secure File System and a minimal frontend using Bootstrap and Axios.

## Features

- User registration + JWT authentication (djangorestframework-simplejwt)
- AES-256 encrypted files, RSA-2048 per-user key pairs, HMAC-SHA256 integrity
- Upload / download / delete files
- Local, Firebase and S3 storage options (local implemented)
- Activity logs

## Quick setup (development)

1. Create virtual environment and activate

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2. Install backend dependencies

```powershell
pip install -r backend/requirements.txt
```

3. Setup env

```powershell
copy backend/sfs_backend/.env.example backend/sfs_backend/.env
# edit .env if needed
```

4. Apply migrations and create superuser

```powershell
cd backend/sfs_backend
python manage.py migrate
python manage.py createsuperuser
```

5. Run server

```powershell
python manage.py runserver
```

Access:

- API root: http://127.0.0.1:8000/api/
- Frontend: http://127.0.0.1:8000/login.html
- Admin: http://127.0.0.1:8000/admin/

## Production notes

- Set `DJANGO_DEBUG=False` and configure `POSTGRES_*` env vars for PostgreSQL
- Use a secure `DJANGO_SECRET_KEY` and handle FILE master key
- Configure proper CORS origins
- Serve static files with WhiteNoise or from a CDN

## Project layout

(see project description in your IDE)

## Tests

Run tests with

```powershell
cd backend/sfs_backend
python manage.py test
```
=======
# SSF: Secure File System

**Presented by Coding Moves**

SSF is a professional-grade, zero-knowledge encrypted file storage and sharing platform. It utilizes the browser's native WebCrypto API to ensure that data is encrypted on the client side before ever reaching a server.

## 🚀 Deployment Guide

### 1. Prepare GitHub Repository
*   Initialize a git repo: `git init`
*   Push your code: `git push origin main`

### 2. Vercel Deployment (Recommended)
1.  Connect your GitHub repo to **Vercel**.
2.  Set the Environment Variable `API_KEY` to your Google AI Studio key.
3.  The project will auto-configure using the included `vercel.json`.

### 3. Netlify Deployment
1.  Connect your GitHub repo to **Netlify**.
2.  Set the `API_KEY` environment variable in **Site Settings > Environment Variables**.
3.  Netlify will use the `netlify.toml` and `_redirects` files to handle routing and security headers.

## 🛡️ Security Specifications
*   **Symmetric Encryption**: AES-256-GCM for file content.
*   **Asymmetric Encryption**: RSA-2048-OAEP for key wrapping.
*   **Hash Algorithm**: SHA-256 for integrity checks.
*   **Zero-Knowledge**: No private keys or plaintext files are ever transmitted or stored on the server.

## 🛠️ Features
*   **Identity Provisioning**: Automatic RSA key pair generation on signup.
*   **Secure Sharing**: RSA-based key re-wrapping for secondary recipients.
*   **Neural Security Logic**: Integrated Gemini-3-Flash for cryptographic analysis.
*   **Immutable Audit**: Real-time logging of all security-sensitive events.

---
© 2025 Coding Moves Engineering Branch. All Rights Reserved.
>>>>>>> bcc90d3f06f7aa01dccbcb36cbf03bbf0ad74362

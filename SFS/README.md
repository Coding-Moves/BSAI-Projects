
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


### Information Security Project – 3rd Semester  
**Under the supervision of Sir Khalid Mehmood**

---

## 👥 Project Team
- **Moavia Amir**
- **Mirza Muhammad Dawood**
- **Arslan Nasir**
- **Ali Raza**

---

## 📌 Project Overview

**SFS (Secure File System)** is a professional-grade, zero-knowledge encrypted file storage and sharing platform developed as part of the **Information Security course (3rd Semester)**.

The system utilizes the browser’s native **WebCrypto API** to perform **client-side encryption**, ensuring that all data is encrypted before being transmitted or stored. At no point are plaintext files or private cryptographic keys exposed to the server.

---

## 🚀 Deployment Guide

### 1. Prepare GitHub Repository
- Initialize the repository:
  ```bash
  git init
  ```

### 2. Vercel Deployment (Recommended)
- Connect the GitHub repository to **Vercel**
- Set the environment variable `API_KEY` with your **Google AI Studio API key**
- The project auto-configures using the included `vercel.json`

### 3. Netlify Deployment
- Connect the GitHub repository to **Netlify**
- Set the `API_KEY` in **Site Settings → Environment Variables**
- Routing and security headers are managed using `netlify.toml` and `_redirects`

---

## 🛡️ Security Specifications
- **Symmetric Encryption**: AES-256-GCM (file content encryption)
- **Asymmetric Encryption**: RSA-2048-OAEP (secure key wrapping)
- **Hash Algorithm**: SHA-256 (data integrity verification)
- **Zero-Knowledge Architecture**:
  - No plaintext files stored
  - No private keys transmitted
  - No sensitive data exposed on the server

---

## 🛠️ Key Features
- **Identity Provisioning**: Automatic RSA key-pair generation during user registration
- **Secure File Sharing**: RSA-based key re-encryption for authorized recipients
- **Neural Security Logic**: Gemini-3-Flash integration for cryptographic analysis
- **Immutable Audit Logging**: Real-time logging of security-sensitive operations

---


© 2025 **Coding Moves – Engineering Branch**  
Developed for academic purposes under the **Information Security curriculum**.


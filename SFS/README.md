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

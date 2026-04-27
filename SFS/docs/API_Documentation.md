# API Documentation

Base path: `/api/`

Endpoints:

- `POST /api/auth/register/` — create user. Body: `{username, password, email}`
- `POST /api/auth/token/` — obtain JWT. Body: `{username, password}`
- `POST /api/auth/token/refresh/` — refresh token
- `GET /api/files/` — list user's files
- `POST /api/files/` — upload file (multipart form `file`)
- `GET /api/files/<id>/download/` — download file
- `DELETE /api/files/<id>/` — delete file (soft delete + remove storage object)

Authentication: Bearer token in `Authorization` header (JWT from `/auth/token/`).

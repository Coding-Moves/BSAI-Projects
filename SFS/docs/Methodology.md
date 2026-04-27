# Methodology

This project follows an API-first approach:

- Implement REST endpoints with DRF
- Provide a simple frontend that consumes the API via Axios
- Keep encryption logic in a single module to make testing and auditing easier

Testing strategy:

- Unit tests for cryptography logic
- API tests for auth and file flows
- Integration tests for upload/download

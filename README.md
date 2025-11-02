# Codex FastAPI Service

This project provides a minimal FastAPI backend that serves both a REST API and static assets. It exposes login and configuration endpoints, secured via token-based authentication, and ships with client-side files from the `static/` directory.

## Prerequisites

- Python 3.12
- Pip and Virtualenv (optional but recommended)
- Docker (optional, for containerised deployment)

## Environment Variables

Copy `.env.example` to `.env` and adjust the values as needed:

```
CODEX_USERNAME="your-username"
CODEX_PASSWORD="your-password"

TOKEN_PREFIX="codex_"
TOKEN_EXPIRE=7200

DB_HOST="127.0.0.1"
DB_USERNAME="root"
DB_PASSWORD="secret"
DB_PORT="3306"
DB_DATABASE="codex"
```

The `Dockerfile` already sets the default values from the committed `.env`. Override them at runtime if you need different credentials or database endpoints.

## Docker Usage

### Build

Build an image tagged `codex` (run from the project root):

```
docker build -t codex .
```

### Run

Run the container exposing port 8001:

```
docker run --rm -p 8001:8001 codex
```

To override any environment variable defined in the `Dockerfile`, pass `-e` flags:

```
docker run --rm -p 8001:8001 ^
  -e CODEX_USERNAME=myuser ^
  -e CODEX_PASSWORD=mypassword ^
  codex
```

### Docker Compose (optional)

If you prefer Docker Compose, create a `docker-compose.yml` similar to:

```
services:
  codex:
    build: .
    ports:
      - "8001:8001"
    environment:
      CODEX_USERNAME: myuser
      CODEX_PASSWORD: mypassword
```

Then run:

```
docker compose up --build
```

## Project Structure

- `main.py` – FastAPI application bootstrap, route definitions, and middleware.
- `static/` – Frontend assets delivered by the FastAPI static mount.
- `requirements.txt` – Python dependencies.
- `Dockerfile` – Container build instructions with baked-in environment defaults.

## Additional Notes

- Update `.env` and `Dockerfile` environment variables consistently to prevent mismatched credentials.
- When deploying, ensure the database credentials allow network access from the container host.

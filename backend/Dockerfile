# Imagen de desarrollo del backend (TRD §3.3). La versión multi-stage llega en la Instancia C.
FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:0.12.2 /uv /uvx /bin/

ENV PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Dependencias primero para aprovechar la caché de capas
COPY pyproject.toml uv.lock* ./
RUN uv sync --no-install-project

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uv run alembic upgrade head && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]

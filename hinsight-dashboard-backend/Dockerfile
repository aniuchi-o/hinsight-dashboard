FROM python:3.11-slim 
ENV PYTHONDONTWRITEBYTECODE=1 
ENV PYTHONUNBUFFERED=1 
WORKDIR /app 
COPY pyproject.toml /app/pyproject.toml 
COPY app /app/app 
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir ".[dev,db]" && pip install "pydantic[email]"
ENV PORT=8080 
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
COPY alembic.ini /app/alembic.ini
COPY alembic /app/alembic
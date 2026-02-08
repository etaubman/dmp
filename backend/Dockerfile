# Data Manager Portal — backend (FastAPI)
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY app ./app
COPY seed-data ./seed-data

# Non-root user (optional for later)
# RUN adduser --disabled-password app && chown -R app:app /app
# USER app

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

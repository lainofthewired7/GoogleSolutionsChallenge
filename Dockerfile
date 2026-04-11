FROM python:3.11-slim

WORKDIR /app

# Install system deps + Node.js for frontend build
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgdal-dev \
    gcc \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Build frontend
COPY dashboard/package*.json dashboard/
RUN cd dashboard && npm ci
COPY dashboard/ dashboard/
RUN cd dashboard && npm run build

# Copy backend
COPY . .

EXPOSE 8000

# Run the application
# We use --proxy-headers and --forwarded-allow-ips='*' to ensure url_for works correctly behind Cloud Run load balancers
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
 
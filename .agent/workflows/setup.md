---
description: Set up the development environment for Indicium
---

# Environment Setup

## Prerequisites
- Python 3.11+
- Docker & docker-compose
- Google Maps API key

## Steps

1. Clone the repository and navigate into it
```bash
cd "/home/jcmb/Indicium"
```

2. Copy the environment template and fill in API keys
```bash
cp .env.example .env
```
Edit `.env` and add your API keys for FRED, Census, HUD, and Google Maps.

// turbo
3. Start the PostGIS database
```bash
docker-compose up -d db
```

// turbo
4. Create a Python virtual environment
```bash
python3 -m venv venv
```

// turbo
5. Activate the virtual environment
```bash
source venv/bin/activate
```

// turbo
6. Install Python dependencies
```bash
pip install -r requirements.txt
```

7. Run database migrations
```bash
python -m db.migrations.env
```

8. Verify the setup
```bash
pytest tests/ -v --co
```

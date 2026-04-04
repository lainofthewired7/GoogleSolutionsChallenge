---
description: Run the test suite for Projectr Analytics
---

# Run Tests

## Steps

1. Activate the virtual environment
```bash
source venv/bin/activate
```

// turbo
2. Run all tests with verbose output
```bash
pytest tests/ -v
```

// turbo
3. Run only unit tests (no DB required)
```bash
pytest tests/test_ingestion.py tests/test_etl.py -v
```

// turbo
4. Run API tests
```bash
pytest tests/test_api.py -v
```

5. Run integration tests (requires running DB)
```bash
docker-compose up -d db
pytest tests/test_integration.py -v
```

// turbo
6. Run with coverage report
```bash
pytest tests/ --cov=ingestion --cov=etl --cov=api --cov-report=term-missing
```

"""Database initialization script for Supabase/PostgreSQL.

This script creates all tables defined in db.models.py using the DATABASE_URL.
"""

import sys
import os

# Add the project root to sys.path so we can import db modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.connection import engine
from db.models import Base

def init_db():
    print("[*] Connecting to database...")
    try:
        # This will create all tables that don't exist yet
        Base.metadata.create_all(bind=engine)
        print("[+] Database tables initialized successfully!")
    except Exception as e:
        print(f"[!] Error initializing database: {e}")
        print("\nTIP: Make sure your DATABASE_URL is correct in the .env file.")
        print("Example: postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres")

if __name__ == "__main__":
    init_db()

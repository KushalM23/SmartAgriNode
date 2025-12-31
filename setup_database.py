"""
Setup script to create Supabase database tables
Run this once to initialize your database schema
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in backend/.env")
    print("Please add your Supabase credentials to backend/.env file")
    exit(1)

# Read SQL schema file
with open('backend/supabase_schema.sql', 'r') as f:
    sql_schema = f.read()

print("Connecting to Supabase...")
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print("Connected to Supabase")
    
    print("\nCreating database tables...")
    print("Note: You need to execute the SQL schema manually in Supabase SQL Editor")
    print(f"\n1. Go to: {SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}")
    print("2. Click 'SQL Editor' in the left sidebar")
    print("3. Create a new query")
    print("4. Copy the contents of backend/supabase_schema.sql")
    print("5. Paste and click 'Run'\n")
    
    # Try to check if tables exist using a simple query
    print("Checking for existing tables...")
    try:
        result = supabase.table('users').select("*").limit(1).execute()
        print("Tables already exist!")
        print(f"   - users table: Found")
    except Exception as e:
        print("Tables not found. Please run the SQL schema in Supabase SQL Editor.")
        print(f"   Error: {str(e)}")
    
except Exception as e:
    print(f"Error connecting to Supabase: {str(e)}")
    exit(1)

print("\nSetup check complete!")

import requests
import os

API_KEY = "f9b268f9c89578aad9d9a99c2bd751ce"

cities = {
    "las-vegas": {"prefix": "LASV332", "msa": "29820"},
    "san-francisco": {"prefix": "SANF806", "msa": "41860"},
    "chicago": {"prefix": "CHIC117", "msa": "16980"},
}

suffixes = ["BPPRIV", "BPPRIVVAL", "NA", "INFO", "UR"]

def check_series(series_id):
    url = "https://api.stlouisfed.org/fred/series/observations"
    params = {
        "series_id": series_id,
        "api_key": API_KEY,
        "file_type": "json",
        "limit": 1
    }
    r = requests.get(url, params=params)
    return r.status_code

for city, config in cities.items():
    print(f"--- {city} ---")
    prefix = config["prefix"]
    msa = config["msa"]
    
    for s in suffixes:
        # Try prefix+suffix
        sid1 = f"{prefix}{s}"
        res1 = check_series(sid1)
        
        # Try suffix+msa
        sid2 = f"{s}{msa}"
        res2 = check_series(sid2)
        
        print(f"  {s:10} | {sid1:15}: {res1} | {sid2:15}: {res2}")

import urllib.request
import json
import os

key = os.getenv('FRED_API_KEY')
if not key:
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('FRED_API_KEY'):
                key = line.split('=')[1].strip()

prefixes = ['DALL148', 'CHIC917', 'NEWY636', 'SEAT853', 'LOSA106']
suffixes = ['NA', 'INFO', 'MFGN', 'PBSV', 'EDUHN', 'GOVTN', 'UR']

for pref in prefixes:
    for suff in suffixes:
        sid = f"{pref}{suff}"
        url = f'https://api.stlouisfed.org/fred/series?series_id={sid}&api_key={key}&file_type=json'
        try:
            with urllib.request.urlopen(url) as res:
                print(f"{sid}: OK")
        except Exception as e:
            print(f"{sid}: FAILED")

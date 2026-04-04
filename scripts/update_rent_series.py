import sys

def update_constants(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()

    mappings = {
        'austin': 'CUUR0300SEHA',
        'dallas': 'CUUSA316SEHA',
        'houston': 'CUUSA314SEHA',
        'san-antonio': 'CUUR0300SEHA',
        'new-york': 'CUUSA101SEHA',
        'chicago': 'CUURA207SEHA',
        'los-angeles': 'CUUSA421SEHA',
        'seattle': 'CUUSA423SEHA',
        'san-francisco': 'CUUSA422SEHA',
        'phoenix': 'CUUSA426SEHA',
        'philadelphia': 'CUUSA102SEHA',
        'atlanta': 'CUUSA319SEHA',
        'miami': 'CUUSA320SEHA',
        'boston': 'CUUSA103SEHA',
        'washington-dc': 'CUURA110SEHA',
        'denver': 'CUUSA433SEHA',
        'minneapolis': 'CUUR0200SEHA',
        'detroit': 'CUURA204SEHA',
        'las-vegas': 'CUUSA429SEHA',
        'portland': 'CUUSA425SEHA',
        'san-diego': 'CUUSA424SEHA',
    }

    new_lines = []
    current_key = None
    for line in lines:
        new_lines.append(line)
        if '"' in line and ':' in line and '{' in line and line.strip().endswith('{'):
            key_part = line.strip().split(':')[0].strip('" ')
            if key_part in mappings:
                current_key = key_part
        if current_key and '"fred_prefix":' in line:
            indent = line[:line.find('"')]
            new_lines.insert(-1, f'{indent}"fred_rent": "{mappings[current_key]}",\n')
            current_key = None

    with open(file_path, 'w') as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    update_constants('api/constants.py')

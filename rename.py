import os

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace occurrences
        new_content = content.replace("Indicium", "Indicium")
        new_content = new_content.replace("Indicium", "Indicium")
        new_content = new_content.replace("indicium", "indicium")
        new_content = new_content.replace("indicium", "indicium")
        new_content = new_content.replace("indicium", "indicium")
        new_content = new_content.replace("INDICIUM", "INDICIUM")

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
    except Exception as e:
        pass

for root, dirs, files in os.walk('.'):
    # excluding some dirs
    if 'node_modules' in root or '.git' in root or 'venv' in root or '__pycache__' in root:
        continue
    for file in files:
        if file.endswith(('.ts', '.tsx', '.json', '.html', '.md', '.py', '.txt', '.toml', '.yml')):
            replace_in_file(os.path.join(root, file))

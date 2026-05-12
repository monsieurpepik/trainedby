#!/usr/bin/env python3
"""
Fix em dashes and em-dash substitutes across all source files.
Rules:
  - In page titles (document.title, <Base title=...>): use ' - ' (single space hyphen)
  - In user-visible prose strings: use '. ' or ': ' or just remove the dash
  - In code comments: leave as-is (comments are not user-visible)
  - The pattern '  -  ' (double-space-hyphen-double-space) is the main em-dash substitute to fix
"""
import os
import re

# Files to process
TARGET_EXTENSIONS = ('.ts', '.astro', '.js')
SRC_DIR = os.path.join(os.path.dirname(__file__), '..', 'src')

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original

    # 1. Fix page titles: "Name  -  Brand" -> "Name - Brand"
    #    These are in <Base title=...> and document.title = ...
    content = re.sub(r'(\w)  -  (\w)', r'\1 - \2', content)

    # 2. Fix em dash (U+2014) -> ' - ' in any context
    content = content.replace('\u2014', ' - ')

    # 3. Fix en dash (U+2013) -> ' - ' in any context
    content = content.replace('\u2013', ' - ')

    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

changed = []
for root, dirs, files in os.walk(SRC_DIR):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'dist')]
    for fn in files:
        if any(fn.endswith(ext) for ext in TARGET_EXTENSIONS):
            path = os.path.join(root, fn)
            if fix_file(path):
                changed.append(path)

print(f"Fixed {len(changed)} file(s):")
for p in changed:
    print(f"  {p}")

if not changed:
    print("  No files needed changes.")

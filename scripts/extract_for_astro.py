#!/usr/bin/env python3
"""
Extract CSS and body content from HTML files for Astro migration.
Outputs each file's style and body content to separate files.
"""
import re
import os

pages = ['join', 'pricing', 'dashboard', 'blog', 'plan-builder', 'edit']
os.makedirs('/tmp/astro_extract', exist_ok=True)

for page in pages:
    fname = f'/home/ubuntu/trainedby/{page}.html'
    if not os.path.exists(fname):
        print(f'SKIP: {fname} not found')
        continue
    with open(fname) as f:
        content = f.read()
    
    # Extract all style blocks
    styles = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
    style_content = '\n'.join(styles)
    
    # Extract body content (between <body> and </body>)
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
    body_content = body_match.group(1) if body_match else ''
    
    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', content)
    title = title_match.group(1) if title_match else page
    
    # Extract meta description
    desc_match = re.search(r'<meta name="description" content="([^"]+)"', content)
    desc = desc_match.group(1) if desc_match else ''
    
    with open(f'/tmp/astro_extract/{page}_style.css', 'w') as f:
        f.write(style_content)
    with open(f'/tmp/astro_extract/{page}_body.html', 'w') as f:
        f.write(body_content)
    
    print(f'{page}: style={len(style_content)} chars, body={len(body_content)} chars, title="{title}"')

print('\nDone. Files in /tmp/astro_extract/')

#!/usr/bin/env python3
"""
Generate Astro page files from extracted HTML content.
Each page wraps the existing CSS + body in an Astro component using Base layout.
"""
import os

pages = {
    'join': {
        'title': 'Get Your Verified Trainer Page — TrainedBy',
        'desc': 'Create your verified personal trainer profile on TrainedBy. REPs UAE verified. Free to set up in 2 minutes.',
        'astro_name': 'join.astro',
    },
    'pricing': {
        'title': 'Pricing — TrainedBy',
        'desc': 'Simple, transparent pricing for UAE personal trainers. Free to start. Pro from AED 199/month with a 30-day ROI guarantee.',
        'astro_name': 'pricing.astro',
    },
    'dashboard': {
        'title': 'Dashboard — TrainedBy',
        'desc': 'Your TrainedBy trainer dashboard. Manage leads, analytics, digital products, and affiliate income.',
        'astro_name': 'dashboard.astro',
    },
    'blog': {
        'title': "TrainedBy Blog — Expert Fitness Advice from UAE's Top Trainers",
        'desc': "Evidence-based fitness, nutrition, and training articles from UAE's REPs-verified personal trainers.",
        'astro_name': 'blog.astro',
    },
    'plan-builder': {
        'title': 'AI Plan Builder — TrainedBy',
        'desc': 'Create evidence-based, citation-backed diet and workout plans for your clients in under 60 seconds.',
        'astro_name': 'plan-builder.astro',
    },
    'edit': {
        'title': 'Edit Profile — TrainedBy',
        'desc': 'Edit your TrainedBy trainer profile, packages, and settings.',
        'astro_name': 'edit.astro',
    },
}

output_dir = '/home/ubuntu/trainedby/src/pages'
extract_dir = '/tmp/astro_extract'

for page_key, meta in pages.items():
    style_file = os.path.join(extract_dir, f'{page_key}_style.css')
    body_file = os.path.join(extract_dir, f'{page_key}_body.html')
    
    if not os.path.exists(style_file) or not os.path.exists(body_file):
        print(f'SKIP: {page_key} - missing extracted files')
        continue
    
    with open(style_file) as f:
        style = f.read().strip()
    with open(body_file) as f:
        body = f.read().strip()
    
    # Remove any nav/footer that might be in the body (they're in Base layout)
    # For join/plan-builder/edit, there's no nav in the original - keep as is
    # For pricing/blog/dashboard, remove nav and footer if present
    
    astro_content = f"""---
import Base from '../layouts/Base.astro';
---

<Base
  title="{meta['title']}"
  description="{meta['desc']}"
>
  <style>
{style}
  </style>

{body}
</Base>
"""
    
    out_path = os.path.join(output_dir, meta['astro_name'])
    with open(out_path, 'w') as f:
        f.write(astro_content)
    
    print(f'Created: {out_path} ({len(astro_content)} chars)')

print('\nAll Astro pages generated.')

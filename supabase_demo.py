import requests
import json
import time
import os

# Configuration
SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo'
EDGE_BASE = f"{SUPABASE_URL}/functions/v1"

HEADERS = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json"
}

def print_step(step_num, title):
    print(f"\n{'-'*50}")
    print(f"STEP {step_num}: {title}")
    print(f"{'-'*50}")

def demo_supabase_capabilities():
    print("🚀 Starting TrainedBy Supabase API Demo\n")
    
    # STEP 1: Fetch Trainers (REST API)
    print_step(1, "Fetch Trainers Directory (REST API)")
    res = requests.get(f"{SUPABASE_URL}/rest/v1/trainers?select=id,name,slug,specialties,avg_rating&limit=3", headers=HEADERS)
    print(f"Status: {res.status_code}")
    print(json.dumps(res.json(), indent=2))
    
    # STEP 2: Get Specific Trainer Profile (Edge Function)
    print_step(2, "Get Trainer Profile & Packages (Edge Function)")
    res = requests.get(f"{EDGE_BASE}/get-trainer?slug=sarah", headers=HEADERS)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        trainer = data.get('trainer', {})
        print(f"Trainer: {trainer.get('name')} ({trainer.get('slug')})")
        print(f"Packages found: {len(data.get('packages', []))}")
    else:
        print(res.text)
        
    # STEP 3: Submit a Lead / Booking Request (Edge Function)
    print_step(3, "Submit Lead / Booking Request (Edge Function)")
    lead_payload = {
        "trainer_id": "sarah", # The edge function handles slug or ID
        "name": "Demo User",
        "phone": "+971501234567",
        "message": "I'm interested in the Monthly Pack",
        "source": "api_demo"
    }
    res = requests.post(f"{EDGE_BASE}/submit-lead", headers=HEADERS, json=lead_payload)
    print(f"Status: {res.status_code}")
    print(res.text)
    
    # STEP 4: Fetch Reviews (REST API)
    print_step(4, "Fetch Verified Reviews (REST API)")
    res = requests.get(f"{SUPABASE_URL}/rest/v1/reviews?verified=eq.true&limit=2", headers=HEADERS)
    print(f"Status: {res.status_code}")
    print(json.dumps(res.json(), indent=2))
    
    # STEP 5: Auth Flow - Send Magic Link (Edge Function)
    print_step(5, "Auth Flow: Send Magic Link (Edge Function)")
    otp_payload = {
        "email": "demo@trainedby.ae",
        "name": "Demo Trainer",
        "mode": "test" # Uses test mode to bypass actual email sending
    }
    res = requests.post(f"{EDGE_BASE}/send-magic-link", headers=HEADERS, json=otp_payload)
    print(f"Status: {res.status_code}")
    print(res.text)
    
    # STEP 6: AI Bio Writer (Edge Function)
    print_step(6, "AI Bio Generation (Edge Function)")
    bio_payload = {
        "name": "Alex",
        "specialties": ["Strength", "Fat Loss"],
        "years_experience": 5,
        "city": "Dubai"
    }
    res = requests.post(f"{EDGE_BASE}/ai-bio-writer", headers=HEADERS, json=bio_payload)
    print(f"Status: {res.status_code}")
    try:
        print(json.dumps(res.json(), indent=2))
    except:
        print(res.text)

    print("\n✅ Demo completed successfully!")
    print("Note: Some endpoints might require specific test data or authentication tokens to return full results.")

if __name__ == "__main__":
    demo_supabase_capabilities()

"""Quick test script to verify QR code backend functionality."""
import requests

BASE = "http://localhost:8000"

# Login
r = requests.post(f"{BASE}/api/auth/login", json={"email": "admin@livetrack.com", "password": "admin123"})
print(f"Login: {r.status_code}")
if r.status_code != 200:
    print(f"  Error: {r.text}")
    exit(1)

token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# List animals to get IDs
r = requests.get(f"{BASE}/api/animals/", headers=headers, params={"per_page": 5})
print(f"Animals: {r.status_code}")
animals = r.json()["animals"]
for a in animals[:3]:
    print(f"  ID={a['id']} UID={a['animal_uid']} Name={a.get('name','?')}")

# Test QR code for first animal
if animals:
    aid = animals[0]["id"]
    print(f"\nFetching QR for animal ID={aid}...")
    r = requests.get(f"{BASE}/api/qr-codes/{aid}", headers=headers)
    print(f"  Status: {r.status_code}")
    print(f"  Content-Type: {r.headers.get('content-type', '?')}")
    print(f"  Size: {len(r.content)} bytes")
    if r.status_code != 200:
        print(f"  Error: {r.text}")

    # Test regenerate
    print(f"\nRegenerate QR for animal ID={aid}...")
    r = requests.post(f"{BASE}/api/qr-codes/regenerate/{aid}", headers=headers)
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.text[:200]}")

    # Re-fetch after regenerate
    print(f"\nRe-fetch QR after regenerate...")
    r = requests.get(f"{BASE}/api/qr-codes/{aid}", headers=headers)
    print(f"  Status: {r.status_code}")
    print(f"  Size: {len(r.content)} bytes")

# Test QR for non-existent animal
print(f"\nFetch QR for non-existent animal ID=99999...")
r = requests.get(f"{BASE}/api/qr-codes/99999", headers=headers)
print(f"  Status: {r.status_code}")
print(f"  Response: {r.text[:200]}")

print("\n✅ QR backend inspection complete.")

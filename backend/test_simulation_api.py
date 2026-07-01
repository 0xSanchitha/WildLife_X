import urllib.request
import urllib.error
import json
import jwt
import datetime

# Configuration
API_URL = "http://127.0.0.1:5000/api"
SECRET_KEY = "wildlifex_secret"
MOCK_USER_ID = "60c72b2f9b1d8e1234567890"  # Mock ObjectId string

# 1. Generate a mock token
token = jwt.encode(
    {
        "user_id": MOCK_USER_ID,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
    },
    SECRET_KEY,
    algorithm="HS256"
)

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print("Created Mock Token:", token[:25] + "...")

def make_request(url, method="GET", data=None):
    req = urllib.request.Request(url, method=method, headers=headers)
    if data:
        json_data = json.dumps(data).encode("utf-8")
        req.data = json_data
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            resp_body = response.read().decode("utf-8")
            return status, json.loads(resp_body)
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode("utf-8")
        try:
            body = json.loads(resp_body)
        except Exception:
            body = resp_body
        return e.code, body
    except Exception as e:
        return 500, str(e)

# 2. Test saving a simulation
print("\n--- Saving Simulation ---")
save_payload = {
    "name": "Test Forest Simulation",
    "ecosystem_type": "forest",
    "world_size": "small",
    "simulation_state": {
        "day": 1,
        "year": 1,
        "season": "Spring",
        "weather": "Sunny",
        "animals": [
            {"species_id": "amur-leopard", "x": 100, "y": 150, "health": 100},
            {"species_id": "giant-panda", "x": 200, "y": 300, "health": 80}
        ],
        "plants": [
            {"type": "tree", "x": 50, "y": 60, "growth": 1.0}
        ]
    }
}

status, resp = make_request(f"{API_URL}/simulations/save", method="POST", data=save_payload)
print("Status:", status)
print("Response:", resp)

saved_sim = resp.get("simulation") if isinstance(resp, dict) else None
sim_db_id = saved_sim.get("_id") if saved_sim else None

if sim_db_id:
    # 3. Test listing simulations
    print("\n--- Listing Simulations ---")
    status, resp = make_request(f"{API_URL}/simulations/", method="GET")
    print("Status:", status)
    print("Response:", resp)

    # 4. Test loading the saved simulation
    print(f"\n--- Loading Simulation ({sim_db_id}) ---")
    status, resp = make_request(f"{API_URL}/simulations/{sim_db_id}", method="GET")
    print("Status:", status)
    if isinstance(resp, dict):
        print("Loaded Name:", resp.get("name"))
        print("Loaded State Animals Count:", len(resp.get("simulation_state", {}).get("animals", [])))
    else:
        print("Response:", resp)

    # 5. Test updating the simulation
    print("\n--- Updating Simulation ---")
    save_payload["id"] = sim_db_id
    save_payload["name"] = "Updated Forest Simulation"
    status, resp = make_request(f"{API_URL}/simulations/save", method="POST", data=save_payload)
    print("Status:", status)
    if isinstance(resp, dict):
        print("Updated Name:", resp.get("simulation", {}).get("name"))
    else:
        print("Response:", resp)

    # 6. Test deleting the simulation
    print(f"\n--- Deleting Simulation ({sim_db_id}) ---")
    status, resp = make_request(f"{API_URL}/simulations/{sim_db_id}", method="DELETE")
    print("Status:", status)
    print("Response:", resp)
else:
    print("Could not save simulation, skipping remaining tests.")

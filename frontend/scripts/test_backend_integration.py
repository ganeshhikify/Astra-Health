"""
ASTRA HEALTH - Backend Integration Test Script
Tests end-to-end communication with live FastAPI and PostgreSQL:
1. Astronaut profile creation & retrieval
2. Mission setup & foreign key linkage
3. Clinical Health Assessment persistence & retrieval
4. Physiological Telemetry measurement persistence & history retrieval
"""

import json
import urllib.request
import sys

BASE_URL = 'http://127.0.0.1:8000/api/v1'


def post(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))


def get(url):
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode('utf-8'))


def main():
    print("=" * 70)
    print("ASTRA HEALTH - LIVE BACKEND & DATABASE INTEGRATION VERIFICATION")
    print("=" * 70)

    # 1. Astronaut Operative
    print("\n[1] Verifying Astronaut Profile Creation & Retrieval...")
    existing_astros = get(f"{BASE_URL}/astronauts/")
    target_astro = next((a for a in existing_astros if a['crew_id'] == 'AST-7824'), None)

    if not target_astro:
        astro_payload = {
            'name': 'Cmdr. Sarah Vance',
            'crew_id': 'AST-7824',
            'role': 'Mission Commander',
            'is_active': True,
            'notes': 'Lead operative for Artemis Basecamp deployment',
        }
        target_astro = post(f"{BASE_URL}/astronauts/", astro_payload)
        print(f"  -> Created Astronaut: ID={target_astro['id']}, Name={target_astro['name']}")
    else:
        print(f"  -> Existing Astronaut: ID={target_astro['id']}, Name={target_astro['name']}")

    astro_fetched = get(f"{BASE_URL}/astronauts/{target_astro['id']}")
    assert astro_fetched['id'] == target_astro['id']
    assert astro_fetched['crew_id'] == 'AST-7824'
    print(f"  [PASS] Verified Astronaut retrieval by UUID: {astro_fetched['id']}")

    # 2. Mission Assignment
    print("\n[2] Verifying Mission Configuration & Foreign Key Association...")
    existing_missions = get(f"{BASE_URL}/missions/")
    target_mission = next((m for m in existing_missions if m.get('astronaut_id') == target_astro['id']), None)

    if not target_mission:
        mission_payload = {
            'name': 'Astra Artemis VII',
            'destination': 'MOON',
            'duration': '180 Days',
            'launch_date': '2027-04-12',
            'environment': 'Low Gravity • Lunar Regolith • Extreme Thermal Fluctuations',
            'astronaut_id': target_astro['id'],
        }
        target_mission = post(f"{BASE_URL}/missions/", mission_payload)
        print(f"  -> Created Mission: ID={target_mission['id']}, Name={target_mission['name']}")
    else:
        print(f"  -> Existing Mission: ID={target_mission['id']}, Name={target_mission['name']}")

    mission_fetched = get(f"{BASE_URL}/missions/{target_mission['id']}")
    assert mission_fetched['id'] == target_mission['id']
    assert mission_fetched['astronaut_id'] == target_astro['id']
    print(f"  [PASS] Verified Mission linked to Astronaut: {mission_fetched['astronaut_id']}")

    # 3. Health Assessment Evaluation
    print("\n[3] Verifying Clinical Health Assessment Persistence...")
    assessment_payload = {
        'astronaut_id': target_astro['id'],
        'assessment_date': '2026-11-15T07:30:00Z',
        'status': 'OPTIMAL',
        'summary': json.dumps({
            'missionDay': 'Sol 42',
            'habitatZone': 'Habitat Core 1 (Lunar South Pole Basecamp)',
            'symptoms': {'headache': False, 'congestion': False, 'fatigue': False, 'backDiscomfort': False},
            'sleepQuality': 'Restful',
            'sleepLatency': '12',
            'workloadStress': 'Low',
            'notes': 'Circadian entrainment nominal. No motion disorientation noted.',
        }),
        'baseline_heart_rate': 72.0,
        'baseline_spo2': 98.0,
        'baseline_temperature': 36.8,
        'baseline_blood_pressure': '120/80',
        'sleep_hours': 7.4,
        'countermeasures_adherence': 'ARED: 75m | Aerobic: 45m',
    }
    assessment_res = post(f"{BASE_URL}/assessments/", assessment_payload)
    print(f"  -> Created Health Assessment: ID={assessment_res['id']}, Status={assessment_res['status']}")

    assessment_fetched = get(f"{BASE_URL}/assessments/{assessment_res['id']}")
    assert assessment_fetched['id'] == assessment_res['id']
    assert assessment_fetched['astronaut_id'] == target_astro['id']
    print(f"  [PASS] Verified Health Assessment in PostgreSQL: ID={assessment_fetched['id']}")

    # 4. Health Measurement Telemetry
    print("\n[4] Verifying Physiological Telemetry Event Logging...")
    measurement_payload = {
        'astronaut_id': target_astro['id'],
        'measured_at': '2026-11-15T07:30:00Z',
        'heart_rate_bpm': 72.0,
        'blood_oxygen_pct': 98.0,
        'body_temperature_celsius': 36.8,
        'systolic_bp_mmhg': 120,
        'diastolic_bp_mmhg': 80,
        'source': 'HEALTH_ASSESSMENT_PORTAL',
        'is_simulated': False,
    }
    meas_res = post(f"{BASE_URL}/measurements/", measurement_payload)
    print(f"  -> Recorded Telemetry Event: ID={meas_res['id']}, HR={meas_res['heart_rate_bpm']}, SpO2={meas_res['blood_oxygen_pct']}")

    meas_history = get(f"{BASE_URL}/measurements/astronaut/{target_astro['id']}")
    assert len(meas_history) > 0
    print(f"  [PASS] Verified Telemetry History: {len(meas_history)} events logged for astronaut.")

    print("\n" + "=" * 70)
    print("ALL API ENDPOINTS & DATABASE TRANSACTIONS VERIFIED 100% OPERATIONAL")
    print("=" * 70)


if __name__ == '__main__':
    main()

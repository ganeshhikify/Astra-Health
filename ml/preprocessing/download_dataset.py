"""
Programmatic downloader for PhysioNet Pulse Transit Time PPG Dataset v1.1.0.
Downloads the minimal useful subset of files into ml/datasets/.
"""

import os
from pathlib import Path
import urllib.request
import sys

BASE_URL = "https://physionet.org/files/pulse-transit-time-ppg/1.1.0"
DATASETS_DIR = Path(__file__).resolve().parent.parent / "datasets"

# Target files: Ground truth clinical parameters + representative resting and exercise waveforms
FILES_TO_DOWNLOAD = [
    ("csv/subjects_info.csv", "subjects_info.csv"),
    ("README.txt", "README.txt"),
    ("csv/s1_sit.csv", "s1_sit.csv"),
    ("csv/s1_run.csv", "s1_run.csv"),
]


def download_file(remote_rel_path: str, local_name: str) -> Path:
    """Downloads a single file from PhysioNet with progress reporting."""
    local_path = DATASETS_DIR / local_name
    if local_path.exists() and local_path.stat().st_size > 0:
        print(f"[OK] {local_name} already exists ({local_path.stat().st_size / 1024 / 1024:.2f} MB). Skipping download.")
        return local_path

    url = f"{BASE_URL}/{remote_rel_path}"
    print(f"[DOWNLOADING] {remote_rel_path} -> {local_name}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (ASTRA-HEALTH-ML-Agent)"})

    try:
        with urllib.request.urlopen(req) as resp, open(local_path, "wb") as out_f:
            total_size = resp.headers.get("Content-Length")
            total_bytes = int(total_size) if total_size else None
            downloaded = 0
            chunk_size = 1024 * 256  # 256 KB chunks

            while True:
                chunk = resp.read(chunk_size)
                if not chunk:
                    break
                out_f.write(chunk)
                downloaded += len(chunk)
                if total_bytes:
                    pct = (downloaded / total_bytes) * 100
                    sys.stdout.write(f"\r  Progress: {downloaded / 1024 / 1024:.2f}/{total_bytes / 1024 / 1024:.2f} MB ({pct:.1f}%)")
                    sys.stdout.flush()
                else:
                    sys.stdout.write(f"\r  Downloaded: {downloaded / 1024 / 1024:.2f} MB")
                    sys.stdout.flush()

        print(f"\n[SUCCESS] Saved {local_name} ({local_path.stat().st_size / 1024 / 1024:.2f} MB)")
        return local_path
    except Exception as exc:
        if local_path.exists():
            local_path.unlink()
        raise RuntimeError(f"Failed to download {remote_rel_path}: {exc}") from exc


def main():
    DATASETS_DIR.mkdir(parents=True, exist_ok=True)
    print("=" * 70)
    print("ASTRA HEALTH - PhysioNet Dataset Downloader")
    print(f"Target Directory: {DATASETS_DIR}")
    print("=" * 70)

    downloaded_paths = []
    for remote_path, local_name in FILES_TO_DOWNLOAD:
        path = download_file(remote_path, local_name)
        downloaded_paths.append(path)

    total_mb = sum(p.stat().st_size for p in downloaded_paths) / (1024 * 1024)
    print("=" * 70)
    print(f"Dataset preparation complete. Total downloaded: {total_mb:.2f} MB in {len(downloaded_paths)} files.")
    print("=" * 70)


if __name__ == "__main__":
    main()

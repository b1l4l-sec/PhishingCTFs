"""
Simple log parser for the credential capture file.
Educational purpose: show how defenders can enumerate compromised attempts.
"""
import json
import re
from pathlib import Path

LOG_FILE = Path("../web/captured_credentials.log")
OUT_FILE = Path("summary.json")

line_pattern = re.compile(
    r'(?P<ts>[^|]+)\|user=(?P<user>[^|]+)\|pass=(?P<pwd>[^|]+)\|ip=(?P<ip>[^|]+)\|ua=(?P<ua>[^|]+)\|token=(?P<token>.*)'
)

def parse():
    attempts = []
    if not LOG_FILE.exists():
        print("No log file found. Run the web app and submit a credential first.")
        return
    with LOG_FILE.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            m = line_pattern.match(line)
            if m:
                attempts.append(m.groupdict())

    unique_users = sorted({a["user"] for a in attempts})
    tokens_used = sorted({a["token"] for a in attempts if a["token"]})
    data = {
        "total_attempts": len(attempts),
        "unique_users": unique_users,
        "tokens_present": tokens_used,
        "sample_first_attempt": attempts[0] if attempts else None
    }
    OUT_FILE.write_text(json.dumps(data, indent=2))
    print(f"Wrote summary to {OUT_FILE}")

if __name__ == "__main__":
    parse()
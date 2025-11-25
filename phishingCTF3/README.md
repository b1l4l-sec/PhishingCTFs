# Phishing Analysis Mini CTF (Easy → Medium)

## WARNING / ETHICS
This project is **only** for defensive education in a controlled lab. Do **NOT** deploy publicly, send real emails, or use against any person or organization. All content is fictional.

## Story
A user reported a suspicious email promising a mandatory "Security Update Portal." The SOC team recovered:
- The original email (`mail/sample_phishing_email.eml`)
- An archive of a web directory (represented here by our Flask app replicating the attacker's kit)
- Access logs (generated at runtime)

Your tasks:

### Tasks (Easy)
1. Open the `.eml` file and list at least 5 phishing indicators.
2. Identify the spoofed domain and the real clickable destination in the email.
3. Extract the tracking token (base64 string) from the email and decode it.
4. Run the phishing site locally (`docker compose up`) and submit test credentials.
5. Locate where credentials are stored and explain the security weakness.
6. Explain two browser features that could alert a user to this phish.

### Tasks (Medium)
7. Enumerate IOCs (domains, paths, file names, token patterns) into a JSON matching `analysis/ioc_report_schema.json`.
8. Identify developer OPSEC mistakes in source comments.
9. Improve the kit by adding a bright banner warning in `login.html` (simulate a defensive sinkhole).
10. Run `analysis/log_analysis.py` to parse logs; determine how many credential attempts occurred and produce a summary.

### Bonus
- Suggest three email gateway rules or content filters that would have blocked or flagged this email.
- Propose a YARA rule against the phishing kit’s HTML characteristics.

## Setup
```bash
docker compose build
docker compose up
# Visit url
```

Alternatively (without Docker):
```bash
cd web
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

## What Players Should NOT Do
- Do not send the sample email externally.
- Do not host the site on the public Internet.
- Do not reuse any credential harvesting logic outside this lab.

## Clean Up
```bash
docker compose down -v
```

## Organizer Notes
You can redact or delay release of `solution/walkthrough.md`. Provide `hints.md` progressively.

## Educational Talking Points
- UI deception vs. technical indicators
- Tokenization / tracking in phish campaigns
- Logging artifacts assisting incident response
- Common attacker OPSEC mistakes

## Go to app.py line 191 instead of the localhost use the VPS infos AND maybe change the port 5000 if its busy
## line 24 in mail/sample_phishing_email.eml change also the localhost to the VPS infos
## If generate email_indecator needed submit it to get the third flag part

```bash
TOKEN="c2FtcGxlVXNlcjpMYWItVHJhY2tpbmc="
DECODED="sampleUser:Lab-Tracking"
HREF="$(cat href.txt)"

cat > email_indicators.md <<EOF
1. Urgent subject "ACTION REQUIRED: Security Validation Needed" – pressure tactic.
2. Threat of suspension – fear inducement to click.
3. Sender/domain account-secure.example.com – security-sounding but not corporate.
4. Base64 tracking token in URL (tid=...) – campaign/user tracking.
5. Footer year ©2023 vs Date 2025 – template inconsistency.
6. Generic greeting (no personalization) – mass mailing clue.

Actual Link: $HREF
Token (tid): $TOKEN
Decoded: $DECODED
EOF
```

Good luck—be ethical!

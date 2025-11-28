import os
import base64
import hashlib
import zipfile
from datetime import datetime
from pathlib import Path
from flask import (
    Flask, render_template, request, redirect, url_for,
    send_file, jsonify, abort, make_response, session
)

"""
Phishing Analysis Training Lab (Educational Only)

Endpoints:
  /                -> Login (phishing landing simulation; accepts ?tid=BASE64TOKEN)
  /auth            -> Credential submission
  /success         -> Post-capture page
  /tracking-demo   -> Demo token generator
  /instructions    -> Scenario tasks
  /email           -> Rendered phishing email
  /download/email.eml  -> Raw email artifact
  /download/site.zip   -> Zip of safe artifacts
  /artifact/<name> -> Whitelisted raw artifacts
  /logview         -> Sanitized credential log
  /scoreboard      -> Attempts summary (JSON)
  /reset-lab (POST)-> Organizer log reset
  /ioc-schema      -> IOC JSON schema
  /flag            -> Multi-step flag collection (URL -> decoded token -> indicators)
  /flag-progress   -> JSON progress for monitoring
"""

app = Flask(__name__)

# SESSION SECRET (SET VIA ENV IN PRODUCTION!)
app.secret_key = os.environ.get("APP_SECRET", "CHANGE_ME_DEV_SECRET")

# Paths & Config
BASE_DIR = Path(__file__).parent
CREDENTIAL_LOG = BASE_DIR / "captured_credentials.log"
TRACKING_SALT = os.environ.get("TRACKING_SALT", "default-salt")
ADMIN_RESET_TOKEN = os.environ.get("ADMIN_RESET_TOKEN", "reset-me-123")
LAB_DEBUG = os.environ.get("LAB_DEBUG", "0") == "1"

ALLOWED_ARTIFACTS = {
    "login.html": BASE_DIR / "templates" / "login.html",
    "success.html": BASE_DIR / "templates" / "success.html",
    "style.css": BASE_DIR / "static" / "style.css",
    "app.py": BASE_DIR / "app.py"
}

ZIP_EXPORT = BASE_DIR / "site.zip"
EMAIL_FILE = Path("/mail/sample_phishing_email.eml")
IOC_SCHEMA_FILE = Path("/analysis/ioc_report_schema.json")

# --------------------------- Utility ---------------------------
def ensure_zip():
    if ZIP_EXPORT.exists():
        return
    with zipfile.ZipFile(ZIP_EXPORT, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for rel in [
            "templates/login.html",
            "templates/success.html",
            "static/style.css",
            "app.py",
            "../mail/sample_phishing_email.eml",
            "../analysis/ioc_report_schema.json"
        ]:
            src = (BASE_DIR / rel) if not rel.startswith("../") else (BASE_DIR.parent / rel[3:])
            if src.exists():
                z.write(src, arcname=rel)

def sanitize_password(pwd: str) -> str:
    if not pwd:
        return ""
    prefix = pwd[:2]
    digest = hashlib.sha256(pwd.encode()).hexdigest()[:12]
    return f"{prefix}***:{digest}"

def log_credentials(user, pwd, ip, ua, token):
    line = f"{datetime.utcnow().isoformat()}Z|user={user}|pass={sanitize_password(pwd)}|ip={ip}|ua={ua}|token={token}\n"
    with CREDENTIAL_LOG.open("a", encoding="utf-8") as f:
        f.write(line)

def generate_token(raw: str) -> str:
    return base64.b64encode(f"{raw}:{TRACKING_SALT}".encode()).decode()

def parse_logs():
    if not CREDENTIAL_LOG.exists():
        return []
    attempts = []
    with CREDENTIAL_LOG.open(encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split("|")
            if len(parts) < 6:
                continue
            attempts.append({
                "timestamp": parts[0],
                "user": parts[1].split("=", 1)[1],
                "pass_scrubbed": parts[2].split("=", 1)[1],
                "ip": parts[3].split("=", 1)[1],
                "ua": parts[4].split("=", 1)[1],
                "token": parts[5].split("=", 1)[1]
            })
    return attempts

@app.after_request
def add_noindex(resp):
    resp.headers["X-Robots-Tag"] = "noindex, nofollow"
    return resp

# --------------------------- Core App ---------------------------
@app.route("/")
def landing():
    token = request.args.get("tid", "")
    return make_response(render_template("login.html", token=token))

@app.route("/auth", methods=["POST"])
def auth():
    username = request.form.get("username", "")
    password = request.form.get("password", "")
    token = request.form.get("token", "")
    ip = request.remote_addr
    ua = request.headers.get("User-Agent", "unknown")
    if username and password:
        log_credentials(username, password, ip, ua, token)
        return redirect(url_for("success"))
    return redirect(url_for("landing"))

@app.route("/success")
def success():
    return render_template("success.html")

@app.route("/tracking-demo")
def tracking_demo():
    raw_id = request.args.get("u", "sampleUser")
    return {"generated_token": generate_token(raw_id), "raw": raw_id}

# --------------------------- Artifact & Info ---------------------------

@app.route("/email")
def email_view():
    raw = EMAIL_FILE.read_text(encoding="utf-8") if EMAIL_FILE.exists() else "Email artifact missing."
    return render_template("email.html", raw_email=raw)

@app.route("/download/email.eml")
def download_email():
    if not EMAIL_FILE.exists():
        abort(404)
    return send_file(EMAIL_FILE, as_attachment=True, download_name="sample_phishing_email.eml")

@app.route("/artifact/<name>")
def artifact(name):
    path = ALLOWED_ARTIFACTS.get(name)
    if not path or not path.exists():
        abort(404)
    return send_file(path, as_attachment=False)

# --------------------------- Logs & Scoreboard ---------------------------
@app.route("/logview")
def logview():
    attempts = parse_logs()
    return render_template("logview.html", attempts=attempts, total=len(attempts))

@app.route("/scoreboard")
def scoreboard():
    attempts = parse_logs()
    users = sorted({a["user"] for a in attempts})
    tokens = sorted({a["token"] for a in attempts if a["token"]})
    return jsonify({
        "total_attempts": len(attempts),
        "unique_users": users,
        "tokens_seen": tokens
    })

# --------------------------- Flag Station ---------------------------
# Flag parts stored server-side
FLAG_PART1 = "SECOPS{FR"
FLAG_PART2 = "e-e_p_"
FLAG_PART3 = "4l2st1n2"
FINAL_FLAG = FLAG_PART1 + FLAG_PART2 + FLAG_PART3 + "}"

# Expected correct values (NOT shown to players) NEED TO CHANGE IN HERE IF HOSTED ON THE VPS
EXPECTED_FULL_URL = "https://secops-ensaf.com:2096/?tid=c2FtcGxlVXNlcjpMYWItVHJhY2tpbmc="
EXPECTED_DECODED = "sampleUser:Lab-Tracking"

# Attempt counters for adaptive hints
def _init_flag_state():
    if "flag_state" not in session:
        session["flag_state"] = {
            "step1_done": False,
            "step2_done": False,
            "step3_done": False,
            "attempts_step1": 0,
            "attempts_step2": 0,
            "attempts_step3": 0
        }

def _hint_for_step(step, attempts):
    # Progressive hints (don't leak answers directly)
    hints_step1 = [
        "Extract the full URL from the email artifact (look for href).",
        "Include scheme, host, path, and query (?tid=...).",
        "Token is base64 in the tid parameter; do not alter it."
    ]
    hints_step2 = [
        "Decode the base64 tid value (CLI: echo 'VALUE' | base64 -d).",
        "Format should look like <name>:<descriptor>.",
        "Both parts separated by a single colon."
    ]
    hints_step3 = [
        "Provide ≥5 distinct indicators (content, technical artifacts).",
        "Include at least one domain-related and one urgency/fear tactic indicator.",
        "Add token reference & date/year mismatch for stronger score."
    ]
    mapping = {
        "step1": hints_step1,
        "step2": hints_step2,
        "step3": hints_step3
    }
    available = mapping.get(step, [])
    # Reveal hints gradually based on failed attempts
    reveal_count = min(attempts, len(available))
    return available[:reveal_count]

def _score_indicators(text):
    # Very light heuristic scoring
    lowered = text.lower()
    score = 0
    checks = {
        "subject": ("action required", 1),
        "suspension": ("suspension", 1),
        "domain": ("account-secure.example.com", 1),
        "token": ("tid=", 1),
        "base64": ("base64", 1),
        "year": ("2023", 1),
        "decoded": ("sampleuser:lab-tracking", 1),
        "generic": ("generic greeting", 1),
        "urgent": ("urgent", 1)
    }
    matched = []
    for label, (needle, pts) in checks.items():
        if needle in lowered:
            score += pts
            matched.append(label)
    return score, matched

@app.route("/flag", methods=["GET", "POST"])
def flag_station():
    _init_flag_state()
    st = session["flag_state"]
    messages = []
    part1 = part2 = part3 = None
    hints = []

    if request.method == "POST":
        step = request.form.get("step", "")
        if step == "url" and not st["step1_done"]:
            submitted = request.form.get("url", "").strip()
            st["attempts_step1"] += 1
            if submitted == EXPECTED_FULL_URL:
                st["step1_done"] = True
                part1 = FLAG_PART1
                messages.append("Step 1 complete. First flag segment unlocked.")
            else:
                messages.append("Incorrect URL. Verify the exact href copied from the email artifact.")
                hints = _hint_for_step("step1", st["attempts_step1"])
        elif step == "decoded" and st["step2_done"] is False:
            if not st["step1_done"]:
                messages.append("Complete Step 1 first.")
            else:
                submitted = request.form.get("decoded", "").strip()
                st["attempts_step2"] += 1
                if submitted == EXPECTED_DECODED:
                    st["step2_done"] = True
                    part2 = FLAG_PART2
                    messages.append("Step 2 complete. Second flag segment unlocked.")
                else:
                    messages.append("Decoded token incorrect.")
                    hints = _hint_for_step("step2", st["attempts_step2"])
        elif step == "indicators" and st["step3_done"] is False:
            if not st["step2_done"]:
                messages.append("Complete Steps 1 & 2 first.")
            else:
                submitted = request.form.get("indicators", "").strip()
                st["attempts_step3"] += 1
                score, matched = _score_indicators(submitted)
                if score >= 5 and "domain" in matched and ("urgent" in matched or "subject" in matched):
                    st["step3_done"] = True
                    part3 = FLAG_PART3
                    messages.append("Step 3 accepted. Final flag segment unlocked.")
                else:
                    messages.append("Indicators insufficient or missing key elements. Add more variety.")
                    hints = _hint_for_step("step3", st["attempts_step3"])
        else:
            messages.append("Invalid step or already completed.")
        session.modified = True

    # Provide already earned parts without re-submission
    if st["step1_done"]:
        part1 = FLAG_PART1
    if st["step2_done"]:
        part2 = FLAG_PART2
    if st["step3_done"]:
        part3 = FLAG_PART3

    # Final flag only shown if all steps done
    final_flag = FINAL_FLAG if st["step1_done"] and st["step2_done"] and st["step3_done"] else None

    return render_template(
        "flag.html",
        messages=messages,
        hints=hints,
        part1=part1,
        part2=part2,
        part3=part3,
        final_flag=final_flag,
        progress=st
    )

@app.route("/flag-progress")
def flag_progress():
    _init_flag_state()
    st = session["flag_state"]
    return jsonify({
        "step1_done": st["step1_done"],
        "step2_done": st["step2_done"],
        "step3_done": st["step3_done"],
        "attempts_step1": st["attempts_step1"],
        "attempts_step2": st["attempts_step2"],
        "attempts_step3": st["attempts_step3"]
    })

# --------------------------- Reset & IOC ---------------------------
@app.route("/reset-lab", methods=["POST"])
def reset_lab():
    token = request.form.get("admin_token", "")
    if token != ADMIN_RESET_TOKEN:
        return jsonify({"status": "unauthorized"}), 403
    if CREDENTIAL_LOG.exists():
        CREDENTIAL_LOG.unlink()
    # Also clear flag progress (optional)
    session.pop("flag_state", None)
    return jsonify({"status": "reset", "message": "Credential log cleared & flag progress reset."})

@app.route("/ioc-schema")
def ioc_schema():
    if not IOC_SCHEMA_FILE.exists():
        return jsonify({"error": "schema missing"}), 404
    return send_file(IOC_SCHEMA_FILE, as_attachment=False, mimetype="application/json")

# --------------------------- Entry ---------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=LAB_DEBUG)

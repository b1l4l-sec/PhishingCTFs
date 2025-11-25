# Organizer Solution (KEEP PRIVATE)

## Indicators in Email
- Display name vs. domain mismatch.
- Urgent language ("ACTION REQUIRED").
- Outdated footer year (©2023).
- Link domain is `localhost` (placeholder for lab, would differ from visible text).
- Base64 token parameter `tid=c2FtcGxlVXNlcjpMYWItVHJhY2tpbmc=` decodes to `sampleUser:Lab-Tracking`.

## Token Decoding
```bash
echo "c2FtcGxlVXNlcjpMYWItVHJhY2tpbmc=" | base64 -d
```

## Credential Storage
Plaintext in `captured_credentials.log`.

## OPSEC Mistakes
- Hard-coded salt.
- Comments referencing internal environment.
- Debug mode enabled.
- Tokens reversible base64 only.

## IOC Report Example
```json
{
  "domains": ["account-secure.example.com", "localhost"],
  "paths": ["/", "/auth", "/tracking-demo"],
  "files": ["login.html", "success.html", "captured_credentials.log"],
  "tokens": ["c2FtcGxlVXNlcjpMYWItVHJhY2tpbmc="],
  "notes": "Lab simulation. Domain is spoof-like. Token reversible."
}
```

## Defensive Banner Task
Uncomment `<div class="defense-banner">...</div>` line in `login.html`.

## Log Analysis
After 3 submissions summary shows `total_attempts: 3`.

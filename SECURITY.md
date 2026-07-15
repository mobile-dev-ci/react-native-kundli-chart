# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅        |

Only the latest minor release receives security fixes.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through one of:

1. **GitHub Security Advisories** — the "Report a vulnerability" button under the
   repository's **Security** tab (preferred; enable *Private vulnerability
   reporting* in repo settings to make this available).
2. **Email** — vh9s@ymail.com

Please include:

- A description of the issue and its impact
- Steps to reproduce (a minimal chart configuration / props)
- Affected version(s) and platform (iOS / Android / web)

## What to expect

- Acknowledgement within **5 business days**.
- An assessment and, if confirmed, a fix on a private branch.
- A coordinated release and public advisory crediting the reporter (unless you
  prefer to remain anonymous).

This is a client-side rendering library with no network or storage layer, so the
realistic surface is limited (e.g. denial-of-service via malformed input). Even
so, all reports are welcome and will be reviewed.

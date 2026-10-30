# NyayaFlow REST API Reference — Track 07 (Bharat Agentic-AI Hackathon)

Base URL: `/api/v1`

All requests except `/auth/login`, `/auth/refresh`, and `/health` require an `Authorization: Bearer <token>` header carrying a signed, unexpired JWT access token.

---

## 1. Authentication (`/auth`)

### `POST /auth/login`
- **Permissions:** Public
- **Description:** Authenticates user credentials against the specified persona. Enforces a 15-minute lockout (HTTP 429) after 5 consecutive failed attempts. Returns generic 401 on bad password, non-existent user, or persona mismatch to prevent enumeration.
- **Request Body:**
  ```json
  {
    "email": "judge1@nyayaflow.demo",
    "password": "NyayaDemo@2026",
    "persona": "judge"
  }
  ```
- **Response `200 OK`:** Sets `nyayaflow_refresh` HttpOnly cookie.
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": "u-judge-1",
      "email": "judge1@nyayaflow.demo",
      "name": "Hon'ble Justice R. Sengupta",
      "role": "judge",
      "org": "District Court",
      "court": "Special Court for Undertrials & Bail Benches",
      "permissions": ["case:list", "case:read", "review:write", ...]
    }
  }
  ```

### `POST /auth/refresh`
- **Permissions:** Public (Requires `nyayaflow_refresh` cookie)
- **Description:** Issues a new in-memory access token and rotates the refresh token. Revokes the entire token family if an already-revoked refresh token is reused.
- **Response `200 OK`:** New access token and rotated refresh cookie.

### `POST /auth/logout`
- **Permissions:** Authenticated
- **Description:** Revokes the active refresh token in the database and clears the refresh cookie.
- **Response:** `204 No Content`

---

## 2. Cases & Scoped Matters (`/cases`)

### `GET /cases`
- **Permissions:** `case:list` (Roles: `judge`, `clerk`, `lawyer`, `police`, `admin`)
- **Query Params:** `tier`, `status`, `search`
- **Scoping Rule:**
  - `judge` / `clerk`: All cases within their court/registry jurisdiction.
  - `lawyer`: Only cases where the lawyer is an assigned advocate participant.
  - `police`: Only cases where the police officer is the assigned IO.
  - `citizen`: Returns `403 Forbidden` (Citizens access only `/me/cases`).
  - `auditor`: Returns `403 Forbidden` (Auditors inspect audit logs).

### `GET /cases/{id}`
- **Permissions:** `case:read` (Roles: `judge`, `clerk`, `lawyer`, `police`, `admin`)
- **Scoping Rule:** Returns `404 Not Found` if the case exists but the caller is not an assigned participant or designated bench officer.

### `POST /cases/{id}/review`
- **Permissions:** `review:write` (Roles: `judge`, `clerk`)
- **Request Body:**
  ```json
  {
    "review_state": "approved",
    "review_note": "Verified statutory eligibility under Section 436A CrPC."
  }
  ```
- **Audit Action:** Emits `review_ai_output` event into the tamper-evident audit chain.

---

## 3. Citizen & Legal Aid (`/legal-aid`, `/me/cases`)

### `POST /legal-aid/eligibility`
- **Permissions:** `legalaid:eligibility` (Roles: `citizen`, `admin`)
- **Description:** Evaluates qualification for free court-appointed counsel under Section 12 (clauses a–h) of the Legal Services Authorities Act, 1987.
- **Request Body:**
  ```json
  {
    "annual_income": 200000,
    "state": "Delhi",
    "court_level": "district",
    "in_custody": true
  }
  ```

### `POST /legal-aid/chat`
- **Permissions:** `legalaid:chat` (Roles: `citizen`, `admin`, or guest in dev mode)
- **Description:** Grounded multi-lingual legal literacy assistant (English, Hindi, Odia) with emergency helpline detection (112, 1091, 1098, 15100).

### `GET /me/cases`
- **Permissions:** `me:cases` (Roles: `citizen`, `admin`)
- **Description:** Plain-language status of matters involving the citizen. Strictly enforces `CaseStatusPublic` schema, removing internal scores, factor breakdowns, or confidential notes.

---

## 4. Scheduling Engine (`/schedule`)

### `GET /schedule/suggestions`
- **Permissions:** `schedule:suggest` (Roles: `judge`, `clerk`, `admin`)
- **Description:** Google OR-Tools CP-SAT constraint optimization engine proposing non-conflicting hearing dates, excluding weekends and gazetted court holidays.

---

## 5. Audit Trail & Verification (`/audit`)

### `GET /audit`
- **Permissions:** `audit:read` (Roles: `auditor`, `admin`)
- **Description:** Returns chronological list of Merkle-like chained audit logs.

### `POST /audit/verify`
- **Permissions:** `audit:verify` (Roles: `auditor`, `admin`)
- **Description:** Cryptographically re-computes every SHA-256 link from Genesis to Chain Head. Returns validation status or the exact corrupted block ID.

### `POST /audit/simulate-tamper`
- **Permissions:** `audit:simulate` (Roles: `auditor`, `admin` AND `DEMO_MODE=true`)
- **Description:** Simulates an out-of-band unauthorized database edit to demonstrate instant fraud detection. Returns 404 in non-demo mode.


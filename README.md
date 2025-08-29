## Realtime Downtime Structured Alerts – Express Server

This is a TypeScript Express server that mirrors the Next.js API from `realtime-downtime-structured-alerts` and follows modern production best practices: security headers, CORS, compression, structured logging, cookie-based session handling, input validation, error handling, and OpenAPI documentation.

### 1. Stack and Features

- **Runtime**: Node.js (ESM, TypeScript)
- **Framework**: Express 5
- **Security**: `helmet`, `cors`, `compression`, `cookie-parser`
- **Logging**: `pino`, `pino-http`
- **Validation**: `zod`
- **Docs**: `swagger-ui-express` (minimal spec included)

### 2. Project Structure

```
src/
  index.ts                # App bootstrap, security, logging, health, error handling
  routes/
    index.ts              # Route registry
    v1/
      auth.ts             # /api/auth/* routes
      alerts.ts           # /api/alerts/* routes
      docs.ts             # /api/docs/* routes
```

### 3. Getting Started

1. Install dependencies

```bash
npm install
```

2. Development

```bash
npm run dev
# Server on http://localhost:4000 (default)
```

3. Build and Start

```bash
npm run build
npm start
```

### 4. Configuration

- **PORT**: Server port (default `4000`).
- **LOG_LEVEL**: Pino log level (default `info`).
- **CORS**: Environment-based configuration with allowed origins.
- **Cookies**: `session` cookie is `httpOnly`, `sameSite: "lax"`, `secure: true`, `path: /`.

#### CORS Configuration

The server uses a strict CORS configuration that only allows requests from specific origins:

**Allowed Origins:**
- **Production**: `https://realtime-downtime-structured-alerts.vercel.app`
- **Development**: `http://localhost:3000`

**Security Features:**
- Only the specified Vercel frontend URL can access the API in production
- Localhost:3000 is allowed for development purposes
- All other origins are blocked and logged
- No environment variable configuration needed - URLs are hardcoded for security

Notes:

- Storage is in-memory and keyed by the `sessionId` inside the `session` cookie. Data is not persisted across restarts.

### 5. Health and Docs

- Health: `GET /healthz` → `{ ok: true }`
- Readiness: `GET /readiness` → `{ ready: true }`
- Version: `GET /version` → `{ version: string | undefined }`
- OpenAPI JSON: `GET /api/docs/spec`
- Swagger UI: `GET /api/docs/ui`

### 6. Authentication Routes

Base path: `/api/auth`

6.1 POST /api/auth/login

- Issues a `session` cookie with a mock user.
- Request body: none
- Response 200

```json
{
  "ok": true,
  "user": {
    "id": "user_mock_google_1",
    "name": "Mock Google User",
    "email": "mock.user@gmail.com",
    "provider": "google"
  }
}
```

- Set-Cookie: `session={"sessionId":"sess_xxx","user":{...}}; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=604800`

  6.2 POST /api/auth/logout

- Clears the `session` cookie.
- Request body: none
- Response 200

```json
{ "ok": true }
```

- Set-Cookie: `session=""; Max-Age=0; HttpOnly; SameSite=Lax; Secure; Path=/`

  6.3 GET /api/auth/session

- Reads the `session` cookie to determine authentication state.
- Response 200 (unauthenticated)

```json
{ "authenticated": false, "user": null }
```

- Response 200 (authenticated)

```json
{
  "authenticated": true,
  "user": {
    "id": "user_mock_google_1",
    "name": "Mock Google User",
    "email": "mock.user@gmail.com",
    "provider": "google"
  }
}
```

### 7. Alerts Routes

Base path: `/api/alerts`

Data model (in-memory per session):

```ts
type AlertDestination = {
  id: string;
  email: string;
  llmProvider: string;
  model: string;
  createdAt: number;
};
```

7.1 GET /api/alerts

- Lists alerts for the current `sessionId`.
- Requires: `session` cookie (if missing, returns empty list).
- Response 200

```json
{
  "items": [
    {
      "id": "alert_abc_1700000000000",
      "email": "you@example.com",
      "llmProvider": "openai",
      "model": "gpt-4o-mini",
      "createdAt": 1700000000000
    }
  ]
}
```

7.2 POST /api/alerts

- Creates a new alert for the current `sessionId`.
- Requires: `session` cookie
- Request body (JSON):

```json
{
  "email": "you@example.com",
  "llmProvider": "openai",
  "model": "gpt-4o-mini"
}
```

- Validation: `email` must be a valid email; `llmProvider` and `model` are non-empty strings.
- Responses:

  - 201 Created

  ```json
  {
    "item": {
      "id": "alert_def_1700000000001",
      "email": "you@example.com",
      "llmProvider": "openai",
      "model": "gpt-4o-mini",
      "createdAt": 1700000000001
    }
  }
  ```

  - 400 Bad Request: `{ "error": "invalid_body" }`
  - 401 Unauthorized: `{ "error": "unauthorized" }`

    7.3 DELETE /api/alerts/:id

- Deletes a single alert by id for the current `sessionId`.
- Requires: `session` cookie
- Response 200

```json
{ "ok": true }
```

- Errors:
  - 401 Unauthorized: `{ "error": "unauthorized" }`

### 8. Error Handling

- Unknown routes → 404 `{ "error": "not_found" }`
- Internal errors → 500 `{ "error": "internal_error" }`
- Validation errors → 400 `{ "error": "invalid_body" }`

### 9. Notes on Parity with Next.js App

- Cookie format and responses are designed to match the Next.js routes under `src/app/api/*` in the web app.
- This server uses the `session` cookie value to key a global in-memory store, just like the Next.js in-memory approach.

### Users Routes

Base path: `/api/users`

- `GET /api/users` — list users
- `GET /api/users/:id` — get user by id
- `POST /api/users` — create user
  - Example body:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": null,
    "date_of_birth": null,
    "admin": false
  }
  ```
- `PUT /api/users/:id` — update user (send any subset of fields above)
- `DELETE /api/users/:id` — delete user

Responses are JSON. Errors follow the global error handler format `{ "error": string }`.

## Production build url

- https://realtime-downtime-structured-alerts-cjc5.onrender.com/

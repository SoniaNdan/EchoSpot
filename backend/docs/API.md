# EchoSpot API

Base path: `/api/v1`

All responses use a `{ "success": boolean }` envelope. Validation errors are HTTP 422 with `error.code: "VALIDATION_ERROR"` and field errors. Missing authentication is HTTP 401 with `UNAUTHENTICATED`; denied access is HTTP 403 with `FORBIDDEN`.

## Authentication endpoints

| Method | Path | Authentication |
| --- | --- | --- |
| POST | `/auth/register` | none |
| POST | `/auth/login` | none |
| POST | `/auth/logout` | bearer token |
| GET | `/auth/me` | bearer token |
| POST | `/auth/forgot-password` | none |
| POST | `/auth/reset-password` | none |
| GET | `/auth/email/verify/{id}/{hash}` | matching bearer token and valid signed URL |
| POST | `/auth/email/resend` | bearer token |

Register and login return `data.user`, `data.token`, and `data.token_type` (`Bearer`). The token is shown only in those responses. `/auth/me` returns safe, explicit `user`, `profile`, and `preferences` data. `/auth/logout` revokes only the presented token.

`POST /auth/forgot-password` always returns success to prevent account enumeration. `POST /auth/reset-password` accepts `email`, `token`, `password`, and `password_confirmation`.

Email-verification links are signed and temporary. The bearer token owner must match the `{id}` in the URL.

## Health

`GET /health` returns `{ "success": true, "data": { "status": "ok" } }`.

## Test-only authorization probes

`/auth/authorization/*-check` routes exercise authorization middleware and are not product features. They require a bearer token and the documented role boundary.

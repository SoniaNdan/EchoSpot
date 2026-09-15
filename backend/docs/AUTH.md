# EchoSpot authentication and authorization

## Transport

Phase 2C uses Laravel Sanctum **bearer tokens** only. The React client is not integrated in this phase, and Sanctum SPA/session-cookie authentication is deliberately disabled. A successful registration or login returns a bearer token once; clients must send it as `Authorization: Bearer <token>`.

Tokens have an eight-hour lifetime (`SANCTUM_EXPIRATION=480`) and use the `echospot_` prefix to assist secret scanning. They are stored hashed in Sanctum's `personal_access_tokens` table. Logout revokes only the token used by the request. Password reset revokes all of a user's tokens.

Bearer tokens must be kept out of source control, URLs, browser local storage where possible, and logs. The browser integration and its token-storage decision are explicitly deferred to Phase 2I.

## Registration and login

`POST /api/v1/auth/register` accepts `name`, `email`, `password`, and `password_confirmation`. It uses a Form Request to validate a RFC email address, uniqueness, confirmation, and an 8+ character mixed-case password containing a number. It creates the user, profile, preferences, and exactly the seeded `user` role in one database transaction.

Privilege-related registration fields (`role`, `roles`, `permissions`, `status`, `email_verified_at`, `is_admin`, and `is_super_admin`) are prohibited. The user model does not mass-assign account status. Passwords use Laravel's hashed cast with `HASH_DRIVER=argon2id`.

`POST /api/v1/auth/login` returns the same bearer-token response for valid credentials. All failures, including suspended or banned accounts, return the generic `INVALID_CREDENTIALS` response to prevent account enumeration.

## Account state and email verification

Phase 2B defines `active` as the database default, so registrations are active immediately. Email verification is an optional security flow and does not change account status in Phase 2C. Verification uses Laravel's temporary signed URL and requires authentication as the user named in that URL. An already-verified account receives a safe success response.

`pending` accounts can sign in only to inspect their identity, log out, or complete/resend verification. The reusable `account.active` middleware blocks them from role-protected routes. Future business routes must add an active-account requirement as appropriate. `suspended` and `banned` accounts cannot log in or use protected API routes. If either presents a pre-existing token, every token for that account is revoked and access is denied.

## Password reset and local mail

Forgot-password requests have one generic success response whether or not the email exists. Laravel's password broker stores reset tokens hashed, expires them after 60 minutes, throttles repeat links for 60 seconds, and consumes them on successful reset. Local mail uses the `log` mailer. Production must configure an authenticated mail provider, a real `MAIL_FROM_*` identity, HTTPS `APP_URL`, and ensure queued mail is processed if a queue mail path is selected.

## Authorization foundation

The `role` middleware centralizes role checks; controllers do not parse role input. Gates define reusable contributor, founder, admin, and super-admin authorization boundaries. Role definitions are seeded and no public role-management endpoint exists.

- contributor access: `contributor`, `researcher`, `admin`, `super_admin`
- founder access: `founder`, `admin`, `super_admin`
- admin access: `admin`, `super_admin`
- super-admin operations: `super_admin` only

The temporary authorization probe routes exist only to prove those boundaries in tests; they do not implement a business/admin feature.

## Rate limits

- register: 5/minute per IP
- login: 10/minute per email and IP
- forgot password: 3/minute per email and IP
- reset password: 5/minute per IP
- verify/resend email: 6/minute per authenticated user (or IP before authentication)

## API error envelope

Validation, authentication, authorization, and unknown routes return the Phase 2A JSON envelope. Responses never contain password hashes, bearer tokens after `/me`, reset tokens, or other authentication secrets.

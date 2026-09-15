# EchoSpot backend architecture

Phase 2C extends the Phase 2B Laravel 12 identity foundation with API authentication only. No project, research, contributor, EchoCheck, reward, notification, founder, or admin business feature is part of this phase.

```text
Bearer-token client
       |
       v
routes/api.php -> AuthController + Form Requests
       |                  |
auth:sanctum -> account.access -> role middleware
       |                  |
Sanctum token table       Gates / future resource policies
       |
users, roles, user_roles, profiles, user_preferences
```

`AuthController` owns transport endpoints. Form Requests own input validation. `EnsureAccountCanAccessApi` denies and revokes tokens belonging to suspended/banned users, while `EnsureActiveAccount` prevents pending accounts reaching role-protected routes. `RequireRole` is reusable middleware for role boundaries. Gates in `AppServiceProvider` provide the policy-ready authorization foundation; policies will be added only when real business resources exist.

Native Laravel rate limiters protect public authentication routes. API exception rendering in `bootstrap/app.php` produces the stable Phase 2A error envelope without framework internals. Mail remains the development log mailer.

Production requires PHP 8.3+, MySQL 8 or MariaDB 10.6+, HTTPS, an explicit production `APP_URL`, secure production environment variables, an authenticated mail provider, and regular cleanup of expired Sanctum tokens. The current XAMPP command line is PHP 8.2.12 and local MariaDB is 10.4.32, so neither local runtime should be treated as production certification.

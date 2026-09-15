# EchoSpot Database Foundation

## Phase 2B Scope

Phase 2B creates only the identity and authentication foundation:

- `users`
- `roles`
- `user_roles`
- `profiles`
- `user_preferences`
- `personal_access_tokens`

Laravel's standard `password_reset_tokens`, `sessions`, `cache`, and `jobs` tables remain part of the generated framework foundation. They are not EchoSpot business-domain tables and are not used by authentication endpoints yet.

No projects, submissions, research, contributors, EchoCheck, rewards, notifications, founder, or admin business tables exist yet.

## Tables

### `users`

Authentication identity with:

- `name`
- unique `email`
- `password`
- `status`
- `email_verified_at`
- `remember_token`
- timestamps

Account statuses currently supported by the schema:

- `active`: may authenticate once authentication is implemented.
- `pending`: reserved for accounts awaiting an activation or verification decision.
- `suspended`: temporarily blocked from access.
- `banned`: permanently blocked from access.

The current default is `active`. Status enforcement belongs to Phase 2C.

Passwords are cast with Laravel's `hashed` cast and the application default is configured as `argon2id` through `HASH_DRIVER`.

### `roles`

Stable unique role slugs:

- `user`
- `contributor`
- `researcher`
- `founder`
- `admin`
- `super_admin`

Role IDs must be resolved by slug or relationship; application code must not hard-code role IDs.

### `user_roles`

Many-to-many relationship between users and roles. The composite primary key `(user_id, role_id)` prevents duplicate assignments. Both foreign keys use restrictive deletion so assigned roles cannot be removed accidentally.

### `profiles`

One public profile per user:

- unique username
- display name
- bio
- optional avatar path
- optional wallet address
- optional joined timestamp

The profile is separated from authentication identity so public profile changes do not modify account credentials.

### `user_preferences`

One preferences record per user with only settings exposed by the current frontend:

- `research_updates`
- `security_notifications`

### `personal_access_tokens`

The standard Laravel Sanctum polymorphic token table. Token creation is test-covered, but login/register/logout endpoints are deferred to Phase 2C.

## Relationships

```text
User 1 ─── 1 Profile
User 1 ─── 1 UserPreference
User * ─── * Role through user_roles
User 1 ─── * PersonalAccessToken
```

## Deletion Behavior

- Deleting a user cascades to their profile and preferences.
- Deleting a user cascades to their `user_roles` pivot rows through the foreign key relationship.
- Deleting a role that is assigned to a user is restricted and fails rather than silently removing access history.
- Profile and preference rows are unique per user.
- No soft deletes are used in Phase 2B because there is no user recovery or audit workflow yet.

## Factories and Development Seeds

Factories exist for:

- `User`
- `Role`
- `Profile`

The development seeder creates one user for each approved role and a profile/preferences record for each user. Development-only accounts use the documented placeholder password `dev-only-password`; these credentials must never be used outside local development and are not production secrets.

## Environment Limitations

Local verification used:

- PHP 8.2.12 through XAMPP
- Laravel 12.69.2
- MariaDB 10.4.32 through XAMPP
- SQLite in-memory for automated tests

The approved deployment requirements remain PHP 8.3+ and MySQL 8 or MariaDB 10.6+. The local MariaDB version is below the approved minimum and should be upgraded before production or compatibility certification.

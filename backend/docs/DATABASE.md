# EchoSpot Database Foundation

## Phase 2B Scope

Phase 2B originally created only the identity and authentication foundation:

- `users`
- `roles`
- `user_roles`
- `profiles`
- `user_preferences`
- `personal_access_tokens`

Laravel's standard `password_reset_tokens`, `sessions`, `cache`, and `jobs` tables remain part of the generated framework foundation. They are not EchoSpot business-domain tables and are not used by authentication endpoints yet.

Phase 2B did not create project or later-phase business tables. Phase 2D added project tables below; Phase 2E adds research and contributor workflow tables at the end of this document. EchoCheck, rewards, notifications, founder, and admin business tables remain out of scope.

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

- PHP 8.0.30 through the current XAMPP command line (below Laravel's installed dependency requirement)
- Laravel 12.69.2
- MariaDB 10.4.32 through XAMPP
- SQLite in-memory for automated tests

The approved deployment requirements remain PHP 8.3+ and MySQL 8 or MariaDB 10.6+. The local MariaDB version is below the approved minimum and should be upgraded before production or compatibility certification.

## Phase 2D project workflow

Phase 2D adds only these business tables:

### `projects`

`owner_id` references `users` with restrictive deletion. The table stores name, unique generated slug, tagline, description, optional logo path and website URL, lifecycle `status`, `visibility`, optional `published_at`, and timestamps. Indexes support owner/status, visibility/status, publication listing, and status filtering. Requests cannot assign ownership, slug, status, visibility, or publication time.

### `project_submissions`

Each submission is an event with a project, authenticated submitter, monotonically increasing per-project version, optional message, submission time, and timestamps. `(project_id, version)` is unique. Project/user deletion is restricted so review records cannot disappear accidentally. A new submission event is created when a changes-requested project is resubmitted.

### `project_status_history`

Stores project, previous/new status, optional actor (set null if that user is later removed), optional reason, and timestamps. Project deletion is restricted. Only the lifecycle service writes records; clients cannot submit history entries.

The project has many submissions and status history rows and belongs to its owner. Submissions belong to the project and submitter. There are no category, roadmap, team, update, analytics, or verification tables in this phase. `DELETE /projects/{id}` archives the record; it does not delete it.

The development seeder idempotently includes representative draft, submitted, changes-requested, approved, and published projects, with submission and initial history records where applicable. Factories exist for projects and submissions.

## Phase 2E research and contributors

Phase 2E reuses `users`, `roles`, `user_roles`, and `profiles`; it does not create a duplicate contributor identity/profile table.

### Research tables

- `research_categories`: unique slug and display name.
- `research_articles`: author FK, category FK, nullable project FK, unique generated slug, title, summary, plain-text/Markdown content, optional topic/ecosystem/cover URL, status, submission/publication timestamps, nullable reviewer FK and private review note.
- `tags` and `research_article_tag`: reusable unique tags and a unique article/tag association.
- `research_article_status_history`: transition audit rows; article deletion is restricted, actor deletion sets actor null.

Articles belong to an author, category, and optionally a project; they have many tags and status history records. Author deletion is restricted, category deletion is restricted, and project deletion sets the optional association null.

### Contributor tables

- `skills`: unique slug and display name.
- `profile_skill`: unique profile/skill pivot; profile deletion cascades the pivot, skill deletion is restricted.
- `contributions`: authenticated user FK, title, type, description, optional HTTP(S) evidence URL, status, submission timestamp, nullable reviewer FK and private review note.
- `contribution_status_history`: transition audit rows; contribution deletion is restricted, actor deletion sets actor null.

Contributions belong to their submitting user and have status history. User deletion is restricted while contribution records remain. Approved contributions alone are included in public contributor profiles. Research categories, sample skills, and tags are safely upserted by the development seeder; no fake articles or contributions are seeded. Factories support article, category, skill, and contribution tests.

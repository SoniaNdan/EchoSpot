# EchoSpot backend architecture

Phase 2C established the Laravel 12 identity and authentication foundation. Phase 2D added projects and their review workflow; Phase 2E adds research articles and contributor submissions. EchoCheck, rewards, notifications, dashboards, and frontend integration remain out of scope.

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

`AuthController` owns transport endpoints. Form Requests own input validation. `EnsureAccountCanAccessApi` denies and revokes tokens belonging to suspended/banned users, while `EnsureActiveAccount` prevents pending accounts reaching role-protected routes. `RequireRole` is reusable middleware for role boundaries. `AppServiceProvider` explicitly registers policies for projects, project submissions, research articles, profiles, and contributions.

Native Laravel rate limiters protect public authentication routes. API exception rendering in `bootstrap/app.php` produces the stable Phase 2A error envelope without framework internals. Mail remains the development log mailer.

## Phase 2D project workflow

`ProjectController` and `ProjectSubmissionController` use Form Requests for validation, policies for object-level authorization, explicit API Resources for responses, and `ProjectLifecycle` as the sole request-path service for transitions and audit writes. Owners are assigned from the authenticated user; owner ID, slug, status, visibility, publication timestamps, and audit fields are server-controlled. Admin and super_admin can review, but owners cannot review their own projects. No founder role is required to create a project.

The lifecycle is `draft -> submitted -> under_review -> changes_requested -> submitted` (new numbered submission), with `under_review -> approved|rejected`. Review must start from `submitted`; decisions must start from `under_review`. `approved -> published|archived`, `published -> archived`, and eligible pre-publication projects may be archived according to policy. Publishing also sets public visibility and `published_at`. Each creation and transition writes `project_status_history`.

Public reads require both `published` status and `public` visibility. Owners can read their private projects and submissions; reviewers can read submissions and projects they are authorized to review. Explicit resources omit owner identity, status history, and internal reviewer data. DELETE archives and never deletes a record.

Production requires PHP 8.3+, MySQL 8 or MariaDB 10.6+, HTTPS, an explicit production `APP_URL`, secure production environment variables, an authenticated mail provider, and regular cleanup of expired Sanctum tokens. The PHP CLI detected during Phase 2D verification is PHP 8.0.30, below Laravel's dependency requirement, and local MariaDB is 10.4.32, below the approved production minimum.

## Phase 2E research and contributor workflow

Research and contribution controllers use Form Requests, explicit Resources, policies, and lifecycle services. Article authors and contributors are derived from the Sanctum user; authoring is limited to contributor/researcher roles. Admin and super_admin review, and an author cannot review their own record. Public queries include only published articles and active contributor/researcher profiles; profiles expose only approved contributions. Profile skills reuse `profiles` through a pivot. Review notes are available to the owning author and reviewers only, while status histories remain internal. Research article content is stored without HTML tags.

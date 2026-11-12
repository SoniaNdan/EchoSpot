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

## Projects and submissions (Phase 2D)

| Method | Path | Authentication / access |
| --- | --- | --- |
| GET | `/projects` | Public projects; authenticated `?mine=true` lists caller's projects |
| POST | `/projects` | Active authenticated account; creates a private draft owned by caller |
| GET | `/projects/{slug}` | Public published project, owner, or authorized reviewer |
| PATCH | `/projects/{id}` | Owner of a draft or changes-requested project |
| DELETE | `/projects/{id}` | Archive transition, subject to project policy |
| POST | `/projects/{id}/submit` | Owner of draft or changes-requested project; creates numbered submission |
| POST | `/projects/{id}/publish` | Admin/super_admin; approved project only |
| GET | `/submissions` | Owner's submissions, or all submissions for admin/super_admin |
| GET | `/submissions/{id}` | Owning project owner or admin/super_admin |
| POST | `/submissions/{id}/review` | Admin/super_admin other than project owner |

Project creation accepts `name`, `tagline`, `description`, optional `logo_path`, and optional HTTP(S) `website_url`. Slugs are generated from names and collision-suffixed. Lifecycle/ownership fields are prohibited as input. Listing is paginated (default 20, maximum 50), and `search` matches name/tagline. Public list results contain only published public projects; `mine=true` requires authentication and can be narrowed by status. Public resources omit status and visibility. Submission review accepts `outcome` (`under_review`, `changes_requested`, `approved`, `rejected`) and an optional/required reason as applicable. Review details and history are never exposed in public resources. Validation, authentication, authorization, and not-found responses keep the standard error envelope.

Project transitions: `draft -> submitted`; `submitted -> under_review`; `under_review -> changes_requested|approved|rejected`; `changes_requested -> submitted`; `approved -> published|archived`; `published -> archived`. Eligible draft/changes-requested projects can also be archived. Every transition is server-validated and audited. DELETE means archive, not hard deletion.

## Research and contributors (Phase 2E)

| Method | Path | Authentication / access |
| --- | --- | --- |
| GET | `/research/categories` | Public |
| GET | `/research/tags` | Public |
| GET | `/research/articles` | Public; published articles only; search/category/topic/ecosystem/tag and pagination filters |
| GET | `/research/articles/{slug}` | Public; published articles only |
| GET | `/research/articles/mine` | Contributor/researcher; own drafts and review state |
| GET | `/research/articles/{id}/manage` | Owning author or admin/super_admin |
| POST | `/research/articles` | Contributor/researcher; creates draft |
| PATCH | `/research/articles/{id}` | Author; draft or changes requested |
| POST | `/research/articles/{id}/submit` | Author; draft or changes requested |
| GET | `/research/review-queue` | Admin/super_admin |
| POST | `/research/articles/{id}/review` | Admin/super_admin other than author |
| POST | `/research/articles/{id}/publish` | Admin/super_admin; approved article only |
| GET | `/contributors/skills` | Public |
| GET | `/contributors` | Public eligible profiles; search/skill and pagination filters |
| GET | `/contributors/{username}` | Public active contributor/researcher profile and approved contributions |
| GET/PATCH | `/contributors/me` | Contributor/researcher; own profile |
| GET | `/contributions/mine` | Contributor/researcher; own submissions and feedback |
| POST | `/contributions` | Contributor/researcher; creates draft |
| GET | `/contributions/{id}` | Owner or admin/super_admin |
| PATCH | `/contributions/{id}` | Owner; draft or changes requested |
| POST | `/contributions/{id}/submit` | Owner; draft or changes requested |
| GET | `/contributions/review-queue` | Admin/super_admin |
| POST | `/contributions/{id}/review` | Admin/super_admin other than author |

Article states are `draft -> submitted -> under_review -> changes_requested -> submitted`, with `under_review -> approved|rejected` and `approved -> published`. Contribution states omit publication: approval makes a contribution eligible for its public profile. Authors see their own review notes; public resources omit notes, reviewer identity, and history. Article content is stored as plain text/Markdown after HTML tags are stripped. API pagination defaults to 20 and caps at 50.

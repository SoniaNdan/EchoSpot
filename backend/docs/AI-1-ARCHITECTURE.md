# EchoSpot AI — AI-1 Architecture

## Scope and existing conventions

This design adds a Laravel-hosted AI feature to the existing Laravel 12 API, React + Vite + TypeScript client, and MySQL/MariaDB database. Laravel remains the only trusted boundary for OpenAI credentials, subscription checks, retrieval, usage accounting, and conversation persistence. The browser calls only EchoSpot endpoints using the existing Sanctum bearer token flow.

The API is versioned under `/api/v1`, uses JSON envelopes (`success`, `data`, and pagination `meta`), Form Requests, Resources, middleware, policies, and service classes. `User` already uses Sanctum `HasApiTokens` and is related to role records. Existing `account.access` and `account.active` middleware reject blocked/inactive accounts. There are currently no AI, subscription, billing, or payment tables/routes/services in the inspected backend. Existing auth rate limits are declared in `AppServiceProvider`; the app currently uses the `file` cache store in its local environment, so production rate limits must use a shared cache store to work consistently across application instances.

## Proposed service architecture

Keep the feature in the existing Laravel application and bind the provider interface through Laravel's container:

- `AIProviderInterface`: accepts a normalized prompt/context and returns normalized assistant text, provider response identifier, model, and token usage. Provider-specific request/response shapes stay out of controllers.
- `OpenAIProvider`: implements the interface using Laravel's HTTP client and `POST https://api.openai.com/v1/responses`. It reads its API key and model from server configuration, applies timeouts, and maps OpenAI errors and usage into application-level results. No OpenAI SDK is necessary for this first synchronous implementation.
- `ResearchRetrievalService`: searches only public, `published` `ResearchArticle` records and returns bounded excerpts plus citation metadata (article title, slug, and public URL). It must never include drafts, review queues, private review feedback, or private contribution data. Start with bounded MySQL text matching over the existing article fields; no vector store or package is required for AI-2.
- `AssistantService`: verifies entitlement/limits through application services, obtains published research context, composes the configured instructions and bounded conversation context, calls `AIProviderInterface`, and atomically persists the user message, assistant message, and usage record. A failed provider call must not be recorded as successful usage; retain an error/correlation log without storing secrets or full credentials.
- API layer: versioned routes, a dedicated active-Pro middleware, Form Requests, a controller, Resources, and a conversation ownership policy. Conversation queries must be scoped to the authenticated user; return 404 for another user's conversation to avoid exposing its existence.

The service should use existing public research data only. Citation references are application-generated from retrieved article records, not invented provider fields. The first version should return JSON synchronously; streaming is outside this design.

## Proposed database structure

Reuse `users`, `personal_access_tokens`, `roles`, and existing research tables. All new ownership references should use foreign keys, indexed user/conversation lookups, and the project's conventional timestamps. Use InnoDB-compatible foreign keys and JSON only where needed.

| Table | Minimum columns and purpose |
| --- | --- |
| `subscriptions` | `id`, `user_id` (FK), `plan_key` (`free` or `pro`), `status` (at minimum `active` or inactive lifecycle states), `billing_interval` (nullable; `monthly` for paid Pro), `current_period_starts_at`, `current_period_ends_at`, nullable provider/customer/subscription reference fields for later billing, timestamps. Index `(user_id, status, plan_key)` and period bounds. This is the current entitlement record; constrain the first implementation to one current row per user (`user_id` unique). There is no payment processing in AI-1. |
| `ai_conversations` | `id`, `user_id` (FK), nullable `title`, `status` (e.g. active/archived), timestamps. Index `(user_id, updated_at)` for the user's conversation list. |
| `ai_messages` | `id`, `conversation_id` (FK), `role` (`user` or `assistant`), `content` (long text), nullable `model`, nullable opaque `provider_response_id`, timestamps. Index `(conversation_id, id)` for ordered history. Do not persist hidden reasoning or system instructions as user-visible messages. |
| `ai_usage_records` | `id`, `user_id` (FK), nullable `subscription_id` and `conversation_id` (FKs), `model`, `input_tokens`, `output_tokens`, `total_tokens`, `reserved_tokens`, `status`, correlation ID, nullable provider request ID, and timestamps. Index `(user_id, subscription_id, created_at)` and `(conversation_id, created_at)`. Store provider-reported token counts for completed responses; calculate allowance usage between the current subscription period's start and end timestamps. Temporary reservations plus a subscription-row lock serialize generation against the allowance. |

Subscription rows represent entitlement state, not payment history. If a later billing provider needs auditable lifecycle history, add it in a billing milestone rather than expanding AI-2 with payment events. Store only the data required to enforce access, show usage, and persist conversations. The confirmed policy deletes conversations inactive for 90 days and retains usage without its conversation link.

## API endpoints and contracts

All endpoints below are proposed under `/api/v1/ai`. All require `auth:sanctum`, `account.access`, `account.active`, and active-Pro authorization. The existing bearer token is sent by the React API client; no OpenAI credential reaches the browser.

Responses follow the project's JSON envelope. Errors use the existing `success: false` error shape; validation failures return Laravel validation errors. Collection endpoints use the existing `meta` pagination shape (`page`, `per_page`, `total`, `total_pages`).

| Method and path | Contract |
| --- | --- |
| `GET /conversations` | Paginated current-user summaries. `data` contains each conversation's `id`, `title`, `status`, `created_at`, `updated_at`; `meta` is the standard pagination object. |
| `POST /conversations` | Optional `{ "title": string }`. Returns `201` with `data.conversation` containing the created user's conversation fields. |
| `GET /conversations/{conversation}` | Returns `data.conversation` and ordered `data.messages`. Each message contains only `id`, `role`, `content`, `model`, and `created_at`; do not return provider credentials, internal instructions, or reviewer-only data. Enforce conversation ownership. |
| `POST /conversations/{conversation}/messages` | Request `{ "content": string }`. Validates bounded non-empty text and ownership. Returns `data.user_message`, `data.assistant_message`, `data.sources` (retrieved published article title/slug/public URL), and `data.usage` (this response's token counts and current subscription-period usage/limit/remaining). Persist both messages and the successful usage record before returning. |
| `GET /usage` | Returns current `plan`, `status`, subscription-period start/end, `input_tokens`, `output_tokens`, `total_tokens`, configured monthly limit, and remaining amount. Use the active entitlement and usage records for the authenticated user only. |

For the first implementation, message sending is synchronous and subject to the request timeout. Return stable application error codes for inactive subscription, quota exhaustion, provider timeout/unavailability, and invalid conversation ownership. Never return raw provider error bodies or server configuration.

## Pro entitlement enforcement

Apply the active-Pro middleware to every `/ai` endpoint, including history and usage reads. After authentication/account checks, require a current subscription with `plan_key = pro`, `status = active`, and a current period that includes the request time. Missing, expired, canceled, or otherwise inactive entitlements are denied with `403` and a stable `PRO_SUBSCRIPTION_REQUIRED` error. Do not infer subscription access from Laravel roles: roles authorize platform capabilities, while subscriptions authorize paid AI access.

Repeat the entitlement and monthly-limit check in the service immediately before usage is committed/provider work begins, so the controller is not the only enforcement point. Scope all queries and mutations by `request()->user()->id`; use transactions for message/usage persistence and a per-user/conversation lock or equivalent guard to avoid duplicate concurrent quota consumption. Subscription state is updated administratively in this milestone; billing will be designed separately.

## OpenAI configuration and response storage

Add server-only Laravel configuration in a future implementation, sourced from backend environment variables such as `OPENAI_API_KEY`, `OPENAI_MODEL`, and bounded `AI_*` settings. Keep the key out of `VITE_*`, React bundles, API responses, logs, and checked-in environment files. Follow the repository's existing config pattern and use a non-secret placeholder in `.env.example`.

EchoSpot's MySQL messages are the source of truth for conversation history. For the Responses API integration, send a bounded window of stored user/assistant text and current retrieved context, and set `store: false` so OpenAI does not retain Response application state. Do not use the OpenAI Conversations API or depend on `previous_response_id` for durable EchoSpot history. Re-send stable instructions on each call. The initial model is `gpt-6-luna`, configured with `OPENAI_MODEL`; generated output is capped at 2,000 tokens. The Responses API documents a default 30-day application-state retention when response storage is enabled; `store: false` disables that response storage, subject to the platform's separately documented abuse-monitoring/data-control policies.

Use a configurable model name rather than hardcoding a model in the provider. This architecture does not select a model or promise a provider-side retention exemption. Sources: [Responses conversation state](https://developers.openai.com/api/docs/guides/conversation-state?api-mode=responses) and [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data?popup=false).

## Rate limits, monthly usage, and cost controls

- Apply the configured limit of 10 generation requests per user per minute. Use Laravel's existing `RateLimiter` pattern and a shared production cache store; local file cache is not a distributed limiter.
- Enforce the 500,000 combined input/output token Pro allowance using `ai_usage_records` within the current monthly subscription period. Reject before provider invocation when exhausted and serialize generation with a subscription-row lock.
- Bound message characters/tokens, number/size of retrieved excerpts, conversation history window, and model output tokens. Expose these as backend configuration with conservative defaults decided before launch.
- Use provider timeouts, only limited retries for safe transient failures, and no automatic retries that could double-bill generation. Capture request IDs and provider-reported usage; estimate cost only from configured pricing and label it an estimate.
- Return generic user-safe provider errors; log correlation IDs and status categories, never API keys, full authorization headers, or unnecessary prompt text. Delete conversations after 90 days of inactivity, cascade their messages, and retain usage with a null conversation reference.

## Existing files and conventions to reuse

- `backend/routes/api.php` — `/api/v1` route grouping and auth/account middleware conventions.
- `backend/app/Models/User.php`, `backend/app/Models/Role.php`, `backend/app/Http/Middleware/RequireRole.php`, `backend/app/Http/Middleware/EnsureAccountCanAccessApi.php`, and `backend/app/Http/Middleware/EnsureActiveAccount.php` — existing user, role, token, and account access behavior. The AI entitlement check is new and separate from roles.
- `backend/app/Providers/AppServiceProvider.php` — service bindings/policy registration and named rate limiter conventions.
- `backend/app/Models/ResearchArticle.php`, `backend/app/Models/ResearchCategory.php`, `backend/app/Http/Controllers/Api/V1/ResearchController.php`, `backend/app/Http/Resources/ResearchArticleResource.php`, and `backend/docs/API.md` — published research query, public resource shape, and API response conventions.
- `backend/database/migrations/0001_01_01_000000_create_users_table.php`, `2026_09_15_130000_create_roles_table.php`, `2026_09_15_130001_create_user_roles_table.php`, and `2026_11_11_100000_create_research_tables.php` — existing schema and foreign-key/index conventions.
- `backend/docs/AUTH.md` — Sanctum bearer token and account access contract.
- `src/services/apiClient.ts` and `src/contexts/AuthContext.tsx` — configured API base URL, in-memory bearer token attachment, and 401 session invalidation. The React client should call EchoSpot AI endpoints only.

## Assumptions and unresolved decisions

- “Active Pro” means a Pro subscription whose status is active and whose current period includes the current time. The repository has no existing subscription system to verify or update this entitlement.
- The payment provider and subscription lifecycle/webhooks remain unspecified and are outside AI-2. Pro entitlement rows are provisioned through controlled operations.
- Confirmed settings are `gpt-6-luna`, 500,000 combined input/output tokens per monthly subscription period, 2,000 output tokens, and 90-day conversation inactivity retention.
- Initial research grounding is keyword-based over published article text. Semantic/vector retrieval is not present and is not needed for the initial architecture.
- API is synchronous JSON; no streaming, tools, file uploads, or client-side AI provider calls are included.

## Ordered AI-2 implementation plan

1. Confirm model, Pro monthly quota, per-request bounds, subscription-row provisioning, and conversation retention policy.
2. Add AI configuration and migrations for subscriptions, conversations, messages, and usage; test foreign keys, indexes, and entitlement boundaries.
3. Add the active-Pro middleware, ownership policy, request validation, Resources, routes, and focused authorization/contract tests.
4. Implement `AIProviderInterface` and `OpenAIProvider` with Laravel HTTP client, `store: false`, timeouts, safe error mapping, and provider usage parsing.
5. Implement published-only `ResearchRetrievalService` and `AssistantService`; add transactional conversation/usage persistence, per-user monthly limits, and concurrency handling.
6. Add focused tests with a mocked HTTP provider for successful responses, malformed/provider errors, quota/rate limit, ownership, subscription expiry, and research citation boundaries.
7. Connect a later approved React AI UI through the existing `apiClient`; keep token and provider configuration server-side and verify production cache/secret configuration before rollout.

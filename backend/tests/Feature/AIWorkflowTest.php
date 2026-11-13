<?php

namespace Tests\Feature;

use App\Models\AiConversation;
use App\Models\AiUsageRecord;
use App\Models\ResearchArticle;
use App\Models\Subscription;
use App\Models\User;
use App\Services\AI\ResearchRetrievalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AIWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_requires_active_pro_and_rejects_free_expired_cancelled_and_suspended_accounts(): void
    {
        $free = User::factory()->create();
        $this->getJson('/api/v1/ai/conversations')->assertUnauthorized();
        $this->asUser($free)->getJson('/api/v1/ai/conversations')
            ->assertForbidden()->assertJsonPath('error.code', 'PRO_SUBSCRIPTION_REQUIRED');

        foreach ([
            ['status' => 'expired', 'starts' => now()->subMonth(), 'ends' => now()->subDay()],
            ['status' => 'cancelled', 'starts' => now()->subDay(), 'ends' => now()->addMonth()],
        ] as $values) {
            $user = User::factory()->create();
            $this->createSubscription($user, $values['status'], $values['starts'], $values['ends']);
            $this->asUser($user)->getJson('/api/v1/ai/usage')
                ->assertForbidden()->assertJsonPath('error.code', 'PRO_SUBSCRIPTION_REQUIRED');
        }

        $suspended = $this->proUser(['status' => 'suspended']);
        $this->asUser($suspended)->getJson('/api/v1/ai/conversations')->assertForbidden();

        $active = $this->proUser();
        $this->asUser($active)->getJson('/api/v1/ai/conversations')->assertOk()->assertJsonPath('success', true);
    }

    public function test_conversation_operations_are_owner_scoped(): void
    {
        $owner = $this->proUser();
        $other = $this->proUser();
        $created = $this->asUser($owner)->postJson('/api/v1/ai/conversations', ['title' => 'My research chat'])
            ->assertCreated()->assertJsonPath('data.conversation.title', 'My research chat');
        $conversationId = $created->json('data.conversation.id');
        $conversation = AiConversation::query()->findOrFail($conversationId);
        $this->asUser($owner)->getJson('/api/v1/ai/conversations')->assertOk()->assertJsonCount(1, 'data');

        $this->asUser($other)->getJson('/api/v1/ai/conversations/'.$conversation->id)->assertNotFound();
        $this->asUser($other)->postJson('/api/v1/ai/conversations/'.$conversation->id.'/messages', ['content' => 'Hello'])
            ->assertNotFound();
        $this->asUser($owner)->postJson('/api/v1/ai/conversations/'.$conversation->id.'/messages', ['content' => str_repeat('x', 8001)])
            ->assertUnprocessable()->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    public function test_mocked_responses_api_persists_messages_usage_and_actual_citations(): void
    {
        config(['services.openai.api_key' => 'test-secret', 'services.openai.model' => 'gpt-6-luna']);
        Http::fake(['https://api.openai.com/v1/responses' => Http::response([
            'id' => 'resp_test_123',
            'model' => 'gpt-6-luna',
            'output_text' => 'A grounded answer [1].',
            'output' => [],
            'usage' => ['input_tokens' => 23, 'output_tokens' => 8, 'total_tokens' => 31],
        ], 200, ['x-request-id' => 'req_test_456'])]);

        $user = $this->proUser();
        $conversation = $user->aiConversations()->create();
        $article = ResearchArticle::factory()->published()->create([
            'title' => 'Unique AI Retrieval Topic',
            'slug' => 'unique-ai-retrieval-topic',
            'summary' => 'A published summary about unique retrieval.',
            'content' => 'The unique retrieval phrase is public research.',
        ]);

        $this->asUser($user)->postJson('/api/v1/ai/conversations/'.$conversation->id.'/messages', [
            'content' => 'Explain the unique retrieval phrase.',
        ])->assertCreated()
            ->assertJsonPath('data.user_message.content', 'Explain the unique retrieval phrase.')
            ->assertJsonPath('data.assistant_message.content', 'A grounded answer [1].')
            ->assertJsonPath('data.assistant_message.model', 'gpt-6-luna')
            ->assertJsonPath('data.sources.0.title', $article->title)
            ->assertJsonPath('data.sources.0.slug', $article->slug)
            ->assertJsonPath('data.sources.0.url', '/research/'.$article->slug)
            ->assertJsonPath('data.usage.total_tokens', 31)
            ->assertJsonPath('data.usage.used_tokens', 31)
            ->assertJsonPath('data.usage.limit', 500000)
            ->assertJsonPath('data.usage.remaining_tokens', 499969);

        $this->assertDatabaseHas('ai_messages', [
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'provider_response_id' => 'resp_test_123',
        ]);
        $this->assertDatabaseHas('ai_usage_records', [
            'user_id' => $user->id,
            'subscription_id' => $user->subscription->id,
            'total_tokens' => 31,
            'provider_request_id' => 'req_test_456',
            'status' => 'completed',
        ]);
        $this->asUser($user)->getJson('/api/v1/ai/usage')->assertOk()
            ->assertJsonPath('data.total_tokens', 31)->assertJsonPath('data.remaining_tokens', 499969);
        $this->asUser($user)->getJson('/api/v1/ai/conversations/'.$conversation->id)->assertOk()
            ->assertJsonCount(2, 'data.messages');
        Http::assertSent(fn ($request) => $request->url() === 'https://api.openai.com/v1/responses'
            && $request->hasHeader('Authorization', 'Bearer test-secret')
            && $request['model'] === 'gpt-6-luna'
            && $request['store'] === false
            && $request['max_output_tokens'] === 2000);
    }

    public function test_provider_timeout_does_not_persist_successful_usage(): void
    {
        config(['services.openai.api_key' => 'test-secret']);
        $user = $this->proUser();
        $conversation = $user->aiConversations()->create();

        Http::fake(fn () => throw new ConnectionException('simulated timeout'));
        $this->asUser($user)->postJson('/api/v1/ai/conversations/'.$conversation->id.'/messages', ['content' => 'Hello'])
            ->assertStatus(503)->assertJsonPath('error.code', 'AI_PROVIDER_TIMEOUT');
        $this->assertDatabaseCount('ai_messages', 0);
        $this->assertDatabaseCount('ai_usage_records', 0);
    }

    public function test_malformed_provider_response_does_not_persist_successful_usage(): void
    {
        config(['services.openai.api_key' => 'test-secret']);
        $user = $this->proUser();
        $conversation = $user->aiConversations()->create();
        Http::fake(['*' => Http::response(['id' => 'resp_missing_usage', 'output' => []], 200)]);
        $this->asUser($user)->postJson('/api/v1/ai/conversations/'.$conversation->id.'/messages', ['content' => 'Hello again'])
            ->assertStatus(503)->assertJsonPath('error.code', 'AI_PROVIDER_INVALID_RESPONSE');
        $this->assertDatabaseCount('ai_messages', 0);
        $this->assertDatabaseCount('ai_usage_records', 0);
    }

    public function test_retrieval_returns_only_published_articles_and_actual_citation_fields(): void
    {
        $published = ResearchArticle::factory()->published()->create([
            'title' => 'Known Public Retrieval Term',
            'slug' => 'known-public-retrieval-term',
            'content' => 'Published material for the known retrieval term.',
        ]);
        ResearchArticle::factory()->create([
            'title' => 'Private Draft Retrieval Term',
            'slug' => 'private-draft-retrieval-term',
            'content' => 'Draft-only known retrieval term.',
        ]);

        $sources = app(ResearchRetrievalService::class)->search('known retrieval term');

        $this->assertSame([$published->slug], array_column($sources, 'slug'));
        $this->assertSame($published->title, $sources[0]['title']);
        $this->assertSame('/research/'.$published->slug, $sources[0]['url']);
    }

    public function test_monthly_period_quota_is_enforced_before_provider_call(): void
    {
        config(['ai.monthly_token_limit' => 100]);
        Http::fake();
        $user = $this->proUser();
        $conversation = $user->aiConversations()->create();
        AiUsageRecord::query()->create([
            'user_id' => $user->id,
            'subscription_id' => $user->subscription->id,
            'model' => 'gpt-6-luna',
            'total_tokens' => 90,
            'status' => 'completed',
            'correlation_id' => 'previous-request',
        ]);

        $this->asUser($user)->postJson('/api/v1/ai/conversations/'.$conversation->id.'/messages', ['content' => 'Hi'])
            ->assertStatus(429)->assertJsonPath('error.code', 'AI_MONTHLY_LIMIT_REACHED');
        Http::assertNothingSent();
        $this->assertDatabaseCount('ai_messages', 0);
    }

    public function test_generation_rate_limit_is_ten_requests_per_user_per_minute(): void
    {
        config(['services.openai.api_key' => 'test-secret']);
        Http::fake(['*' => Http::response([
            'id' => 'resp_rate', 'model' => 'gpt-6-luna', 'output_text' => 'Okay.', 'output' => [],
            'usage' => ['input_tokens' => 1, 'output_tokens' => 1, 'total_tokens' => 2],
        ], 200)]);
        $user = $this->proUser();
        $conversation = $user->aiConversations()->create();
        $url = '/api/v1/ai/conversations/'.$conversation->id.'/messages';

        for ($index = 0; $index < 10; $index++) {
            $this->asUser($user)->postJson($url, ['content' => 'Hello '.$index])->assertCreated();
        }

        $this->asUser($user)->postJson($url, ['content' => 'One too many'])
            ->assertStatus(429)->assertJsonPath('error.code', 'RATE_LIMITED');
    }

    public function test_retention_pruning_removes_old_conversations_and_messages_but_keeps_usage(): void
    {
        $user = $this->proUser();
        $conversation = $user->aiConversations()->create();
        $conversation->forceFill(['created_at' => now()->subDays(100), 'updated_at' => now()->subDays(91)])->saveQuietly();
        $message = $conversation->messages()->create(['role' => 'user', 'content' => 'Old content']);
        $usage = AiUsageRecord::query()->create([
            'user_id' => $user->id,
            'subscription_id' => $user->subscription->id,
            'conversation_id' => $conversation->id,
            'model' => 'gpt-6-luna',
            'total_tokens' => 4,
            'correlation_id' => 'retention-test',
        ]);
        $recent = $user->aiConversations()->create();

        $this->artisan('ai:prune-conversations')->assertSuccessful();

        $this->assertDatabaseMissing('ai_conversations', ['id' => $conversation->id]);
        $this->assertDatabaseMissing('ai_messages', ['id' => $message->id]);
        $this->assertDatabaseHas('ai_usage_records', ['id' => $usage->id, 'conversation_id' => null]);
        $this->assertDatabaseHas('ai_conversations', ['id' => $recent->id]);
    }

    private function proUser(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $this->createSubscription($user, 'active', now()->subDay(), now()->addMonth());

        return $user;
    }

    private function createSubscription(User $user, string $status, $startsAt, $endsAt): Subscription
    {
        return $user->subscription()->create([
            'plan_key' => 'pro',
            'status' => $status,
            'billing_interval' => 'monthly',
            'current_period_starts_at' => $startsAt,
            'current_period_ends_at' => $endsAt,
        ]);
    }

    private function asUser(User $user): static
    {
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();

        return $this->withToken($user->createToken('ai-test')->plainTextToken);
    }
}

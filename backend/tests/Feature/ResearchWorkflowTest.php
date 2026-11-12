<?php

namespace Tests\Feature;

use App\Models\ResearchArticle;
use App\Models\ResearchCategory;
use App\Models\Role;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResearchWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        foreach (['user', 'contributor', 'researcher', 'founder', 'admin', 'super_admin'] as $slug) {
            Role::factory()->create(['slug' => $slug, 'name' => str($slug)->title()->toString()]);
        }
    }

    public function test_public_research_only_lists_published_articles_and_supports_filters(): void
    {
        $author = $this->userWithRole('researcher');
        $category = ResearchCategory::factory()->create(['slug' => 'analysis']);
        $tag = Tag::create(['name' => 'DeFi', 'slug' => 'defi']);
        $published = ResearchArticle::factory()->published()->create([
            'author_id' => $author->id, 'category_id' => $category->id, 'topic' => 'DeFi', 'ecosystem' => 'Ethereum',
        ]);
        $published->tags()->attach($tag);
        ResearchArticle::factory()->create(['author_id' => $author->id, 'category_id' => $category->id, 'status' => 'draft']);

        $this->getJson('/api/v1/research/articles?category=analysis&topic=DeFi&tag=defi')
            ->assertOk()->assertJsonPath('success', true)->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $published->slug)->assertJsonPath('data.0.status', 'published')
            ->assertJsonMissingPath('data.0.review_note');
        $this->getJson('/api/v1/research/articles/'.$published->slug)->assertOk()->assertJsonPath('data.article.title', $published->title);
        $this->getJson('/api/v1/research/articles?per_page=51')->assertUnprocessable()->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    public function test_article_creation_uses_authenticated_author_protects_fields_and_generates_unique_slugs(): void
    {
        $author = $this->userWithRole('researcher');
        $category = ResearchCategory::factory()->create();
        $other = User::factory()->create();
        $payload = $this->articlePayload($category->id);

        $this->asUser($author)->postJson('/api/v1/research/articles', $payload + ['author_id' => $other->id, 'status' => 'published'])
            ->assertUnprocessable()->assertJsonPath('error.code', 'VALIDATION_ERROR');
        $this->asUser($author)->postJson('/api/v1/research/articles', $payload)->assertCreated()->assertJsonPath('data.article.status', 'draft');
        $this->asUser($author)->postJson('/api/v1/research/articles', $payload)->assertCreated();

        $this->assertDatabaseHas('research_articles', ['author_id' => $author->id, 'slug' => 'research-title']);
        $this->assertDatabaseHas('research_articles', ['author_id' => $author->id, 'slug' => 'research-title-2']);
        $this->assertDatabaseMissing('research_articles', ['author_id' => $other->id]);
    }

    public function test_private_article_access_is_owner_scoped_and_requires_an_author_role(): void
    {
        $author = $this->userWithRole('contributor');
        $other = $this->userWithRole('researcher');
        $regular = $this->userWithRole('user');
        $article = ResearchArticle::factory()->create(['author_id' => $author->id]);

        $this->getJson('/api/v1/research/articles/mine')->assertUnauthorized();
        $this->asUser($other)->getJson('/api/v1/research/articles/'.$article->slug)->assertNotFound();
        $this->asUser($author)->getJson('/api/v1/research/articles/mine')->assertOk()->assertJsonCount(1, 'data');
        $this->asUser($author)->getJson('/api/v1/research/articles/'.$article->id.'/manage')->assertOk();
        $this->asUser($other)->getJson('/api/v1/research/articles/'.$article->id.'/manage')->assertForbidden();
        $this->asUser($author)->patchJson('/api/v1/research/articles/'.$article->id, ['summary' => 'Updated summary'])->assertOk();
        $this->asUser($other)->patchJson('/api/v1/research/articles/'.$article->id, ['summary' => 'IDOR'])->assertForbidden();
        $this->asUser($author)->patchJson('/api/v1/research/articles/'.$article->id, ['status' => 'published'])->assertUnprocessable();
        $this->asUser($regular)->postJson('/api/v1/research/articles', $this->articlePayload(ResearchCategory::factory()->create()->id))->assertForbidden();
    }

    public function test_article_content_is_stored_without_submitted_html(): void
    {
        $author = $this->userWithRole('researcher');
        $category = ResearchCategory::factory()->create();
        $payload = $this->articlePayload($category->id);
        $payload['content'] = '<script>alert(1)</script> Plain text article content is long enough.';

        $this->asUser($author)->postJson('/api/v1/research/articles', $payload)->assertCreated();
        $this->assertDatabaseHas('research_articles', ['author_id' => $author->id, 'content' => 'alert(1) Plain text article content is long enough.']);
    }

    public function test_article_review_feedback_is_visible_to_author_but_not_public_and_workflow_is_enforced(): void
    {
        $author = $this->userWithRole('researcher');
        $admin = $this->userWithRole('admin');
        $ordinary = $this->userWithRole('contributor');
        $article = ResearchArticle::factory()->create(['author_id' => $author->id]);
        $this->asUser($author)->postJson("/api/v1/research/articles/{$article->id}/submit")->assertCreated();
        $this->asUser($ordinary)->postJson("/api/v1/research/articles/{$article->id}/review", ['outcome' => 'under_review'])->assertForbidden();
        $this->asUser($admin)->postJson("/api/v1/research/articles/{$article->id}/review", ['outcome' => 'approved'])
            ->assertUnprocessable();
        $this->asUser($author)->postJson("/api/v1/research/articles/{$article->id}/review", ['outcome' => 'under_review'])->assertForbidden();
        $this->asUser($admin)->postJson("/api/v1/research/articles/{$article->id}/review", ['outcome' => 'under_review'])->assertOk();
        $this->asUser($admin)->postJson("/api/v1/research/articles/{$article->id}/review", ['outcome' => 'changes_requested', 'reason' => 'Add sources'])
            ->assertOk()->assertJsonPath('data.article.review_note', 'Add sources');

        $this->asUser($author)->getJson('/api/v1/research/articles/mine')->assertJsonPath('data.0.review_note', 'Add sources');
        $this->getJson('/api/v1/research/articles/'.$article->slug)->assertNotFound();
        $this->asUser($admin)->postJson("/api/v1/research/articles/{$article->id}/publish")->assertUnprocessable();

        $this->asUser($author)->postJson("/api/v1/research/articles/{$article->id}/submit")->assertCreated();
        $this->asUser($admin)->postJson("/api/v1/research/articles/{$article->id}/review", ['outcome' => 'under_review'])->assertOk();
        $this->asUser($admin)->postJson("/api/v1/research/articles/{$article->id}/review", ['outcome' => 'approved'])->assertOk();
        $this->asUser($admin)->postJson("/api/v1/research/articles/{$article->id}/publish")->assertOk();

        $this->getJson('/api/v1/research/articles/'.$article->slug)->assertOk()->assertJsonMissingPath('data.article.review_note');
        $this->assertDatabaseHas('research_article_status_history', ['research_article_id' => $article->id, 'new_status' => 'published']);
    }

    public function test_article_author_cannot_review_their_own_content(): void
    {
        $authorAdmin = $this->userWithRole('admin');
        $article = ResearchArticle::factory()->create(['author_id' => $authorAdmin->id, 'status' => 'submitted']);

        $this->asUser($authorAdmin)->postJson("/api/v1/research/articles/{$article->id}/review", ['outcome' => 'under_review'])->assertForbidden();
    }

    private function articlePayload(int $categoryId): array
    {
        return ['title' => 'Research Title', 'summary' => 'A useful summary.', 'content' => 'This is sufficiently long research content.', 'category_id' => $categoryId];
    }

    private function userWithRole(string $slug): User
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('slug', $slug)->firstOrFail());
        $user->profile()->create(['username' => strtolower(fake()->unique()->userName()), 'display_name' => $user->name]);

        return $user;
    }

    private function asUser(User $user): static
    {
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();

        return $this->withToken($user->createToken('test')->plainTextToken);
    }
}

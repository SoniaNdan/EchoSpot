<?php

namespace Tests\Feature;

use App\Models\Contribution;
use App\Models\Role;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContributorWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        foreach (['user', 'contributor', 'researcher', 'founder', 'admin', 'super_admin'] as $slug) {
            Role::factory()->create(['slug' => $slug, 'name' => str($slug)->title()->toString()]);
        }
    }

    public function test_public_directory_filters_eligible_profiles_and_only_shows_approved_contributions(): void
    {
        $contributor = $this->userWithRole('contributor', 'sarah');
        $skill = Skill::factory()->create(['name' => 'Research', 'slug' => 'research']);
        $contributor->profile->skills()->attach($skill);
        Contribution::factory()->approved()->create(['user_id' => $contributor->id]);
        Contribution::factory()->create(['user_id' => $contributor->id, 'status' => 'submitted', 'review_note' => 'private']);
        $this->userWithRole('user', 'regular');
        $this->userWithRole('contributor', 'suspended', 'suspended');

        $this->getJson('/api/v1/contributors?skill=research&search=sarah')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.username', 'sarah');
        $this->getJson('/api/v1/contributors/sarah')->assertOk()->assertJsonCount(1, 'data.contributor.contributions')
            ->assertJsonMissing(['review_note' => 'private']);
        $this->getJson('/api/v1/contributors/regular')->assertNotFound();
        $this->getJson('/api/v1/contributors/suspended')->assertNotFound();
    }

    public function test_profile_management_is_limited_to_authenticated_contributor_and_researcher(): void
    {
        $owner = $this->userWithRole('researcher', 'owner');
        $other = $this->userWithRole('contributor', 'other');
        $skill = Skill::factory()->create();

        $this->asUser($owner)->getJson('/api/v1/contributors/me')->assertOk()->assertJsonPath('data.contributor.username', 'owner');
        $this->asUser($owner)->patchJson('/api/v1/contributors/me', [
            'display_name' => 'Changed Name', 'skill_ids' => [$skill->id], 'user_id' => $other->id,
        ])->assertUnprocessable();
        $this->asUser($owner)->patchJson('/api/v1/contributors/me', ['display_name' => 'Changed Name', 'skill_ids' => [$skill->id]])
            ->assertOk()->assertJsonPath('data.contributor.display_name', 'Changed Name')->assertJsonPath('data.contributor.skills.0.slug', $skill->slug);
        $this->asUser($other)->assertDatabaseMissing('profiles', ['user_id' => $other->id, 'display_name' => 'Changed Name']);

        $regular = $this->userWithRole('user', 'normal');
        $this->asUser($regular)->patchJson('/api/v1/contributors/me', ['bio' => 'No'])->assertForbidden();
    }

    public function test_contribution_ownership_review_privacy_and_public_approval(): void
    {
        $owner = $this->userWithRole('contributor', 'owner');
        $other = $this->userWithRole('researcher', 'other');
        $admin = $this->userWithRole('admin', 'admin');

        $this->asUser($owner)->postJson('/api/v1/contributions', [
            'title' => 'Reviewed research', 'type' => 'research', 'description' => 'A contribution with evidence.', 'user_id' => $other->id,
        ])->assertUnprocessable();
        $this->asUser($owner)->postJson('/api/v1/contributions', [
            'title' => 'Reviewed research', 'type' => 'research', 'description' => 'A contribution with evidence.',
        ])->assertCreated()->assertJsonPath('data.contribution.status', 'draft');
        $contribution = Contribution::sole();

        $this->asUser($other)->postJson("/api/v1/contributions/{$contribution->id}/submit")->assertForbidden();
        $this->asUser($other)->getJson("/api/v1/contributions/{$contribution->id}")->assertForbidden();
        $this->asUser($owner)->patchJson("/api/v1/contributions/{$contribution->id}", ['description' => 'Updated contribution'])->assertOk();
        $this->asUser($other)->patchJson("/api/v1/contributions/{$contribution->id}", ['description' => 'IDOR'])->assertForbidden();
        $this->asUser($owner)->postJson("/api/v1/contributions/{$contribution->id}/submit")->assertCreated();
        $this->asUser($other)->postJson("/api/v1/contributions/{$contribution->id}/review", ['outcome' => 'under_review'])->assertForbidden();
        $this->asUser($admin)->postJson("/api/v1/contributions/{$contribution->id}/review", ['outcome' => 'approved'])->assertUnprocessable();
        $this->asUser($admin)->postJson("/api/v1/contributions/{$contribution->id}/review", ['outcome' => 'under_review'])->assertOk();
        $this->asUser($admin)->postJson("/api/v1/contributions/{$contribution->id}/review", ['outcome' => 'changes_requested', 'reason' => 'Please clarify evidence'])->assertOk();
        $this->asUser($owner)->getJson('/api/v1/contributions/mine')->assertJsonPath('data.0.review_note', 'Please clarify evidence');
        $this->getJson('/api/v1/contributors/owner')->assertJsonCount(0, 'data.contributor.contributions');

        $this->asUser($owner)->postJson("/api/v1/contributions/{$contribution->id}/submit")->assertCreated();
        $this->asUser($admin)->postJson("/api/v1/contributions/{$contribution->id}/review", ['outcome' => 'under_review'])->assertOk();
        $this->asUser($admin)->postJson("/api/v1/contributions/{$contribution->id}/review", ['outcome' => 'approved'])->assertOk();
        $this->getJson('/api/v1/contributors/owner')->assertJsonCount(1, 'data.contributor.contributions')
            ->assertJsonMissingPath('data.contributor.contributions.0.review_note');
        $this->assertDatabaseHas('contribution_status_history', ['contribution_id' => $contribution->id, 'new_status' => 'approved']);
    }

    public function test_contribution_author_cannot_review_their_own_submission(): void
    {
        $ownerAdmin = $this->userWithRole('admin', 'owner-admin');
        $contribution = Contribution::factory()->create(['user_id' => $ownerAdmin->id, 'status' => 'submitted']);

        $this->asUser($ownerAdmin)->postJson("/api/v1/contributions/{$contribution->id}/review", ['outcome' => 'under_review'])->assertForbidden();
    }

    private function userWithRole(string $role, string $username, string $status = 'active'): User
    {
        $user = User::factory()->create(['status' => $status]);
        $user->roles()->attach(Role::where('slug', $role)->firstOrFail());
        $user->profile()->create(['username' => $username, 'display_name' => ucfirst($username)]);

        return $user;
    }

    private function asUser(User $user): static
    {
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();

        return $this->withToken($user->createToken('test')->plainTextToken);
    }
}

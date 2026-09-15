<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['user', 'contributor', 'researcher', 'founder', 'admin', 'super_admin'] as $role) {
            Role::factory()->create(['slug' => $role, 'name' => str($role)->replace('_', ' ')->title()->toString()]);
        }
    }

    public function test_authenticated_user_creates_a_private_draft_owned_by_them(): void
    {
        $owner = User::factory()->create();
        $this->asUser($owner)->postJson('/api/v1/projects', $this->projectPayload())
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.project.status', 'draft');

        $project = Project::sole();
        $this->assertSame($owner->id, $project->owner_id);
        $this->assertSame('private', $project->visibility);
        $this->assertDatabaseHas('project_status_history', ['project_id' => $project->id, 'new_status' => 'draft']);
    }

    public function test_project_creation_requires_authentication_and_rejects_protected_fields(): void
    {
        $this->postJson('/api/v1/projects', $this->projectPayload())->assertUnauthorized();

        $owner = User::factory()->create();
        $other = User::factory()->create();
        $payload = array_merge($this->projectPayload(), [
            'owner_id' => $other->id,
            'status' => 'published',
            'visibility' => 'public',
            'published_at' => now()->toISOString(),
        ]);

        $this->asUser($owner)->postJson('/api/v1/projects', $payload)
            ->assertUnprocessable()
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');
        $this->assertDatabaseCount('projects', 0);
    }

    public function test_project_validation_and_slug_collision_handling(): void
    {
        $user = User::factory()->create();
        $this->asUser($user)->postJson('/api/v1/projects', ['name' => '', 'website_url' => 'javascript:alert(1)'])
            ->assertUnprocessable()
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');

        $this->asUser($user)->postJson('/api/v1/projects', $this->projectPayload(['name' => 'Same Name']))->assertCreated();
        $this->asUser($user)->postJson('/api/v1/projects', $this->projectPayload(['name' => 'Same Name']))->assertCreated();

        $this->assertDatabaseHas('projects', ['slug' => 'same-name']);
        $this->assertDatabaseHas('projects', ['slug' => 'same-name-2']);
    }

    public function test_private_projects_are_not_exposed_and_owner_can_access_them(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->getJson("/api/v1/projects/{$project->slug}")->assertNotFound();
        $this->asUser($other)->getJson("/api/v1/projects/{$project->slug}")->assertNotFound();
        $this->asUser($owner)->getJson("/api/v1/projects/{$project->slug}")
            ->assertOk()
            ->assertJsonPath('data.project.status', 'draft');
    }

    public function test_public_listing_is_paginated_and_does_not_include_drafts(): void
    {
        Project::factory()->published()->count(2)->create();
        Project::factory()->create();

        $this->getJson('/api/v1/projects?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.total', 2)
            ->assertJsonMissingPath('data.0.status');
        $this->getJson('/api/v1/projects?per_page=51')->assertUnprocessable();
    }

    public function test_owner_can_update_only_an_editable_project_and_cannot_change_protected_fields(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->asUser($owner)
            ->patchJson("/api/v1/projects/{$project->id}", ['tagline' => 'Updated tagline'])
            ->assertOk()
            ->assertJsonPath('data.project.tagline', 'Updated tagline');
        $this->asUser($other)
            ->patchJson("/api/v1/projects/{$project->id}", ['tagline' => 'Stolen'])
            ->assertForbidden();
        $this->asUser($owner)
            ->patchJson("/api/v1/projects/{$project->id}", ['status' => 'published'])
            ->assertUnprocessable();
    }

    public function test_owner_can_submit_once_and_other_users_cannot_submit_their_project(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->asUser($other)
            ->postJson("/api/v1/projects/{$project->id}/submit", ['message' => 'Mine now'])
            ->assertForbidden();
        $this->asUser($owner)
            ->postJson("/api/v1/projects/{$project->id}/submit", ['message' => 'Ready for review'])
            ->assertCreated()
            ->assertJsonPath('data.project.status', 'submitted');

        $this->assertDatabaseHas('project_submissions', ['project_id' => $project->id, 'submitted_by' => $owner->id, 'version' => 1]);
        $this->asUser($owner)
            ->postJson("/api/v1/projects/{$project->id}/submit", [])
            ->assertForbidden();
    }

    public function test_submission_access_is_scoped_to_owner_or_reviewer(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id, 'status' => 'submitted']);
        $submission = ProjectSubmission::factory()->create(['project_id' => $project->id, 'submitted_by' => $owner->id]);

        $this->asUser($other)->getJson("/api/v1/submissions/{$submission->id}")->assertForbidden();
        $this->asUser($owner)->getJson("/api/v1/submissions/{$submission->id}")->assertOk();
        $this->asUser($other)->getJson('/api/v1/submissions')->assertJsonCount(0, 'data');
    }

    public function test_only_non_owner_admin_can_review_and_valid_transitions_are_enforced(): void
    {
        $owner = User::factory()->create();
        $ordinary = User::factory()->create();
        $admin = $this->userWithRole('admin');
        $project = Project::factory()->create(['owner_id' => $owner->id, 'status' => 'submitted']);
        $submission = ProjectSubmission::factory()->create(['project_id' => $project->id, 'submitted_by' => $owner->id]);

        $this->asUser($ordinary)
            ->postJson("/api/v1/submissions/{$submission->id}/review", ['outcome' => 'under_review'])
            ->assertForbidden();
        $this->asUser($admin)
            ->postJson("/api/v1/submissions/{$submission->id}/review", ['outcome' => 'approved'])
            ->assertUnprocessable();
        $this->asUser($admin)
            ->postJson("/api/v1/submissions/{$submission->id}/review", ['outcome' => 'under_review'])
            ->assertOk()
            ->assertJsonPath('data.project.status', 'under_review');
        $this->asUser($admin)
            ->postJson("/api/v1/submissions/{$submission->id}/review", ['outcome' => 'approved'])
            ->assertOk()
            ->assertJsonPath('data.project.status', 'approved');

        $this->assertDatabaseHas('project_status_history', ['project_id' => $project->id, 'new_status' => 'approved', 'changed_by' => $admin->id]);
    }

    public function test_owner_with_admin_role_cannot_self_approve(): void
    {
        $ownerAdmin = $this->userWithRole('admin');
        $project = Project::factory()->create(['owner_id' => $ownerAdmin->id, 'status' => 'submitted']);
        $submission = ProjectSubmission::factory()->create(['project_id' => $project->id, 'submitted_by' => $ownerAdmin->id]);

        $this->asUser($ownerAdmin)
            ->postJson("/api/v1/submissions/{$submission->id}/review", ['outcome' => 'under_review'])
            ->assertForbidden();
    }

    public function test_approved_project_can_be_published_by_a_reviewer(): void
    {
        $admin = $this->userWithRole('admin');
        $project = Project::factory()->create(['status' => 'approved']);

        $this->asUser($admin)
            ->postJson("/api/v1/projects/{$project->id}/publish")
            ->assertOk();

        $this->assertDatabaseHas('projects', ['id' => $project->id, 'status' => 'published', 'visibility' => 'public']);
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/v1/projects/{$project->slug}")->assertOk()->assertJsonMissingPath('data.project.status');
    }

    private function projectPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Echo Project',
            'tagline' => 'A privacy-first community discovery tool.',
            'description' => 'A sufficiently detailed project description for review.',
            'website_url' => 'https://example.test',
        ], $overrides);
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('slug', $role)->sole());

        return $user;
    }

    private function asUser(User $user): static
    {
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();

        return $this->withToken($user->createToken('test')->plainTextToken);
    }
}

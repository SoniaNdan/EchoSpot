<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IdentityFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_be_created_with_an_active_status(): void
    {
        $user = User::factory()->create();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 'active',
        ]);
        $this->assertNotSame('password', $user->password);
    }

    public function test_user_email_is_unique(): void
    {
        User::factory()->create(['email' => 'duplicate@echospot.test']);

        $this->expectException(QueryException::class);

        User::factory()->create(['email' => 'duplicate@echospot.test']);
    }

    public function test_users_can_have_multiple_roles(): void
    {
        $user = User::factory()->create();
        $userRole = Role::factory()->create(['slug' => 'user']);
        $contributorRole = Role::factory()->create(['slug' => 'contributor']);

        $user->roles()->attach([$userRole->id, $contributorRole->id]);

        $this->assertCount(2, $user->fresh()->roles);
    }

    public function test_duplicate_user_role_assignment_is_rejected(): void
    {
        $user = User::factory()->create();
        $role = Role::factory()->create();
        $user->roles()->attach($role);

        $this->expectException(QueryException::class);

        $user->roles()->attach($role);
    }

    public function test_profile_and_preferences_belong_to_one_user(): void
    {
        $user = User::factory()->create();
        $profile = Profile::factory()->create(['user_id' => $user->id]);
        $preferences = UserPreference::create(['user_id' => $user->id]);

        $this->assertTrue($profile->user->is($user));
        $this->assertTrue($preferences->user->is($user));
        $this->assertTrue($user->fresh()->profile->is($profile));
        $this->assertTrue($user->fresh()->preferences->is($preferences));
    }

    public function test_profile_and_preferences_are_unique_per_user(): void
    {
        $user = User::factory()->create();
        Profile::factory()->create(['user_id' => $user->id]);

        $this->expectException(QueryException::class);
        Profile::factory()->create(['user_id' => $user->id]);
    }

    public function test_assigned_roles_cannot_be_deleted(): void
    {
        $user = User::factory()->create();
        $role = Role::factory()->create();
        $user->roles()->attach($role);

        $this->expectException(QueryException::class);
        $role->delete();
    }

    public function test_profile_and_preferences_are_removed_with_the_user(): void
    {
        $user = User::factory()->create();
        Profile::factory()->create(['user_id' => $user->id]);
        UserPreference::create(['user_id' => $user->id]);

        $user->delete();

        $this->assertDatabaseCount('profiles', 0);
        $this->assertDatabaseCount('user_preferences', 0);
    }

    public function test_user_role_assignments_are_removed_with_the_user(): void
    {
        $user = User::factory()->create();
        $role = Role::factory()->create();
        $user->roles()->attach($role);

        $user->delete();

        $this->assertDatabaseCount('user_roles', 0);
    }

    public function test_sanctum_tokens_can_be_created_for_a_user(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token');

        $this->assertNotEmpty($token->plainTextToken);
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
            'name' => 'test-token',
        ]);
    }
}

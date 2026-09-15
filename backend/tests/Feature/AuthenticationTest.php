<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::factory()->create(['slug' => 'user', 'name' => 'User']);
        Role::factory()->create(['slug' => 'contributor', 'name' => 'Contributor']);
        Role::factory()->create(['slug' => 'researcher', 'name' => 'Researcher']);
        Role::factory()->create(['slug' => 'founder', 'name' => 'Founder']);
        Role::factory()->create(['slug' => 'admin', 'name' => 'Admin']);
        Role::factory()->create(['slug' => 'super_admin', 'name' => 'Super Admin']);
    }

    public function test_valid_registration_creates_identity_profile_preferences_and_default_role(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New Contributor',
            'email' => 'new@echospot.test',
            'password' => 'StrongPass1',
            'password_confirmation' => 'StrongPass1',
        ]);

        $response->assertCreated()->assertJsonPath('success', true)->assertJsonStructure([
            'data' => [
                'user' => ['id', 'roles'],
                'token',
                'token_type',
            ],
        ]);
        $this->assertDatabaseHas('users', ['email' => 'new@echospot.test', 'status' => 'active']);
        $user = User::where('email', 'new@echospot.test')->firstOrFail();
        $this->assertTrue(Hash::check('StrongPass1', $user->password));
        $this->assertTrue($user->roles->contains('slug', 'user'));
        $this->assertNotNull($user->profile);
        $this->assertNotNull($user->preferences);
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_registration_rejects_privilege_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Unsafe User',
            'email' => 'unsafe@echospot.test',
            'password' => 'StrongPass1',
            'password_confirmation' => 'StrongPass1',
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now()->toISOString(),
            'is_admin' => true,
        ]);

        $response->assertStatus(422)->assertJsonPath('error.code', 'VALIDATION_ERROR');
        $this->assertDatabaseMissing('users', ['email' => 'unsafe@echospot.test']);
    }

    public function test_registration_validates_email_password_and_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Invalid User',
            'email' => 'not-an-email',
            'password' => 'weak',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422)->assertJsonPath('error.code', 'VALIDATION_ERROR');
        $this->assertArrayHasKey('email', $response->json('error.fields'));
        $this->assertArrayHasKey('password', $response->json('error.fields'));
    }

    public function test_duplicate_registration_fails(): void
    {
        User::factory()->create(['email' => 'existing@echospot.test']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Existing User',
            'email' => 'existing@echospot.test',
            'password' => 'StrongPass1',
            'password_confirmation' => 'StrongPass1',
        ])->assertStatus(422)->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    public function test_valid_login_returns_bearer_token(): void
    {
        $user = User::factory()->create(['email' => 'login@echospot.test', 'password' => 'StrongPass1']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'login@echospot.test',
            'password' => 'StrongPass1',
        ])->assertOk()->assertJsonPath('data.token_type', 'Bearer')->assertJsonMissingPath('data.user.password');

        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertNotNull($user->fresh());
    }

    public function test_invalid_credentials_are_generic(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'missing@echospot.test',
            'password' => 'WrongPass1',
        ])->assertUnauthorized()->assertExactJson([
            'success' => false,
            'error' => [
                'code' => 'INVALID_CREDENTIALS',
                'message' => 'Invalid credentials.',
            ],
        ]);
    }

    public function test_suspended_and_banned_users_cannot_login(): void
    {
        foreach (['suspended', 'banned'] as $status) {
            User::factory()->create([
                'email' => $status.'@echospot.test',
                'password' => 'StrongPass1',
                'status' => $status,
            ]);

            $this->postJson('/api/v1/auth/login', [
                'email' => $status.'@echospot.test',
                'password' => 'StrongPass1',
            ])->assertUnauthorized()->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
        }
    }

    public function test_pending_users_can_login_but_remain_pending_until_verified(): void
    {
        $user = User::factory()->create([
            'email' => 'pending@echospot.test',
            'password' => 'StrongPass1',
            'status' => 'pending',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'StrongPass1',
        ]);

        $response->assertOk()->assertJsonPath('data.user.status', 'pending');
    }

    public function test_suspended_and_banned_users_cannot_use_existing_tokens(): void
    {
        foreach (['suspended', 'banned'] as $status) {
            $user = User::factory()->create(['status' => $status]);
            $token = $user->createToken('before-status-change')->plainTextToken;

            $this->withToken($token)->getJson('/api/v1/auth/me')
                ->assertForbidden()
                ->assertJsonPath('error.code', 'FORBIDDEN');

            $this->assertDatabaseCount('personal_access_tokens', 0);
            $this->app['auth']->forgetGuards();
        }
    }

    public function test_current_user_requires_authentication_and_never_exposes_secrets(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized()->assertJsonPath('error.code', 'UNAUTHENTICATED');

        $user = User::factory()->create(['password' => 'StrongPass1']);
        $user->roles()->attach(Role::where('slug', 'user')->first());
        Profile::factory()->create(['user_id' => $user->id]);
        UserPreference::create(['user_id' => $user->id]);
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonStructure(['data' => ['user', 'profile', 'preferences']])
            ->assertJsonMissingPath('data.user.password')
            ->assertJsonMissingPath('data.user.token')
            ->assertJsonMissingPath('data.user.password_hash');
    }

    public function test_logout_revokes_only_the_current_token(): void
    {
        $user = User::factory()->create();
        $first = $user->createToken('first')->plainTextToken;
        $second = $user->createToken('second')->plainTextToken;

        $this->withToken($first)->postJson('/api/v1/auth/logout')->assertOk();
        $this->app['auth']->forgetGuards();
        $this->withToken($first)->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->app['auth']->forgetGuards();
        $this->withToken($second)->getJson('/api/v1/auth/me')->assertOk();
    }

    public function test_password_reset_is_generic_and_single_use(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'reset@echospot.test', 'password' => 'OldPass1']);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'missing@echospot.test'])
            ->assertOk()->assertJsonPath('success', true);
        $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email])
            ->assertOk()->assertJsonPath('success', true);
        Notification::assertSentTo($user, ResetPassword::class);

        $token = Password::createToken($user);
        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'NewPass1',
            'password_confirmation' => 'NewPass1',
        ])->assertOk();

        $this->assertTrue(Hash::check('NewPass1', $user->fresh()->password));
        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'AnotherPass1',
            'password_confirmation' => 'AnotherPass1',
        ])->assertStatus(422)->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    public function test_expired_password_reset_token_is_rejected(): void
    {
        $user = User::factory()->create(['password' => 'OldPass1']);
        $token = Password::createToken($user);
        DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->update(['created_at' => now()->subMinutes(61)]);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'NewPass1',
            'password_confirmation' => 'NewPass1',
        ])->assertStatus(422)->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    public function test_email_verification_requires_a_valid_signed_url_and_matching_user(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email_verified_at' => null]);
        $token = $user->createToken('verify')->plainTextToken;
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(10), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->withToken($token)->getJson($url)->assertOk();
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->withToken($token)->getJson($url)->assertOk();

        $invalidUrl = URL::temporarySignedRoute('verification.verify', now()->addMinutes(10), [
            'id' => $user->id,
            'hash' => sha1('wrong@example.test'),
        ]);
        $this->withToken($token)->getJson($invalidUrl)->assertForbidden();

        $expiredUrl = URL::temporarySignedRoute('verification.verify', now()->subMinute(), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);
        $this->withToken($token)->getJson($expiredUrl)->assertForbidden();
    }

    public function test_role_authorization_is_enforced_by_middleware(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('slug', 'user')->first());
        $userToken = $user->createToken('user')->plainTextToken;

        $this->withToken($userToken)->getJson('/api/v1/auth/authorization/admin-check')
            ->assertForbidden()->assertJsonPath('error.code', 'FORBIDDEN');

        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('slug', 'admin')->first());
        $this->assertTrue($admin->fresh()->hasRole('admin'));
        $adminToken = $admin->createToken('admin')->plainTextToken;
        $this->app['auth']->forgetGuards();
        $this->withToken($adminToken)->getJson('/api/v1/auth/me')->assertJsonPath('data.user.id', $admin->id);
        $this->app['auth']->forgetGuards();

        $this->withToken($adminToken)->getJson('/api/v1/auth/authorization/admin-check')
            ->assertOk()->assertJsonPath('data.authorized', true);
    }

    public function test_role_boundaries_are_enforced(): void
    {
        $contributor = User::factory()->create();
        $contributor->roles()->attach(Role::where('slug', 'contributor')->sole());
        $contributorToken = $contributor->createToken('contributor')->plainTextToken;

        $this->withToken($contributorToken)->getJson('/api/v1/auth/authorization/contributor-check')->assertOk();
        $this->app['auth']->forgetGuards();
        $this->withToken($contributorToken)->getJson('/api/v1/auth/authorization/founder-check')->assertForbidden();
        $this->app['auth']->forgetGuards();

        $founder = User::factory()->create();
        $founder->roles()->attach(Role::where('slug', 'founder')->sole());
        $founderToken = $founder->createToken('founder')->plainTextToken;
        $this->withToken($founderToken)->getJson('/api/v1/auth/authorization/admin-check')->assertForbidden();
        $this->app['auth']->forgetGuards();

        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('slug', 'admin')->sole());
        $adminToken = $admin->createToken('admin')->plainTextToken;
        $this->withToken($adminToken)->getJson('/api/v1/auth/authorization/super-admin-check')->assertForbidden();
    }

    public function test_pending_user_cannot_use_a_role_protected_endpoint(): void
    {
        $user = User::factory()->create(['status' => 'pending']);
        $user->roles()->attach(Role::where('slug', 'admin')->sole());
        $token = $user->createToken('pending-admin')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/auth/authorization/admin-check')->assertForbidden();
    }

    public function test_invalid_and_revoked_tokens_are_rejected(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test');
        $this->withToken('not-a-real-token')->getJson('/api/v1/auth/me')->assertUnauthorized();
        $token->accessToken->delete();
        $this->withToken($token->plainTextToken)->getJson('/api/v1/auth/me')->assertUnauthorized();
    }
}

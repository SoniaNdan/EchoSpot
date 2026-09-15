<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $user = User::create([
                'name' => $request->string('name')->toString(),
                'email' => $request->string('email')->lower()->toString(),
                'password' => $request->string('password')->toString(),
            ]);

            Profile::create([
                'user_id' => $user->id,
                'username' => $this->uniqueUsername($user->name),
                'display_name' => $user->name,
                'joined_at' => now(),
            ]);
            UserPreference::create(['user_id' => $user->id]);
            $user->roles()->attach(Role::query()->where('slug', 'user')->sole()->id);

            return $user;
        });

        $user->sendEmailVerificationNotification();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $this->userPayload($user->fresh(['roles', 'profile', 'preferences'])),
                'token' => $this->issueToken($user),
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email')->lower())->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password) || in_array($user->status, ['suspended', 'banned'], true)) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INVALID_CREDENTIALS',
                    'message' => 'Invalid credentials.',
                ],
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $this->userPayload($user->load(['roles', 'profile', 'preferences'])),
                'token' => $this->issueToken($user),
                'token_type' => 'Bearer',
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        if ($token) {
            $request->user()->tokens()->whereKey($token->getKey())->delete();
        }

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Signed out successfully.'],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'profile', 'preferences']);

        return response()->json([
            'success' => true,
            'data' => $this->identityPayload($user),
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink(['email' => $request->string('email')->lower()->toString()]);

        return response()->json([
            'success' => true,
            'data' => ['message' => 'If an account exists for that email, reset instructions have been sent.'],
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();
                $user->tokens()->delete();
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => ['The password reset token is invalid or expired.'],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Password reset successfully.'],
        ]);
    }

    public function verifyEmail(Request $request, User $id, string $hash): JsonResponse
    {
        abort_unless(hash_equals(sha1($id->getEmailForVerification()), $hash), 403);
        abort_unless($request->user()->is($id), 403);

        if (! $id->hasVerifiedEmail()) {
            $id->markEmailAsVerified();
            event(new Verified($id));
        }

        return response()->json([
            'success' => true,
            'data' => ['message' => 'Email address verified.'],
        ]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'success' => true,
            'data' => ['message' => 'If verification is required, instructions have been sent.'],
        ]);
    }

    private function uniqueUsername(string $name): string
    {
        $base = Str::of($name)->slug()->limit(70, '')->toString() ?: 'user';
        $username = $base;
        $suffix = 1;

        while (Profile::query()->where('username', $username)->exists()) {
            $username = $base.'-'.$suffix++;
        }

        return $username;
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'email_verified_at' => $user->email_verified_at,
            'roles' => $user->roles->pluck('slug')->values(),
        ];
    }

    private function identityPayload(User $user): array
    {
        return [
            'user' => $this->userPayload($user),
            'profile' => $user->profile ? [
                'username' => $user->profile->username,
                'display_name' => $user->profile->display_name,
                'bio' => $user->profile->bio,
                'avatar_path' => $user->profile->avatar_path,
                'joined_at' => $user->profile->joined_at,
            ] : null,
            'preferences' => $user->preferences ? [
                'research_updates' => $user->preferences->research_updates,
                'security_notifications' => $user->preferences->security_notifications,
            ] : null,
        ];
    }

    private function issueToken(User $user): string
    {
        return $user->createToken('api', ['*'], now()->addMinutes((int) config('sanctum.expiration')))->plainTextToken;
    }
}

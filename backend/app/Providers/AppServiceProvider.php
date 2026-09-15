<?php

namespace App\Providers;

use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Policies\ProjectPolicy;
use App\Policies\ProjectSubmissionPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(ProjectSubmission::class, ProjectSubmissionPolicy::class);

        Gate::define('access-contributor', fn ($user): bool => $user->hasAnyRole(['contributor', 'researcher', 'admin', 'super_admin']));
        Gate::define('access-founder', fn ($user): bool => $user->hasAnyRole(['founder', 'admin', 'super_admin']));
        Gate::define('access-admin', fn ($user): bool => $user->hasAnyRole(['admin', 'super_admin']));
        Gate::define('manage-roles', fn ($user): bool => $user->hasRole('super_admin'));

        RateLimiter::for('auth-register', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
        RateLimiter::for('auth-login', fn (Request $request) => Limit::perMinute(10)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('auth-forgot-password', fn (Request $request) => Limit::perMinute(3)->by(strtolower((string) $request->input('email')).'|'.$request->ip()));
        RateLimiter::for('auth-reset-password', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
        RateLimiter::for('auth-email-verification', fn (Request $request) => Limit::perMinute(6)->by((string) ($request->user()?->id ?? $request->ip())));
    }
}

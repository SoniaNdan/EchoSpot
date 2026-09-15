<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $roles = collect($roles)
            ->flatMap(fn (string $role): array => explode(',', $role))
            ->filter()
            ->values()
            ->all();

        if (! $user || ! $user->hasAnyRole($roles)) {
            abort(403);
        }

        return $next($request);
    }
}

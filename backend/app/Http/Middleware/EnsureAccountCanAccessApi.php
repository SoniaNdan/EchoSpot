<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountCanAccessApi
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && in_array($user->status, ['suspended', 'banned'], true)) {
            // Presenting a token after an account is blocked invalidates every
            // active token for that account, including tokens on other devices.
            $user->tokens()->delete();

            abort(403);
        }

        return $next($request);
    }
}

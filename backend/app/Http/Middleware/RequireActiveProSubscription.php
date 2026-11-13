<?php

namespace App\Http\Middleware;

use App\Services\AI\ProSubscriptionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireActiveProSubscription
{
    public function __construct(private readonly ProSubscriptionService $subscriptions) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $this->subscriptions->currentActivePro($request->user())) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'PRO_SUBSCRIPTION_REQUIRED',
                    'message' => 'An active Pro subscription is required to use EchoSpot AI.',
                ],
            ], 403);
        }

        return $next($request);
    }
}

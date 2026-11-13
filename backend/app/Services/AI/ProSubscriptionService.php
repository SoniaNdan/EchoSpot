<?php

namespace App\Services\AI;

use App\Models\Subscription;
use App\Models\User;

class ProSubscriptionService
{
    public function currentActivePro(User $user, bool $lockForUpdate = false): ?Subscription
    {
        $query = Subscription::query()->where('user_id', $user->id)
            ->where('plan_key', 'pro')
            ->where('status', 'active')
            ->where('current_period_starts_at', '<=', now())
            ->where('current_period_ends_at', '>', now());

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        return $query->first();
    }
}

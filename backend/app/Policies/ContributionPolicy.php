<?php

namespace App\Policies;

use App\Models\Contribution;
use App\Models\User;

class ContributionPolicy
{
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['contributor', 'researcher']);
    }

    public function view(User $user, Contribution $contribution): bool
    {
        return $contribution->user_id === $user->id || $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function update(User $user, Contribution $contribution): bool
    {
        return $contribution->user_id === $user->id
            && in_array($contribution->status, ['draft', 'changes_requested'], true);
    }

    public function submit(User $user, Contribution $contribution): bool
    {
        return $this->update($user, $contribution);
    }

    public function review(User $user, Contribution $contribution): bool
    {
        return $contribution->user_id !== $user->id && $user->hasAnyRole(['admin', 'super_admin']);
    }
}

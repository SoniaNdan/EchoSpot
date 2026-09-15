<?php

namespace App\Policies;

use App\Models\ProjectSubmission;
use App\Models\User;

class ProjectSubmissionPolicy
{
    public function view(User $user, ProjectSubmission $submission): bool
    {
        return $submission->project->owner_id === $user->id
            || $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function review(User $user, ProjectSubmission $submission): bool
    {
        return $submission->project->owner_id !== $user->id
            && $user->hasAnyRole(['admin', 'super_admin']);
    }
}

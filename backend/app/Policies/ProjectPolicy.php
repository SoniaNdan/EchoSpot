<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(?User $user, Project $project): bool
    {
        return $project->isPublic()
            || ($user && ($project->owner_id === $user->id || $this->canReview($user)));
    }

    public function update(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            && in_array($project->status, ['draft', 'changes_requested'], true);
    }

    public function submit(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            && in_array($project->status, ['draft', 'changes_requested'], true);
    }

    public function review(User $user, Project $project): bool
    {
        return $project->owner_id !== $user->id && $this->canReview($user);
    }

    public function publish(User $user, Project $project): bool
    {
        return $this->canReview($user) && $project->status === 'approved';
    }

    public function archive(User $user, Project $project): bool
    {
        return ($project->owner_id === $user->id && in_array($project->status, ['draft', 'changes_requested'], true))
            || ($this->canReview($user) && in_array($project->status, ['approved', 'published'], true));
    }

    private function canReview(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }
}

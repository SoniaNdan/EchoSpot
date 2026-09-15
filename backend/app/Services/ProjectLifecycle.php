<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProjectLifecycle
{
    public function recordCreation(Project $project, User $actor): void
    {
        $this->record($project, null, 'draft', $actor, null);
    }

    public function submit(Project $project, User $actor, ?string $message): Project
    {
        return DB::transaction(function () use ($project, $actor, $message): Project {
            $project->refresh();
            $this->transition($project, 'submitted', $actor, $message, ['draft', 'changes_requested']);

            $project->submissions()->create([
                'submitted_by' => $actor->id,
                'version' => ((int) $project->submissions()->max('version')) + 1,
                'message' => $message,
                'submitted_at' => now(),
            ]);

            return $project->fresh();
        });
    }

    public function review(Project $project, User $actor, string $outcome, ?string $reason): Project
    {
        $allowedSources = match ($outcome) {
            'under_review' => ['submitted'],
            'changes_requested', 'approved', 'rejected' => ['under_review'],
            default => [],
        };

        return DB::transaction(function () use ($project, $actor, $outcome, $reason, $allowedSources): Project {
            $project->refresh();
            $this->transition($project, $outcome, $actor, $reason, $allowedSources);

            return $project->fresh();
        });
    }

    public function publish(Project $project, User $actor): Project
    {
        return DB::transaction(function () use ($project, $actor): Project {
            $project->refresh();
            $this->transition($project, 'published', $actor, null, ['approved'], [
                'visibility' => 'public',
                'published_at' => now(),
            ]);

            return $project->fresh();
        });
    }

    public function archive(Project $project, User $actor): Project
    {
        return DB::transaction(function () use ($project, $actor): Project {
            $project->refresh();
            $this->transition($project, 'archived', $actor, null, ['draft', 'changes_requested', 'approved', 'published']);

            return $project->fresh();
        });
    }

    private function transition(Project $project, string $to, User $actor, ?string $reason, array $from, array $attributes = []): void
    {
        if (! in_array($project->status, $from, true)) {
            throw ValidationException::withMessages([
                'status' => ["The project cannot transition from {$project->status} to {$to}."],
            ]);
        }

        $previous = $project->status;
        $project->forceFill(array_merge(['status' => $to], $attributes))->save();
        $this->record($project, $previous, $to, $actor, $reason);
    }

    private function record(Project $project, ?string $previous, string $new, User $actor, ?string $reason): void
    {
        ProjectStatusHistory::create([
            'project_id' => $project->id,
            'previous_status' => $previous,
            'new_status' => $new,
            'changed_by' => $actor->id,
            'reason' => $reason,
        ]);
    }
}

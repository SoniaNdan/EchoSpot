<?php

namespace App\Services;

use App\Models\Contribution;
use App\Models\ContributionStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContributionLifecycle
{
    public function created(Contribution $contribution, User $actor): void
    {
        $this->record($contribution, null, 'draft', $actor, null);
    }

    public function submit(Contribution $contribution, User $actor): Contribution
    {
        return $this->transition($contribution, $actor, 'submitted', ['draft', 'changes_requested'], ['submitted_at' => now()]);
    }

    public function review(Contribution $contribution, User $actor, string $outcome, ?string $reason): Contribution
    {
        $from = $outcome === 'under_review' ? ['submitted'] : ['under_review'];

        return $this->transition($contribution, $actor, $outcome, $from, ['reviewed_by' => $actor->id, 'review_note' => $reason], $reason);
    }

    private function transition(Contribution $contribution, User $actor, string $to, array $from, array $attributes = [], ?string $reason = null): Contribution
    {
        return DB::transaction(function () use ($contribution, $actor, $to, $from, $attributes, $reason): Contribution {
            $contribution = Contribution::query()->lockForUpdate()->findOrFail($contribution->id);
            if (! in_array($contribution->status, $from, true)) {
                throw ValidationException::withMessages(['status' => ["The contribution cannot transition from {$contribution->status} to {$to}."]]);
            }

            $previous = $contribution->status;
            $contribution->forceFill(array_merge(['status' => $to], $attributes))->save();
            $this->record($contribution, $previous, $to, $actor, $reason);

            return $contribution->fresh(['contributor.profile']);
        });
    }

    private function record(Contribution $contribution, ?string $previous, string $new, User $actor, ?string $reason): void
    {
        ContributionStatusHistory::create([
            'contribution_id' => $contribution->id,
            'previous_status' => $previous,
            'new_status' => $new,
            'changed_by' => $actor->id,
            'reason' => $reason,
        ]);
    }
}

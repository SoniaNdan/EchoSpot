<?php

namespace App\Services;

use App\Models\ResearchArticle;
use App\Models\ResearchArticleStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ResearchArticleLifecycle
{
    public function created(ResearchArticle $article, User $actor): void
    {
        $this->record($article, null, 'draft', $actor, null);
    }

    public function submit(ResearchArticle $article, User $actor): ResearchArticle
    {
        return $this->transition($article, $actor, 'submitted', ['draft', 'changes_requested'], ['submitted_at' => now()]);
    }

    public function review(ResearchArticle $article, User $actor, string $outcome, ?string $reason): ResearchArticle
    {
        $from = $outcome === 'under_review' ? ['submitted'] : ['under_review'];

        return $this->transition($article, $actor, $outcome, $from, ['reviewed_by' => $actor->id, 'review_note' => $reason], $reason);
    }

    public function publish(ResearchArticle $article, User $actor): ResearchArticle
    {
        return $this->transition($article, $actor, 'published', ['approved'], ['published_at' => now()]);
    }

    private function transition(ResearchArticle $article, User $actor, string $to, array $from, array $attributes = [], ?string $reason = null): ResearchArticle
    {
        return DB::transaction(function () use ($article, $actor, $to, $from, $attributes, $reason): ResearchArticle {
            $article = ResearchArticle::query()->lockForUpdate()->findOrFail($article->id);
            if (! in_array($article->status, $from, true)) {
                throw ValidationException::withMessages(['status' => ["The article cannot transition from {$article->status} to {$to}."]]);
            }

            $previous = $article->status;
            $article->forceFill(array_merge(['status' => $to], $attributes))->save();
            $this->record($article, $previous, $to, $actor, $reason);

            return $article->fresh(['author.profile', 'category', 'tags', 'project']);
        });
    }

    private function record(ResearchArticle $article, ?string $previous, string $new, User $actor, ?string $reason): void
    {
        ResearchArticleStatusHistory::create([
            'research_article_id' => $article->id,
            'previous_status' => $previous,
            'new_status' => $new,
            'changed_by' => $actor->id,
            'reason' => $reason,
        ]);
    }
}

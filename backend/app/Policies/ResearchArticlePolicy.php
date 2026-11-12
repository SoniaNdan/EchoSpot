<?php

namespace App\Policies;

use App\Models\ResearchArticle;
use App\Models\User;

class ResearchArticlePolicy
{
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['contributor', 'researcher']);
    }

    public function view(User $user, ResearchArticle $article): bool
    {
        return $article->author_id === $user->id || $this->canReview($user);
    }

    public function update(User $user, ResearchArticle $article): bool
    {
        return $article->author_id === $user->id && in_array($article->status, ['draft', 'changes_requested'], true);
    }

    public function submit(User $user, ResearchArticle $article): bool
    {
        return $this->update($user, $article);
    }

    public function review(User $user, ResearchArticle $article): bool
    {
        return $article->author_id !== $user->id && $this->canReview($user);
    }

    public function publish(User $user, ResearchArticle $article): bool
    {
        return $this->canReview($user);
    }

    private function canReview(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }
}

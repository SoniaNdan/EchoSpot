<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResearchArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isAuthor = $user && (int) $this->author_id === (int) $user->id;
        $isReviewer = $user && $user->hasAnyRole(['admin', 'super_admin']);
        $includePrivate = $isAuthor || $isReviewer;

        return array_filter([
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'summary' => $this->summary,
            'content' => $this->content,
            'category' => $this->whenLoaded('category', fn () => $this->category->slug),
            'category_name' => $this->whenLoaded('category', fn () => $this->category->name),
            'topic' => $this->topic,
            'ecosystem' => $this->ecosystem,
            'cover_image_url' => $this->cover_image_url,
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($tag) => ['slug' => $tag->slug, 'name' => $tag->name])->values()),
            'project' => $this->whenLoaded('project', fn () => $this->project && $this->project->isPublic()
                ? ['slug' => $this->project->slug, 'name' => $this->project->name]
                : null),
            'author' => $this->whenLoaded('author', fn () => $this->author?->profile
                ? ['username' => $this->author->profile->username, 'display_name' => $this->author->profile->display_name, 'avatar_path' => $this->author->profile->avatar_path]
                : null),
            'status' => $this->status,
            'review_note' => $includePrivate ? $this->review_note : null,
            'published_at' => $this->published_at,
            'reading_minutes' => max(1, (int) ceil(str_word_count(strip_tags((string) $this->content)) / 220)),
            'created_at' => $includePrivate ? $this->created_at : null,
            'updated_at' => $includePrivate ? $this->updated_at : null,
        ], static fn (mixed $value): bool => $value !== null);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearchArticle extends Model
{
    use HasFactory;

    public const STATUSES = ['draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected', 'published'];

    protected $attributes = ['status' => 'draft'];

    protected $fillable = ['slug', 'category_id', 'project_id', 'title', 'summary', 'content', 'topic', 'ecosystem', 'cover_image_url'];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime', 'published_at' => 'datetime'];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ResearchCategory::class, 'category_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'research_article_tag');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ResearchArticleStatusHistory::class);
    }
}

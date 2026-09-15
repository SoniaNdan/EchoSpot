<?php

namespace App\Models;

use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    public const STATUSES = ['draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'published', 'rejected', 'archived'];

    protected $fillable = [
        'name',
        'tagline',
        'description',
        'logo_path',
        'website_url',
    ];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ProjectSubmission::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ProjectStatusHistory::class);
    }

    public function isPublic(): bool
    {
        return $this->status === 'published' && $this->visibility === 'public';
    }
}

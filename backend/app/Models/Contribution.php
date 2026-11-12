<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contribution extends Model
{
    use HasFactory;

    public const STATUSES = ['draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected'];

    protected $attributes = ['status' => 'draft'];

    protected $fillable = ['title', 'type', 'description', 'evidence_url'];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime'];
    }

    public function contributor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ContributionStatusHistory::class);
    }
}

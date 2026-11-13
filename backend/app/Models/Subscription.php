<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    public const STATUSES = ['active', 'expired', 'cancelled'];

    protected $fillable = [
        'user_id', 'plan_key', 'status', 'billing_interval', 'current_period_starts_at', 'current_period_ends_at',
    ];

    protected function casts(): array
    {
        return [
            'current_period_starts_at' => 'datetime',
            'current_period_ends_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function usageRecords(): HasMany
    {
        return $this->hasMany(AiUsageRecord::class);
    }
}

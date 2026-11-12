<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContributionStatusHistory extends Model
{
    protected $table = 'contribution_status_history';

    protected $fillable = ['contribution_id', 'previous_status', 'new_status', 'changed_by', 'reason'];

    public function contribution(): BelongsTo
    {
        return $this->belongsTo(Contribution::class);
    }
}

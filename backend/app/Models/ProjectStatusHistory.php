<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectStatusHistory extends Model
{
    protected $table = 'project_status_history';

    protected $fillable = ['project_id', 'previous_status', 'new_status', 'changed_by', 'reason'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}

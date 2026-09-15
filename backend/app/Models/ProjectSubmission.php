<?php

namespace App\Models;

use Database\Factories\ProjectSubmissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectSubmission extends Model
{
    /** @use HasFactory<ProjectSubmissionFactory> */
    use HasFactory;

    protected $fillable = ['project_id', 'submitted_by', 'version', 'message', 'submitted_at'];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime'];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}

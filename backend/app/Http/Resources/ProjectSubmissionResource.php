<?php

namespace App\Http\Resources;

use App\Models\ProjectSubmission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProjectSubmission */
class ProjectSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_slug' => $this->project->slug,
            'version' => $this->version,
            'message' => $this->message,
            'submitted_at' => $this->submitted_at,
        ];
    }
}

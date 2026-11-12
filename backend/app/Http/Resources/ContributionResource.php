<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContributionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isOwner = $user && (int) $this->user_id === (int) $user->id;
        $isReviewer = $user && $user->hasAnyRole(['admin', 'super_admin']);

        return array_filter([
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->type,
            'description' => $this->description,
            'evidence_url' => $this->evidence_url,
            'status' => $this->status,
            'review_note' => ($isOwner || $isReviewer) ? $this->review_note : null,
            'contributor' => $this->whenLoaded('contributor', fn () => $this->contributor?->profile
                ? ['username' => $this->contributor->profile->username, 'display_name' => $this->contributor->profile->display_name]
                : null),
            'submitted_at' => $this->submitted_at,
            'created_at' => ($isOwner || $isReviewer) ? $this->created_at : null,
            'updated_at' => ($isOwner || $isReviewer) ? $this->updated_at : null,
        ], static fn (mixed $value): bool => $value !== null);
    }
}

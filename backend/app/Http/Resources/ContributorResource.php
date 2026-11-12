<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContributorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->profile;

        return [
            'username' => $profile?->username,
            'display_name' => $profile?->display_name,
            'bio' => $profile?->bio,
            'avatar_path' => $profile?->avatar_path,
            'joined_at' => $profile?->joined_at,
            'roles' => $this->roles->whereIn('slug', ['contributor', 'researcher'])->pluck('slug')->values(),
            'skills' => $profile?->skills->map(fn ($skill) => ['slug' => $skill->slug, 'name' => $skill->name])->values() ?? collect(),
            'contributions' => $this->whenLoaded('contributions', fn () => $this->contributions->map(fn ($contribution) => [
                'id' => $contribution->id,
                'title' => $contribution->title,
                'type' => $contribution->type,
                'description' => $contribution->description,
                'date' => $contribution->updated_at,
            ])->values()),
        ];
    }
}

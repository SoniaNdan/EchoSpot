<?php

namespace App\Http\Resources;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

/** @mixin Project */
class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = Auth::guard('sanctum')->user();
        $isOwner = $user && $this->owner_id === $user->id;
        $canReview = $user && $user->hasAnyRole(['admin', 'super_admin']);

        return array_filter([
            'name' => $this->name,
            'slug' => $this->slug,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'logo_path' => $this->logo_path,
            'website_url' => $this->website_url,
            'published_at' => $this->published_at,
            'status' => ($isOwner || $canReview) ? $this->status : null,
            'visibility' => ($isOwner || $canReview) ? $this->visibility : null,
            'created_at' => ($isOwner || $canReview) ? $this->created_at : null,
            'updated_at' => ($isOwner || $canReview) ? $this->updated_at : null,
        ], static fn (mixed $value): bool => $value !== null);
    }
}

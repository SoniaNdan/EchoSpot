<?php

namespace App\Http\Requests\Contributor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['contributor', 'researcher']) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'type' => ['required', 'string', Rule::in(['research', 'review', 'writing', 'design', 'community', 'other'])],
            'description' => ['required', 'string', 'max:10000'],
            'evidence_url' => ['nullable', 'url:http,https', 'max:2048'],
            'user_id' => ['prohibited'],
            'contributor_id' => ['prohibited'],
            'status' => ['prohibited'],
            'submitted_at' => ['prohibited'],
            'reviewed_by' => ['prohibited'],
            'reviewer_id' => ['prohibited'],
            'approved_by' => ['prohibited'],
            'author_id' => ['prohibited'],
            'review_note' => ['prohibited'],
            'created_at' => ['prohibited'],
            'updated_at' => ['prohibited'],
        ];
    }
}

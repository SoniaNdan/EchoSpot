<?php

namespace App\Http\Requests\Research;

use Illuminate\Foundation\Http\FormRequest;

class StoreResearchArticleRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('content'))) {
            $this->merge(['content' => strip_tags($this->input('content'))]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['contributor', 'researcher']) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'summary' => ['required', 'string', 'max:500'],
            'content' => ['required', 'string', 'min:20', 'max:100000'],
            'category_id' => ['required', 'integer', 'exists:research_categories,id'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'topic' => ['nullable', 'string', 'max:100'],
            'ecosystem' => ['nullable', 'string', 'max:100'],
            'cover_image_url' => ['nullable', 'url:http,https', 'max:2048'],
            'tag_ids' => ['sometimes', 'array', 'max:12'],
            'tag_ids.*' => ['integer', 'distinct', 'exists:tags,id'],
            'slug' => ['prohibited'],
            'author_id' => ['prohibited'],
            'reviewer_id' => ['prohibited'],
            'approved_by' => ['prohibited'],
            'user_id' => ['prohibited'],
            'status' => ['prohibited'],
            'submitted_at' => ['prohibited'],
            'published_at' => ['prohibited'],
            'reviewed_by' => ['prohibited'],
            'review_note' => ['prohibited'],
            'created_at' => ['prohibited'],
            'updated_at' => ['prohibited'],
        ];
    }
}

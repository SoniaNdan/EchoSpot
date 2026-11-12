<?php

namespace App\Http\Requests\Research;

use Illuminate\Foundation\Http\FormRequest;

class SubmitResearchArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['prohibited'],
            'author_id' => ['prohibited'],
            'reviewed_by' => ['prohibited'],
            'reviewer_id' => ['prohibited'],
            'published_at' => ['prohibited'],
            'review_note' => ['prohibited'],
            'status_history' => ['prohibited'],
        ];
    }
}

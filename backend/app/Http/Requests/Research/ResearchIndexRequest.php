<?php

namespace App\Http\Requests\Research;

use Illuminate\Foundation\Http\FormRequest;

class ResearchIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'exists:research_categories,slug'],
            'topic' => ['nullable', 'string', 'max:100'],
            'ecosystem' => ['nullable', 'string', 'max:100'],
            'tag' => ['nullable', 'string', 'exists:tags,slug'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}

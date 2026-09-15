<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class SubmitProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['nullable', 'string', 'max:4000'],
            'status' => ['prohibited'],
            'submitted_by' => ['prohibited'],
            'reviewer_id' => ['prohibited'],
        ];
    }
}

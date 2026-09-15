<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'outcome' => ['required', 'string', Rule::in(['under_review', 'changes_requested', 'approved', 'rejected'])],
            'reason' => ['nullable', 'string', 'max:4000', 'required_if:outcome,changes_requested,rejected'],
            'status' => ['prohibited'],
            'reviewer_id' => ['prohibited'],
            'approved_by' => ['prohibited'],
        ];
    }
}

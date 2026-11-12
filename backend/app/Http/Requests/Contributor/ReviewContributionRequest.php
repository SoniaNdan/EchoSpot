<?php

namespace App\Http\Requests\Contributor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewContributionRequest extends FormRequest
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
            'review_note' => ['prohibited'],
            'reviewed_by' => ['prohibited'],
            'reviewer_id' => ['prohibited'],
            'user_id' => ['prohibited'],
            'contributor_id' => ['prohibited'],
            'approved_by' => ['prohibited'],
        ];
    }
}

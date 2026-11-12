<?php

namespace App\Http\Requests\Contributor;

use Illuminate\Foundation\Http\FormRequest;

class SubmitContributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['prohibited'],
            'user_id' => ['prohibited'],
            'author_id' => ['prohibited'],
            'reviewed_by' => ['prohibited'],
            'reviewer_id' => ['prohibited'],
            'review_note' => ['prohibited'],
            'approved_by' => ['prohibited'],
        ];
    }
}

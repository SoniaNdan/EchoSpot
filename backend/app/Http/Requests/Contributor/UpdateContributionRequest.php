<?php

namespace App\Http\Requests\Contributor;

class UpdateContributionRequest extends StoreContributionRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        foreach (['title', 'type', 'description'] as $required) {
            $rules[$required][0] = 'sometimes';
        }

        return $rules;
    }
}

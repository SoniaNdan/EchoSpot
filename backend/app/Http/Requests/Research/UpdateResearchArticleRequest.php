<?php

namespace App\Http\Requests\Research;

class UpdateResearchArticleRequest extends StoreResearchArticleRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        foreach (['title', 'summary', 'content', 'category_id'] as $required) {
            $rules[$required][0] = 'sometimes';
        }

        return $rules;
    }
}

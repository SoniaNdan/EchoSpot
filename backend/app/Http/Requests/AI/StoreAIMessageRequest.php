<?php

namespace App\Http\Requests\AI;

use Illuminate\Foundation\Http\FormRequest;

class StoreAIMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'min:1', 'max:'.(int) config('ai.message_max_characters', 8000)],
            'role' => ['prohibited'],
            'model' => ['prohibited'],
            'user_id' => ['prohibited'],
            'provider_response_id' => ['prohibited'],
        ];
    }
}

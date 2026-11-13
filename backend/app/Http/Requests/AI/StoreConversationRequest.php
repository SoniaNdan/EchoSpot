<?php

namespace App\Http\Requests\AI;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:160'],
            'user_id' => ['prohibited'],
            'status' => ['prohibited'],
        ];
    }
}

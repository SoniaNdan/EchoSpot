<?php

namespace App\Http\Requests\Contributor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['contributor', 'researcher']) ?? false;
    }

    public function rules(): array
    {
        $profileId = $this->user()?->profile?->id;

        return [
            'username' => ['sometimes', 'required', 'string', 'max:80', 'alpha_dash:ascii', Rule::unique('profiles', 'username')->ignore($profileId)],
            'display_name' => ['sometimes', 'required', 'string', 'max:160'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:4000'],
            'avatar_path' => ['sometimes', 'nullable', 'string', 'max:500'],
            'skill_ids' => ['sometimes', 'array', 'max:30'],
            'skill_ids.*' => ['integer', 'distinct', 'exists:skills,id'],
            'user_id' => ['prohibited'],
            'id' => ['prohibited'],
            'name' => ['prohibited'],
            'email' => ['prohibited'],
            'password' => ['prohibited'],
            'status' => ['prohibited'],
            'role' => ['prohibited'],
            'roles' => ['prohibited'],
            'role_id' => ['prohibited'],
            'wallet_address' => ['prohibited'],
            'joined_at' => ['prohibited'],
            'created_at' => ['prohibited'],
            'updated_at' => ['prohibited'],
        ];
    }
}

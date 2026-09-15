<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'password_confirmation' => ['required', 'same:password'],
            'role' => ['prohibited'],
            'roles' => ['prohibited'],
            'status' => ['prohibited'],
            'email_verified_at' => ['prohibited'],
            'permissions' => ['prohibited'],
            'is_admin' => ['prohibited'],
            'is_super_admin' => ['prohibited'],
        ];
    }
}

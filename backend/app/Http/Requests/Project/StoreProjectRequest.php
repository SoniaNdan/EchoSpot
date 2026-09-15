<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:160'],
            'tagline' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:20000'],
            'logo_path' => ['nullable', 'string', 'max:500'],
            'website_url' => ['nullable', 'url:http,https', 'max:2048'],
            'slug' => ['prohibited'],
            'owner_id' => ['prohibited'],
            'founder_id' => ['prohibited'],
            'status' => ['prohibited'],
            'visibility' => ['prohibited'],
            'published_at' => ['prohibited'],
            'approved_by' => ['prohibited'],
            'created_at' => ['prohibited'],
            'updated_at' => ['prohibited'],
        ];
    }
}

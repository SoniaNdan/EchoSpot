<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;

class AuthorizationProbeController
{
    public function admin(): JsonResponse
    {
        return $this->allowed();
    }

    public function contributor(): JsonResponse
    {
        return $this->allowed();
    }

    public function founder(): JsonResponse
    {
        return $this->allowed();
    }

    public function superAdmin(): JsonResponse
    {
        return $this->allowed();
    }

    private function allowed(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ['authorized' => true]]);
    }
}

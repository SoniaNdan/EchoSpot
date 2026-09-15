<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiHealthTest extends TestCase
{
    public function test_health_endpoint_returns_structured_success_response(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response
            ->assertOk()
            ->assertExactJson([
                'success' => true,
                'data' => [
                    'status' => 'ok',
                ],
            ]);
    }

    public function test_unknown_api_endpoint_returns_structured_not_found_response(): void
    {
        $response = $this->getJson('/api/v1/does-not-exist');

        $response
            ->assertNotFound()
            ->assertExactJson([
                'success' => false,
                'error' => [
                    'code' => 'NOT_FOUND',
                    'message' => 'The requested API endpoint was not found.',
                ],
            ]);
    }
}

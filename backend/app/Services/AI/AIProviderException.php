<?php

namespace App\Services\AI;

use RuntimeException;

class AIProviderException extends RuntimeException
{
    public function __construct(
        public readonly string $errorCode = 'AI_PROVIDER_UNAVAILABLE',
        public readonly ?string $requestId = null,
    ) {
        parent::__construct('The AI provider could not complete the request.');
    }
}

<?php

namespace App\Services\AI;

final readonly class AIProviderResponse
{
    public function __construct(
        public string $text,
        public string $responseId,
        public string $model,
        public int $inputTokens,
        public int $outputTokens,
        public int $totalTokens,
        public ?string $requestId,
    ) {}
}

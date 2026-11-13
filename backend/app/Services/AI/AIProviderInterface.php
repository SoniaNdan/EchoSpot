<?php

namespace App\Services\AI;

interface AIProviderInterface
{
    /**
     * @param  array<int, array{role: string, content: string}>  $input
     */
    public function generate(string $instructions, array $input, int $maxOutputTokens): AIProviderResponse;
}

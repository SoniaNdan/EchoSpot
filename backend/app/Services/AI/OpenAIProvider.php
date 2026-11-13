<?php

namespace App\Services\AI;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class OpenAIProvider implements AIProviderInterface
{
    public function generate(string $instructions, array $input, int $maxOutputTokens): AIProviderResponse
    {
        $apiKey = (string) config('services.openai.api_key');
        $model = (string) config('services.openai.model', 'gpt-6-luna');

        if ($apiKey === '' || $model === '') {
            throw new AIProviderException('AI_PROVIDER_NOT_CONFIGURED');
        }

        try {
            $response = Http::acceptJson()
                ->asJson()
                ->withToken($apiKey)
                ->connectTimeout((int) config('services.openai.connect_timeout', 10))
                ->timeout((int) config('services.openai.timeout', 45))
                ->post((string) config('services.openai.responses_url'), [
                    'model' => $model,
                    'instructions' => $instructions,
                    'input' => $input,
                    'max_output_tokens' => $maxOutputTokens,
                    'store' => false,
                ]);
        } catch (ConnectionException) {
            throw new AIProviderException('AI_PROVIDER_TIMEOUT');
        }

        $requestId = $response->header('x-request-id');

        if (! $response->successful()) {
            throw new AIProviderException('AI_PROVIDER_UNAVAILABLE', $requestId);
        }

        $body = $response->json();
        if (! is_array($body) || ! is_array($body['output'] ?? null) || ! is_array($body['usage'] ?? null)) {
            throw new AIProviderException('AI_PROVIDER_INVALID_RESPONSE', $requestId);
        }

        $text = (string) ($body['output_text'] ?? '');
        if ($text === '') {
            $chunks = [];
            foreach ($body['output'] as $item) {
                foreach (($item['content'] ?? []) as $content) {
                    if (($content['type'] ?? null) === 'output_text' && is_string($content['text'] ?? null)) {
                        $chunks[] = $content['text'];
                    }
                }
            }
            $text = implode("\n", $chunks);
        }

        $usage = $body['usage'];
        $inputTokens = $usage['input_tokens'] ?? null;
        $outputTokens = $usage['output_tokens'] ?? null;
        $totalTokens = $usage['total_tokens'] ?? null;
        if ($text === '' || ! is_numeric($inputTokens) || ! is_numeric($outputTokens)
            || ! is_numeric($totalTokens) || ! is_string($body['id'] ?? null)) {
            throw new AIProviderException('AI_PROVIDER_INVALID_RESPONSE', $requestId);
        }

        $inputTokens = (int) $inputTokens;
        $outputTokens = (int) $outputTokens;
        $totalTokens = (int) $totalTokens;
        if ($totalTokens !== $inputTokens + $outputTokens) {
            throw new AIProviderException('AI_PROVIDER_INVALID_RESPONSE', $requestId);
        }

        return new AIProviderResponse(
            text: $text,
            responseId: $body['id'],
            model: is_string($body['model'] ?? null) ? $body['model'] : $model,
            inputTokens: $inputTokens,
            outputTokens: $outputTokens,
            totalTokens: $totalTokens,
            requestId: $requestId,
        );
    }
}

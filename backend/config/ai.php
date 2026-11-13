<?php

return [
    'monthly_token_limit' => (int) env('AI_MONTHLY_TOKEN_LIMIT', 500000),
    'max_output_tokens' => min(2000, max(16, (int) env('AI_MAX_OUTPUT_TOKENS', 2000))),
    'rate_limit_per_minute' => (int) env('AI_RATE_LIMIT_PER_MINUTE', 10),
    'conversation_retention_days' => (int) env('AI_CONVERSATION_RETENTION_DAYS', 90),
    'message_max_characters' => 8000,
    'history_messages' => 8,
    'retrieval_results' => 3,
    'retrieval_excerpt_characters' => 1800,
];

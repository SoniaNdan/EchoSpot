<?php

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Laravel\Sanctum\Http\Middleware\AuthenticateSession;

return [
    // This API deliberately uses bearer tokens, not Sanctum SPA cookies.
    'stateful' => [],
    'guard' => ['web'],
    'expiration' => (int) env('SANCTUM_EXPIRATION', 480),
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', 'echospot_'),
    'middleware' => [
        'authenticate_session' => AuthenticateSession::class,
        'encrypt_cookies' => EncryptCookies::class,
        'validate_csrf_token' => ValidateCsrfToken::class,
    ],
];

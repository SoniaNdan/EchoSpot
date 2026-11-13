<?php

use App\Http\Middleware\EnsureAccountCanAccessApi;
use App\Http\Middleware\EnsureActiveAccount;
use App\Http\Middleware\RequireActiveProSubscription;
use App\Http\Middleware\RequireRole;
use App\Services\AI\AIProSubscriptionRequiredException;
use App\Services\AI\AIProviderException;
use App\Services\AI\AIQuotaExceededException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => RequireRole::class,
            'account.access' => EnsureAccountCanAccessApi::class,
            'account.active' => EnsureActiveAccount::class,
            'ai.pro' => RequireActiveProSubscription::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AIProSubscriptionRequiredException $exception, Request $request): ?JsonResponse {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => ['code' => 'PRO_SUBSCRIPTION_REQUIRED', 'message' => $exception->getMessage()],
            ], 403);
        });

        $exceptions->render(function (AIQuotaExceededException $exception, Request $request): ?JsonResponse {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => ['code' => 'AI_MONTHLY_LIMIT_REACHED', 'message' => $exception->getMessage()],
            ], 429);
        });

        $exceptions->render(function (AIProviderException $exception, Request $request): ?JsonResponse {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => $exception->errorCode,
                    'message' => 'EchoSpot AI is temporarily unavailable. Please try again later.',
                ],
            ], 503);
        });

        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $exception): bool {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (Throwable $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            if ($exception instanceof ValidationException
                || $exception instanceof AuthenticationException
                || $exception instanceof AccessDeniedHttpException) {
                return null;
            }

            $status = $exception instanceof HttpExceptionInterface
                ? $exception->getStatusCode()
                : 500;
            $errorCode = match ($status) {
                404 => 'NOT_FOUND',
                403 => 'FORBIDDEN',
                429 => 'RATE_LIMITED',
                default => 'SERVER_ERROR',
            };
            $message = match ($status) {
                404 => 'The requested API endpoint was not found.',
                403 => 'You are not authorized to perform this action.',
                429 => 'Too many requests. Please try again later.',
                default => 'An unexpected server error occurred.',
            };

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => $errorCode,
                    'message' => $message,
                ],
            ], $status);
        });

        $exceptions->render(function (ValidationException $exception, Request $request): ?JsonResponse {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'The submitted data is invalid.',
                    'fields' => $exception->errors(),
                ],
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request): ?JsonResponse {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Authentication is required.',
                ],
            ], 401);
        });

        $exceptions->render(function (AccessDeniedHttpException $exception, Request $request): ?JsonResponse {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => 'You are not authorized to perform this action.',
                ],
            ], 403);
        });
    })->create();

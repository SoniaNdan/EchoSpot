<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AuthorizationProbeController;
use App\Http\Controllers\Api\V1\ContributionController;
use App\Http\Controllers\Api\V1\ContributorController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\ProjectSubmissionController;
use App\Http\Controllers\Api\V1\ResearchController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', HealthController::class);

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{project:slug}', [ProjectController::class, 'show']);

    Route::get('/research/categories', [ResearchController::class, 'categories']);
    Route::get('/research/tags', [ResearchController::class, 'tags']);
    Route::get('/research/articles', [ResearchController::class, 'index']);
    Route::get('/research/articles/mine', [ResearchController::class, 'mine'])->middleware(['auth:sanctum', 'account.access', 'account.active', 'role:contributor,researcher']);
    Route::get('/research/articles/{slug}', [ResearchController::class, 'show']);

    Route::get('/contributors/skills', [ContributorController::class, 'skills']);
    Route::get('/contributors', [ContributorController::class, 'index']);
    Route::get('/contributors/me', [ContributorController::class, 'me'])->middleware(['auth:sanctum', 'account.access', 'account.active', 'role:contributor,researcher']);
    Route::get('/contributors/{username}', [ContributorController::class, 'show']);

    Route::middleware(['auth:sanctum', 'account.access'])->group(function (): void {
        Route::middleware('account.active')->group(function (): void {
            Route::get('/research/review-queue', [ResearchController::class, 'reviewQueue'])->middleware('role:admin,super_admin');
            Route::post('/research/articles', [ResearchController::class, 'store']);
            Route::get('/research/articles/{article}/manage', [ResearchController::class, 'manageShow']);
            Route::patch('/research/articles/{article}', [ResearchController::class, 'update']);
            Route::post('/research/articles/{article}/submit', [ResearchController::class, 'submit'])->middleware('role:contributor,researcher');
            Route::post('/research/articles/{article}/review', [ResearchController::class, 'review'])->middleware('role:admin,super_admin');
            Route::post('/research/articles/{article}/publish', [ResearchController::class, 'publish'])->middleware('role:admin,super_admin');

            Route::patch('/contributors/me', [ContributorController::class, 'update'])->middleware('role:contributor,researcher');
            Route::get('/contributions/mine', [ContributionController::class, 'mine'])->middleware('role:contributor,researcher');
            Route::get('/contributions/review-queue', [ContributionController::class, 'reviewQueue'])->middleware('role:admin,super_admin');
            Route::post('/contributions', [ContributionController::class, 'store'])->middleware('role:contributor,researcher');
            Route::get('/contributions/{contribution}', [ContributionController::class, 'show']);
            Route::patch('/contributions/{contribution}', [ContributionController::class, 'update'])->middleware('role:contributor,researcher');
            Route::post('/contributions/{contribution}/submit', [ContributionController::class, 'submit'])->middleware('role:contributor,researcher');
            Route::post('/contributions/{contribution}/review', [ContributionController::class, 'review'])->middleware('role:admin,super_admin');
        });

        Route::post('/projects', [ProjectController::class, 'store']);
        Route::patch('/projects/{project}', [ProjectController::class, 'update']);
        Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
        Route::post('/projects/{project}/submit', [ProjectController::class, 'submit']);
        Route::post('/projects/{project}/publish', [ProjectController::class, 'publish'])->middleware('account.active');

        Route::get('/submissions', [ProjectSubmissionController::class, 'index'])->middleware('account.active');
        Route::get('/submissions/{submission}', [ProjectSubmissionController::class, 'show'])->middleware('account.active');
        Route::post('/submissions/{submission}/review', [ProjectSubmissionController::class, 'review'])->middleware('account.active');
    });

    Route::prefix('auth')->group(function (): void {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth-register');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth-login');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth-forgot-password');
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth-reset-password');
        Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->middleware(['auth:sanctum', 'account.access', 'signed', 'throttle:auth-email-verification'])
            ->name('verification.verify');

        Route::middleware(['auth:sanctum', 'account.access'])->group(function (): void {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/email/resend', [AuthController::class, 'resendVerification'])->middleware('throttle:auth-email-verification');
            Route::get('/authorization/admin-check', [AuthorizationProbeController::class, 'admin'])->middleware(['account.active', 'role:admin,super_admin']);
            Route::get('/authorization/contributor-check', [AuthorizationProbeController::class, 'contributor'])->middleware(['account.active', 'role:contributor,researcher,admin,super_admin']);
            Route::get('/authorization/founder-check', [AuthorizationProbeController::class, 'founder'])->middleware(['account.active', 'role:founder,admin,super_admin']);
            Route::get('/authorization/super-admin-check', [AuthorizationProbeController::class, 'superAdmin'])->middleware(['account.active', 'role:super_admin']);
        });
    });

    Route::fallback(function () {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => 'NOT_FOUND',
                'message' => 'The requested API endpoint was not found.',
            ],
        ], 404);
    });
});

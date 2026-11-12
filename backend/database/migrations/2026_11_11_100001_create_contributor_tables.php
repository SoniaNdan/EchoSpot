<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skills', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 100)->unique();
            $table->string('name', 100)->unique();
            $table->timestamps();
        });

        Schema::create('profile_skill', function (Blueprint $table): void {
            $table->foreignId('profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->restrictOnDelete();
            $table->primary(['profile_id', 'skill_id']);
        });

        Schema::create('contributions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('title', 180);
            $table->string('type', 80);
            $table->text('description');
            $table->string('evidence_url', 2048)->nullable();
            $table->string('status', 30)->default('draft')->index();
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_note')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('contribution_status_history', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contribution_id')->constrained()->restrictOnDelete();
            $table->string('previous_status', 30)->nullable();
            $table->string('new_status', 30);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->timestamps();
            $table->index(['contribution_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contribution_status_history');
        Schema::dropIfExists('contributions');
        Schema::dropIfExists('profile_skill');
        Schema::dropIfExists('skills');
    }
};

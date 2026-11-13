<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_usage_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('conversation_id')->nullable()->constrained('ai_conversations')->nullOnDelete();
            $table->string('model', 100);
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->unsignedInteger('total_tokens')->default(0);
            $table->unsignedInteger('reserved_tokens')->default(0);
            $table->string('status', 20)->default('completed');
            $table->string('correlation_id', 64)->index();
            $table->string('provider_request_id', 128)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'subscription_id', 'created_at'], 'ai_usage_user_period_index');
            $table->index(['conversation_id', 'created_at'], 'ai_usage_conversation_created_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_usage_records');
    }
};

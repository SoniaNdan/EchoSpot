<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_conversations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160)->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->index(['user_id', 'updated_at'], 'ai_conversations_user_updated_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_conversations');
    }
};

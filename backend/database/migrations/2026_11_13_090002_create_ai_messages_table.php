<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained('ai_conversations')->cascadeOnDelete();
            $table->string('role', 20);
            $table->longText('content');
            $table->string('model', 100)->nullable();
            $table->string('provider_response_id', 128)->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'id'], 'ai_messages_conversation_order_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_messages');
    }
};

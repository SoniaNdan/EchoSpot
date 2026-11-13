<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('plan_key', 20)->default('pro');
            $table->string('status', 20)->default('active');
            $table->string('billing_interval', 20)->default('monthly');
            $table->timestamp('current_period_starts_at');
            $table->timestamp('current_period_ends_at');
            $table->timestamps();

            $table->index(['plan_key', 'status', 'current_period_ends_at'], 'subscriptions_entitlement_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};

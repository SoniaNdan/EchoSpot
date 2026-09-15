<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->restrictOnDelete();
            $table->string('name', 160);
            $table->string('slug', 180)->unique();
            $table->string('tagline', 255);
            $table->text('description');
            $table->string('logo_path', 500)->nullable();
            $table->string('website_url', 2048)->nullable();
            $table->string('status', 30)->default('draft')->index();
            $table->string('visibility', 20)->default('private')->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();

            $table->index(['owner_id', 'status']);
            $table->index(['visibility', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};

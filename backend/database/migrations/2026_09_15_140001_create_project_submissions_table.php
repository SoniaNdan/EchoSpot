<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_submissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('project_id')->constrained()->restrictOnDelete();
            $table->foreignId('submitted_by')->constrained('users')->restrictOnDelete();
            $table->unsignedSmallInteger('version');
            $table->text('message')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->unique(['project_id', 'version']);
            $table->index(['submitted_by', 'submitted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_submissions');
    }
};

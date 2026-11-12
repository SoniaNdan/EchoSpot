<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('research_categories')) {
            Schema::create('research_categories', function (Blueprint $table): void {
                $table->id();
                $table->string('slug', 80)->unique();
                $table->string('name', 120);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('tags')) {
            Schema::create('tags', function (Blueprint $table): void {
                $table->id();
                $table->string('slug', 100)->unique();
                $table->string('name', 100)->unique();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('research_articles')) {
            Schema::create('research_articles', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('author_id')->constrained('users')->restrictOnDelete();
                $table->foreignId('category_id')->constrained('research_categories')->restrictOnDelete();
                $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
                $table->string('slug', 180)->unique();
                $table->string('title', 180);
                $table->string('summary', 500);
                $table->longText('content');
                $table->string('topic', 100)->nullable();
                $table->string('ecosystem', 100)->nullable();
                $table->string('cover_image_url', 2048)->nullable();
                $table->string('status', 30)->default('draft')->index();
                $table->timestamp('submitted_at')->nullable();
                $table->timestamp('published_at')->nullable()->index();
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('review_note')->nullable();
                $table->timestamps();

                $table->index(['author_id', 'status']);
                $table->index(['category_id', 'status']);
                $table->index(['status', 'published_at']);
            });
        }

        if (! Schema::hasTable('research_article_tag')) {
            Schema::create('research_article_tag', function (Blueprint $table): void {
                $table->foreignId('research_article_id')->constrained()->cascadeOnDelete();
                $table->foreignId('tag_id')->constrained()->restrictOnDelete();
                $table->primary(['research_article_id', 'tag_id']);
            });
        }

        if (! Schema::hasTable('research_article_status_history')) {
            Schema::create('research_article_status_history', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('research_article_id')->constrained()->restrictOnDelete();
                $table->string('previous_status', 30)->nullable();
                $table->string('new_status', 30);
                $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('reason')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasIndex('research_article_status_history', 'research_article_status_article_created_index')) {
            Schema::table('research_article_status_history', function (Blueprint $table): void {
                $table->index(['research_article_id', 'created_at'], 'research_article_status_article_created_index');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('research_article_status_history');
        Schema::dropIfExists('research_article_tag');
        Schema::dropIfExists('research_articles');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('research_categories');
    }
};

<?php

namespace Database\Factories;

use App\Models\ResearchArticle;
use App\Models\ResearchCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<ResearchArticle> */
class ResearchArticleFactory extends Factory
{
    protected $model = ResearchArticle::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(5);

        return [
            'author_id' => User::factory(),
            'category_id' => ResearchCategory::factory(),
            'project_id' => null,
            'slug' => Str::slug($title),
            'title' => $title,
            'summary' => fake()->sentence(),
            'content' => fake()->paragraphs(3, true),
            'topic' => fake()->word(),
            'ecosystem' => fake()->word(),
            'cover_image_url' => null,
            'status' => 'draft',
        ];
    }

    public function published(): static
    {
        return $this->state(fn (): array => ['status' => 'published', 'published_at' => now()]);
    }
}

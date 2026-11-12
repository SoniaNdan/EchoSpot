<?php

namespace Database\Factories;

use App\Models\ResearchCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<ResearchCategory> */
class ResearchCategoryFactory extends Factory
{
    protected $model = ResearchCategory::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return ['name' => Str::title($name), 'slug' => Str::slug($name)];
    }
}

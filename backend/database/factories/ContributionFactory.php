<?php

namespace Database\Factories;

use App\Models\Contribution;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Contribution> */
class ContributionFactory extends Factory
{
    protected $model = Contribution::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(5),
            'type' => fake()->randomElement(['research', 'review', 'writing', 'design', 'community', 'other']),
            'description' => fake()->paragraph(),
            'evidence_url' => fake()->optional()->url(),
            'status' => 'draft',
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (): array => ['status' => 'approved', 'submitted_at' => now()]);
    }
}

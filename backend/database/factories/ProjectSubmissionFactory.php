<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectSubmission>
 */
class ProjectSubmissionFactory extends Factory
{
    protected $model = ProjectSubmission::class;

    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'submitted_by' => User::factory(),
            'version' => 1,
            'message' => fake()->optional()->paragraph(),
            'submitted_at' => now(),
        ];
    }
}

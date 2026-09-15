<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
{
    protected $model = Profile::class;

    public function definition(): array
    {
        $name = fake()->name();
        $username = fake()->unique()->userName();

        return [
            'user_id' => User::factory(),
            'username' => $username,
            'display_name' => $name,
            'bio' => fake()->optional()->paragraph(),
            'avatar_path' => null,
            'wallet_address' => null,
            'joined_at' => fake()->dateTimeBetween('-2 years', 'now'),
        ];
    }
}

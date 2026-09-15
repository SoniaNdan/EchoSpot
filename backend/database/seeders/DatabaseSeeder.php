<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\Project;
use App\Models\ProjectStatusHistory;
use App\Models\ProjectSubmission;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = collect([
            ['slug' => 'user', 'name' => 'User'],
            ['slug' => 'contributor', 'name' => 'Contributor'],
            ['slug' => 'researcher', 'name' => 'Researcher'],
            ['slug' => 'founder', 'name' => 'Founder'],
            ['slug' => 'admin', 'name' => 'Admin'],
            ['slug' => 'super_admin', 'name' => 'Super Admin'],
        ])->mapWithKeys(function (array $attributes): array {
            $role = Role::updateOrCreate(
                ['slug' => $attributes['slug']],
                ['name' => $attributes['name'], 'description' => "Development {$attributes['name']} role"],
            );

            return [$role->slug => $role];
        });

        $demoUsers = [
            ['name' => 'Demo User', 'email' => 'demo.user@echospot.test', 'role' => 'user'],
            ['name' => 'Demo Contributor', 'email' => 'demo.contributor@echospot.test', 'role' => 'contributor'],
            ['name' => 'Demo Researcher', 'email' => 'demo.researcher@echospot.test', 'role' => 'researcher'],
            ['name' => 'Demo Founder', 'email' => 'demo.founder@echospot.test', 'role' => 'founder'],
            ['name' => 'Demo Admin', 'email' => 'demo.admin@echospot.test', 'role' => 'admin'],
            ['name' => 'Demo Super Admin', 'email' => 'demo.super-admin@echospot.test', 'role' => 'super_admin'],
        ];

        $users = [];

        foreach ($demoUsers as $attributes) {
            $user = User::query()->firstOrCreate(['email' => $attributes['email']], [
                'name' => $attributes['name'],
                'password' => 'dev-only-password',
            ]);

            $user->roles()->sync([$roles[$attributes['role']]->id]);
            Profile::query()->updateOrCreate(['user_id' => $user->id], [
                'user_id' => $user->id,
                'username' => str($attributes['role'])->replace('_', '-')->append('-demo')->toString(),
                'display_name' => $attributes['name'],
            ]);
            UserPreference::query()->firstOrCreate(['user_id' => $user->id]);
            $users[$attributes['role']] = $user;
        }

        $projects = [
            ['slug' => 'echo-draft', 'owner' => 'user', 'name' => 'Echo Draft', 'status' => 'draft', 'visibility' => 'private'],
            ['slug' => 'echo-review', 'owner' => 'contributor', 'name' => 'Echo Review', 'status' => 'submitted', 'visibility' => 'private'],
            ['slug' => 'echo-changes', 'owner' => 'researcher', 'name' => 'Echo Changes', 'status' => 'changes_requested', 'visibility' => 'private'],
            ['slug' => 'echo-approved', 'owner' => 'founder', 'name' => 'Echo Approved', 'status' => 'approved', 'visibility' => 'private'],
            ['slug' => 'echo-published', 'owner' => 'founder', 'name' => 'Echo Published', 'status' => 'published', 'visibility' => 'public'],
        ];

        foreach ($projects as $attributes) {
            $owner = $users[$attributes['owner']];
            $project = Project::query()->updateOrCreate(['slug' => $attributes['slug']], [
                'owner_id' => $owner->id,
                'name' => $attributes['name'],
                'tagline' => 'Development project for the Phase 2D workflow.',
                'description' => 'Repeatable local seed data used to exercise project visibility and review states.',
                'status' => $attributes['status'],
                'visibility' => $attributes['visibility'],
                'published_at' => $attributes['status'] === 'published' ? now() : null,
            ]);

            ProjectStatusHistory::query()->firstOrCreate([
                'project_id' => $project->id,
                'new_status' => $project->status,
            ], [
                'previous_status' => null,
                'changed_by' => $owner->id,
            ]);

            if (in_array($project->status, ['submitted', 'changes_requested'], true)) {
                ProjectSubmission::query()->updateOrCreate([
                    'project_id' => $project->id,
                    'version' => 1,
                ], [
                    'submitted_by' => $owner->id,
                    'message' => 'Development seed submission.',
                    'submitted_at' => now(),
                ]);
            }
        }
    }
}

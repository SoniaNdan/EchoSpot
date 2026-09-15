<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\ProjectIndexRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\SubmitProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ProjectLifecycle;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(ProjectIndexRequest $request): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        $query = Project::query();

        if ($request->boolean('mine')) {
            if (! $user) {
                throw new AuthenticationException;
            }

            $query->where('owner_id', $user->id);
        } else {
            $query->where('status', 'published')->where('visibility', 'public');
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('tagline', 'like', "%{$search}%");
            });
        }

        $projects = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => ProjectResource::collection($projects->getCollection())->resolve($request),
            'meta' => [
                'page' => $projects->currentPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
                'total_pages' => $projects->lastPage(),
            ],
        ]);
    }

    public function store(StoreProjectRequest $request, ProjectLifecycle $lifecycle): JsonResponse
    {
        $user = $request->user();
        $project = new Project($request->safe()->only(['name', 'tagline', 'description', 'logo_path', 'website_url']));
        $project->forceFill([
            'owner_id' => $user->id,
            'slug' => $this->uniqueSlug($request->string('name')->toString()),
        ])->save();
        $lifecycle->recordCreation($project, $user);

        return response()->json([
            'success' => true,
            'data' => ['project' => (new ProjectResource($project->fresh()))->resolve($request)],
        ], 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();

        if (! $project->isPublic() && (! $user || Gate::forUser($user)->denies('view', $project))) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'data' => ['project' => (new ProjectResource($project))->resolve($request)],
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        Gate::authorize('update', $project);
        $project->fill($request->safe()->only(['name', 'tagline', 'description', 'logo_path', 'website_url']))->save();

        return response()->json([
            'success' => true,
            'data' => ['project' => (new ProjectResource($project->fresh()))->resolve($request)],
        ]);
    }

    public function submit(SubmitProjectRequest $request, Project $project, ProjectLifecycle $lifecycle): JsonResponse
    {
        Gate::authorize('submit', $project);
        $project = $lifecycle->submit($project, $request->user(), $request->string('message')->toString() ?: null);

        return response()->json([
            'success' => true,
            'data' => ['project' => (new ProjectResource($project))->resolve($request)],
        ], 201);
    }

    public function publish(Request $request, Project $project, ProjectLifecycle $lifecycle): JsonResponse
    {
        Gate::authorize('publish', $project);
        $project = $lifecycle->publish($project, $request->user());

        return response()->json([
            'success' => true,
            'data' => ['project' => (new ProjectResource($project))->resolve($request)],
        ]);
    }

    public function destroy(Request $request, Project $project, ProjectLifecycle $lifecycle): JsonResponse
    {
        Gate::authorize('archive', $project);
        $project = $lifecycle->archive($project, $request->user());

        return response()->json([
            'success' => true,
            'data' => ['project' => (new ProjectResource($project))->resolve($request)],
        ]);
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::of($name)->slug()->limit(160, '')->toString() ?: 'project';
        $slug = $base;
        $suffix = 2;

        while (Project::query()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}

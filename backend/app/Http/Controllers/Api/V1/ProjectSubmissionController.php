<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\ReviewSubmissionRequest;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\ProjectSubmissionResource;
use App\Models\ProjectSubmission;
use App\Services\ProjectLifecycle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProjectSubmissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ProjectSubmission::query()->with('project');

        if (! $user->hasAnyRole(['admin', 'super_admin'])) {
            $query->whereHas('project', fn ($projectQuery) => $projectQuery->where('owner_id', $user->id));
        }

        $submissions = $query->latest('submitted_at')->paginate(min($request->integer('per_page', 20), 50));

        return response()->json([
            'success' => true,
            'data' => ProjectSubmissionResource::collection($submissions->getCollection())->resolve($request),
            'meta' => [
                'page' => $submissions->currentPage(),
                'per_page' => $submissions->perPage(),
                'total' => $submissions->total(),
                'total_pages' => $submissions->lastPage(),
            ],
        ]);
    }

    public function show(Request $request, ProjectSubmission $submission): JsonResponse
    {
        $submission->load('project');
        Gate::authorize('view', $submission);

        return response()->json([
            'success' => true,
            'data' => ['submission' => (new ProjectSubmissionResource($submission))->resolve($request)],
        ]);
    }

    public function review(ReviewSubmissionRequest $request, ProjectSubmission $submission, ProjectLifecycle $lifecycle): JsonResponse
    {
        $submission->load('project');
        Gate::authorize('review', $submission);
        $project = $lifecycle->review(
            $submission->project,
            $request->user(),
            $request->string('outcome')->toString(),
            $request->string('reason')->toString() ?: null,
        );

        return response()->json([
            'success' => true,
            'data' => ['project' => (new ProjectResource($project))->resolve($request)],
        ]);
    }
}

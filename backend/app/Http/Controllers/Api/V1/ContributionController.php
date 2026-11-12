<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contributor\ReviewContributionRequest;
use App\Http\Requests\Contributor\StoreContributionRequest;
use App\Http\Requests\Contributor\SubmitContributionRequest;
use App\Http\Requests\Contributor\UpdateContributionRequest;
use App\Http\Resources\ContributionResource;
use App\Models\Contribution;
use App\Services\ContributionLifecycle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ContributionController extends Controller
{
    public function mine(Request $request): JsonResponse
    {
        $page = Contribution::query()->where('user_id', $request->user()->id)->with('contributor.profile')->latest('updated_at')->paginate(min(max(1, $request->integer('per_page', 20)), 50));

        return $this->paginated($request, $page);
    }

    public function show(Request $request, Contribution $contribution): JsonResponse
    {
        Gate::authorize('view', $contribution);

        return response()->json(['success' => true, 'data' => ['contribution' => (new ContributionResource($contribution->load('contributor.profile')))->resolve($request)]]);
    }

    public function store(StoreContributionRequest $request, ContributionLifecycle $lifecycle): JsonResponse
    {
        Gate::authorize('create', Contribution::class);
        $contribution = DB::transaction(function () use ($request, $lifecycle) {
            $contribution = $request->user()->contributions()->create($request->safe()->only(['title', 'type', 'description', 'evidence_url']));
            $lifecycle->created($contribution, $request->user());

            return $contribution;
        });

        return response()->json(['success' => true, 'data' => ['contribution' => (new ContributionResource($contribution->load('contributor.profile')))->resolve($request)]], 201);
    }

    public function update(UpdateContributionRequest $request, Contribution $contribution): JsonResponse
    {
        Gate::authorize('update', $contribution);
        $contribution->fill($request->safe()->only(['title', 'type', 'description', 'evidence_url']))->save();

        return response()->json(['success' => true, 'data' => ['contribution' => (new ContributionResource($contribution->fresh('contributor.profile')))->resolve($request)]]);
    }

    public function submit(SubmitContributionRequest $request, Contribution $contribution, ContributionLifecycle $lifecycle): JsonResponse
    {
        Gate::authorize('submit', $contribution);
        $contribution = $lifecycle->submit($contribution, $request->user());

        return response()->json(['success' => true, 'data' => ['contribution' => (new ContributionResource($contribution))->resolve($request)]], 201);
    }

    public function reviewQueue(Request $request): JsonResponse
    {
        $page = Contribution::query()->whereIn('status', ['submitted', 'under_review'])->with('contributor.profile')->latest('submitted_at')->paginate(min(max(1, $request->integer('per_page', 20)), 50));

        return $this->paginated($request, $page);
    }

    public function review(ReviewContributionRequest $request, Contribution $contribution, ContributionLifecycle $lifecycle): JsonResponse
    {
        Gate::authorize('review', $contribution);
        $contribution = $lifecycle->review($contribution, $request->user(), $request->string('outcome')->toString(), $request->string('reason')->toString() ?: null);

        return response()->json(['success' => true, 'data' => ['contribution' => (new ContributionResource($contribution))->resolve($request)]]);
    }

    private function paginated(Request $request, $paginator): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => ContributionResource::collection($paginator->getCollection())->resolve($request),
            'meta' => ['page' => $paginator->currentPage(), 'per_page' => $paginator->perPage(), 'total' => $paginator->total(), 'total_pages' => $paginator->lastPage()],
        ]);
    }
}

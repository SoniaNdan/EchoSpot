<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contributor\DirectoryRequest;
use App\Http\Requests\Contributor\UpdateProfileRequest;
use App\Http\Resources\ContributorResource;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ContributorController extends Controller
{
    private const PUBLIC_WITH = ['roles', 'profile.skills'];

    public function skills(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Skill::query()->orderBy('name')->get(['slug', 'name']),
        ]);
    }

    public function index(DirectoryRequest $request): JsonResponse
    {
        $query = User::query()
            ->where('status', 'active')
            ->whereHas('roles', fn ($roleQuery) => $roleQuery->whereIn('slug', ['contributor', 'researcher']))
            ->whereHas('profile')
            ->with(self::PUBLIC_WITH);

        if ($search = $request->string('search')->trim()->toString()) {
            $query->whereHas('profile', fn ($profileQuery) => $profileQuery->where('display_name', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")
                ->orWhere('bio', 'like', "%{$search}%"));
        }
        if ($skill = $request->input('skill')) {
            $query->whereHas('profile.skills', fn ($skillQuery) => $skillQuery->where('slug', $skill));
        }

        $page = $query->orderBy('id')->paginate($request->integer('per_page', 20));

        return $this->paginated($request, $page);
    }

    public function show(Request $request, string $username): JsonResponse
    {
        $user = User::query()
            ->where('status', 'active')
            ->whereHas('roles', fn ($roleQuery) => $roleQuery->whereIn('slug', ['contributor', 'researcher']))
            ->whereHas('profile', fn ($profileQuery) => $profileQuery->where('username', $username))
            ->with(self::PUBLIC_WITH + ['contributions' => fn ($query) => $query->where('status', 'approved')->latest('updated_at')->limit(10)])
            ->firstOrFail();

        return response()->json(['success' => true, 'data' => ['contributor' => (new ContributorResource($user))->resolve($request)]]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(self::PUBLIC_WITH + ['contributions' => fn ($query) => $query->where('status', 'approved')->latest('updated_at')->limit(10)]);

        return response()->json(['success' => true, 'data' => ['contributor' => (new ContributorResource($user))->resolve($request)]]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $profile = $request->user()->profile;
        abort_if(! $profile, 404);
        Gate::authorize('update', $profile);

        $profile->fill($request->safe()->only(['username', 'display_name', 'bio', 'avatar_path']))->save();
        if ($request->exists('skill_ids')) {
            $profile->skills()->sync($request->validated('skill_ids', []));
        }
        $user = $request->user()->fresh()->load(self::PUBLIC_WITH + ['contributions' => fn ($query) => $query->where('status', 'approved')->latest('updated_at')->limit(10)]);

        return response()->json(['success' => true, 'data' => ['contributor' => (new ContributorResource($user))->resolve($request)]]);
    }

    private function paginated(Request $request, $paginator): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => ContributorResource::collection($paginator->getCollection())->resolve($request),
            'meta' => ['page' => $paginator->currentPage(), 'per_page' => $paginator->perPage(), 'total' => $paginator->total(), 'total_pages' => $paginator->lastPage()],
        ]);
    }
}

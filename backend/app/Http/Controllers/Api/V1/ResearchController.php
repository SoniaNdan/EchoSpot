<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Research\ResearchIndexRequest;
use App\Http\Requests\Research\ReviewResearchArticleRequest;
use App\Http\Requests\Research\StoreResearchArticleRequest;
use App\Http\Requests\Research\SubmitResearchArticleRequest;
use App\Http\Requests\Research\UpdateResearchArticleRequest;
use App\Http\Resources\ResearchArticleResource;
use App\Http\Resources\ResearchCategoryResource;
use App\Models\ResearchArticle;
use App\Models\ResearchCategory;
use App\Models\Tag;
use App\Services\ResearchArticleLifecycle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class ResearchController extends Controller
{
    private const WITH = ['author.profile', 'category', 'tags', 'project'];

    public function categories(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => ResearchCategoryResource::collection(ResearchCategory::query()->orderBy('name')->get())->resolve($request),
        ]);
    }

    public function tags(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => Tag::query()->orderBy('name')->get(['slug', 'name'])]);
    }

    public function index(ResearchIndexRequest $request): JsonResponse
    {
        $query = ResearchArticle::query()->where('status', 'published')->with(self::WITH);
        $filters = $request->validated();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn ($builder) => $builder->where('title', 'like', "%{$search}%")
                ->orWhere('summary', 'like', "%{$search}%"));
        }
        if (! empty($filters['category'])) {
            $query->whereHas('category', fn ($builder) => $builder->where('slug', $filters['category']));
        }
        foreach (['topic', 'ecosystem'] as $field) {
            if (! empty($filters[$field])) {
                $query->where($field, $filters[$field]);
            }
        }
        if (! empty($filters['tag'])) {
            $query->whereHas('tags', fn ($builder) => $builder->where('slug', $filters['tag']));
        }

        $articles = $query->orderByDesc('published_at')->paginate($request->integer('per_page', 20));

        return $this->paginated($request, $articles, ResearchArticleResource::class);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $article = ResearchArticle::query()->where('slug', $slug)->where('status', 'published')->with(self::WITH)->firstOrFail();

        return response()->json(['success' => true, 'data' => ['article' => (new ResearchArticleResource($article))->resolve($request)]]);
    }

    public function manageShow(Request $request, ResearchArticle $article): JsonResponse
    {
        Gate::authorize('view', $article);

        return response()->json(['success' => true, 'data' => ['article' => (new ResearchArticleResource($article->load(self::WITH)))->resolve($request)]]);
    }

    public function mine(Request $request): JsonResponse
    {
        $articles = ResearchArticle::query()->where('author_id', $request->user()->id)->with(self::WITH)->latest('updated_at')->paginate(min(max(1, $request->integer('per_page', 20)), 50));

        return $this->paginated($request, $articles, ResearchArticleResource::class);
    }

    public function store(StoreResearchArticleRequest $request, ResearchArticleLifecycle $lifecycle): JsonResponse
    {
        Gate::authorize('create', ResearchArticle::class);
        $data = $request->safe()->only(['title', 'summary', 'content', 'category_id', 'project_id', 'topic', 'ecosystem', 'cover_image_url']);
        $article = DB::transaction(function () use ($request, $lifecycle, $data): ResearchArticle {
            $article = $request->user()->researchArticles()->create($data + ['slug' => $this->uniqueSlug($data['title'])]);
            if ($request->exists('tag_ids')) {
                $article->tags()->sync($request->validated('tag_ids', []));
            }
            $lifecycle->created($article, $request->user());

            return $article->load(self::WITH);
        });

        return response()->json(['success' => true, 'data' => ['article' => (new ResearchArticleResource($article))->resolve($request)]], 201);
    }

    public function update(UpdateResearchArticleRequest $request, ResearchArticle $article): JsonResponse
    {
        Gate::authorize('update', $article);
        $article->fill($request->safe()->only(['title', 'summary', 'content', 'category_id', 'project_id', 'topic', 'ecosystem', 'cover_image_url']))->save();
        if ($request->exists('tag_ids')) {
            $article->tags()->sync($request->validated('tag_ids', []));
        }

        return response()->json(['success' => true, 'data' => ['article' => (new ResearchArticleResource($article->fresh(self::WITH)))->resolve($request)]]);
    }

    public function submit(SubmitResearchArticleRequest $request, ResearchArticle $article, ResearchArticleLifecycle $lifecycle): JsonResponse
    {
        Gate::authorize('submit', $article);
        $article = $lifecycle->submit($article, $request->user());

        return response()->json(['success' => true, 'data' => ['article' => (new ResearchArticleResource($article))->resolve($request)]], 201);
    }

    public function reviewQueue(Request $request): JsonResponse
    {
        $articles = ResearchArticle::query()->whereIn('status', ['submitted', 'under_review'])->with(self::WITH)->latest('submitted_at')->paginate(min(max(1, $request->integer('per_page', 20)), 50));

        return $this->paginated($request, $articles, ResearchArticleResource::class);
    }

    public function review(ReviewResearchArticleRequest $request, ResearchArticle $article, ResearchArticleLifecycle $lifecycle): JsonResponse
    {
        Gate::authorize('review', $article);
        $article = $lifecycle->review($article, $request->user(), $request->string('outcome')->toString(), $request->string('reason')->toString() ?: null);

        return response()->json(['success' => true, 'data' => ['article' => (new ResearchArticleResource($article))->resolve($request)]]);
    }

    public function publish(Request $request, ResearchArticle $article, ResearchArticleLifecycle $lifecycle): JsonResponse
    {
        Gate::authorize('publish', $article);
        $article = $lifecycle->publish($article, $request->user());

        return response()->json(['success' => true, 'data' => ['article' => (new ResearchArticleResource($article))->resolve($request)]]);
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::of($title)->slug()->limit(160, '')->toString() ?: 'research';
        $slug = $base;
        for ($suffix = 2; ResearchArticle::query()->where('slug', $slug)->exists(); $suffix++) {
            $slug = "{$base}-{$suffix}";
        }

        return $slug;
    }

    private function paginated(Request $request, $paginator, string $resource): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $resource::collection($paginator->getCollection())->resolve($request),
            'meta' => ['page' => $paginator->currentPage(), 'per_page' => $paginator->perPage(), 'total' => $paginator->total(), 'total_pages' => $paginator->lastPage()],
        ]);
    }
}

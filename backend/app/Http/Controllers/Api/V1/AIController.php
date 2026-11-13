<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AI\StoreAIMessageRequest;
use App\Http\Requests\AI\StoreConversationRequest;
use App\Http\Resources\AIConversationResource;
use App\Http\Resources\AIMessageResource;
use App\Models\AiConversation;
use App\Services\AI\AssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $conversations = AiConversation::query()
            ->where('user_id', $request->user()->id)
            ->latest('updated_at')
            ->paginate(min(max(1, $request->integer('per_page', 20)), 50));

        return response()->json([
            'success' => true,
            'data' => AIConversationResource::collection($conversations->getCollection())->resolve($request),
            'meta' => [
                'page' => $conversations->currentPage(),
                'per_page' => $conversations->perPage(),
                'total' => $conversations->total(),
                'total_pages' => $conversations->lastPage(),
            ],
        ]);
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        $conversation = $request->user()->aiConversations()->create([
            'title' => $request->validated('title'),
        ]);

        return response()->json([
            'success' => true,
            'data' => ['conversation' => (new AIConversationResource($conversation))->resolve($request)],
        ], 201);
    }

    public function show(Request $request, int $conversation): JsonResponse
    {
        $conversation = AiConversation::query()
            ->where('user_id', $request->user()->id)
            ->whereKey($conversation)
            ->firstOrFail();
        $messages = $conversation->messages()->latest('id')->limit(100)->get()->reverse()->values();

        return response()->json([
            'success' => true,
            'data' => [
                'conversation' => (new AIConversationResource($conversation))->resolve($request),
                'messages' => AIMessageResource::collection($messages)->resolve($request),
            ],
        ]);
    }

    public function message(StoreAIMessageRequest $request, int $conversation, AssistantService $assistant): JsonResponse
    {
        $conversation = AiConversation::query()
            ->where('user_id', $request->user()->id)
            ->whereKey($conversation)
            ->firstOrFail();
        $result = $assistant->sendMessage($request->user(), $conversation, $request->validated('content'));

        return response()->json([
            'success' => true,
            'data' => [
                'user_message' => (new AIMessageResource($result['user_message']))->resolve($request),
                'assistant_message' => (new AIMessageResource($result['assistant_message']))->resolve($request),
                'sources' => $result['sources'],
                'usage' => $result['usage'],
            ],
        ], 201);
    }

    public function usage(Request $request, AssistantService $assistant): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $assistant->usage($request->user())]);
    }
}

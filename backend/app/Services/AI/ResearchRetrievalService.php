<?php

namespace App\Services\AI;

use App\Models\ResearchArticle;
use Illuminate\Support\Str;

class ResearchRetrievalService
{
    /** @return array<int, array{title: string, slug: string, url: string, excerpt: string}> */
    public function search(string $query): array
    {
        $terms = collect(preg_split('/\s+/u', Str::limit($query, 500, '')) ?: [])
            ->map(fn (string $term): string => trim($term, " \t\n\r\0\x0B.,!?;:\"'()[]{}"))
            ->filter(fn (string $term): bool => mb_strlen($term) >= 3)
            ->unique(fn (string $term): string => mb_strtolower($term))
            ->take(6)
            ->values();

        if ($terms->isEmpty()) {
            return [];
        }

        $articles = ResearchArticle::query()
            ->select(['id', 'slug', 'title', 'summary', 'content'])
            ->where('status', 'published')
            ->where(function ($builder) use ($terms): void {
                foreach ($terms as $term) {
                    $needle = '%'.$term.'%';
                    $builder->orWhere('title', 'like', $needle)
                        ->orWhere('summary', 'like', $needle)
                        ->orWhere('content', 'like', $needle);
                }
            })
            ->orderByDesc('published_at')
            ->limit((int) config('ai.retrieval_results', 3))
            ->get();

        return $articles->map(function (ResearchArticle $article): array {
            $excerpt = trim(strip_tags($article->summary."\n".$article->content));

            return [
                'title' => $article->title,
                'slug' => $article->slug,
                'url' => '/research/'.$article->slug,
                'excerpt' => Str::limit($excerpt, (int) config('ai.retrieval_excerpt_characters', 1800), '...'),
            ];
        })->all();
    }
}

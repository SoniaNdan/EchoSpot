<?php

namespace App\Console\Commands;

use App\Models\AiConversation;
use Illuminate\Console\Command;

class PruneAIConversations extends Command
{
    protected $signature = 'ai:prune-conversations';

    protected $description = 'Delete AI conversations inactive beyond the configured retention period.';

    public function handle(): int
    {
        $cutoff = now()->subDays((int) config('ai.conversation_retention_days', 90));
        $deleted = AiConversation::query()->where('updated_at', '<', $cutoff)->delete();

        $this->info("Deleted {$deleted} expired AI conversation(s).");

        return self::SUCCESS;
    }
}

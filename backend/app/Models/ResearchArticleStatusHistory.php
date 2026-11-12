<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResearchArticleStatusHistory extends Model
{
    protected $table = 'research_article_status_history';

    protected $fillable = ['research_article_id', 'previous_status', 'new_status', 'changed_by', 'reason'];

    public function article(): BelongsTo
    {
        return $this->belongsTo(ResearchArticle::class, 'research_article_id');
    }
}

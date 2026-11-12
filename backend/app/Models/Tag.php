<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = ['slug', 'name'];

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(ResearchArticle::class, 'research_article_tag');
    }
}

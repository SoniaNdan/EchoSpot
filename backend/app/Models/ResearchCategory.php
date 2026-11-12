<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearchCategory extends Model
{
    use HasFactory;

    protected $fillable = ['slug', 'name'];

    public function articles(): HasMany
    {
        return $this->hasMany(ResearchArticle::class, 'category_id');
    }
}

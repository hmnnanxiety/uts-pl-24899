<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GearItem extends Model
{
    protected $fillable = [
        'code',
        'name',
        'brand',
        'model',
        'category',
        'condition',
        'status',
        'storage_location',
        'purchase_date',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
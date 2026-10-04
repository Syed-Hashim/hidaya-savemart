<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'fee',
        'minimum_order',
        'eta_text',
        'is_active',
    ];

    protected $casts = [
        'fee' => 'decimal:2',
        'minimum_order' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}

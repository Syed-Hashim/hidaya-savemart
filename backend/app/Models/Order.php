<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    public const STATUSES = ['New', 'Packing', 'Out', 'Delivered'];

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_phone',
        'delivery_zone_id',
        'address',
        'payment_method_id',
        'status',
        'subtotal',
        'delivery_fee',
        'total',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function deliveryZone()
    {
        return $this->belongsTo(DeliveryZone::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function nextStatus(): ?string
    {
        $index = array_search($this->status, self::STATUSES, true);

        if ($index === false || $index >= count(self::STATUSES) - 1) {
            return null;
        }

        return self::STATUSES[$index + 1];
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['items', 'deliveryZone', 'paymentMethod'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json([
            'status' => true,
            'data'   => $query->get(),
        ], 200);
    }

    public function show(Order $order)
    {
        return response()->json([
            'status' => true,
            'data'   => $order->load(['items', 'deliveryZone', 'paymentMethod']),
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'          => 'required|string|max:255',
            'customer_phone'         => 'nullable|string|max:50',
            'delivery_zone_id'       => 'nullable|exists:delivery_zones,id',
            'address'                => 'nullable|string|max:255',
            'payment_method_id'      => 'required|exists:payment_methods,id',
            'notes'                  => 'nullable|string',
            'items'                  => 'required|array|min:1',
            'items.*.product_id'     => 'required|exists:products,id',
            'items.*.quantity'       => 'required|integer|min:1',
        ]);

        $order = DB::transaction(function () use ($validated) {
            $subtotal = 0;
            $lines = [];

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "Not enough stock for {$product->name} (only {$product->stock_quantity} left).",
                    ]);
                }

                $lineTotal = $product->price * $item['quantity'];
                $subtotal += $lineTotal;

                $lines[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'unit_price'   => $product->price,
                    'quantity'     => $item['quantity'],
                    'line_total'   => $lineTotal,
                ];

                $product->decrement('stock_quantity', $item['quantity']);
            }

            $deliveryFee = 0;
            if (!empty($validated['delivery_zone_id'])) {
                $zone = \App\Models\DeliveryZone::find($validated['delivery_zone_id']);
                $deliveryFee = $zone ? (float) $zone->fee : 0;
            }

            $order = Order::create([
                'order_number'      => 'PENDING',
                'customer_name'     => $validated['customer_name'],
                'customer_phone'    => $validated['customer_phone'] ?? null,
                'delivery_zone_id'  => $validated['delivery_zone_id'] ?? null,
                'address'           => $validated['address'] ?? null,
                'payment_method_id' => $validated['payment_method_id'],
                'status'            => Order::STATUSES[0],
                'subtotal'          => $subtotal,
                'delivery_fee'      => $deliveryFee,
                'total'             => $subtotal + $deliveryFee,
                'notes'             => $validated['notes'] ?? null,
            ]);

            $order->order_number = 'SM-' . (1000 + $order->id);
            $order->save();

            foreach ($lines as $line) {
                $order->items()->create($line);
            }

            return $order;
        });

        return response()->json([
            'status'  => true,
            'message' => 'Order created successfully',
            'data'    => $order->load(['items', 'deliveryZone', 'paymentMethod']),
        ], 201);
    }

    public function advance(Order $order)
    {
        $next = $order->nextStatus();

        if (!$next) {
            return response()->json([
                'status'  => false,
                'message' => 'Order is already at its final status',
            ], 422);
        }

        $order->update(['status' => $next]);

        return response()->json([
            'status'  => true,
            'message' => "Order marked as {$next}",
            'data'    => $order->load(['items', 'deliveryZone', 'paymentMethod']),
        ], 200);
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Order deleted successfully',
        ], 200);
    }
}

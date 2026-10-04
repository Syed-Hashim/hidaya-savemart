<?php

namespace App\Http\Controllers;

use App\Models\DeliveryZone;
use Illuminate\Http\Request;

class DeliveryZoneController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => true,
            'data'   => DeliveryZone::orderBy('name')->get(),
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'fee'           => 'required|numeric|min:0',
            'minimum_order' => 'required|numeric|min:0',
            'eta_text'      => 'nullable|string|max:255',
            'is_active'     => 'sometimes|boolean',
        ]);

        $zone = DeliveryZone::create($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Delivery zone created successfully',
            'data'    => $zone,
        ], 201);
    }

    public function update(Request $request, DeliveryZone $deliveryZone)
    {
        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'fee'           => 'sometimes|required|numeric|min:0',
            'minimum_order' => 'sometimes|required|numeric|min:0',
            'eta_text'      => 'nullable|string|max:255',
            'is_active'     => 'sometimes|boolean',
        ]);

        $deliveryZone->update($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Delivery zone updated successfully',
            'data'    => $deliveryZone,
        ], 200);
    }

    public function destroy(DeliveryZone $deliveryZone)
    {
        $deliveryZone->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Delivery zone deleted successfully',
        ], 200);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => true,
            'data'   => PaymentMethod::orderBy('label')->get(),
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'key'         => 'required|string|max:50|unique:payment_methods,key',
            'label'       => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'is_active'   => 'sometimes|boolean',
        ]);

        $method = PaymentMethod::create($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Payment method created successfully',
            'data'    => $method,
        ], 201);
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $validated = $request->validate([
            'key'         => 'sometimes|required|string|max:50|unique:payment_methods,key,' . $paymentMethod->id,
            'label'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:255',
            'is_active'   => 'sometimes|boolean',
        ]);

        $paymentMethod->update($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Payment method updated successfully',
            'data'    => $paymentMethod,
        ], 200);
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        $paymentMethod->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Payment method deleted successfully',
        ], 200);
    }
}

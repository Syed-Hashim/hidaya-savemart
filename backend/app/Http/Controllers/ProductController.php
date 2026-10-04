<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => true,
            'data'   => Product::with('category')->latest()->get(),
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id'    => 'required|exists:categories,id',
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'price'          => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'image'          => 'nullable|image|max:2048',
            'is_active'      => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Product created successfully',
            'data'    => $product->load('category'),
        ], 201);
    }

    public function show(Product $product)
    {
        return response()->json([
            'status' => true,
            'data'   => $product->load('category'),
        ], 200);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id'    => 'sometimes|required|exists:categories,id',
            'name'           => 'sometimes|required|string|max:255',
            'description'    => 'nullable|string',
            'price'          => 'sometimes|required|numeric|min:0',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'image'          => 'nullable|image|max:2048',
            'is_active'      => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Product updated successfully',
            'data'    => $product->load('category'),
        ], 200);
    }

    public function destroy(Product $product)
    {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Product deleted successfully',
        ], 200);
    }
}

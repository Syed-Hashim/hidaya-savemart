<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => true,
            'data'   => Category::orderBy('name')->get(),
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = Category::create($request->only('name'));

        return response()->json([
            'status'  => true,
            'message' => 'Category created successfully',
            'data'    => $category,
        ], 201);
    }

    public function show(Category $category)
    {
        return response()->json([
            'status' => true,
            'data'   => $category,
        ], 200);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        $category->update($request->only('name'));

        return response()->json([
            'status'  => true,
            'message' => 'Category updated successfully',
            'data'    => $category,
        ], 200);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Category deleted successfully',
        ], 200);
    }
}

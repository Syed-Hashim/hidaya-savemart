<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;

// Public routes — no token needed
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes — token required
Route::middleware(['auth:api'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Categories (admin)
    Route::get('/categories',          [CategoryController::class, 'index']);
    Route::post('/categories',         [CategoryController::class, 'store']);
    Route::get('/categories/{category}',    [CategoryController::class, 'show']);
    Route::post('/categories/{category}',   [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Products (admin)
    Route::get('/products',          [ProductController::class, 'index']);
    Route::post('/products',         [ProductController::class, 'store']);
    Route::get('/products/{product}',    [ProductController::class, 'show']);
    Route::post('/products/{product}',   [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
});
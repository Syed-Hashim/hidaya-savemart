<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DeliveryZoneController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\DashboardController;

// Public routes — no token needed
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes — token required
Route::middleware(['auth:api'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Dashboard (admin)
    Route::get('/dashboard', [DashboardController::class, 'index']);

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

    // Orders (admin)
    Route::get('/orders',             [OrderController::class, 'index']);
    Route::post('/orders',            [OrderController::class, 'store']);
    Route::get('/orders/{order}',     [OrderController::class, 'show']);
    Route::post('/orders/{order}/advance', [OrderController::class, 'advance']);
    Route::delete('/orders/{order}',  [OrderController::class, 'destroy']);

    // Delivery zones (admin)
    Route::get('/delivery-zones',          [DeliveryZoneController::class, 'index']);
    Route::post('/delivery-zones',         [DeliveryZoneController::class, 'store']);
    Route::post('/delivery-zones/{deliveryZone}',   [DeliveryZoneController::class, 'update']);
    Route::delete('/delivery-zones/{deliveryZone}', [DeliveryZoneController::class, 'destroy']);

    // Payment methods (admin)
    Route::get('/payment-methods',          [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods',         [PaymentMethodController::class, 'store']);
    Route::post('/payment-methods/{paymentMethod}',   [PaymentMethodController::class, 'update']);
    Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy']);
});

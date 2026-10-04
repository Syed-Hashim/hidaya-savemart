<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Step 1 — validate the incoming request
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Step 2 — grab email and password from request
        $credentials = $request->only('email', 'password');

        // Step 3 — try to login and generate token
        $token = Auth::attempt($credentials);

        // Step 4 — if login failed
        if (!$token) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid email or password',
            ], 401);
        }

        // Step 5 — if login successful return token
        return response()->json([
            'status'  => true,
            'message' => 'Login successful',
            'data'    => [
                'token'      => $token,
                'token_type' => 'bearer',
                'user'       => Auth::user(),
            ]
        ], 200);
    }

    public function logout()
    {
        // invalidate the current token
        Auth::logout();

        return response()->json([
            'status'  => true,
            'message' => 'Logged out successfully',
        ], 200);
    }

    public function me()
    {
        // return currently logged in user
        return response()->json([
            'status' => true,
            'data'   => Auth::user(),
        ], 200);
    }
}
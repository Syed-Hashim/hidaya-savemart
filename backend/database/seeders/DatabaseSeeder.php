<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $methods = [
            ['key' => 'cod', 'label' => 'Cash on delivery', 'description' => 'Pay at your door'],
            ['key' => 'jazzcash', 'label' => 'JazzCash', 'description' => 'Mobile wallet'],
            ['key' => 'easypaisa', 'label' => 'Easypaisa', 'description' => 'Mobile wallet'],
            ['key' => 'raast', 'label' => 'Raast', 'description' => 'Instant bank transfer'],
        ];

        foreach ($methods as $method) {
            PaymentMethod::updateOrCreate(['key' => $method['key']], $method);
        }
    }
}

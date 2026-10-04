<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        $salesToday = Order::whereDate('created_at', $today)->sum('total');
        $ordersToday = Order::whereDate('created_at', $today)->count();
        $toPack = Order::where('status', 'Packing')->count();
        $newOrders = Order::where('status', 'New')->count();

        $salesLast7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = $today->copy()->subDays($i);
            $salesLast7Days[] = [
                'label' => $i === 0 ? 'Today' : $day->format('D'),
                'total' => (float) Order::whereDate('created_at', $day)->sum('total'),
            ];
        }

        $bestSellers = OrderItem::select('product_name', DB::raw('SUM(quantity) as sold'))
            ->whereHas('order', function ($query) use ($today) {
                $query->where('created_at', '>=', $today->copy()->subDays(6));
            })
            ->groupBy('product_name')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => true,
            'data'   => [
                'sales_today'      => (float) $salesToday,
                'orders_today'     => $ordersToday,
                'to_pack'          => $toPack,
                'new_orders'       => $newOrders,
                'sales_last_7_days' => $salesLast7Days,
                'best_sellers'     => $bestSellers,
            ],
        ], 200);
    }
}

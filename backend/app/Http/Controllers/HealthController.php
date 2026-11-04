<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks = [
            'database' => 'ok',
            'cache' => 'ok',
        ];

        try {
            DB::select('SELECT 1');
        } catch (Throwable) {
            $checks['database'] = 'failed';
            Log::error('health.database.failed', [
                'actor' => 'health_probe',
                'action' => 'database.ping',
                'reason' => 'select_1_failed',
            ]);
        }

        $cacheKey = 'health:'.Str::uuid();

        try {
            if (! Cache::put($cacheKey, 'ok', 10) || Cache::pull($cacheKey) !== 'ok') {
                $checks['cache'] = 'failed';
            }
        } catch (Throwable) {
            $checks['cache'] = 'failed';
        }

        if ($checks['cache'] === 'failed') {
            Log::error('health.cache.failed', [
                'actor' => 'health_probe',
                'action' => 'cache.round_trip',
                'reason' => 'cache_probe_failed',
            ]);
        }

        $healthy = ! in_array('failed', $checks, true);

        return response()->json([
            'status' => $healthy ? 'healthy' : 'unhealthy',
            'checks' => $checks,
        ], $healthy ? 200 : 503)->header('Cache-Control', 'no-store');
    }
}

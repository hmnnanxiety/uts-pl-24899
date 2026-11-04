<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Tests\TestCase;

class HealthTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_checks_the_database_and_database_cache(): void
    {
        config(['cache.default' => 'database']);

        $this->getJson('/health')
            ->assertOk()
            ->assertExactJson([
                'status' => 'healthy',
                'checks' => ['database' => 'ok', 'cache' => 'ok'],
            ]);

        $this->assertDatabaseEmpty('cache');
    }

    public function test_database_failure_is_reported_without_logging_the_exception(): void
    {
        DB::shouldReceive('select')->once()->with('SELECT 1')
            ->andThrow(new RuntimeException('Sensitive connection details'));
        Log::spy();

        $this->getJson('/health')
            ->assertServiceUnavailable()
            ->assertExactJson([
                'status' => 'unhealthy',
                'checks' => ['database' => 'failed', 'cache' => 'ok'],
            ]);

        Log::shouldHaveReceived('error')->once()->with('health.database.failed', [
            'actor' => 'health_probe',
            'action' => 'database.ping',
            'reason' => 'select_1_failed',
        ]);
    }

    public function test_cache_failure_is_reported_independently(): void
    {
        config(['cache.default' => 'null']);

        $this->getJson('/health')
            ->assertServiceUnavailable()
            ->assertExactJson([
                'status' => 'unhealthy',
                'checks' => ['database' => 'ok', 'cache' => 'failed'],
            ]);
    }
}

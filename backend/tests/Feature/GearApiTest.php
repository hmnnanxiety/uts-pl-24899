<?php

namespace Tests\Feature;

use App\Models\GearItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GearApiTest extends TestCase
{
    use RefreshDatabase;

    private function createGear(User $creator): GearItem
    {
        return GearItem::create([
            'created_by' => $creator->id,
            'code' => 'CAM-001',
            'name' => 'Sony Alpha A7 III',
            'brand' => 'Sony',
            'category' => 'camera',
            'condition' => 'excellent',
            'status' => 'available',
        ]);
    }

    public function test_guest_cannot_access_gear(): void
    {
        $this->getJson('/api/gear')
            ->assertUnauthorized();

        $this->postJson('/api/gear', [
            'code' => 'CAM-001',
            'name' => 'Sony Alpha',
            'brand' => 'Sony',
            'category' => 'camera',
        ])->assertUnauthorized();
    }

    public function test_staff_can_create_gear(): void
    {
        $staff = User::factory()->create();
        $otherStaff = User::factory()->create();

        Sanctum::actingAs($staff);

        $this->postJson('/api/gear', [
            'code' => 'CAM-001',
            'name' => 'Sony Alpha A7 III',
            'brand' => 'Sony',
            'category' => 'camera',
            'condition' => 'excellent',
            'status' => 'available',
            'created_by' => $otherStaff->id,
        ])
            ->assertCreated()
            ->assertJsonPath('data.code', 'CAM-001')
            ->assertJsonPath('data.created_by', $staff->id);

        $this->assertDatabaseHas('gear_items', [
            'code' => 'CAM-001',
            'created_by' => $staff->id,
        ]);
    }

    public function test_staff_can_list_and_view_gear(): void
    {
        $staff = User::factory()->create();
        $gear = $this->createGear($staff);

        Sanctum::actingAs($staff);

        $this->getJson('/api/gear')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.code', 'CAM-001');

        $this->getJson("/api/gear/{$gear->id}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Sony Alpha A7 III');
    }

    public function test_another_staff_can_manage_shared_inventory(): void
    {
        $creator = User::factory()->create();
        $staff = User::factory()->create();

        $gear = $this->createGear($creator);

        Sanctum::actingAs($staff);

        $this->getJson("/api/gear/{$gear->id}")
            ->assertOk();

        $this->putJson("/api/gear/{$gear->id}", [
            'status' => 'in_use',
            'condition' => 'good',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_use')
            ->assertJsonPath('data.condition', 'good')
            ->assertJsonPath('data.created_by', $creator->id);

        $this->assertDatabaseHas('gear_items', [
            'id' => $gear->id,
            'status' => 'in_use',
            'created_by' => $creator->id,
        ]);
    }

    public function test_staff_can_delete_gear(): void
    {
        $staff = User::factory()->create();
        $gear = $this->createGear($staff);

        Sanctum::actingAs($staff);

        $this->deleteJson("/api/gear/{$gear->id}")
            ->assertOk();

        $this->assertDatabaseMissing('gear_items', [
            'id' => $gear->id,
        ]);

        $this->getJson("/api/gear/{$gear->id}")
            ->assertNotFound();
    }

    public function test_invalid_gear_returns_422(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/gear', [
            'name' => '',
            'category' => 'spaceship',
            'condition' => 'perfect',
            'status' => 'sold',
            'purchase_date' => 'bukan-tanggal',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'code',
                'name',
                'brand',
                'category',
                'condition',
                'status',
                'purchase_date',
            ]);
    }

    public function test_duplicate_inventory_code_is_rejected(): void
    {
        $staff = User::factory()->create();

        $this->createGear($staff);

        Sanctum::actingAs($staff);

        $this->postJson('/api/gear', [
            'code' => 'CAM-001',
            'name' => 'Canon EOS R6',
            'brand' => 'Canon',
            'category' => 'camera',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['code']);

        $this->assertDatabaseCount('gear_items', 1);
    }

    public function test_missing_gear_returns_404(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/gear/999')
            ->assertNotFound();

        $this->putJson('/api/gear/999', [
            'name' => 'Updated',
        ])->assertNotFound();

        $this->deleteJson('/api/gear/999')
            ->assertNotFound();
    }
}
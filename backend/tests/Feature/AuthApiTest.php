<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Illuminate\Support\Facades\Auth;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(): User
    {
        return User::factory()->create([
            'email' => 'demo@uts.test',
            'password' => Hash::make('DemoUTS123!'),
        ]);
    }

    public function test_user_can_login_and_receive_token(): void
    {
        $this->createUser();

        $this->postJson('/api/login', [
            'email' => 'demo@uts.test',
            'password' => 'DemoUTS123!',
        ])
            ->assertOk()
            ->assertJsonStructure([
                'message',
                'token',
                'token_type',
                'user' => ['id', 'name', 'email'],
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_login_rejects_wrong_password(): void
    {
        $this->createUser();

        $this->postJson('/api/login', [
            'email' => 'demo@uts.test',
            'password' => 'WrongPassword',
        ])->assertUnauthorized();
    }

    public function test_login_validates_input(): void
    {
        $this->postJson('/api/login', [
            'email' => 'bukan-email',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_protected_endpoint_requires_token(): void
    {
        $this->getJson('/api/me')
            ->assertUnauthorized();
    }

    public function test_user_can_access_profile_with_token(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('uts-test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'demo@uts.test');
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('uts-test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);

        // Simulasikan request baru dengan auth guard yang bersih.
        Auth::forgetGuards();

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertUnauthorized();
    }
}
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\GearController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Legacy resource (akan dihapus setelah refactor selesai)
    Route::apiResource('tasks', TaskController::class);

    // FrameVault equipment resource
    Route::apiResource('gear', GearController::class);
});
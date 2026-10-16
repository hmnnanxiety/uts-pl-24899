<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GearItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GearController extends Controller
{
    public function index(): JsonResponse
    {
        $gear = GearItem::query()
            ->latest()
            ->get();

        return response()->json([
            'data' => $gear,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => [
                'required',
                'string',
                'max:32',
                Rule::unique('gear_items', 'code'),
            ],
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['required', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'category' => [
                'required',
                Rule::in([
                    'camera',
                    'lens',
                    'lighting',
                    'tripod',
                    'accessory',
                ]),
            ],
            'condition' => [
                'sometimes',
                Rule::in([
                    'excellent',
                    'good',
                    'fair',
                    'damaged',
                ]),
            ],
            'status' => [
                'sometimes',
                Rule::in([
                    'available',
                    'in_use',
                    'maintenance',
                ]),
            ],
            'storage_location' => [
                'nullable',
                'string',
                'max:255',
            ],
            'purchase_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $gear = GearItem::create([
            ...$data,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Equipment berhasil ditambahkan.',
            'data' => $gear,
        ], 201);
    }

    public function show(GearItem $gear): JsonResponse
    {
        return response()->json([
            'data' => $gear,
        ]);
    }

    public function update(
        Request $request,
        GearItem $gear
    ): JsonResponse {
        $data = $request->validate([
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:32',
                Rule::unique('gear_items', 'code')
                    ->ignore($gear->id),
            ],
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'brand' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'model' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],
            'category' => [
                'sometimes',
                'required',
                Rule::in([
                    'camera',
                    'lens',
                    'lighting',
                    'tripod',
                    'accessory',
                ]),
            ],
            'condition' => [
                'sometimes',
                Rule::in([
                    'excellent',
                    'good',
                    'fair',
                    'damaged',
                ]),
            ],
            'status' => [
                'sometimes',
                Rule::in([
                    'available',
                    'in_use',
                    'maintenance',
                ]),
            ],
            'storage_location' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
            'purchase_date' => [
                'sometimes',
                'nullable',
                'date',
            ],
            'notes' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ]);

        $gear->update($data);

        return response()->json([
            'message' => 'Equipment berhasil diperbarui.',
            'data' => $gear->fresh(),
        ]);
    }

    public function destroy(GearItem $gear): JsonResponse
    {
        $gear->delete();

        return response()->json([
            'message' => 'Equipment berhasil dihapus.',
        ]);
    }
}
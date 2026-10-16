<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tasks = Task::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => $tasks,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::in([
                'pending', 'in_progress', 'completed'
            ])],
            'priority' => ['sometimes', Rule::in([
                'low', 'medium', 'high'
            ])],
            'due_date' => ['nullable', 'date'],
        ]);

        $task = Task::create([
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Task berhasil dibuat.',
            'data' => $task,
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $task = $this->findOwnedTask($request, $id);

        return response()->json([
            'data' => $task,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $task = $this->findOwnedTask($request, $id);

        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', Rule::in([
                'pending', 'in_progress', 'completed'
            ])],
            'priority' => ['sometimes', Rule::in([
                'low', 'medium', 'high'
            ])],
            'due_date' => ['sometimes', 'nullable', 'date'],
        ]);

        $task->update($data);

        return response()->json([
            'message' => 'Task berhasil diperbarui.',
            'data' => $task->fresh(),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $task = $this->findOwnedTask($request, $id);

        $task->delete();

        return response()->json([
            'message' => 'Task berhasil dihapus.',
        ]);
    }

    private function findOwnedTask(Request $request, string $id): Task
    {
        return Task::query()
            ->where('user_id', $request->user()->id)
            ->whereKey($id)
            ->firstOrFail();
    }
}
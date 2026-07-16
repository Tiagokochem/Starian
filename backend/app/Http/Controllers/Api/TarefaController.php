<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTarefaRequest;
use App\Http\Requests\UpdateTarefaRequest;
use App\Http\Resources\TarefaResource;
use App\Models\Tarefa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TarefaController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return TarefaResource::collection(
            Tarefa::query()->orderBy('id')->get()
        );
    }

    public function store(StoreTarefaRequest $request): JsonResponse
    {
        $tarefa = Tarefa::create([
            'title' => $request->validated('title'),
            'completed' => false,
        ]);

        return (new TarefaResource($tarefa))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateTarefaRequest $request, Tarefa $tarefa): TarefaResource
    {
        $tarefa->update($request->validated());

        return new TarefaResource($tarefa->fresh());
    }

    public function destroy(Tarefa $tarefa): Response
    {
        $tarefa->delete();

        return response()->noContent();
    }
}

<?php

namespace Tests\Feature;

use App\Models\Tarefa;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TarefaApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lista_tarefas(): void
    {
        Tarefa::factory()->count(2)->create();

        $response = $this->getJson('/api/tarefas');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonStructure([
                '*' => ['id', 'title', 'completed'],
            ]);
    }

    public function test_cria_tarefa(): void
    {
        $response = $this->postJson('/api/tarefas', [
            'title' => 'Nova tarefa',
        ]);

        $response->assertCreated()
            ->assertJsonFragment([
                'title' => 'Nova tarefa',
                'completed' => false,
            ]);

        $this->assertDatabaseHas('tarefas', [
            'title' => 'Nova tarefa',
            'completed' => false,
        ]);
    }

    public function test_nao_cria_tarefa_sem_titulo(): void
    {
        $response = $this->postJson('/api/tarefas', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title']);
    }

    public function test_atualiza_tarefa_completed(): void
    {
        $tarefa = Tarefa::factory()->create(['completed' => false]);

        $response = $this->patchJson("/api/tarefas/{$tarefa->id}", [
            'completed' => true,
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $tarefa->id,
                'completed' => true,
            ]);

        $this->assertDatabaseHas('tarefas', [
            'id' => $tarefa->id,
            'completed' => true,
        ]);
    }

    public function test_remove_tarefa(): void
    {
        $tarefa = Tarefa::factory()->create();

        $response = $this->deleteJson("/api/tarefas/{$tarefa->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('tarefas', ['id' => $tarefa->id]);
    }

    public function test_retorna_404_ao_remover_tarefa_inexistente(): void
    {
        $response = $this->deleteJson('/api/tarefas/999');

        $response->assertNotFound();
    }

    public function test_retorna_404_ao_atualizar_tarefa_inexistente(): void
    {
        $response = $this->patchJson('/api/tarefas/999', [
            'completed' => true,
        ]);

        $response->assertNotFound();
    }
}

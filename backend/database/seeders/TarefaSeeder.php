<?php

namespace Database\Seeders;

use App\Models\Tarefa;
use Illuminate\Database\Seeder;

class TarefaSeeder extends Seeder
{
    public function run(): void
    {
        Tarefa::query()->delete();

        Tarefa::insert([
            [
                'title' => 'Tarefa 1',
                'completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Tarefa 2',
                'completed' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Tarefa 3',
                'completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

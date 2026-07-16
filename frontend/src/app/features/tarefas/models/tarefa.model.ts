export interface Tarefa {
  id: number;
  title: string;
  completed: boolean;
}

export interface CreateTarefaDto {
  title: string;
}

export interface UpdateTarefaDto {
  title?: string;
  completed?: boolean;
}

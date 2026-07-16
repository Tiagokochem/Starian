import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Tarefa } from '../models/tarefa.model';
import { TarefaService } from '../services/tarefa.service';
import { TarefaFormComponent } from '../components/tarefa-form/tarefa-form.component';
import { TarefaListaComponent } from '../components/tarefa-lista/tarefa-lista.component';

@Component({
  selector: 'app-tarefas-page',
  standalone: true,
  imports: [TarefaFormComponent, TarefaListaComponent],
  templateUrl: './tarefas-page.component.html',
  styleUrl: './tarefas-page.component.scss',
})
export class TarefasPageComponent implements OnInit {
  private readonly tarefaService = inject(TarefaService);
  private readonly destroyRef = inject(DestroyRef);
//teste
  tarefas: Tarefa[] = [];
  loading = false;
  saving = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.carregar();
  }

  get busy(): boolean {
    return this.loading || this.saving;
  }

  carregar(): void {
    this.loading = true;
    this.errorMessage = null;

    this.tarefaService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tarefas) => {
          this.tarefas = tarefas;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = this.mensagemErro(error, 'Não foi possível carregar as tarefas.');
        },
      });
  }

  criar(title: string): void {
    this.saving = true;
    this.errorMessage = null;

    this.tarefaService
      .criar({ title })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tarefa) => {
          this.tarefas = [...this.tarefas, tarefa];
          this.saving = false;
        },
        error: (error: HttpErrorResponse) => {
          this.saving = false;
          this.errorMessage = this.mensagemErro(error, 'Não foi possível criar a tarefa.');
        },
      });
  }

  remover(id: number): void {
    this.saving = true;
    this.errorMessage = null;

    this.tarefaService
      .remover(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.tarefas = this.tarefas.filter((tarefa) => tarefa.id !== id);
          this.saving = false;
        },
        error: (error: HttpErrorResponse) => {
          this.saving = false;
          this.errorMessage = this.mensagemErro(error, 'Não foi possível remover a tarefa.');
        },
      });
  }

  alternar(tarefa: Tarefa): void {
    this.saving = true;
    this.errorMessage = null;

    this.tarefaService
      .atualizar(tarefa.id, { completed: !tarefa.completed })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (atualizada) => {
          this.tarefas = this.tarefas.map((item) =>
            item.id === atualizada.id ? atualizada : item
          );
          this.saving = false;
        },
        error: (error: HttpErrorResponse) => {
          this.saving = false;
          this.errorMessage = this.mensagemErro(error, 'Não foi possível atualizar a tarefa.');
        },
      });
  }

  private mensagemErro(error: HttpErrorResponse, fallback: string): string {
    if (error.status === 422 && error.error?.message) {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'API indisponível. Verifique se o backend está em execução.';
    }

    return fallback;
  }
}

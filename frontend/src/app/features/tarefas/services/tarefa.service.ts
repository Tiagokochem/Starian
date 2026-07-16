import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateTarefaDto, Tarefa, UpdateTarefaDto } from '../models/tarefa.model';

@Injectable({
  providedIn: 'root',
})
export class TarefaService {
  private readonly baseUrl = `${environment.apiUrl}/tarefas`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.baseUrl);
  }

  criar(payload: CreateTarefaDto): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: UpdateTarefaDto): Observable<Tarefa> {
    return this.http.patch<Tarefa>(`${this.baseUrl}/${id}`, payload);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

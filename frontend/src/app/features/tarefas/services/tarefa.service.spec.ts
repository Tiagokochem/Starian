import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TarefaService } from './tarefa.service';
import { environment } from '../../../../environments/environment';
import { Tarefa } from '../models/tarefa.model';

describe('TarefaService', () => {
  let service: TarefaService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/tarefas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(TarefaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar tarefas', () => {
    const mock: Tarefa[] = [
      { id: 1, title: 'Tarefa 1', completed: false },
    ];

    service.listar().subscribe((tarefas) => {
      expect(tarefas).toEqual(mock);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('deve criar tarefa', () => {
    const criada: Tarefa = { id: 2, title: 'Nova', completed: false };

    service.criar({ title: 'Nova' }).subscribe((tarefa) => {
      expect(tarefa).toEqual(criada);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Nova' });
    req.flush(criada);
  });

  it('deve atualizar tarefa', () => {
    const atualizada: Tarefa = { id: 1, title: 'Tarefa 1', completed: true };

    service.atualizar(1, { completed: true }).subscribe((tarefa) => {
      expect(tarefa.completed).toBeTrue();
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PATCH');
    req.flush(atualizada);
  });

  it('deve remover tarefa', () => {
    service.remover(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

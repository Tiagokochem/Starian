import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TarefasPageComponent } from './tarefas-page.component';
import { TarefaService } from '../services/tarefa.service';
import { Tarefa } from '../models/tarefa.model';

describe('TarefasPageComponent', () => {
  let fixture: ComponentFixture<TarefasPageComponent>;
  let component: TarefasPageComponent;
  let tarefaService: jasmine.SpyObj<TarefaService>;

  const tarefasMock: Tarefa[] = [
    { id: 1, title: 'Tarefa 1', completed: false },
    { id: 2, title: 'Tarefa 2', completed: true },
  ];

  beforeEach(async () => {
    tarefaService = jasmine.createSpyObj<TarefaService>('TarefaService', [
      'listar',
      'criar',
      'remover',
      'atualizar',
    ]);

    tarefaService.listar.and.returnValue(of(tarefasMock));

    await TestBed.configureTestingModule({
      imports: [TarefasPageComponent],
      providers: [{ provide: TarefaService, useValue: tarefaService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TarefasPageComponent);
    component = fixture.componentInstance;
  });

  it('deve carregar tarefas com sucesso', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(tarefaService.listar).toHaveBeenCalled();
    expect(component.tarefas.length).toBe(2);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Tarefa 1');
  }));

  it('deve exibir erro quando a listagem falhar', fakeAsync(() => {
    tarefaService.listar.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 0,
            statusText: 'Unknown Error',
          })
      )
    );

    fixture.detectChanges();
    tick();

    expect(component.tarefas).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('API indisponível');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  }));

  it('deve criar tarefa e atualizar a lista', fakeAsync(() => {
    const criada: Tarefa = { id: 3, title: 'Nova', completed: false };
    tarefaService.criar.and.returnValue(of(criada));

    fixture.detectChanges();
    tick();

    component.criar('Nova');
    tick();

    expect(tarefaService.criar).toHaveBeenCalledWith({ title: 'Nova' });
    expect(component.tarefas.some((t) => t.id === 3)).toBeTrue();
    expect(component.saving).toBeFalse();
  }));

  it('não deve remover da lista quando a API falhar', fakeAsync(() => {
    tarefaService.remover.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            statusText: 'Server Error',
          })
      )
    );

    fixture.detectChanges();
    tick();

    component.remover(1);
    tick();

    expect(component.tarefas.some((t) => t.id === 1)).toBeTrue();
    expect(component.errorMessage).toContain('Não foi possível remover');
  }));
});

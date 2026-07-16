import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarefa } from '../../models/tarefa.model';
import { TarefaItemComponent } from '../tarefa-item/tarefa-item.component';

@Component({
  selector: 'app-tarefa-lista',
  standalone: true,
  imports: [TarefaItemComponent],
  templateUrl: './tarefa-lista.component.html',
  styleUrl: './tarefa-lista.component.scss',
})
export class TarefaListaComponent {
  @Input() tarefas: Tarefa[] = [];
  @Input() busy = false;
  @Output() remover = new EventEmitter<number>();
  @Output() alternar = new EventEmitter<Tarefa>();
}

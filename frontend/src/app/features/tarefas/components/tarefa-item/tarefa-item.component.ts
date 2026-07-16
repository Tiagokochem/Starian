import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarefa } from '../../models/tarefa.model';

@Component({
  selector: 'app-tarefa-item',
  standalone: true,
  templateUrl: './tarefa-item.component.html',
  styleUrl: './tarefa-item.component.scss',
})
export class TarefaItemComponent {
  @Input({ required: true }) tarefa!: Tarefa;
  @Input() busy = false;
  @Output() remover = new EventEmitter<number>();
  @Output() alternar = new EventEmitter<Tarefa>();

  onRemover(): void {
    if (!this.busy) {
      this.remover.emit(this.tarefa.id);
    }
  }

  onAlternar(): void {
    if (!this.busy) {
      this.alternar.emit(this.tarefa);
    }
  }
}

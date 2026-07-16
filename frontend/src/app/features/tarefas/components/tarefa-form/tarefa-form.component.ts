import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tarefa-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tarefa-form.component.html',
  styleUrl: './tarefa-form.component.scss',
})
export class TarefaFormComponent {
  @Input() disabled = false;
  @Output() criar = new EventEmitter<string>();

  titulo = '';

  enviar(): void {
    const titulo = this.titulo.trim();
    if (!titulo || this.disabled) {
      return;
    }

    this.criar.emit(titulo);
    this.titulo = '';
  }
}

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/tarefas/pages/tarefas-page.component').then(
        (m) => m.TarefasPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

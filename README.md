# Starian — Teste Técnico (Angular + Laravel)

Aplicação de **Tarefas** refatorada a partir de um template propositalmente mal estruturado.

## Como subir

### Pré-requisitos

- Docker e Docker Compose

### Subir a stack

```bash
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend (Angular) | http://localhost:4201 |
| Backend (Laravel API) | http://localhost:8000 |

> A porta **4201** é usada no host porque a **4200** costuma estar ocupada por outros ambientes. Dentro do container o Angular continua na 4200.

Na primeira subida o container Laravel executa `composer install`, migrations e seed.

### API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/tarefas` | Lista tarefas |
| `POST` | `/api/tarefas` | Cria tarefa (`{ "title": "..." }`) |
| `PATCH` | `/api/tarefas/{id}` | Atualiza (`title` e/ou `completed`) |
| `DELETE` | `/api/tarefas/{id}` | Remove tarefa |

### Testes do backend

```bash
docker compose exec laravel php artisan test
```

## O que foi refatorado

### Backend

- Removida persistência em `storage/tarefas.json` → **SQLite + Eloquent**
- Removidas closures/funções globais em rotas → **Controller + Form Requests + Resource**
- Rotas de API registradas corretamente (`/api`), sem misturar com `web` (CSRF)
- CORS customizado aberto (`*`) substituído por **CORS nativo** com origem do frontend
- Validação de entrada, 404 em recursos inexistentes e seeder inicial

### Frontend

- HTTP e lógica removidos do `AppComponent` → **feature `tarefas`** (page, form, lista, item)
- **Service tipado** + `environment.apiUrl`
- `provideHttpClient()` no bootstrap (sem `HttpClientModule` no componente)
- Estados de **loading / erro / vazio** (sem dados fake no erro)
- Layout **responsivo** em SCSS, com label, Enter para submit e botões desabilitados durante requests
- Toggle de `completed` alinhado ao campo já existente no domínio

### Docker

- Paths de volume/`WORKDIR` alinhados
- Backend com `pdo_sqlite`
- Porta do frontend no host mapeada para **4201** para evitar conflito

## Estrutura relevante

```text
backend/
  app/Http/Controllers/Api/TarefaController.php
  app/Http/Requests/
  app/Http/Resources/TarefaResource.php
  app/Models/Tarefa.php
  routes/api.php
frontend/
  src/app/features/tarefas/
  src/environments/
```

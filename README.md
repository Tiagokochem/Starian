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

Na primeira subida o container Laravel executa `composer install`, migrations e seed (idempotente: só popula se a tabela estiver vazia).

### API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/tarefas` | Lista tarefas |
| `POST` | `/api/tarefas` | Cria tarefa (`{ "title": "..." }`) |
| `PATCH` | `/api/tarefas/{id}` | Atualiza (`title` e/ou `completed`) |
| `DELETE` | `/api/tarefas/{id}` | Remove tarefa |

### Testes

```bash
# Backend
docker compose exec laravel php artisan test

# Frontend (headless)
cd frontend && npm run test:ci
```

Há também pipeline CI em `.github/workflows/ci.yml` (PHPUnit + `ng test` + `ng build`).

## O que foi refatorado

### Backend

- Removida persistência em `storage/tarefas.json` → **SQLite + Eloquent**
- Removidas closures/funções globais em rotas → **Controller + Form Requests + Resource**
- Rotas de API registradas corretamente (`/api`), sem misturar com `web` (CSRF)
- CORS customizado aberto (`*`) substituído por **CORS nativo** com origem do frontend
- Validação de entrada, 404 em recursos inexistentes e seeder inicial idempotente

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

## Decisões técnicas (e o que não foi feito)

### Feito de propósito

| Decisão | Motivo |
|---------|--------|
| SQLite + Eloquent | O `.env` já apontava para SQLite; JSON não escala, não valida schema e sofre race condition |
| Controller fino + Form Request + Resource | Separação clara de HTTP, validação e shape de resposta sem overengineering |
| Prefixo `/api` | Isola a API do stack `web` (CSRF/sessão) e segue o default do Laravel 11 |
| CORS nativo (`config/cors.php`) | Evita middleware caseiro inseguro (`*`) e trata preflight corretamente |
| Feature folder no Angular | Responsabilidades por domínio; shell (`AppComponent`) só hospeda o router |
| Sem dados fake no erro | Erro deve ser visível; mascarar falha da API esconde regressões |
| Seed idempotente | `migrate --seed` no boot do Docker não deve apagar dados a cada restart |
| PATCH de `completed` | Campo já existia no modelo/UI; completa o contrato, não inventa domínio novo |

### Deliberadamente fora de escopo

| Não feito | Motivo |
|-----------|--------|
| Repository / DDD | Domínio é CRUD simples; Repository genérico adicionaria camadas sem ganho |
| Auth / Sanctum | O teste pede refatoração de estrutura, não autenticação |
| Paginação / versionamento de API | Volume de dados e contrato atuais não justificam |
| Nginx multi-stage de produção | Compose atual é ambiente de desenvolvimento do teste |
| Proxy Angular | `environment.apiUrl` + CORS restrito resolve o cenário local com clareza |

## Estrutura relevante

```text
backend/
  app/Http/Controllers/Api/TarefaController.php
  app/Http/Requests/
  app/Http/Resources/TarefaResource.php
  app/Models/Tarefa.php
  routes/api.php
  tests/Feature/TarefaApiTest.php
frontend/
  src/app/features/tarefas/
  src/environments/
.github/workflows/ci.yml
```

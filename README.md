# Starian — Teste Técnico (Angular + Laravel)

Aplicação de **Tarefas** refatorada a partir de um template propositalmente mal estruturado.

O objetivo desta entrega foi melhorar estrutura, legibilidade, manutenibilidade, separação de responsabilidades, responsividade e confiabilidade sem transformar um CRUD simples em uma arquitetura desnecessariamente complexa.

## Apoio de IA

Durante a refatoração utilizei apoio de IA no **Cursor**, com modelo **GPT-5.5**, para acelerar diagnóstico, organização do plano, revisão de más práticas, escrita de testes e documentação.

As decisões técnicas, validações e ajustes finais foram conduzidos com foco no escopo do teste: manter a aplicação funcionando, corrigir más práticas reais e evitar overengineering.

## Stack e versões

### Ambiente

| Item | Versão / configuração |
|------|------------------------|
| Docker Compose | Compose v2 (`docker compose`) |
| Backend container | `php:8.3-cli` |
| Frontend container | `node:20` |
| Banco local | SQLite |
| Porta backend | `8000` |
| Porta frontend no host | `4201` |
| Porta frontend no container | `4200` |

> A porta `4201` foi usada no host porque a `4200` estava ocupada por outro container no ambiente local. Dentro do container Angular a aplicação continua rodando na `4200`.

### Backend

| Dependência | Versão |
|-------------|--------|
| PHP | `8.3` |
| Laravel Framework | `^11.31` declarado; `v11.45.1` no lock |
| PHPUnit | `^11.0.1` |
| Laravel Pint | `^1.13` |
| Banco | SQLite com `pdo_sqlite` |

### Frontend

| Dependência | Versão |
|-------------|--------|
| Angular | `17.3.x` (`@angular/core` resolvido em `17.3.12`) |
| Angular CLI | `^17.3.17` |
| TypeScript | `~5.4.2` |
| RxJS | `~7.8.0` (`7.8.1` no lock) |
| Zone.js | `~0.14.3` |
| Test runner | Karma + Jasmine + Chrome Headless |

## Como rodar

### Pré-requisitos

- Docker
- Docker Compose v2

### Subir a aplicação

Na raiz do projeto:

```bash
docker compose up --build
```

Após subir:

| Serviço | URL |
|---------|-----|
| Frontend (Angular) | http://localhost:4201 |
| Backend (Laravel API) | http://localhost:8000 |
| API de tarefas | http://localhost:8000/api/tarefas |

Na primeira subida o container Laravel executa:

- `composer install`
- criação do arquivo `database/database.sqlite`
- migrations
- seed inicial idempotente
- `php artisan serve`

O container Angular executa:

- `npm install`
- `ng serve --host=0.0.0.0 --port=4200`

### Hot reload

Com os containers rodando, mudanças em arquivos Angular (`.ts`, `.html`, `.scss`) são recompiladas automaticamente pelo `ng serve`.

Não é necessário rodar build manual a cada alteração de código.

Use rebuild apenas quando alterar `Dockerfile`, `docker-compose.yml` ou dependências relevantes:

```bash
docker compose up --build
```

## Comandos úteis

### Backend

```bash
# Rodar todos os testes Laravel
docker compose exec laravel php artisan test

# Rodar apenas os testes da API de tarefas
docker compose exec laravel php artisan test --filter=TarefaApiTest

# Rodar migrations manualmente
docker compose exec laravel php artisan migrate

# Repopular seed manualmente
docker compose exec laravel php artisan db:seed
```

### Frontend

```bash
# Rodar testes headless
docker compose exec angular npm run test:ci

# Rodar build de produção
docker compose exec angular npm run build
```

## Endpoints da API

| Método | Endpoint | Descrição | Body |
|--------|----------|-----------|------|
| `GET` | `/api/tarefas` | Lista tarefas | - |
| `POST` | `/api/tarefas` | Cria tarefa | `{ "title": "Nova tarefa" }` |
| `PATCH` | `/api/tarefas/{id}` | Atualiza tarefa | `{ "title": "Novo título" }` ou `{ "completed": true }` |
| `DELETE` | `/api/tarefas/{id}` | Remove tarefa | - |

Exemplo:

```bash
curl http://localhost:8000/api/tarefas
```

## O que foi refatorado

### Backend

Antes, a API tinha lógica em closures dentro de `routes/api.php`, funções globais para ler/salvar JSON e persistência em `storage/tarefas.json`.

Foi alterado para:

- `TarefaController` em `app/Http/Controllers/Api`
- `StoreTarefaRequest` e `UpdateTarefaRequest` para validação
- `TarefaResource` para padronizar resposta
- `Tarefa` como model Eloquent
- migration `create_tarefas_table`
- factory `TarefaFactory`
- seeder `TarefaSeeder`
- testes de feature em `TarefaApiTest`

Melhorias aplicadas:

- Persistência em **SQLite + Eloquent**
- Rotas de API reais em `/api/tarefas`
- Remoção de API carregada pelo `web.php`
- Remoção de dependência de arquivo JSON
- Validação de payloads
- Retorno `422` para validação inválida
- Retorno `404` para tarefa inexistente
- Retorno `204` em remoção bem-sucedida
- Seed inicial idempotente, sem apagar dados existentes a cada restart

### CORS

O middleware customizado `CorsMiddleware` foi removido porque:

- liberava `Access-Control-Allow-Origin: *`
- estava registrado globalmente
- reinventava comportamento já suportado pelo Laravel
- não era a melhor solução para preflight `OPTIONS`

Foi substituído por `config/cors.php`, usando a origem do frontend (`FRONTEND_URL`).

### Frontend

Antes, o frontend concentrava estado, HTTP, layout e fallback fake dentro do `AppComponent`.

Foi alterado para uma estrutura por feature:

```text
frontend/src/app/features/tarefas/
  components/
    tarefa-form/
    tarefa-item/
    tarefa-lista/
  models/
    tarefa.model.ts
  pages/
    tarefas-page.component.*
  services/
    tarefa.service.ts
```

Melhorias aplicadas:

- `AppComponent` virou shell simples com `router-outlet`
- Rota lazy com `loadComponent`
- `TarefaService` concentra comunicação HTTP
- `environment.apiUrl` remove URL hardcoded no componente
- Tipos `Tarefa`, `CreateTarefaDto` e `UpdateTarefaDto`
- Remoção de `any`
- `provideHttpClient()` no bootstrap
- Remoção de `HttpClientModule` do componente
- Estados explícitos de `loading`, `saving` e `errorMessage`
- Remoção de dados fake em caso de erro
- Delete só altera a lista após sucesso da API
- Toggle de `completed` via `PATCH`
- `takeUntilDestroyed` para encerrar subscriptions com o ciclo de vida do componente
- HTML separado de regra de negócio
- SCSS responsivo, sem estilos inline
- Label no formulário, submit com Enter e botões desabilitados durante requests

### Docker

Melhorias aplicadas:

- `WORKDIR` do backend alinhado com volume (`/var/www`)
- `WORKDIR` do frontend alinhado com volume (`/app`)
- extensão `pdo_sqlite` instalada no backend
- volume separado para `node_modules`
- frontend exposto em `4201:4200` para evitar conflito local
- remoção do `version` obsoleto do Compose

### Testes e CI

Foram adicionados:

- testes de feature Laravel para listar, criar, validar, atualizar e remover tarefas
- testes Angular para `TarefaService`
- testes Angular para `TarefasPageComponent`
- configuração Karma `ChromeHeadlessCI`
- pipeline GitHub Actions em `.github/workflows/ci.yml`

O CI executa:

- `composer install`
- `php artisan test`
- `npm ci`
- `npm run test:ci`
- `npm run build`

## Validação realizada

Validações executadas durante a refatoração:

- Docker Compose subindo Laravel e Angular
- API respondendo em `/api/tarefas`
- CORS liberando origem do frontend
- Angular servindo em `http://localhost:4201`
- PHPUnit: `7` testes passando na API
- Angular/Karma: `8` testes passando

## Decisões técnicas

| Decisão | Motivo |
|---------|--------|
| SQLite + Eloquent | O projeto já apontava para SQLite; é suficiente para o teste e remove a fragilidade do JSON |
| Controller + Form Request + Resource | Separa HTTP, validação e resposta sem criar camadas artificiais |
| Sem Repository Pattern | O domínio é CRUD simples; repository genérico adicionaria complexidade sem ganho real |
| CORS nativo do Laravel | Mais seguro, padronizado e compatível com preflight |
| Feature folder no Angular | Organização por domínio e responsabilidades menores |
| Sem dados fake no erro | Falhas da API devem ser visíveis, não mascaradas |
| Seed idempotente | `docker compose up` não deve apagar dados já criados |
| CI mínimo | Garante que backend e frontend continuam buildando/testando |

## Deliberadamente fora de escopo

| Não implementado | Motivo |
|------------------|--------|
| Autenticação / Sanctum | O teste pede refatoração, não controle de acesso |
| Paginação | Volume e escopo atuais não exigem |
| Versionamento de API | Contrato pequeno e interno ao teste |
| Nginx multi-stage para produção | O Compose atual atende ambiente local de avaliação |
| DDD completo | Seria excesso para um CRUD de tarefas |

## Estrutura relevante

```text
backend/
  app/Http/Controllers/Api/TarefaController.php
  app/Http/Requests/StoreTarefaRequest.php
  app/Http/Requests/UpdateTarefaRequest.php
  app/Http/Resources/TarefaResource.php
  app/Models/Tarefa.php
  config/cors.php
  database/factories/TarefaFactory.php
  database/migrations/2026_07_16_000001_create_tarefas_table.php
  database/seeders/TarefaSeeder.php
  routes/api.php
  tests/Feature/TarefaApiTest.php

frontend/
  src/app/features/tarefas/
  src/app/app.config.ts
  src/app/app.routes.ts
  src/environments/
  karma.conf.js

.github/workflows/ci.yml
docker-compose.yml
```

## Observações finais

Esta refatoração priorizou:

- manter o comportamento da aplicação
- corrigir más práticas estruturais
- melhorar legibilidade e separação de responsabilidades
- adicionar validação e testes
- tornar a execução local previsível
- documentar decisões e trade-offs

O projeto segue simples de rodar, mas com uma base mais limpa para evolução.

# Colmeia API

Rails 8 em modo API. Veja o README na raiz do repositório para a visão geral.

```bash
bundle install
bin/rails db:prepare db:seed
bin/rails server
```

Endpoints em `/api/v1`: `household`, `members`, `tasks` (+ `POST /tasks/:id/complete`), `completions` (+ `POST /completions/:id/review`), `shopping_items` (+ `DELETE /shopping_items/purchased`), `goal`.

Variáveis: `CORS_ORIGINS` (lista separada por vírgula, padrão `http://localhost:5173`), `APP_TIME_ZONE` (padrão `America/Sao_Paulo`).

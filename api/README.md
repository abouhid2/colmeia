# Colmeia API

Rails 8 em modo API. Veja o README na raiz do repositório para a visão geral.

```bash
bundle install
bin/rails db:prepare db:seed
bin/rails server
```

As seeds criam uma colmeia de exemplo com o código de convite `demo`, com duas
estações ("Estação passada", encerrada, e "Estação atual"), e podem rodar mais
de uma vez sem duplicar nada. Ela é marcada como colmeia de exemplo (`demo`), a
mesma coisa que o endpoint público entrega, então o desenvolvimento vê o mesmo
aviso e o mesmo "recomeçar" que o visitante vê.

## Colmeias

Tudo pertence a uma colmeia (`households`). Uma colmeia é endereçada pelo seu
`invite_code`, um código aleatório de 10 caracteres, único, que é o que viaja no
link do convite.

Endpoints públicos, alcançáveis só com o código:

| Verbo  | Rota                                   | O que faz |
| ------ | -------------------------------------- | --------- |
| `POST` | `/api/v1/households`                   | Cria a colmeia. Corpo `{ household: { name, member_names: ["Ana", "Bruno"] } }`. Cada nome vira um membro que ninguém ocupou ainda. Responde 201 com `{ id, name, invite_code, members }`. |
| `GET`  | `/api/v1/households/:invite_code`      | A colmeia e a sua lista, com `claimed` em cada membro. 404 para código desconhecido. |
| `POST` | `/api/v1/households/:invite_code/claim`| Ocupa um membro da lista. Corpo `{ member_id }`. 409 se alguém já ocupou. |
| `POST` | `/api/v1/households/:invite_code/join` | Cria uma pessoa que não estava na lista, já ocupada. Corpo `{ member: { name, avatar, color } }`. |
| `POST` | `/api/v1/households/demo`              | Cria uma colmeia de exemplo, já cheia, e responde 201 com `{ household, member }`. Sem corpo e sem cabeçalho. |

## Colmeias de exemplo

Quem não tem convite nem colmeia pede uma em `POST /api/v1/households/demo`. A
resposta traz a colmeia e o membro por onde entrar (a Ana, já ocupada), então
não há nada a preencher antes de mexer no app.

Uma colmeia de exemplo é uma colmeia como as outras, com o seu próprio código
de convite, marcada com `demo: true`. Todo mundo pode ser ocupado, o convite
funciona, e nada ali é dado de ninguém:

- **Limite**: a API para de entregar exemplos quando já saíram
  `Api::V1::HouseholdsController::DEMO_LIMIT_PER_HOUR` (30) na última hora, e
  responde `429` com a explicação em `details`.
- **Recomeçar**: `POST /api/v1/household/reseed` (com o cabeçalho da colmeia)
  apaga o que foi feito ali e enche a colmeia de novo, respondendo com o membro
  por onde continuar, já que os ids antigos morreram. `409` se a colmeia não for
  de exemplo.
- **Limpeza**: `bin/rails demo:cleanup` apaga as colmeias de exemplo com mais de
  uma semana, com tudo dentro delas. Rode por cron em qualquer deploy público.

Os dados do exemplo vivem em `Households::SeedExample`, usado tanto pelo
endpoint quanto por `db/seeds.rb`.

## Estações

Uma estação (`seasons`) é um campeonato da colmeia: tem as suas tarefas, as
suas metas, os seus pontos e o seu ranking. Cada colmeia tem quantas quiser, e
toda colmeia nasce com uma, a "Primeira estação". Pessoas e lista de compras
ficam na colmeia, fora das estações.

Uma estação começa em `starts_on` e vai até `ends_on`, que pode ficar em branco
("sem data de fim"). Encerrar (`closed_at`) congela o ranking: a estação
encerrada não aceita tarefa nova, meta nova nem conclusão.

| Verbo    | Rota                          | O que faz |
| -------- | ----------------------------- | --------- |
| `GET`    | `/api/v1/seasons`             | As estações da colmeia, da mais recente para a mais antiga, com `tasks_count` e `completions_count`. |
| `POST`   | `/api/v1/seasons`             | Abre uma estação. Corpo `{ season: { name, starts_on, ends_on, copy_tasks_from_season_id } }`. Com `copy_tasks_from_season_id`, copia as tarefas abertas daquela estação (sem prazo e sem histórico). |
| `PATCH`  | `/api/v1/seasons/:id`         | Muda nome e datas. |
| `POST`   | `/api/v1/seasons/:id/close`   | Encerra. 409 se já estava encerrada. |
| `POST`   | `/api/v1/seasons/:id/reopen`  | Reabre. 409 se não estava encerrada. |
| `DELETE` | `/api/v1/seasons/:id`         | Apaga a estação e as tarefas e metas dela. 409 quando já tem conclusões. |

`tasks`, `goals` e `completions` carregam `season_id`. Criar tarefa ou meta
exige uma estação da própria colmeia (422 se faltar ou for de outra); os
índices aceitam `?season_id=` para filtrar e, sem ele, devolvem todas as
estações. A conclusão guarda a estação da tarefa no momento em que é feita, e
por isso o histórico sobrevive à tarefa ser apagada.

## Endpoints com escopo

Todo o resto exige o cabeçalho `X-Household-Code: <invite_code>` e só enxerga a
colmeia daquele código. Sem cabeçalho, ou com um código que ninguém tem, a
resposta é `401 { "error": "unauthorized" }`. Um id de outra colmeia responde
404: não dá para completar uma tarefa com alguém de fora, nem avaliar por ela.

`household` (`GET` devolve `{ id, name, invite_code, demo }`, `PATCH` renomeia,
`POST /household/reseed` recomeça uma colmeia de exemplo),
`members`, `seasons` (+ `close` e `reopen`), `tasks`
(+ `POST /tasks/:id/complete`), `completions`
(+ `POST /completions/:id/review`), `shopping_items`
(+ `DELETE /shopping_items/purchased`), `goals`.

```bash
curl -H "X-Household-Code: demo" http://localhost:3000/api/v1/tasks
```

Variáveis: `CORS_ORIGINS` (lista separada por vírgula, padrão `http://localhost:5173`), `APP_TIME_ZONE` (padrão `America/Sao_Paulo`).

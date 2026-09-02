# Colmeia API

Rails 8 em modo API. Veja o README na raiz do repositório para a visão geral.

```bash
bundle install
bin/rails db:prepare db:seed
bin/rails server
```

As seeds criam uma colmeia de demonstração com o código de convite `demo`, com
duas estações ("Estação passada", encerrada, e "Estação atual"), e podem rodar
mais de uma vez sem duplicar nada.

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

`household` (`GET` devolve `{ id, name, invite_code }`, `PATCH` renomeia),
`members`, `seasons` (+ `close` e `reopen`), `tasks`
(+ `POST /tasks/:id/complete`), `completions`
(+ `POST /completions/:id/review`), `shopping_items`
(+ `DELETE /shopping_items/purchased`), `goals`.

```bash
curl -H "X-Household-Code: demo" http://localhost:3000/api/v1/tasks
```

Variáveis: `CORS_ORIGINS` (lista separada por vírgula, padrão `http://localhost:5173`), `APP_TIME_ZONE` (padrão `America/Sao_Paulo`).

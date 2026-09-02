# Colmeia API

Rails 8 em modo API. Veja o README na raiz do repositório para a visão geral.

```bash
bundle install
bin/rails db:prepare db:seed
bin/rails server
```

As seeds criam uma colmeia de demonstração com o código de convite `demo` e
podem rodar mais de uma vez sem duplicar nada.

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

## Endpoints com escopo

Todo o resto exige o cabeçalho `X-Household-Code: <invite_code>` e só enxerga a
colmeia daquele código. Sem cabeçalho, ou com um código que ninguém tem, a
resposta é `401 { "error": "unauthorized" }`. Um id de outra colmeia responde
404: não dá para completar uma tarefa com alguém de fora, nem avaliar por ela.

`household` (`GET` devolve `{ id, name, invite_code }`, `PATCH` renomeia),
`members`, `tasks` (+ `POST /tasks/:id/complete`), `completions`
(+ `POST /completions/:id/review`), `shopping_items`
(+ `DELETE /shopping_items/purchased`), `goals`.

```bash
curl -H "X-Household-Code: demo" http://localhost:3000/api/v1/tasks
```

Variáveis: `CORS_ORIGINS` (lista separada por vírgula, padrão `http://localhost:5173`), `APP_TIME_ZONE` (padrão `America/Sao_Paulo`).

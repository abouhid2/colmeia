# Colmeia

As tarefas da casa viram pontos, e os pontos viram uma recompensa para a família inteira.

A casa é a colmeia: cada tarefa concluída enche uma célula do favo. Quando o favo enche, a família ganha a recompensa combinada (pizza no sábado, passeio, o que for).

## O que dá para fazer

- **Tarefas com pontos**: cada tarefa vale o que a família decidir (uma resistência de chuveiro queimada pode valer 50 pontos).
- **Avaliação opcional**: tarefas marcadas "com avaliação" só liberam os pontos depois que outra pessoa dá uma nota de 1 a 5. Os pontos saem proporcionais à nota. Ninguém avalia o próprio trabalho.
- **Recorrência**: diária, semanal, mensal ou a cada N dias. A próxima data conta a partir do dia em que a tarefa foi feita. Tarefas pontuais fecham ao concluir.
- **Responsável**: qualquer tarefa pode ser atribuída a alguém ou deixada para "quem pegar primeiro".
- **Prioridade**: baixa, normal, alta ou urgente. As vencidas e urgentes aparecem primeiro.
- **Lista de compras** compartilhada, com quem pediu e quem comprou.
- **Meta coletiva** por semana ou mês, com o favo de progresso e o ranking de quem mais contribuiu.

## Estrutura

```
api/   Rails 8 (API only, SQLite): regras de negócio, persistência, specs
web/   React 19 + Vite + Tailwind 4: a interface, com dois modos de dados
```

O front funciona de dois jeitos, escolhidos pela variável `VITE_API_URL`:

- **Sem API** (o que roda no GitHub Pages): tudo fica no `localStorage` do navegador, com dados de exemplo. Bom para experimentar.
- **Com API**: aponta para o Rails e a família inteira compartilha os mesmos dados.

As regras (pontos por nota, avanço de recorrência, quem pode avaliar) existem nos dois lados e são testadas nos dois.

## Rodando

API:

```bash
cd api
bundle install
bin/rails db:prepare db:seed
bin/rails server            # http://localhost:3000
```

Web:

```bash
cd web
pnpm install
cp .env.example .env        # opcional: aponta para a API
pnpm dev                    # http://localhost:5173
```

Testes:

```bash
cd api && bundle exec rspec
cd web && pnpm test
```

## Deploy

Todo push em `main` publica o `web/` no GitHub Pages pelo workflow em `.github/workflows/deploy-pages.yml`. O caminho base é derivado do nome do repositório, então renomear o repo não quebra o deploy.

A API não roda no Pages. Para uso real, hospede o Rails em qualquer lugar (Render, Fly, um Raspberry na sala) e defina `VITE_API_URL` no build do front e `CORS_ORIGINS` na API.

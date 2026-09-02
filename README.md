# Colmeia

As tarefas da casa viram pontos, e os pontos viram uma recompensa para a família inteira.

A casa é a colmeia: cada tarefa concluída enche uma célula do favo. Quando o favo enche, a família ganha a recompensa combinada (pizza no sábado, passeio, o que for).

## O que dá para fazer

- **Uma colmeia por casa**: cada colmeia tem o seu link de convite, e ninguém vê os dados da outra.
- **Estações**: campeonatos que a família cria e nomeia. Cada estação tem as suas tarefas, as suas metas, os seus pontos e o seu ranking.
- **Tarefas com pontos**: cada tarefa vale o que a família decidir (uma resistência de chuveiro queimada pode valer 50 pontos).
- **Avaliação opcional**: tarefas marcadas "com avaliação" só liberam os pontos depois que outra pessoa dá uma nota de 1 a 5. Os pontos saem proporcionais à nota. Ninguém avalia o próprio trabalho.
- **Recorrência**: diária, semanal, mensal ou a cada N dias. A próxima data conta a partir do dia em que a tarefa foi feita. Tarefas pontuais fecham ao concluir.
- **Responsável**: qualquer tarefa pode ser atribuída a alguém ou deixada para "quem pegar primeiro".
- **Prioridade**: baixa, normal, alta ou urgente. As vencidas e urgentes aparecem primeiro.
- **Lista de compras** compartilhada, com quem pediu e quem comprou.
- **Metas da estação**: uma coletiva, com o favo de progresso e o ranking de quem mais contribuiu, e quantas individuais quiserem (só os pontos daquela pessoa contam).
- **Filtro por integrante** presente em todas as telas: escolha uma pessoa e o app mostra só as tarefas, compras, metas e conquistas dela.

## Estações

Uma estação é um campeonato da casa. A família abre quantas quiser e dá o nome
que quiser: "Estação do verão", "Setembro", "Férias". Cada estação tem as suas
tarefas, as suas metas, os seus pontos e o seu ranking; pessoas e lista de
compras ficam na colmeia, fora das estações.

Abrir uma estação nova pode **reaproveitar as tarefas abertas** de outra: as
mesmas tarefas de casa voltam, com o placar zerado e sem prazo. Uma estação
começa num dia e pode ficar **sem data de fim**, correndo até alguém encerrar.

**Encerrar congela o ranking**: a estação encerrada vira histórico e não aceita
tarefa nova, meta nova nem conclusão. Quem mais pontuou na última estação
encerrada, com a meta batida, usa a coroa e o título que escolheu enquanto a
estação seguinte corre. Dá para reabrir uma estação encerrada, e apagar uma que
ainda não tem nenhuma conclusão.

O seletor de estação fica na barra lateral e no cabeçalho, e a página
`/estacoes` é onde se cria, ajusta, encerra e reabre.

## Colmeias e convites

Uma colmeia é uma casa. Quem cria dá um nome e escreve quem mora lá: cada nome
vira um espantalho, uma pessoa que existe na lista mas que ninguém ocupou
ainda.

A colmeia ganha um código de convite e o link `/entrar/<código>`. Quem abre o
link vê o nome da colmeia e a lista, e escolhe:

- **"Sou essa pessoa"** ocupa um espantalho. Quem já entrou aparece apagado e
  não pode ser escolhido de novo.
- **"Sou outra pessoa"** cria uma pessoa nova, já ocupada.

A partir daí o navegador fica preso àquela colmeia e àquela pessoa
(`colmeia.session` no `localStorage`). O seletor no topo continua trocando de
pessoa dentro da mesma colmeia, que é o caso do tablet da cozinha. Sem sessão,
o app abre numa tela com dois caminhos: criar uma colmeia ou colar um link de
convite.

O botão **Convidar**, na barra lateral e no cabeçalho, copia o link. Na página
Família ele fica sempre à vista, junto de quem ainda não entrou e da saída da
colmeia.

**Sem API o link só funciona no mesmo navegador**: não há servidor para o outro
lado do link alcançar. O app diz isso na cara, e é por isso que o modo
demonstração serve para experimentar, não para a família inteira usar.

## Estrutura

```
api/   Rails 8 (API only, SQLite): regras de negócio, persistência, specs
web/   React 19 + Vite + Tailwind 4: a interface, com dois modos de dados
```

O front funciona de dois jeitos, escolhidos pela variável `VITE_API_URL`:

- **Sem API** (o que roda no GitHub Pages): tudo fica no `localStorage` do navegador, uma chave por colmeia, com dados de exemplo na colmeia `demo` (uma estação encerrada e outra em andamento). Bom para experimentar, mas os convites não saem daquele navegador.
- **Com API**: aponta para o Rails e a família inteira compartilha os mesmos dados. Cada requisição leva o código da colmeia no cabeçalho `X-Household-Code`.

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

# Colmeia

As tarefas da casa viram pontos, e os pontos viram uma recompensa para a família inteira.

A casa é a colmeia: cada tarefa concluída enche uma célula do favo. Quando o favo enche, a família ganha a recompensa combinada (pizza no sábado, passeio, o que for).

## O que dá para fazer

- **Uma colmeia por casa**: cada colmeia tem o seu link de convite, e ninguém vê os dados da outra.
- **Tarefas com pontos**: cada tarefa vale o que a família decidir (uma resistência de chuveiro queimada pode valer 50 pontos).
- **Avaliação opcional**: tarefas marcadas "com avaliação" só liberam os pontos depois que outra pessoa dá uma nota de 1 a 5. Os pontos saem proporcionais à nota. Ninguém avalia o próprio trabalho.
- **Recorrência**: diária, semanal, mensal ou a cada N dias. A próxima data conta a partir do dia em que a tarefa foi feita. Tarefas pontuais fecham ao concluir.
- **Responsável**: qualquer tarefa pode ser atribuída a alguém ou deixada para "quem pegar primeiro".
- **Prioridade**: baixa, normal, alta ou urgente. As vencidas e urgentes aparecem primeiro.
- **Lista de compras** compartilhada, com quem pediu e quem comprou.
- **Metas** por semana ou mês: uma coletiva, com o favo de progresso e o ranking de quem mais contribuiu, e quantas individuais quiserem (só os pontos daquela pessoa contam).
- **Lagartinhas**: crianças na colmeia. Cada pessoa é abelha ou lagartinha, e a lagartinha ganha os pontos multiplicados (1,5× por padrão, ajustável de 0,5× a 3×) para conseguir acompanhar os adultos. O multiplicador aparece na cara, ao lado do nome. Há um ranking só das lagartinhas, e as tarefas podem ser marcadas "boa para lagartinhas", com filtro na lista. O raciocínio está em [docs/lagartinhas.md](docs/lagartinhas.md).
- **Filtro por integrante** presente em todas as telas: escolha uma pessoa e o app mostra só as tarefas, compras, metas e conquistas dela.
- **Família de exemplo**: quem chega sem convite e sem colmeia clica em "Experimentar com uma família de exemplo" e cai numa colmeia só dele, já cheia de tarefas, pessoas e histórico de mentira. Dá para mexer em tudo, recomeçar do zero e sair quando quiser.

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
o app abre numa tela com três caminhos: criar uma colmeia, colar um link de
convite ou entrar numa família de exemplo.

A família de exemplo é uma colmeia como as outras, com o seu próprio código de
convite, mas marcada como exemplo: quem pediu entra direto como a Ana, um aviso
no topo lembra que nada ali é de verdade, e a página Família tem um
"Recomeçar o exemplo" que devolve tudo ao estado inicial. Cada visitante ganha
a sua, e ninguém vê a dos outros.

O botão **Convidar**, na barra lateral e no cabeçalho, copia o link. Na página
Família ele fica sempre à vista, junto de quem ainda não entrou e da saída da
colmeia.

**Sem API o link só funciona no mesmo navegador**: não há servidor para o outro
lado do link alcançar. O app diz isso na cara, e é por isso que a família de
exemplo serve para experimentar, não para a família inteira usar.

## Estrutura

```
api/   Rails 8 (API only, SQLite): regras de negócio, persistência, specs
web/   React 19 + Vite + Tailwind 4: a interface, com dois modos de dados
```

O front funciona de dois jeitos, escolhidos pela variável `VITE_API_URL`:

- **Sem API** (o que roda no GitHub Pages): tudo fica no `localStorage` do navegador, uma chave por colmeia. Um navegador novo não guarda nada até alguém criar uma colmeia, entrar por um convite ou pedir a família de exemplo. Bom para experimentar, mas os convites não saem daquele navegador.
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

O site abre na tela inicial, sem dados nenhum: a família de exemplo fica a um clique, em "Experimentar com uma família de exemplo".

A API não roda no Pages. Para uso real, hospede o Rails em qualquer lugar (Render, Fly, um Raspberry na sala) e defina `VITE_API_URL` no build do front e `CORS_ORIGINS` na API.

# Como o Claude Code está configurado aqui

Este documento explica o que está em cada lugar, o que vai para o GitHub e o que fica só na sua
máquina. Se você abrir o repositório em outro computador, só a primeira parte vem junto.

## O que é versionado

| Arquivo                | Para que serve                                                     |
| ---------------------- | ------------------------------------------------------------------ |
| `CLAUDE.md`            | As regras do projeto. É lido automaticamente em toda sessão.        |
| `docs/claude-setup.md` | Este arquivo.                                                       |

O `CLAUDE.md` é curto de propósito. Ele tem o mapa da stack, as regras que não podem ser quebradas,
os comandos e a lista de verificação antes de dar qualquer coisa por pronta. Ele aponta para os
arquivos detalhados, mas não depende deles: quem clonar o repositório sem a pasta local ainda recebe
tudo que importa.

## O que fica só na sua máquina

Toda a pasta `.claude/` está no `.gitignore`. Ela foi destilada das suas configurações de trabalho, e
essas configurações não vão para um repositório público. Nada no `CLAUDE.md` depende dela existir.

```
.claude/
  rules/       o detalhe longo, um arquivo por assunto
  skills/      rotinas repetíveis, invocáveis pelo nome
  agents/      contratos de subagente
  hooks/       um guarda de segurança para comandos de shell
  memory/      fatos do projeto que o código não registra
  settings.json  permissões e o hook
```

### `rules/`

São seis arquivos, cada um com um assunto. O Claude lê o que for relevante para a tarefa.

- **`frontend.md`**: o sistema de design (a paleta do `index.css` é a única fonte de cor), componentes
  presentacionais, lógica em hooks, limites de tamanho de arquivo, mobile primeiro, acessibilidade.
  Tem a regra da contenção: antes de terminar uma tela, tire uma coisa.
- **`rails.md`**: controllers finos, um service por verbo, serializers, specs com o cabeçalho da
  colmeia, migrations, i18n em pt-BR.
- **`parity.md`**: a disciplina das regras que existem duas vezes, em Ruby e em TypeScript. Tem a
  tabela de onde mora cada regra e a lista de conferência.
- **`review.md`**: a revisão adversarial antes de entregar. Isolamento entre colmeias, datas e fuso,
  diálogos, toasts, limites, migrations, código morto. Termina com um veredito GO ou NO-GO.
- **`workflow.md`**: worktrees, commits, merge, e o mais importante, o que conferir de um relatório de
  subagente em vez de acreditar nele.
- **`copy.md`**: o guia de tom em português. Vocabulário do produto, exemplos de bom e ruim, e a lista
  de frases que soam a máquina.

### `skills/`

Rotinas. Você invoca pelo nome com `/verify-feature`, ou o Claude entra nelas sozinho quando a tarefa
combina com a descrição.

- **`verify-feature`**: a verificação completa antes de dar por pronto. As duas suítes, typecheck,
  build, lint, paridade, navegador, revisão adversarial, e o formato do relatório.
- **`subagent-brief`**: o modelo para delegar uma feature a um agente numa worktree. Um briefing sem
  os comandos de setup produz um agente que roda a suíte na pasta errada e reporta verde.
- **`browser-check`**: a rotina do Chrome DevTools. Página própria, 390px e 1280px, o fluxo inteiro e
  não só o carregamento, console limpo, e nunca encostar nas suas abas.
- **`merge-branch`**: fechar uma branch. Verificar na worktree, trazer o `main`, rodar as suítes de
  novo, e só então, com o seu aval, mergear, publicar e acompanhar o CI.
- **`copy-pass`**: revisar as strings em português de um diff ou de uma tela.

### `agents/`

Três contratos de subagente.

- **`adversarial-reviewer`**: caçador de bugs, só leitura. Roda as suítes ele mesmo em vez de
  acreditar em quem entregou, e devolve as descobertas como ordem de serviço com veredito.
- **`feature-builder`**: o implementador padrão de uma worktree. Constrói, testa, verifica no
  navegador, commita na branch, e nunca faz merge nem push.
- **`copy-editor`**: revisa e reescreve as strings em português. Só mexe em texto, nunca em lógica.

### `hooks/guard-bash.sh`

Um `PreToolUse` que roda antes de qualquer comando de shell e bloqueia cinco coisas: `git push` com
força, `--no-verify`, um `git commit` cuja mensagem contenha atribuição de IA, um `git commit` feito
na `main`, e comandos destrutivos de banco. Ele falha aberto de propósito: se o `jq` sumir ou o
payload vier estranho, o comando passa. Um guarda quebrado não pode travar a sessão.

O bloqueio de atribuição existe porque a ferramenta às vezes sugere sozinha um rodapé
`Co-Authored-By` ou um link de sessão. Esse repositório nunca leva isso.

O bloqueio de commit na `main` segue o fluxo de worktree: a feature nasce em `feat/<slug>` e a `main`
recebe por fast-forward, que não cria commit e portanto passa. Se você quiser mesmo commitar direto
na `main`, apague o bloco `git commit` com `BRANCH` do `guard-bash.sh`. São seis linhas.

### `memory/`

Fatos que o código não conta. Um fato por arquivo, com frontmatter, mais um `MEMORY.md` que é só o
índice. Já vem com oito: por que cada worktree precisa das próprias dependências, por que o oxlint
estoura memória, as faixas de timestamp das migrations, o truque do `404.html` no GitHub Pages, o
código da colmeia de demonstração, o arredondamento que difere entre Ruby e JavaScript, por que o CI
carrega o schema em vez de preparar o banco, e por que a paleta padrão do Tailwind foi apagada.

A convenção está em `.claude/memory/README.md`. A regra que mais importa: só escreva o que não dá
para descobrir lendo o código ou o `git log`.

### `settings.json`

Libera sem perguntar o que é leitura e teste: as duas suítes, typecheck, build, lint, rubocop,
brakeman, `git status`, `git log`, `git diff`, `gh run`. Pergunta antes de commit, push, merge,
rebase e PR. Nega força bruta, `reset --hard`, `db:drop`, `db:reset`, e a leitura do `master.key`,
do `credentials.yml.enc` e de qualquer `.env`.

## Como usar no dia a dia

1. Abra o Claude Code na raiz do repositório. O `CLAUDE.md` entra sozinho.
2. Para uma feature nova, peça uma worktree e delegue com o modelo do `subagent-brief`.
3. Antes de fechar qualquer coisa, `/verify-feature`.
4. Antes de mergear, rode o `adversarial-reviewer` na branch.
5. Quando alguma coisa custar tempo duas vezes, peça para salvar em `.claude/memory/`.

## Manutenção

O `CLAUDE.md` é o único arquivo que precisa ficar curto. Se ele passar de umas 120 linhas, alguma
coisa dele pertence a um arquivo em `rules/`. Se uma regra em `rules/` nunca é lida, apague.

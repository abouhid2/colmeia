# Copy: Brazilian Portuguese, warm and concrete

Every string a person reads is pt-BR. The family reading it includes children. Write the way you
would speak to someone in their own kitchen: short, concrete, kind, never corporate, never robotic.

## Voice

- **Short.** One idea per string. If it needs a comma and a semicolon, it needs two strings.
- **Concrete.** Name the thing. "Trocar a resistência do chuveiro", not "Realizar manutenção".
- **Warm, not cute.** "A casa está em dia. Aproveite." Warmth comes from the thought, not from emoji
  or exclamation marks. One exclamation mark per screen is already a lot.
- **Sentence case.** Capitalize the first word and proper nouns. Never Title Case A Whole Button.
- **Second person, informal.** "você", never "vós" and never "o usuário". The app talks to a person.
- **No em-dashes.** Use a comma, a colon, or a full stop.
- **Numbers agree.** "1 ponto", "2 pontos". `formatPoints` in `src/domain/points.ts` already does this.

## The project vocabulary

Use these words and no synonyms, because the product is built on the metaphor.

| Concept              | Word            | Never                            |
| -------------------- | --------------- | -------------------------------- |
| The household        | colmeia         | casa (in UI), grupo, workspace   |
| A person in it       | pessoa, abelha  | usuário, membro, participante    |
| A child in it        | lagartinha      | criança, kid, junior             |
| The reward target    | meta            | objetivo, goal                   |
| Points               | pontos          | créditos, moedas, XP             |
| Progress visual      | favo            | gráfico, barra                   |

## Good and bad

| Bad                                            | Good                                                     |
| ---------------------------------------------- | -------------------------------------------------------- |
| "Nenhum item encontrado."                      | "A casa está em dia. Aproveite."                          |
| "Erro ao processar sua solicitação."           | "Não deu para salvar. Tente de novo."                     |
| "Adicionar Nova Tarefa"                        | "Nova tarefa"                                             |
| "Insira o código de convite do household"      | "Cole o link ou o código"                                 |
| "Você não possui metas cadastradas no sistema" | "Nenhuma meta ainda"                                      |
| "Configure o multiplicador de pontuação"       | "A lagartinha ganha os pontos multiplicados"              |
| "Ops! Algo deu errado 😅"                       | "Essa colmeia não está mais aqui"                         |
| "Tarefa concluída com sucesso!"                | "Feito"                                                   |

## Shapes that repeat

- **Empty state**: a title that names the absence, then one line that says what to do next.
  "Nenhuma tarefa aberta" / "Crie a primeira: o que precisa ser feito na casa?"
- **Toast on success**: two or three words, past tense. "Nome da colmeia salvo".
- **Toast on failure**: what failed, then the way out. "Não deu para entrar. Confira o link."
- **Destructive confirm**: the button says the verb, not "OK". "Confirmar saída", "Confirmar exclusão".
- **Field hint**: an example, prefixed `Ex.:`. "Ex.: pizza e filme no sábado".
- **Explaining a rule**: state the consequence, not the mechanism.
  "Os pontos só entram na colmeia depois da nota." not "O status permanece pending até a avaliação."

## Phrases that read as machine-written

Strike these on sight: "Ops!", "Algo deu errado", "com sucesso", "por favor, tente novamente",
"nossa plataforma", "gerencie suas tarefas", "otimize", "de forma simples e intuitiva", "sistema",
"realizar", "efetuar", "usuário", any sentence that starts with "Aqui você pode".

## Where strings live

- Interface strings sit inline in the component or in a small `*Copy.ts` next to it, like
  `src/components/goal/goalCopy.ts`. Do not build an i18n layer, the app is single language.
- Model and attribute names for API validation errors go in `api/config/locales/pt-BR.yml`.
  Add the attribute there whenever you add a validated column, or the error says the column name.
- `en.yml` exists because Rails wants a default. Keep it in sync in structure, not in tone.

---
name: copy-pass
description: Review pass over the Brazilian Portuguese strings in a Colmeia diff or screen. Use after adding UI text, before finishing a feature, or when asked to improve the wording. Checks tone, vocabulary, empty states, toasts and machine-sounding phrasing.
---

# Copy pass

Read `.claude/rules/copy.md` first, it holds the voice and the vocabulary. This is the routine for
applying it to real strings.

## 1. Collect the strings

```bash
# every quoted string with a capitalized Portuguese start, in the diff
git diff main...HEAD -- web/src | grep -E '^\+' | grep -oE '"[A-ZÀ-Ú][^"]{3,}"' | sort -u

# or across a screen
grep -rhoE '"[A-ZÀ-Ú][^"]{3,}"' web/src/components/<area> web/src/pages/<Page>.tsx | sort -u
```

Do not forget: `aria-label` and `IconButton label`, placeholders, `Ex.:` hints, dialog titles and
descriptions, confirm button labels, toast messages, and `api/config/locales/pt-BR.yml`.

## 2. Read each one out loud

If you would not say it to someone standing in their kitchen, rewrite it. The test is not grammar,
it is whether a person wrote it.

## 3. Checklist per string

- [ ] Sentence case, not Title Case.
- [ ] Accents and cedillas correct. Never `nao`, `voce`, `conclusao`.
- [ ] Project vocabulary: colmeia, pessoa, lagartinha, meta, pontos, favo. No synonyms.
- [ ] No "usuário", "sistema", "realizar", "efetuar", "com sucesso", "Ops!", "Algo deu errado".
- [ ] No em-dash. Comma, colon or full stop.
- [ ] Singular and plural agree with the number. Use `formatPoints` for points.
- [ ] Under about 8 words for a label, under about 15 for a hint.
- [ ] At most one exclamation mark per screen, and probably zero.
- [ ] It says the consequence, not the mechanism. Not "status pending", but what the family sees.

## 4. Shapes

| Where              | Shape                                                       |
| ------------------ | ----------------------------------------------------------- |
| Empty state title  | names the absence: "Nenhuma tarefa aberta"                   |
| Empty state hint   | says what to do: "Crie a primeira: o que precisa ser feito?" |
| Success toast      | two or three words, past tense: "Nome da colmeia salvo"      |
| Error toast        | what failed, then the way out                                |
| Destructive button | the verb: "Confirmar saída", never "OK"                      |
| Field hint         | an example prefixed `Ex.:`                                   |

## 5. Fix and prove

Edit the strings. Then rerun `pnpm test`, because component tests query by accessible name and
renaming a button breaks them. That breakage is the point: it proves the string is user-facing.

## 6. Report

List each change as `antes → depois`, grouped by file, plus anything you left alone and why.

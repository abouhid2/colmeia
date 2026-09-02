# Revisão de texto da Colmeia

O que mudou em cada tela, com o texto antigo e o novo. Foram duas passadas:
115 textos reescritos e depois 27 sub-textos removidos. Nada de comportamento
mudou: só palavra.

O que guiou as escolhas:

- Frase com sujeito e verbo. Subtítulo que não diz nada foi embora.
- Botão diz o que acontece quando você aperta.
- Erro diz o que houve e o que fazer, sem pedir desculpa.
- Vazio convida a fazer alguma coisa.
- Sentence case, sem travessão, sem " - " separando ideias.

## Segunda passada: menos legenda

O dono leu a primeira rodada e disse que ainda soava a IA. O motivo não era a
escolha das palavras, era a quantidade de texto: quase toda seção tinha um
subtítulo explicando o próprio título, e quase todo campo tinha uma legenda
repetindo o rótulo. Interface que explica tudo parece feita por máquina, porque
gente não narra o que está à vista.

Saíram 27 sub-textos. A regra que sobrou:

**Um sub-texto só fica se carrega uma regra que a tela não mostra.** Se ele
descreve o que a lista abaixo obviamente é, ou repete o rótulo, sai.

A definição de estação aparecia cinco vezes: no título da página, na seção da
Família, no seletor, no diálogo de criar e no estado vazio. Ficou só no estado
vazio, que é onde alguém encontra a palavra pela primeira vez sem nada em volta.

### Subtítulos de seção que saíram

| Seção | Subtítulo removido |
| --- | --- |
| Lagartinhas | "O ranking só entre as crianças." |
| Metas e recompensas | "Uma meta para a colmeia inteira e quantas individuais quiserem." |
| Estações (Família) | "Cada campeonato com as suas tarefas, metas e ranking." |
| Metas individuais | "Cada um com a sua meta e a sua recompensa." |
| Para fazer agora | "As mais urgentes primeiro." |
| Tarefas abertas (pessoa) | "Na fila de Duda nesta estação, as mais urgentes primeiro." |
| Histórico de conquistas | "As mais recentes, com a data de cada uma." |
| Ainda não | "Falta pouco para algumas." |
| Histórico (pessoa) | encurtado para "De todas as estações." |

### Títulos de página que perderam a legenda

| Página | Legenda removida |
| --- | --- |
| Compras | "Uma lista só, e todo mundo escreve nela." |
| Estações | "Cada estação é um campeonato com as suas tarefas, metas e ranking." |
| Conquistas | "O que já foi ganho, e o que ainda falta." |

### Estados vazios que viraram só título

| Título | Legenda removida |
| --- | --- |
| Nada concluído ainda | "A primeira tarefa feita aparece aqui." (em duas telas) |
| Duda ainda não tem meta | "Uma recompensa só de Duda, contando os pontos dela." |
| Nada na fila | "Ninguém passou tarefa nenhuma para Duda ainda." |
| Não falta nenhuma | "Duda já ganhou todas." |
| Nada concluído nesta estação | "Toda tarefa feita aparece aqui, até as que se repetem." |
| Ninguém tem meta individual ainda | "Uma recompensa para uma pessoa só, contando os pontos dela." |

Os vazios que aparecem só porque um filtro está ligado perderam a legenda
inteira. O filtro está visível logo acima e sai com um toque, então não precisa
de instrução.

### Campos de formulário

| Campo | Antes | Depois |
| --- | --- | --- |
| Meta em pontos | legenda "Quantos pontos precisam juntar." | sem legenda |
| Recompensa | legenda "O que ganha quem bater a meta." | sem legenda |
| Nome da estação | legenda com exemplos e placeholder abstrato | os exemplos viraram o placeholder |
| Boa para lagartinhas | "Uma criança dá conta desta tarefa sozinha." | sem legenda |
| Abelha | "Ganha exatamente o que a tarefa vale." | sem legenda |
| Quando vencer, vira | "Escolha o título que quiser. Deixe em branco…" | "Deixe em branco para ficar de fora da coroa." |
| Link do convite | "Mande para quem mora aí. Quem abrir escolhe…" | "Quem abrir escolhe quem é na lista." |

O diálogo da meta ganhou um quadro "Como fica" que já mostra o resultado, então
as duas legendas viraram ruído em cima de uma explicação melhor.

A legenda da abelha sumiu, a da lagartinha ficou. Ganhar o valor cheio da tarefa
é o normal e não precisa ser dito; ganhar multiplicado é a exceção e precisa.

### Descrições de diálogo que saíram

| Diálogo | Descrição removida |
| --- | --- |
| Nova meta | "Combinem quantos pontos precisam juntar e o que ganham ao chegar lá." |
| Nova estação | "Um campeonato com as suas tarefas, as suas metas e o seu ranking." |
| Estações (seletor) | "Cada estação tem as suas tarefas, metas e ranking." |
| Convidar | "Cada pessoa abre o link e diz quem é." |

### O que continua explicando, e por quê

- **A regra da coroa**, na Família. Ninguém adivinha como se ganha o título.
- **"Os pontos só entram no favo depois da nota"**, em Para avaliar.
- **A nota de 1 a 5 muda os pontos**, no formulário da tarefa.
- **O multiplicador da lagartinha**, dito por extenso. Bônus escondido não é
  confiado, e isso está escrito em `docs/lagartinhas.md`.
- **"Pode ficar em branco"** e **"as tarefas abertas vêm junto"**, na estação.
  São consequências que só aparecem depois de salvar.
- **O que encerrar uma estação faz.** É irreversível na prática.
- **As telas de beco sem saída**: convite morto, colmeia sumida, pessoa que saiu.
- **Os vazios de primeira vez** que ensinam o próximo passo: a primeira tarefa,
  a primeira estação, a primeira conquista, a lista de compras.
- **"A casa está em dia. Aproveite."** Não explica nada, é a recompensa.

## Glossário

Termos padronizados na interface inteira.

| Termo | O que quer dizer | Onde não usar |
| --- | --- | --- |
| **colmeia** | O grupo de pessoas e tudo que é delas no app: a lista, o favo, as metas, o convite. | Nunca "casa" nesse sentido. |
| **casa** | O lugar físico e o serviço dele: "as tarefas da casa", "a casa está em dia". | Nunca para o grupo de pessoas. |
| **favo** | A barra de progresso da meta da colmeia, o desenho que enche. | |
| **pessoa** | Quem está na colmeia. | Nunca "membro", "integrante", "usuário". |
| **abelha** / **lagartinha** | Adulto e criança. | |
| **meta** | O alvo de pontos. | |
| **recompensa** | O que se ganha quando a meta é batida. | |
| **tarefa** | O que precisa ser feito. | |
| **conquista** | A medalha da página da pessoa. | Não usar para tarefa concluída. |
| **nota** | A avaliação de 1 a 5 estrelas. | |

Duas correções de consistência que vieram daí:

- **"Toda a casa"** virou **"A colmeia inteira"** na meta coletiva, em três telas.
- **"Últimas conquistas"** (o feed do início) virou **"Últimas tarefas feitas"**,
  porque "Conquistas" já é o nome das medalhas na página da pessoa. Duas coisas
  diferentes não podem ter o mesmo nome.

## Página da pessoa

O caso que o dono apontou.

| Antes | Depois |
| --- | --- |
| Conquistas: "Saem sozinhas do que essa pessoa já fez." | Conquistas: "O que a Duda já ganhou, e o que falta." |
| "Atribuídas a Duda, as mais urgentes primeiro." | "Na fila de Duda, as mais urgentes primeiro." |
| "Nada na fila" / "Ninguém atribuiu tarefa nenhuma para essa pessoa." | "Nada na fila" / "Ninguém passou tarefa nenhuma para Duda ainda." |
| Histórico: "Tudo que já foi feito, do mais recente para o mais antigo." | Histórico: "Tudo que Duda já fez, da mais recente para a mais antiga." |
| "Uma recompensa só para essa pessoa, contando só os pontos dela." | "Uma recompensa só de Duda, contando os pontos dela." |
| "Voltar para a Família" | "Voltar para a família" |
| Nota média sem nota nenhuma: travessão longo | traço curto, o travessão saiu daqui também |

O subtítulo das conquistas agora usa o nome da pessoa, que a tela já tem. Fica
mais quente e diz o que a lista é: o que já veio e o que ainda falta.

## Início

| Antes | Depois |
| --- | --- |
| "Nada atribuído a Ana" | "Ana está sem tarefa" |
| "Atribua uma tarefa ou limpe o filtro." | "Passe uma tarefa para essa pessoa ou tire o filtro." |
| "Atribuídas a Ana, as mais urgentes primeiro." | "Na fila de Ana, as mais urgentes primeiro." |
| "Uma recompensa só para uma pessoa, contando só os pontos dela." | "Uma recompensa para uma pessoa só, contando os pontos dela." |
| "Só de Ana." | "Só as de Ana." |
| Seção "Últimas conquistas" | Seção "Últimas tarefas feitas" |

## Tarefas

| Antes | Depois |
| --- | --- |
| "Ana ainda não concluiu nada" | "Ana ainda não fez nada por aqui" |
| "Toda tarefa concluída aparece aqui, inclusive as recorrentes." | "Toda tarefa feita aparece aqui, até as que se repetem." |
| "Nada atribuído a Ana" | "Ana está sem tarefa" |
| "Crie uma tarefa para essa pessoa ou veja todas." | "Crie uma tarefa para essa pessoa ou tire o filtro." |

### Formulário da tarefa

| Antes | Depois |
| --- | --- |
| Botão "Salvar" | "Salvar tarefa" |
| "Excluir" / "Confirmar exclusão" | "Excluir tarefa" / "Excluir mesmo" |
| Erro: "A cada quantos dias?" | "Diga a cada quantos dias" |
| "Outra pessoa dá uma nota de 1 a 5 e os pontos saem proporcionais." | "Outra pessoa dá uma nota de 1 a 5, e os pontos saem conforme a nota." |
| Detalhes: "Opcional: onde está o material, o que observar…" | "Onde está o material, o que observar…" |

### Concluir tarefa

| Antes | Depois |
| --- | --- |
| "Enviado. Outra pessoa avalia e libera os 20 pontos." | "Feito. Agora outra pessoa dá a nota e libera os 20 pontos." |

Os botões "Enviar para avaliação" e "Concluir e ganhar 8" já estavam certos e
ficaram como estavam.

## Avaliar

| Antes | Depois |
| --- | --- |
| Botão "Aprovar" | "Confirmar nota" |
| "Os pontos só entram na colmeia depois da nota." | "Os pontos só entram no favo depois da nota." |
| "Quem fez não avalia o próprio trabalho. Troque de pessoa no topo para avaliar." | "Ninguém avalia o próprio trabalho. Troque de pessoa lá em cima para dar a nota." |

"Aprovar" não dizia o que ia acontecer, e a nota 1 também é aprovação. O botão
agora diz a ação: confirmar a nota que você deu.

## Metas e recompensas

| Antes | Depois |
| --- | --- |
| "Uma recompensa para a casa inteira ou só para uma pessoa." | "Uma recompensa para a colmeia inteira ou só para uma pessoa." |
| Opção "Toda a casa" | "A colmeia inteira" |
| "Meta batida. A recompensa está garantida." | "Meta batida. A recompensa é de vocês." |
| Botão "Ajustar" | "Ajustar meta" |
| "Remover" / "Confirmar remoção" | "Apagar meta" / "Apagar mesmo" |
| Aviso "Meta removida" | "Meta apagada" |
| "Uma meta de pontos para a casa inteira: quando a colmeia enche, todo mundo ganha." | "Uma meta de pontos para a colmeia inteira: quando o favo enche, todo mundo ganha." |
| Botão "Definir meta" | "Criar a meta" |
| "Uma meta para a casa e quantas individuais quiserem." | "Uma meta para a colmeia inteira e quantas individuais quiserem." |
| "Combinem uma recompensa e uma quantidade de pontos." | "Combinem uma recompensa e quantos pontos ela custa." |
| Leitor de tela: "Progresso da meta: 120 de 300 pontos" | "Favo da meta: 120 de 300 pontos" |
| Leitor de tela: "Quem já contribuiu" | "Quem já ajudou" |

## Família

| Antes | Depois |
| --- | --- |
| Botão "Adicionar" (quem mora aqui) | "Adicionar pessoa" |
| Coroa: "Quem mais pontuou na semana passada com a meta batida ganha o título que escolheu (Abelha Rainha, Abelhão ou o que quiser) até o fim desta semana." | "Quem mais pontuou na semana passada e bateu a meta usa o título que escolheu até o fim desta semana." |
| Cartão da pessoa: "12 no período · 40 no total" | "12 esta semana · 40 no total" |
| Lagartinhas: "A disputa das crianças, entre elas." | "O ranking só entre as crianças." |

A frase da coroa tinha três ideias e um parêntese no meio. Os exemplos de título
já aparecem como sugestões clicáveis no formulário, então saíram daqui.

"No período" não dizia qual período. Agora diz.

### Formulário da pessoa

| Antes | Depois |
| --- | --- |
| Campo "Tipo" | "É abelha ou lagartinha?" |
| "Criança: os pontos são multiplicados para ela acompanhar a casa." | "Criança: ganha os pontos multiplicados para acompanhar o resto da colmeia." |
| Botão "Ajustes avançados" | "Mexer no multiplicador" |
| "Remover" / "Confirmar saída" | "Tirar da colmeia" / "Tirar mesmo" |
| Botões "Salvar" / "Adicionar" | "Salvar pessoa" / "Adicionar à colmeia" |
| "Deixe em branco para nunca receber a coroa." | "Deixe em branco para ficar de fora da coroa." |

## Conquistas

Dois textos só repetiam o nome da medalha ("Dez tarefas" / "Dez tarefas
concluídas."). Agora dizem alguma coisa.

| Antes | Depois |
| --- | --- |
| "Dez tarefas concluídas." | "Dez tarefas feitas. A casa sente a diferença." |
| "Cinquenta tarefas concluídas." | "Cinquenta tarefas feitas. Isso já virou hábito." |
| "Cem pontos ganhos desde sempre." | "Cem pontos somados desde o começo." |
| "Quinhentos pontos ganhos desde sempre." | "Quinhentos pontos somados desde o começo." |
| "Recebeu uma nota 5 de alguém da casa." | "Ganhou uma nota 5 de alguém da colmeia." |

Os nomes ("Impecável", "Olho clínico", "Apagou o incêndio", "Missão pesada")
estavam bons e ficaram.

## Compras

| Antes | Depois |
| --- | --- |
| "Uma lista só, todo mundo acrescenta." | "Uma lista só, e todo mundo escreve nela." |
| "Acabou algo? Escreva acima e a casa inteira vê." | "Acabou alguma coisa? Escreva aí em cima que todo mundo vê." |
| Botão "Limpar" | "Tirar da lista" |

## Entrada, convite e colmeia nova

| Antes | Depois |
| --- | --- |
| "Colmeias neste navegador" | "Colmeias que você já abriu aqui" |
| "Outras colmeias neste navegador" | "Outras colmeias que você já abriu aqui" |
| "Escreva quem mora aí. Depois você manda o link e cada pessoa diz qual é ela." | "Escreva quem mora aí. Depois é só mandar o link: cada um entra e diz quem é." |
| "Confira o link com quem te chamou, ou crie a sua própria colmeia." | "Confira o link com quem te chamou. Ou crie a sua própria colmeia." |
| "Sem a API, o link só funciona neste navegador." | "No modo demonstração o link só abre neste navegador." |
| "Confirmar saída" (sair da colmeia) | "Sair mesmo" |
| Lista do convite: "já entrou" | "Já entrou" |
| Histórico: "aguardando avaliação" | "Aguardando avaliação" |

"Sem a API" é conversa de programador. Quem abre o link é a tia.

## Demonstração

| Antes | Depois |
| --- | --- |
| "Para a família inteira usar, rode a API em api/." | "Para a família inteira usar junto, rode a API em api/." |
| Botão "Restaurar exemplo" | "Voltar ao exemplo" |
| Aviso "Dados de exemplo restaurados" | "Exemplo restaurado" |

## Erros

Antes vários erros só diziam que deu errado. Agora dizem o que fazer.

| Antes | Depois |
| --- | --- |
| "Algo deu errado" | "Não deu certo. Tente de novo." |
| "Sem acesso a esta colmeia." | "Você não está nesta colmeia. Abra o link do convite de novo." |
| "Alguém mexeu nisso antes de você." | "Alguém mexeu nisso antes de você. Atualize a página." |
| "Dados inválidos." | "Faltou alguma coisa. Confira o que você escreveu." |
| "Pedido inválido." | "Não deu para entender o pedido. Tente de novo." |
| "O servidor respondeu com erro 500" | "O servidor respondeu com erro 500. Tente de novo em instantes." |
| "Membro não encontrado" | "Essa pessoa não está mais aqui. Atualize a página." |
| "Tarefa não encontrado" | "Essa tarefa não está mais aqui. Atualize a página." |
| "Conclusão não encontrado" | "Essa tarefa feita não está mais aqui. Atualize a página." |
| "Item não encontrado" | "Esse item não está mais aqui. Atualize a página." |
| "Meta não encontrado" | "Essa meta não está mais aqui. Atualize a página." |
| "Use no máximo 120 caracteres" | "Use no máximo 120 letras" |
| "O título cabe em 30 caracteres" | "O título cabe em 30 letras" |
| "A quantidade cabe em 30 caracteres" | "A quantidade cabe em 30 letras" |
| "A meta precisa ser maior que zero" | "A meta precisa de pelo menos 1 ponto" |
| "Os pontos precisam ser um número maior que zero" | "A tarefa vale pelo menos 1 ponto" |
| "Informe a cada quantos dias a tarefa se repete" | "Diga a cada quantos dias a tarefa se repete" |

O "não encontrado" concordava errado com metade dos casos ("Meta não
encontrado"). Sumiu junto.

### Erros que vinham em inglês

A API mandava quatro mensagens em inglês que apareciam na tela do usuário.
Este é o achado mais sério da revisão: não era estilo, era texto quebrado.

| Antes (na tela, em inglês) | Depois |
| --- | --- |
| "task is already done" | "Essa tarefa já foi concluída" |
| "completion was already reviewed" | "Essa tarefa já foi avaliada" |
| "you cannot review your own work" | "Quem fez a tarefa não pode avaliar o próprio trabalho" |
| "task is already open" | "Essa tarefa já está aberta" |
| "rating must be an integer" | "A nota precisa ser um número de 1 a 5" |
| "Responsável is from another colmeia" | "Responsável não é desta colmeia" |
| "essa pessoa já entrou na colmeia" (minúscula) | "Essa pessoa já entrou na colmeia" |

Dois testes de RSpec conferiam essas frases em inglês e foram atualizados.

### Rótulos da API

| Antes | Depois |
| --- | --- |
| "Alguém ou algo referenciado aqui não existe mais. Atualize a página." | "Alguém ou alguma coisa daqui não existe mais. Atualize a página." |
| Modelo "Casa" | "Colmeia" |
| Campo "Nome da casa" | "Nome da colmeia" |
| Modelo "Conclusão" | "Tarefa feita" |

## README

| Antes | Depois |
| --- | --- |
| "Os pontos saem proporcionais à nota." | "Os pontos saem conforme a nota." |
| "cada nome vira um espantalho, uma pessoa que existe na lista mas que ninguém ocupou ainda." | "cada nome vira um lugar guardado na lista, esperando a pessoa dizer que é ela." |
| "uma coletiva, com o favo de progresso e o ranking de quem mais contribuiu" | "uma da colmeia inteira, com o favo enchendo e o ranking de quem mais ajudou" |
| "O multiplicador aparece na cara, ao lado do nome." | "O multiplicador fica à vista, ao lado do nome." |

"Espantalho" era uma metáfora que ninguém entende sem explicação, e a explicação
vinha logo depois, o que prova o ponto.

## O que ficou como estava, de propósito

- **Notas das estrelas** ("Precisa refazer", "Meia-boca", "Ok", "Bem feito",
  "Impecável"). São a melhor coisa escrita no app.
- **Recorrências** ("Uma vez só", "Todo dia", "Toda semana", "Todo mês").
- **"As tarefas da casa viram pontos"** na entrada. Aqui casa é a casa mesmo.
- **"A casa está em dia. Aproveite."** Idem.
- **"Nossa casa"**, o nome que a colmeia recebe quando ninguém escolheu um. É o
  padrão da coluna no banco, definido numa migration já aplicada. Trocar só o
  lado do front deixaria os dois lados diferentes; trocar os dois pede uma
  migration, que não é trabalho de texto.
- **`docs/lagartinhas.md`**. É um documento de decisão com voz própria e
  argumento de gente. Não achei frase de robô lá.
- **`web/README.md`**. É o texto que veio no template do Vite, em inglês, para
  quem programa. Não é texto de usuário.

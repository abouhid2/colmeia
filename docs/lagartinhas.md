# Lagartinhas: crianças na colmeia

## O problema

Uma criança de sete anos não troca a resistência do chuveiro. Ela leva o lixo,
rega as plantas, guarda os brinquedos. Isso vale 5 pontos; a resistência vale 50.

O efeito é aritmético e cruel: no ranking da casa a criança fica no fim para
sempre, e a meta individual dela leva semanas para encher. Quem nunca sobe para
de jogar. O adulto não sente nada disso, porque as tarefas caras estão todas ao
alcance dele.

Precisamos de um jeito de a criança contribuir de verdade para o favo coletivo
sem que a família tenha que fingir que uma tarefa pequena é grande.

## Caminhos possíveis

| Mecanismo | A favor | Contra |
| --- | --- | --- |
| **Multiplicador por pessoa** (a criança ganha 1,5× em tudo) | Uma regra só, visível, ajustável por família. Não mexe no valor das tarefas nem separa as pessoas. | Precisa ser dito na cara, senão parece nota trocada em segredo. |
| **Valor de criança em cada tarefa** (dois preços por tarefa) | Precisão máxima: lavar a louça pode valer 5 para o adulto e 12 para a criança. | Dobra o trabalho de cadastrar tarefa. Ninguém vai manter isso. |
| **Liga separada** (ranking só de lagartinhas) | A criança compete com iguais e pode ganhar. | Sozinha não resolve: ela continua invisível no favo da casa. |
| **Meta individual com alvo menor** | Simples, já existe (é só digitar 30 em vez de 300). | Só conserta a meta pessoal. O ranking da casa continua humilhante. |
| **Contribuição relativa** (percentual do que cada um poderia fazer) | Matematicamente o mais justo. | Ninguém entende o número que aparece na tela. Ponto vira abstração. |

## O que recomendo

**Multiplicador por pessoa, liga separada e uma marca de tarefa boa para
criança.** Os três juntos, porque cada um resolve uma parte diferente.

1. **`points_multiplier` por pessoa**, decimal, 1,0 para abelhas e 1,5 para
   lagartinhas, editável de 0,5 a 3,0. A tela diz a frase inteira: "Duda ganha
   1,5× por ser lagartinha". Nada de bônus escondido. Se a família achar 1,5
   demais, baixa para 1,2 e pronto.
2. **Mini ranking "Lagartinhas"**, ao lado do ranking da casa, aparecendo só
   quando existe alguma criança. É onde a criança disputa de igual para igual.
3. **"Boa para lagartinhas"** nas tarefas, com filtro na lista. A criança abre o
   app e vê o que ela consegue fazer, em vez de uma parede de tarefas de adulto.

O favo coletivo continua somando os pontos já multiplicados de todo mundo. É o
ponto central: a criança move a barra da casa de verdade, e vê isso acontecer.

Descartei o valor duplo por tarefa (custo de cadastro que ninguém paga) e a
contribuição relativa (justa e ilegível). A meta com alvo menor continua
disponível: ela já existe e combina bem com o multiplicador.

## Nem toda casa tem criança

Uma colmeia só de adultos não tem o que fazer com multiplicador, liga separada
nem tarefa marcada para criança: são três coisas na tela que não querem dizer
nada ali. Por isso o assunto inteiro é um interruptor da colmeia,
`lagartinhas_enabled`, na página Família, em "Ajustes da colmeia". Ele nasce
desligado, porque a maioria das casas não tem criança, e a família de exemplo
nasce ligada, porque tem a Duda.

Desligado, nenhuma tela fala em lagartinha: somem o tipo de pessoa e o
multiplicador no cadastro, a marca ao lado do nome, o mini ranking, a marca
"boa para lagartinhas" nas tarefas e o filtro da lista.

O que ele não faz é mexer em ninguém. Quem está cadastrado como lagartinha
continua lagartinha, com o multiplicador que tem, e os pontos continuam saindo
multiplicados. Desligar é parar de falar do assunto, não reescrever o que já
aconteceu, pelo mesmo motivo do histórico logo abaixo. Quem desliga com uma
criança na casa lê isso embaixo do interruptor, com o nome dela.

## Como interage com o resto

**Avaliação.** A ordem importa e é sempre a mesma: a nota escala os pontos base
da tarefa, e só então o multiplicador entra. Uma tarefa de 20 pontos com nota 4
dá 16, e a lagartinha com 1,5× leva 24. A criança não é punida duas vezes por
uma nota baixa, nem ganha bônus sobre pontos que não conquistou.

**Recorrência.** Nada muda. A tarefa volta na data seguinte como sempre, e cada
conclusão aplica o multiplicador de quem fez naquele dia.

**Histórico.** Cada conclusão guarda o multiplicador usado. Se a família mudar o
1,5 para 1,2 no mês que vem, o que já foi ganho continua valendo o que valia. O
passado não é reescrito.

// Conteudo embutido do app (Fase 1: texto e imagens reais; codigos/bonus provisorios
// da [[Tabela de Conteudo do App]], calibragem fina fica para a Fase 5).
//
// O texto vive em [[Roteiro de Conteudo do App]]; aqui ele esta em formato de dados,
// na ordem em que aparece em cada card.

export const IMG = (name: string) => `${import.meta.env.BASE_URL}images/${name}`;
export const AUDIO = (path: string) => `${import.meta.env.BASE_URL}audio/${path}`;

export type CardTag = "abertura" | "principal" | "secundaria" | "final";
export type FinalKind = "fracasso" | "v1" | "v2";

export type Box =
  | { kind: "narrator"; text: string }
  | { kind: "character"; name: string; role: string; portrait: string; text: string }
  | { kind: "phone"; from: string; text: string }
  | { kind: "image"; src: string; alt: string }
  | { kind: "mission"; text: string };

export interface StoryCard {
  id: string;
  tag: CardTag;
  order?: number;
  title: string;
  code?: string; // normalizado; abertura e fracasso nao tem
  bonusSeconds: number; // 0 na abertura e nos finais
  updatesMission: boolean;
  mission?: string; // texto do "Sua missao" (so principais)
  finalKind?: FinalKind;
  boxes: Box[];
}

const P = {
  josafa: IMG("josafa.png"),
  beto: IMG("beto.png"),
  jameson: IMG("jameson.jpeg"),
  pedro: IMG("pedro-pablo.jpeg"),
};

export const ABERTURA: StoryCard = {
  id: "abertura",
  tag: "abertura",
  order: 0,
  title: "A mochila esquecida",
  bonusSeconds: 0,
  updatesMission: true,
  mission: "Encontre o dono da mochila.",
  boxes: [
    {
      kind: "narrator",
      text: "Que jogo! No meio da festa, da vibração da arquibancada, vocês quase nem repararam: o rapaz que torcia bem do lado de vocês, sozinho, com a bandeira do Haiti no ombro, sumiu na multidão assim que o juiz apitou. E, sem perceber, deixou a mochila dele para trás.",
    },
    { kind: "image", src: IMG("mochila.jpeg"), alt: "A mochila esquecida" },
    {
      kind: "narrator",
      text: "Vocês saíram no embalo da torcida e levaram a mochila junto, achando que era de alguém do grupo. Até que, alguns passos depois, abriram para pegar o celular e congelaram. Essa mochila não é de vocês. É dele.",
    },
    {
      kind: "narrator",
      text: "E dentro tem coisa demais para alguém simplesmente perder: um passaporte, uma carteira, uma carta dobrada com muito cuidado e uma passagem de volta para o Haiti, com o voo marcado para esta madrugada. Sem esses documentos, ele perde o voo e fica preso, sozinho, do outro lado do mundo.",
    },
    { kind: "image", src: IMG("mochilabaerta.jpeg"), alt: "A mochila aberta" },
    {
      kind: "narrator",
      text: "Vocês têm pouco tempo, e o relógio já está correndo. Em algum lugar desta cidade, esse rapaz procura, desesperado, o que está agora nas mãos de vocês. É preciso encontrá-lo antes que o avião dele decole. Mas por onde começar?",
    },
    { kind: "mission", text: "Encontre o dono da mochila." },
  ],
};

const EST1: StoryCard = {
  id: "est1-hotel",
  tag: "principal",
  order: 1,
  title: "O Hotel",
  code: "HT314",
  bonusSeconds: 720,
  updatesMission: true,
  mission:
    "Ele correu de volta para o estádio. Procurem o balcão de Achados e Perdidos do estádio.",
  boxes: [
    {
      kind: "narrator",
      text: "Vocês cruzam as portas de vidro do hotel onde a delegação do Haiti ficou hospedada. É madrugada, o saguão está quase vazio, e numa TV ligada no canto ainda passam os melhores momentos de Brasil x Haiti. Atrás do balcão, um recepcionista de crachá levanta os olhos quando vocês entram com a mochila no ombro. O nome dele é Josafá.",
    },
    { kind: "image", src: IMG("cena_estacao1_hotel_saguao.png"), alt: "O saguão do hotel" },
    {
      kind: "narrator",
      text: "Vocês mostram o cartão-chave que encontraram dentro da mochila. Ele reconhece na hora.",
    },
    {
      kind: "character",
      name: "Josafá",
      role: "recepcionista",
      portrait: P.josafa,
      text: "Ah... então é dele essa mochila. Eu sabia que tinha alguma coisa errada com aquele menino.",
    },
    {
      kind: "character",
      name: "Josafá",
      role: "recepcionista",
      portrait: P.josafa,
      text: "Esteve aqui sim, quarto 314. Educado como poucos, sempre um 'boa noite, senhor Josafá', sempre sozinho. Mas, pra falar a verdade pra vocês, foi o hóspede mais triste que passou por aqui essa semana inteira.",
    },
    {
      kind: "character",
      name: "Josafá",
      role: "recepcionista",
      portrait: P.josafa,
      text: "Toda madrugada eu via ele aqui no sofá do saguão, sem conseguir dormir, abrindo e fechando uma carta dobrada. Lia, guardava, lia de novo. Uma noite eu perguntei se estava tudo bem. Ele só disse: 'É uma carta do meu pai, seu Josafá. Quando essa Copa acabar, eu tenho que voltar e ocupar um lugar que me espera lá em casa.'",
    },
    { kind: "image", src: IMG("cena_estacao1_wisly_carta.png"), alt: "Wisly relendo a carta" },
    {
      kind: "character",
      name: "Josafá",
      role: "recepcionista",
      portrait: P.josafa,
      text: "Eu perguntei se não era uma coisa boa, voltar pra família. Ele ficou um tempão calado. Aí me soltou uma pergunta esquisita, dessas que a gente não esquece: 'O senhor acha que existe um Deus que aceita a gente mesmo quando a gente decepciona a própria família?' Eu não soube o que responder. Que tipo de menino carrega um peso desse na mochila?",
    },
    {
      kind: "character",
      name: "Josafá",
      role: "recepcionista",
      portrait: P.josafa,
      text: "Hoje ele desceu pra fechar a conta, já de saída pro aeroporto. Foi pegar os documentos e gelou. A mochila tinha sumido. Passaporte, passagem, tudo. Ele ficou branco, falou que devia ter esquecido no estádio, na hora da confusão do apito final, e saiu correndo. Disse que ia tentar o achados e perdidos antes que fechasse.",
    },
    { kind: "image", src: IMG("cena_estacao1_wisly_desespero.png"), alt: "Wisly em desespero" },
    {
      kind: "narrator",
      text: "A mochila que ele procura desesperado está aqui, no ombro de vocês. E ele não faz ideia. O relógio corre: o voo dele é ainda nesta madrugada.",
    },
    {
      kind: "mission",
      text: "Ele correu de volta para o estádio. Procurem o balcão de Achados e Perdidos do estádio. É a última esperança dele de reaver a mochila, e a próxima pegada que vocês têm para seguir.",
    },
  ],
};

const EST2: StoryCard = {
  id: "est2-achados",
  tag: "principal",
  order: 2,
  title: "O Achados e Perdidos",
  code: "AP206",
  bonusSeconds: 600,
  updatesMission: true,
  mission: "Vá para a casa do primo do Wisly e descubra o que fazer.",
  boxes: [
    {
      kind: "narrator",
      text: "Depois de um bom tempo carregando, empilhando e organizando junto com ele, vocês finalmente terminam. O funcionário passa a mão na testa suada e solta um sorriso de alívio: com a ajuda de vocês, deu tempo de fechar o estádio. Ele cumpre o combinado. Vocês perguntam se um rapaz haitiano chamado Wisly passou por ali, procurando a mochila e os documentos. No crachá dele, o nome: Beto Brandão.",
    },
    { kind: "image", src: IMG("cena_estacao2_beto_stadium.png"), alt: "Beto no estádio" },
    {
      kind: "character",
      name: "Beto Brandão",
      role: "funcionário do estádio",
      portrait: P.beto,
      text: "Trato é trato, meninos. Vocês me salvaram hoje. Um rapaz haitiano, Wisly... deixa eu pensar, passou tanta gente por aqui depois do jogo.",
    },
    {
      kind: "character",
      name: "Beto Brandão",
      role: "funcionário do estádio",
      portrait: P.beto,
      text: "Wisly... peraí. Magrinho, camisa do Haiti, esteve aqui sim! Faz umas horas. Chegou que nem um furacão, perguntando se alguém tinha entregado a mochila dele, os documentos. Quase me convenceu a virar o achados e perdidos do avesso de tão desesperado que estava.",
    },
    { kind: "image", src: IMG("cena_estacao2_wisly_desesperado.png"), alt: "Wisly desesperado" },
    {
      kind: "character",
      name: "Beto Brandão",
      role: "funcionário do estádio",
      portrait: P.beto,
      text: "Procurei tudo pra ele, mas não tinha nada com o nome do rapaz. Foi embora de mãos vazias, mais aflito ainda. Parecia que o mundo ia acabar se ele não achasse aquela mochila.",
    },
    { kind: "image", src: IMG("cena_estacao2_wisly_indo_embora.png"), alt: "Wisly indo embora" },
    {
      kind: "character",
      name: "Beto Brandão",
      role: "funcionário do estádio",
      portrait: P.beto,
      text: "Eu falei pra ele se acalmar, ligar pra família, pedir ajuda em casa. O menino travou. Ficou olhando pro chão e disse baixinho: 'Em casa eu não posso contar agora, é complicado com o meu pai.' Aí me deu um aperto. Imagina o que é estar sozinho, do outro lado do mundo, sem poder ligar pro próprio pai.",
    },
    {
      kind: "character",
      name: "Beto Brandão",
      role: "funcionário do estádio",
      portrait: P.beto,
      text: "Eu sugeri procurar a polícia. Ele nem deixou eu terminar, fez que não com a cabeça. Disse que ia atrás de um primo que mora aqui na cidade, que era a única pessoa que podia ajudar ele a saber o que fazer. Saiu correndo de novo. Coitado.",
    },
    {
      kind: "narrator",
      text: "Um primo, na cidade. Vocês se lembram na hora: dentro da mochila tem uma lista de endereços, vários nomes à mão. E um deles deve ser do primo.",
    },
    { kind: "mission", text: "Vá para a casa do primo do Wisly e descubra o que fazer." },
  ],
};

const EST3: StoryCard = {
  id: "est3-primo",
  tag: "principal",
  order: 3,
  title: "A casa do primo",
  code: "JC417",
  bonusSeconds: 840,
  updatesMission: true,
  mission: "Sigam as pistas em busca do Wisly.",
  boxes: [
    {
      kind: "narrator",
      text: "Só depois que vocês arregaçam as mangas e ajudam a pôr a mesa, o barulho diminui, e ele enfim senta com vocês. É o Jameson, primo do Wisly.",
    },
    { kind: "image", src: IMG("cena_estacao3_jameson_casa.png"), alt: "A casa do primo" },
    {
      kind: "character",
      name: "Jameson",
      role: "primo do Wisly",
      portrait: P.jameson,
      text: "Ufa... valeu mesmo, gente. Com essa casa cheia eu não tava dando conta de nada. Agora sim dá pra conversar. Vocês falaram do Wisly, né? É meu primo, sim. Fui eu que dei uma força pra ele vir nessa Copa.",
    },
    {
      kind: "character",
      name: "Jameson",
      role: "primo do Wisly",
      portrait: P.jameson,
      text: "Esse menino eu conheço desde pequeno. E ninguém imagina o tamanho do peso que ele carrega nas costas. Lá em casa a nossa família é muito religiosa, leva a sério mesmo. O pai dele é uma figura grande, um líder respeitado no Vodu e o Wisly é o único filho homem.",
    },
    {
      kind: "character",
      name: "Jameson",
      role: "primo do Wisly",
      portrait: P.jameson,
      text: "Quer dizer: desde que nasceu já tem um lugar reservado pra ele ocupar, um caminho todo traçado pra seguir os passos do pai. Tem até um ritual, uma cerimônia pesada que ele teria que passar pra assumir o ason. E é o que tira o sono dele. Ele ama o pai, ama a família, mas no fundo não sabe se quer aquela vida.",
    },
    {
      kind: "character",
      name: "Jameson",
      role: "primo do Wisly",
      portrait: P.jameson,
      text: "Ele me olhava aqui em casa e dizia: 'Jameson, como é bom te ver livre, escolhendo as suas próprias coisas.' Eu acho que ele veio pra Copa muito mais pra fugir um pouco disso do que pra ver futebol. Fui eu, inclusive, que dei uma câmera velha pra ele faz tempo. Daí não largou mais: vive tirando foto, escrevendo umas reflexões. Quieto por fora, mas por dentro é um mundo.",
    },
    {
      kind: "character",
      name: "Jameson",
      role: "primo do Wisly",
      portrait: P.jameson,
      text: "A gente cresceu junto no lakou, sabe? Aquele terreiro grande da família, lá perto de Gonaïves. A nossa religião é o vodu, e a família do Wisly é das mais antigas e respeitadas da região: servir aos lwa, os espíritos, é coisa de muitas gerações. Eu lembro do Wisly pequenininho no meio dos tambores, pés descalços na terra, os olhos brilhando. Ele amava aquilo de verdade.",
    },
    { kind: "image", src: IMG("cena_estacao3_wisly_infancia.png"), alt: "Wisly na infância no lakou" },
    {
      kind: "character",
      name: "Jameson",
      role: "primo do Wisly",
      portrait: P.jameson,
      text: "O avô deles, o seu Ezéchiel, era o houngan, o sacerdote, o homem mais respeitado de todo o lakou. Antes de morrer, passou o ason, o chocalho sagrado, o símbolo de tudo, pro pai do Wisly. E todo mundo já sabia qual ia ser o próximo nome a segurar aquele ason: o do Wisly. O que pra uma criança era orgulho, ser 'o escolhido', foi virando um peso grande demais pras costas dele.",
    },
    {
      kind: "character",
      name: "Jameson",
      role: "primo do Wisly",
      portrait: P.jameson,
      text: "Hoje ele apareceu aqui desesperado, sem os documentos. A primeira coisa que falou foi em procurar a polícia. Eu cortei na hora: 'Não, Wis, nem pensa nisso. É perigoso, não dá pra confiar.' Mandei ele num lugar mais seguro: tem um guichê de atendimento ao turista, aberto 24 horas, pertinho daqui. Lá orientam direitinho quem perdeu documento. Falei pra ele correr pra lá.",
    },
    {
      kind: "character",
      name: "Jameson",
      role: "primo do Wisly",
      portrait: P.jameson,
      text: "Deixa eu tentar ligar pra ele agora, pra vocês falarem direto... (silêncio) ...Que estranho. Não atende. Já é a terceira vez. Não é do feitio dele sumir assim. Tomara que esteja tudo bem.",
    },
    { kind: "image", src: IMG("cena_estacao3_jameson_tentando_ligar.png"), alt: "Jameson tentando ligar" },
    {
      kind: "narrator",
      text: "Um arrepio passa por vocês. Vocês sabem o que o Jameson não sabe: cada minuto que passa é um minuto a menos antes do voo da madrugada. E agora, de repente, o Wisly não atende.",
    },
    { kind: "mission", text: "Sigam as pistas em busca do Wisly." },
  ],
};

const EST5: StoryCard = {
  id: "est5-hospital",
  tag: "principal",
  order: 4,
  title: "O Hospital",
  code: "PR905",
  bonusSeconds: 840,
  updatesMission: true,
  mission: "Fale com Wisly!",
  boxes: [
    {
      kind: "narrator",
      text: "No meio da confusão do plantão de madrugada, vocês finalmente conseguem ser atendidos no balcão. A recepcionista checa o sistema e confirma: sim, um rapaz chamado Wisly Dorsainvil deu entrada aqui esta noite, depois de um pequeno acidente na rua. Nada grave, só um susto e alguns curativos. Ela chama o enfermeiro que cuidou dele. Um homem de jaleco se aproxima, e no pescoço dele balança um pingente de cruz vazada. É o Pedro Pablo.",
    },
    { kind: "image", src: IMG("cena_estacao5_enfermeiro_hospital.png"), alt: "O enfermeiro no hospital" },
    {
      kind: "character",
      name: "Pedro Pablo",
      role: "enfermeiro",
      portrait: P.pedro,
      text: "Então vocês são amigos do Wisly? Que bom. Eu fiquei pensando nele depois que foi embora. Sou Pedro Pablo, de Porto Rico, trabalho aqui nas madrugadas.",
    },
    {
      kind: "character",
      name: "Pedro Pablo",
      role: "enfermeiro",
      portrait: P.pedro,
      text: "O rapaz chegou bem assustado, depois de um acidente besta na rua. Foi leve, graças a Deus: um corte, uns curativos, muito susto e nada mais. Mas o que me pegou não foi o machucado. Foi o jeito dele: sozinho, longe de tudo, com um medo de quem se sente completamente perdido no mundo.",
    },
    {
      kind: "character",
      name: "Pedro Pablo",
      role: "enfermeiro",
      portrait: P.pedro,
      text: "Enquanto eu fazia o curativo, ele foi se soltando aos poucos. Falou do pai, de um peso enorme esperando por ele em casa, de uma decisão que não sabia como tomar. Disse que tinha vindo pra Copa pra descobrir o que fazer da vida, e que agora até isso tinha dado errado. Em certo momento ele me olhou meio desconfiado e perguntou: 'Por que você está fazendo tudo isso por mim? Você nem me conhece.'",
    },
    {
      kind: "character",
      name: "Pedro Pablo",
      role: "enfermeiro",
      portrait: P.pedro,
      text: "Eu só sorri e disse que não precisava de motivo, que tem coisa na vida que a gente recebe sem ter feito nada pra merecer. Foi quando ele reparou no meu pingente, nessa cruz vazia. Os olhos dele mudaram, abriu um sorriso meio triste e falou: 'Eu tinha um colega na escola que usava uma cruz assim. Ele vivia falando de um Deus que ama sem cobrar nada.' E completou baixinho: 'Mas lá em casa ninguém faz nada de graça.'",
    },
    {
      kind: "character",
      name: "Pedro Pablo",
      role: "enfermeiro",
      portrait: P.pedro,
      text: "Aquela cruz pareceu destrancar alguma coisa nele. Me contou que a única vez que tentou levar essas perguntas pro próprio pai, acabou numa briga feia, e que desde então aprendeu a engolir tudo calado. Mas ali, comigo, sei lá por quê, ele teve coragem. Começou a perguntar coisas que parecia que guardava preso na garganta fazia anos: 'Você acredita em Deus, Pedro? Como é que a pessoa sabe qual caminho seguir, quando seguir o próprio coração significa machucar quem ela ama?'",
    },
    { kind: "image", src: IMG("cena_estacao5_wisly_olhando_cruz.png"), alt: "Wisly olhando a cruz" },
    {
      kind: "character",
      name: "Pedro Pablo",
      role: "enfermeiro",
      portrait: P.pedro,
      text: "Eu podia ter despejado um monte de resposta pronta em cima dele. Mas não quis, não era a minha hora de falar, era a hora de ele se escutar. Então devolvi com outras perguntas: 'O que o seu coração te diz quando não tem ninguém mandando em você? Será que um pai que ama de verdade só ama se você for exatamente o que ele espera? E se existisse um amor que você não precisasse merecer, você ia saber reconhecer?'",
    },
    {
      kind: "character",
      name: "Pedro Pablo",
      role: "enfermeiro",
      portrait: P.pedro,
      text: "Ele não respondeu nenhuma. Ficou ali, em silêncio, olhando pra cruz do meu pingente, com os olhos cheios. Acho que ninguém nunca tinha deixado ele só pensar, sem cobrar uma resposta na hora. Tem pergunta que a gente precisa carregar um tempo até encontrar a saída. Mas eu vi: alguma coisa ali dentro dele mudou.",
    },
    {
      kind: "character",
      name: "Pedro Pablo",
      role: "enfermeiro",
      portrait: P.pedro,
      text: "Antes de ir, a gente trocou Instagram pra não perder o contato. Ele disse que ia direto pro aeroporto, que o voo era ainda hoje. Tomem, o perfil dele é @je_wisly. Hoje em dia é o único jeito de vocês falarem com ele. Façam isso por mim: cuidem desse menino.",
    },
    { kind: "image", src: IMG("cena_estacao5_wisly_saindo.png"), alt: "Wisly saindo do hospital" },
    {
      kind: "narrator",
      text: "Vocês olham para o relógio e sabem que o voo está perto. Aquele arroba é o fio que finalmente liga vocês a ele. E, pela primeira vez na noite, vocês vão poder falar com o Wisly em pessoa, não com quem só o viu passar.",
    },
    { kind: "mission", text: "Fale com Wisly!" },
  ],
};

export const PRINCIPAIS: StoryCard[] = [EST1, EST2, EST3, EST5];

// ---- Missoes secundarias ----

const SEC_ORACAO: StoryCard = {
  id: "sec-oracao",
  tag: "secundaria",
  title: "A Sala de Oração",
  code: "INTERCESSAO",
  bonusSeconds: 480,
  updatesMission: false,
  boxes: [
    {
      kind: "narrator",
      text: "Vocês podiam ter passado reto. Tinham todo o motivo do mundo: o relógio corre, o Wisly não pode perder o voo, cada segundo conta. E mesmo assim pararam. No meio da pressa, escolheram dobrar os joelhos por gente que nem conhecem, do outro lado do mundo.",
    },
    { kind: "image", src: IMG("cena_secundaria_oracao.png"), alt: "A sala de oração" },
    {
      kind: "narrator",
      text: "É exatamente isso que Cristo faz com a gente. Ele nos tira do centro de tudo, dos nossos problemas, das nossas tarefas, das nossas urgências, e vira o nosso rosto para o outro. Para o que está longe, para o que está perdido, para quem ninguém lembra de procurar. O Reino começa quando a nossa correria abre espaço para o próximo.",
    },
    {
      kind: "narrator",
      text: "Que isto fique gravado muito além desta noite: não importa o tamanho da pressa, sempre dá tempo de orar pelo outro. Sempre ore. Sempre ore pelo outro. Vocês acabaram de viver, de verdade, o coração inteiro desta brincadeira. E ganharam tempo por isso.",
    },
  ],
};

const GLOSS = (
  id: string,
  title: string,
  code: string,
  img: string,
  boxes: string[],
): StoryCard => ({
  id,
  tag: "secundaria",
  title,
  code,
  bonusSeconds: 300,
  updatesMission: false,
  boxes: [
    { kind: "image", src: IMG(img), alt: title },
    ...boxes.map((text) => ({ kind: "narrator", text }) as Box),
  ],
});

const SEC_ASON = GLOSS("sec-ason", "Ason", "HERANCA", "secundaria_polaroid_ason.png", [
  "Ason. É um chocalho sagrado, coberto de contas, o objeto mais importante na mão de um sacerdote do vodu. Não é enfeite: é o sinal de quem tem autoridade para conduzir os rituais, falar com os espíritos e liderar toda uma comunidade.",
  "O avô do Wisly, Ezéchiel, segurou esse ason. Depois passou para Lucien, o pai. E todo mundo no lakou já sabe qual é o próximo nome a recebê-lo: o do Wisly. Ele é o único filho homem; desde que nasceu, esse chocalho o espera. Não é uma escolha que lhe ofereceram, é um destino que colocaram no berço. Imaginem carregar, ainda menino, o peso de um caminho inteiro já decidido por você, e a culpa de só de pensar em recusar.",
]);

const SEC_LWA = GLOSS("sec-lwa", "Lwa", "SERVIR", "secundaria_polaroid_lwa.png", [
  "Lwa. São os espíritos que a família do Wisly serve, e serve há gerações. Junto deles vêm os mortos da família, os ancestrais, que se acredita continuarem presentes, guiando e protegendo os vivos.",
  "No vodu, a relação com eles é de mão dupla: você serve com rituais, oferendas e devoção, e em troca eles protegem e sustentam. Para a família do Wisly, foram os lwa que os mantiveram de pé mesmo na pior miséria. Mas repare na lógica por baixo: tudo é troca, tudo se paga, nada vem de graça. Você protege o seu lugar servindo, sempre servindo, sem nunca poder parar. É o exato oposto do que um colega de escola dizia ao Wisly, sobre um Deus que ama e dá tudo sem cobrar nada. Duas formas de enxergar o céu que não cabem no mesmo peito ao mesmo tempo.",
]);

const SEC_LAKOU = GLOSS("sec-lakou", "Lakou", "RAIZ", "secundaria_polaroid_lakou.png", [
  "Lakou. É o terreiro, o grande pátio de terra da família, lá perto de Gonaïves, onde a vida e a religião acontecem juntas. É casa, é 'igreja', é praça, é tudo num lugar só.",
  "É o lugar mais amado da infância do Wisly: os tambores, as danças, os pés descalços na terra, o calor de uma comunidade inteira que funciona como uma família enorme. É o pertencimento dele, a raiz, o lar. E é justamente por isso que dói tanto. A carta do pai ameaça fechar para sempre a porta desse lakou. Tudo o que o Wisly mais ama é o que ele corre o risco de perder, se um dia seguir o próprio coração.",
]);

const SEC_KANZO = GLOSS("sec-kanzo", "Kanzo", "RITO", "secundaria_polaroid_kanzo.png", [
  "Kanzo. É o rito de iniciação, a cerimônia pesada que faz de alguém, de verdade, parte do sacerdócio do vodu. É um caminho sem volta: quem passa pelo kanzo assume um compromisso para a vida inteira e dá o primeiro grande passo para um dia se tornar sacerdote.",
  "É esse rito que espera o Wisly quando a Copa acabar, e é ele que tira o sono do rapaz. Porque o kanzo não é só uma festa: é dizer 'sim' para sempre a uma vida que ele não tem certeza se quer. É a linha que, uma vez cruzada, decide quem ele vai ser pelo resto da existência. E ele está parado bem na beira dela, sem coragem de avançar nem de voltar atrás.",
]);

const SEC_HOUNGAN = GLOSS(
  "sec-houngan",
  "Houngan",
  "SACERDOTE",
  "secundaria_polaroid_houngan.png",
  [
    "Houngan. É o sacerdote do vodu, um dos homens mais respeitados e mais temidos de toda a comunidade. É ele quem conduz os rituais, guarda as tradições, carrega o ason e responde pelo bem-estar espiritual de todo o lakou.",
    "O avô do Wisly foi houngan. O pai dele, Lucien, é houngan até hoje. E o lugar reservado ao Wisly é esse: ser o próximo. Soa como honra, e é. Mas é também um fardo gigante para um rapaz de 17 anos: a vida espiritual de uma comunidade inteira sobre os seus ombros, sem espaço para a dúvida, sem permissão para ser apenas ele mesmo. Ser houngan é ganhar o respeito de todos e, no mesmo gesto, talvez perder a liberdade de descobrir quem ele de fato é.",
  ],
);

export const SECUNDARIAS: StoryCard[] = [
  SEC_ORACAO,
  SEC_ASON,
  SEC_LWA,
  SEC_LAKOU,
  SEC_KANZO,
  SEC_HOUNGAN,
];

// ---- Finais ----

export const FINAL_FRACASSO: StoryCard = {
  id: "final-fracasso",
  tag: "final",
  finalKind: "fracasso",
  title: "Final: o tempo acabou",
  bonusSeconds: 0,
  updatesMission: false,
  boxes: [
    { kind: "narrator", text: "O relógio chegou a zero. O tempo acabou, e vocês nunca chegaram até o Wisly." },
    { kind: "image", src: IMG("cena_final_fracasso.png"), alt: "O tempo acabou" },
    {
      kind: "narrator",
      text: "A mochila com os documentos ficou nas mãos de vocês. E ele, do outro lado da cidade, ficou sem nada. No aeroporto, sem passaporte e sem passagem, o Wisly viu no painel o seu voo ser anunciado, e depois decolar. Ficou parado, olhando o avião subir sem ele, rumo à única casa que ele tinha no mundo.",
    },
    { kind: "narrator", text: "Sem saída, ele fez a única coisa que lhe restava: mandou uma mensagem para o pai." },
    {
      kind: "phone",
      from: "Wisly",
      text: "Pai, me perdoa. Eu perdi meus documentos, perdi a passagem, perdi tudo aqui. Não consegui voltar. Me ajuda, por favor.",
    },
    { kind: "narrator", text: "A resposta demorou. Quando veio, foi curta e fria." },
    {
      kind: "phone",
      from: "Lucien (o pai)",
      text: "Eu te avisei. Eu disse o que aconteceria se você largasse o que é seu. Um homem que abandona o seu povo não tem mais casa pra onde voltar. Não me procure mais. Eu não tenho filho.",
    },
    { kind: "image", src: IMG("cena_final_fracasso_celular.png"), alt: "A mensagem do pai" },
    { kind: "narrator", text: "Era exatamente o que a carta na mochila já anunciava. O pai cumpriu a sua palavra." },
    {
      kind: "narrator",
      text: "Sozinho e sem nada que provasse quem era, o Wisly acabou parado pela polícia e ficou detido. Passou dias preso, até ser mandado de volta ao Haiti. Não como quem volta para casa, mas como quem é expulso de um lugar.",
    },
    { kind: "image", src: IMG("cena_final_fracasso_detido.png"), alt: "Wisly detido" },
    {
      kind: "narrator",
      text: "De volta à ilha, ele tentou se reaproximar da família. Bateu na porta do lakou onde cresceu. Mas a porta não se abriu. O nome dele havia sido apagado, como o pai jurou. Dizem que hoje ele vaga pelas ruas, sem rumo, ainda carregando no peito aquelas perguntas que um dia fez a um enfermeiro num corredor de hospital. Só que agora não há mais ninguém por perto para ajudá-lo a respondê-las.",
    },
    { kind: "image", src: IMG("cena_final_fracasso_ruas.png"), alt: "Wisly nas ruas" },
    {
      kind: "narrator",
      text: "Vocês carregavam, sem saber, as duas coisas que ele mais precisava: os documentos que o levariam de volta pra casa, e a notícia de um Pai cujo amor ele jamais precisaria merecer. Nenhuma das duas chegou até ele a tempo. E o tempo, esse, não voltou atrás.",
    },
  ],
};

export const FINAL_V1: StoryCard = {
  id: "final-sucesso-v1",
  tag: "final",
  finalKind: "v1",
  title: "Final: o encontro superficial",
  code: "ENT38",
  bonusSeconds: 0,
  updatesMission: false,
  boxes: [
    {
      kind: "narrator",
      text: "Vocês conseguiram. Chegaram a tempo, encontraram o Wisly no aeroporto e devolveram a mochila. Ele agradeceu aliviado, quase chorando, abraçou vocês. Vocês desejaram um 'que Deus te abençoe', trocaram poucas palavras, e o viram seguir para o embarque. Missão cumprida... ou quase.",
    },
    { kind: "image", src: IMG("cena_final_sucesso_v1_aeroporto.png"), alt: "O encontro no aeroporto" },
    {
      kind: "narrator",
      text: "Porque a noite inteira foi Deus deixando sinais no caminho dele: as perguntas que ele soltou pro recepcionista, a carta relida sem parar, a cruz que mexeu com ele no hospital, as perguntas que o enfermeiro plantou e ficaram sem resposta. O coração do Wisly estava aberto, maduro, pronto. Mas a conversa de vocês foi rápida e gentil demais, só de superfície. Vocês devolveram a mochila, mas não falaram da única coisa que ele mais procurava sem saber nomear. Ele entrou no avião com os documentos em mãos, e o mesmo vazio no peito.",
    },
    {
      kind: "narrator",
      text: "De volta ao Haiti, sem nenhuma resposta nova, o Wisly fez o que sempre esperaram dele. Ajoelhou-se onde o avô Ezéchiel se ajoelhou. Passou pelo kanzo, o rito que o tornou homem entre os seus, e com o tempo recebeu das mãos do pai o ason, o chocalho sagrado da linhagem. Tornou-se houngan, o sacerdote, o guardião da tradição, exatamente o lugar que a carta dizia ser dele.",
    },
    { kind: "image", src: IMG("cena_final_sucesso_v1.png"), alt: "Wisly como sacerdote" },
    {
      kind: "narrator",
      text: "Por fora, era tudo o que a família sonhou. Por dentro, o Wisly carregou a vida toda uma tristeza calada que nunca soube explicar. A sensação de que faltava alguma coisa, de que houve uma verdade que ele quase tocou uma vez, numa madrugada estranha do outro lado do mundo, e que escorreu por entre os dedos. Mas ele não conhecia outro caminho além do que herdou. Então seguiu, fiel ao que tinha, sem nunca encontrar o que de verdade procurava.",
    },
    { kind: "image", src: IMG("cena_final_sucesso_v1_tristeza.png"), alt: "A tristeza calada" },
    {
      kind: "narrator",
      text: "E o Wisly foi longe. Com os anos, tornou-se um líder ainda maior que o próprio pai, maior até que o avô Ezéchiel. Sob a liderança dele o lakou floresceu, a sociedade se multiplicou, e o vodu se espalhou pela região como nunca antes: muitos passaram a sevi lwa, a servir aos espíritos, por causa do Wisly. Aos olhos do mundo, uma vida inteira de honra e sucesso.",
    },
    { kind: "image", src: IMG("cena_final_sucesso_v1_lideranca.png"), alt: "A liderança do Wisly" },
    {
      kind: "narrator",
      text: "Mas aquele menino que uma vez perguntou se existia um Deus que ama sem a gente precisar merecer nunca chegou a ouvir a resposta. Vocês o encontraram a tempo. Devolveram a mochila. E deixaram passar a única entrega que teria mudado tudo, para ele e para toda uma geração depois dele. Às vezes não basta chegar. É preciso saber para que se chegou.",
    },
  ],
};

export const FINAL_V2: StoryCard = {
  id: "final-sucesso-v2",
  tag: "final",
  finalKind: "v2",
  title: "Final: o encontro pleno",
  code: "GRC57",
  bonusSeconds: 0,
  updatesMission: false,
  boxes: [
    {
      kind: "narrator",
      text: "Vocês conseguiram. E não só chegaram a tempo. No meio do corre, vocês entenderam que carregavam duas coisas naquela mochila: os documentos que levariam o Wisly pra casa, e algo muito maior, a notícia de um Pai cujo amor não se compra e não se merece.",
    },
    { kind: "image", src: IMG("mochilaecruz.jpeg"), alt: "A mochila e a cruz" },
    {
      kind: "narrator",
      text: "Quando encontraram o Wisly no aeroporto, devolveram a mochila. Mas não pararam ali. Olharam nos olhos dele e falaram daquilo que a noite inteira vinha preparando: de Jesus, da cruz que não estava vazia à toa, de um Deus que amou tanto o mundo que veio carregar o peso que ninguém aguenta sozinho. Sem saber, vocês responderam exatamente as perguntas que ele tinha feito ao enfermeiro. Disseram que existe, sim, um Pai que aceita o filho mesmo quando ele decepciona todo mundo. Que o amor d'Ele é de graça.",
    },
    {
      kind: "narrator",
      text: "O Wisly ouviu calado. Quando vocês terminaram, ele estava chorando. Não o choro do medo, mas o de quem finalmente acha o que procurou a vida inteira sem saber o nome. 'É isso', ele disse baixinho. 'É isso que eu estava procurando esse tempo todo.' Ali, num aeroporto qualquer, o filho do houngan entregou o coração a Cristo.",
    },
    { kind: "image", src: IMG("cena_final_sucesso_v2_aeroporto.png"), alt: "A entrega do coração" },
    { kind: "narrator", text: "Ali mesmo, antes de qualquer coisa, o Wisly pegou o celular e mandou uma mensagem pro pai. Não de rebeldia, mas de amor." },
    {
      kind: "phone",
      from: "Wisly",
      text: "Pai, eu te amo, e amo a nossa família mais do que você imagina. Mas alguma coisa mudou em mim nesta viagem. Eu encontrei o que faltava no meu coração desde que eu era menino. Por isso eu vou ficar. Preciso seguir esse caminho. Me perdoa, e saiba que eu nunca, nunca vou parar de te amar.",
    },
    { kind: "image", src: IMG("cena_final_sucesso_v2_celular_pai.png"), alt: "A mensagem ao pai" },
    {
      kind: "narrator",
      text: "E então o Wisly fez o que ninguém esperava. Quando chamaram o voo dele, ele não embarcou. Com os documentos de volta nas mãos, livre para ir, ele escolheu ficar. Não fugindo da família, mas seguindo o Pai que tinha acabado de encontrar.",
    },
    {
      kind: "narrator",
      text: "E vocês não soltaram a mão dele. Viraram amigos do Wisly de verdade. Ensinaram ele a caminhar na fé, um dia de cada vez, levaram ele pra igreja, abriram pra ele uma nova família, a família de Deus. Onde antes havia um rapaz sozinho do outro lado do mundo, agora havia irmãos. Até que chegou o dia em que o Wisly desceu às águas do batismo, e foi como se o céu inteiro sorrisse.",
    },
    { kind: "image", src: IMG("cena_final_sucesso_v2_batismo.png"), alt: "O batismo" },
    {
      kind: "narrator",
      text: "Com o tempo, aquele menino cheio de perguntas virou um homem firme e sereno na fé. Amadureceu, foi chamado, e se tornou pastor. E então fez a escolha mais corajosa de todas: voltou. Voltou pro Haiti, pro seu lakou, pra sua gente, agora como missionário.",
    },
    { kind: "image", src: IMG("cena_final_sucesso_v2.png"), alt: "O retorno como missionário" },
    {
      kind: "narrator",
      text: "Não para assumir o ason, mas para levar aos seus, e ao próprio pai, a mesma notícia que transformou a vida dele. O filho que o pai achou que tinha perdido voltou trazendo a maior das heranças.",
    },
    { kind: "image", src: IMG("cena_final_sucesso_v2_retorno.png"), alt: "O retorno ao lakou" },
    {
      kind: "narrator",
      text: "E vocês? Vocês foram o instrumento de tudo isso. Não porque correram mais rápido que os outros, mas porque, no meio da brincadeira, da festa e do corre, ficaram atentos e não deixaram a oportunidade passar.",
    },
    {
      kind: "narrator",
      text: "O Wisly desta noite é um personagem. Mas os Wislys da vida real estão por toda parte: na sua escola, no seu time, na sua rua. Gente carregando perguntas que não tem coragem de fazer, procurando um Pai cujo amor não precise ser merecido. E vocês carregam, de verdade, a mesma mochila: a boa notícia de Jesus. A pergunta que fica para depois desta noite é simples: você vai estar atento para entregá-la?",
    },
  ],
};

export const FINAIS: StoryCard[] = [FINAL_FRACASSO, FINAL_V1, FINAL_V2];

// Indice por codigo normalizado -> card (loop de palavra-chave).
export const ALL_UNLOCKABLE: StoryCard[] = [...PRINCIPAIS, ...SECUNDARIAS, FINAL_V1, FINAL_V2];

export const CARD_BY_CODE: Record<string, StoryCard> = Object.fromEntries(
  ALL_UNLOCKABLE.filter((c) => c.code).map((c) => [c.code as string, c]),
);

export const CARD_BY_ID: Record<string, StoryCard> = Object.fromEntries(
  [ABERTURA, ...ALL_UNLOCKABLE, FINAL_FRACASSO].map((c) => [c.id, c]),
);

// Avisos de urgencia (Tabela de Conteudo): marco em segundos + texto do banner.
export interface UrgencyCue {
  atSeconds: number;
  audio: string;
  banner: string;
}

export const URGENCY_CUES: UrgencyCue[] = [
  { atSeconds: 600, audio: "urg_10min", banner: "Faltam 10 minutos para o embarque do Wisly." },
  { atSeconds: 300, audio: "urg_05min", banner: "Faltam 5 minutos. O voo está chamando." },
  { atSeconds: 60, audio: "urg_01min", banner: "Último minuto. É agora ou nunca." },
];

/** Caminho do audio de urgencia (pasta audio/urgency/). */
export const URGENCY_AUDIO = (id: string) => AUDIO(`urgency/${id}.mp3`);

// ---- Audio da narracao (um arquivo por card, ver [[Shotlist de Audio]]) ----
// Cada card tem UMA narracao (narrador + personagens no mesmo arquivo). A
// revelacao das caixas e distribuida ao longo da duracao do audio. Convencao:
// public/audio/{cardId}.mp3; arquivo ausente cai no fallback por tempo.
export function cardAudioSrc(card: StoryCard): string {
  return AUDIO(`${card.id}.mp3`);
}

// Equipes pre-configuradas (PRD secao 9).
export const PRESET_TEAMS = [
  "Seleção dos Canelas Finas",
  "Os Pernas de Pau FC",
  "Seleção do Banco de Reserva",
  "Time do Quase Gol",
  "Os Reservas do Goleiro",
];

export const DEFAULT_INITIAL_SECONDS = 20 * 60;

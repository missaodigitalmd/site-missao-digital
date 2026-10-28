// Página de apresentação dos times de agentes. Três níveis: Início, Times e a página de cada time.
// Cada cena anima ao entrar e espera o toque para sair. Desenho: ../desenho-pagina.md
const NS = "http://www.w3.org/2000/svg";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
// aleatório com semente, para o desenho sair igual a cada abertura
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// palco 1920x1200 escalado para caber na tela
const fit = () => document.documentElement.style.setProperty("--k", Math.min(innerWidth / 1920, innerHeight / 1200));
fit(); addEventListener("resize", fit);

// degradê laranja das ligações, um só para a página
document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="grad-l" gradientUnits="userSpaceOnUse" x1="0" x2="1920" y1="0" y2="0"><stop offset="0" stop-color="#ffac13"/><stop offset="1" stop-color="#fe7003"/></linearGradient></defs></svg>`);

// ligação que se desenha, e um pulso de luz que corre por ela
function ligacoes(svg, rotas) {
  return rotas.map(d => {
    const p = el("path", { d, class: "lig" }, svg);
    const L = p.getTotalLength();
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.L = L;
    return p;
  });
}
const desenha = (tl, p, at, dur = .7) => tl.to(p, { strokeDashoffset: 0, duration: dur, ease: "power2.inOut", onStart: () => p.classList.add("on") }, at);
const zeraLigas = ps => ps.forEach(p => { p.classList.remove("on"); p.style.strokeDashoffset = p.dataset.L; });
function pulso(svg, p, dur = 1.4, delay = 0) {
  const c = el("circle", { r: 7, class: "pulso", opacity: 0 }, svg), L = +p.dataset.L, o = { t: 0 };
  return gsap.timeline({ paused: true, repeat: -1, delay })
    .to(o, { t: 1, duration: dur, ease: "none", onUpdate: () => { const q = p.getPointAtLength(o.t * L); c.setAttribute("cx", q.x); c.setAttribute("cy", q.y); } }, 0)
    .fromTo(c, { attr: { opacity: 0 } }, { attr: { opacity: 1 }, duration: .2 }, 0)
    .to(c, { attr: { opacity: 0 }, duration: .2 }, dur - .2);
}
// entradas da marca: do desfocado para o nítido
const foco = { autoAlpha: 0, y: 30, filter: "blur(12px)" }, nitido = { autoAlpha: 1, y: 0, filter: "blur(0px)", ease: "power3.out" };
const pop = (tl, alvo, at, extra = {}) => tl.fromTo(alvo, { autoAlpha: 0, scale: .5, y: 24, filter: "blur(8px)" }, { autoAlpha: 1, scale: 1, y: 0, filter: "blur(0px)", duration: .7, ease: "back.out(1.6)", ...extra }, at);

// ================= classes do Ensino: cada uma com a sua identidade, todas da mesma igreja =================
const CLASSE = {
  criancas: { nome: "Crianças", tema: "Heróis da fé", bg: "#ffd23f", ink: "#3a2400", ac: "#ff5a3c", papel: "#fff6d1", ff: "'Montserrat', sans-serif",
    titulos: ["Abraão", "José", "Moisés", "Josué", "Gideão", "Davi", "Daniel", "Ester", "Jesus"],
    textos: ["Gênesis 12", "Gênesis 37", "Êxodo 3", "Josué 1", "Juízes 6", "1 Samuel 17", "Daniel 6", "Ester 4", "Lucas 2"],
    mats: [["biblia", "Bíblia"], ["livro", "Heróis da Bíblia"], ["estudo", "Plano do líder"], ["artigo", "Ideias de atividade"], ["nota", "Essência: Deus é fiel"]] },
  adolescentes: { nome: "Adolescentes", tema: "Teologia do Pacto", bg: "#141a33", ink: "#f3ead8", ac: "#e8343c", papel: "#f4efe6", ff: "'Montserrat', sans-serif", real: true,
    titulos: ["De quem você é?", "Dois deuses?", "Quem decide o que é certo?", "Por que eu faço de novo?", "O fio tá cortado", "Deus desistiu do mundo?", "Como eu sei que é firme?", "Qual lei vale hoje?", "Quem constrói para quem?"],
    mats: [["biblia", "Bíblia (ARA)"], ["livro", "O Cristo dos Pactos"], ["livro", "Catecismo Maior"], ["artigo", "Artigos de apoio"], ["nota", "Essência: o fio escarlate"]] },
  adultos: { nome: "Adultos", tema: "Cosmovisão cristã", bg: "#0f3b33", ink: "#f3ead8", ac: "#d4af37", papel: "#efe7d4", ff: "Georgia, 'Times New Roman', serif",
    titulos: ["Criação", "Queda", "Redenção", "Trabalho", "Família", "Tecnologia", "Arte", "Cidade", "Missão"],
    textos: ["Gênesis 1", "Gênesis 3", "Romanos 3", "Gênesis 2.15", "Efésios 5", "Gênesis 11", "Êxodo 31", "Jeremias 29", "Mateus 28"],
    mats: [["biblia", "Bíblia"], ["livro", "Livro-base do líder"], ["livro", "Confissão de fé da igreja"], ["artigo", "Artigos de cosmovisão"], ["nota", "Essência: toda a vida sob Cristo"]] },
  casais: { nome: "Casais", tema: "Família e fé", bg: "#f6e3d7", ink: "#5a2323", ac: "#c4553f", papel: "#ffffff", ff: "Georgia, 'Times New Roman', serif",
    titulos: ["Aliança", "Diálogo", "Perdão", "Finanças", "Filhos", "Serviço", "Tempo", "Crises", "Legado"],
    textos: ["Gênesis 2.24", "Tiago 1.19", "Colossenses 3.13", "Provérbios 3.9", "Deuteronômio 6.6-7", "Gálatas 5.13", "Efésios 5.16", "Salmo 46", "Salmo 78.4"],
    mats: [["biblia", "Bíblia"], ["livro", "Livro-base do líder"], ["estudo", "Estudos de caso"], ["artigo", "Artigos sobre família"], ["nota", "Essência: aliança no lar"]] },
};
const vars = c => `--bg:${c.bg};--ink:${c.ink};--ac:${c.ac};--papel:${c.papel};--ff:${c.ff}`;
const pad = n => String(n).padStart(2, "0");
const slideMock = (id, n, grande) => { const c = CLASSE[id]; return `<div class="slide-m sm-${id}${grande ? " grande" : ""}" style="${vars(c)}"><i class="d1"></i><i class="d2"></i><small>${grande ? c.tema + " &middot; " : ""}Encontro ${n}</small><strong>${c.titulos[n - 1]}</strong><span class="marca"></span></div>`; };
const papelMock = (c, t) => `<span class="papel-m" style="${vars(c)}"><b>${t}</b><u></u><u></u><u class="c"></u><u></u><u></u><u></u></span>`;
const folhaMock = (id, n, atv) => { const c = CLASSE[id]; return `<div class="doc"><div class="folha-m" style="${vars(c)}"><small>${c.nome} &middot; ${c.tema}</small><h3>${atv ? "Atividade" : "Encontro " + n}: ${c.titulos[n - 1]}</h3><p class="tb">Texto-base: ${c.textos[n - 1]}</p><h4>${atv ? "Como fazer" : "Objetivo"}</h4><u></u><u></u><u class="c"></u><h4>${atv ? "Material" : "Para conversar"}</h4><u></u><u></u><u></u><u></u><h4>Aplicação</h4><u></u><u class="c"></u><u></u></div></div>`; };

// ================= modal: vídeo, estudo, imagem, carrossel, encontro e agente =================
const modal = $("#modal"), caixa = $("#m-caixa");
const SLIDES_IG = Array.from({ length: 8 }, (_, i) => `assets/img/carr-${i + 1}.webp`);
let conversa = null;
// passador de imagens com setas e arrasto
function passador(lista, i0 = 0) {
  let i = i0;
  const c = h(`<div class="carrossel"><button aria-label="Anterior">&#8249;</button><img alt=""><button aria-label="Próxima">&#8250;</button><span class="n"></span></div>`);
  const img = $("img", c), n = $(".n", c);
  const vai = d => { i = (i + d + lista.length) % lista.length; img.src = lista[i]; n.textContent = `${i + 1} de ${lista.length}`; };
  $$("button", c)[0].onclick = () => vai(-1); $$("button", c)[1].onclick = () => vai(1);
  let x0 = null;
  img.addEventListener("pointerdown", e => { x0 = e.clientX; });
  img.addEventListener("pointerup", e => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) vai(e.clientX < x0 ? 1 : -1); x0 = null; });
  vai(0);
  return c;
}
// leitor de documento: páginas empilhadas, largas, rolando com o dedo
const leitor = paginas => h(`<div class="doc">${paginas.map(p => `<img src="${p}" alt="">`).join("")}</div>`);
function abre(tipo, dado, inicio) {
  fecha();
  if (tipo === "video") caixa.append(h(`<video src="assets/vid/${dado}.mp4" controls autoplay playsinline></video>`));
  if (tipo === "estudo") {
    const f = h(`<iframe src="assets/grupo/index.html" title="Estudo do grupo"></iframe>`);
    f.onload = () => { try { f.contentDocument.head.append(h(`<style>html{scrollbar-width:none}::-webkit-scrollbar{display:none}</style>`)); } catch (e) {} };
    caixa.append(f);
  }
  if (tipo === "imagem") caixa.append(h(`<img src="${dado}" alt="">`));
  if (tipo === "doc") caixa.append(leitor(dado));
  if (tipo === "galeria") caixa.append(passador(dado, inicio || 0));
  if (tipo === "carrossel") caixa.append(passador(SLIDES_IG), h(`<div class="qr"><img src="assets/img/qr-carrossel.jpg" alt="QR do post"><span>Aponte a câmera e veja o post</span></div>`));
  modal.classList.add("on");
}
// um encontro tem várias entregas: slides, material de estudo e um extra
function abreEncontro(id, n, aba = "slides") {
  fecha();
  const c = CLASSE[id];
  const w = h(`<div class="enc-modal" style="${vars(c)}"><div class="enc-cab"><div><small>${c.nome} &middot; Encontro ${n}</small><b>${c.titulos[n - 1]}</b></div><nav><button data-a="slides">Slides</button><button data-a="estudo">Material de estudo</button><button data-a="extra">${c.real ? "Infográfico" : "Atividade"}</button></nav></div><div class="enc-corpo"></div></div>`);
  const corpo = $(".enc-corpo", w);
  const mostraAba = a => {
    $$("nav button", w).forEach(b => b.classList.toggle("on", b.dataset.a === a));
    corpo.innerHTML = "";
    let v;
    if (c.real) {
      const m = window.EBD[n];
      if (a === "slides") v = passador(Array.from({ length: m.s }, (_, i) => `assets/ebd/e${n}/s${pad(i + 1)}.webp`));
      if (a === "estudo") v = leitor(Array.from({ length: m.a }, (_, i) => `assets/ebd/e${n}/a${pad(i + 1)}.webp`));
      if (a === "extra") v = leitor([`assets/ebd/e${n}/info.webp`]);
    } else v = h(a === "slides" ? slideMock(id, n, true) : folhaMock(id, n, a === "extra"));
    corpo.append(v);
    gsap.fromTo(v, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .35, ease: "power2.out" });
  };
  $$("nav button", w).forEach(b => { b.onclick = () => mostraAba(b.dataset.a); });
  caixa.append(w); mostraAba(aba);
  modal.classList.add("on");
}
// o agente se apresenta em conversa: quem é, o que faz, e o que muda para a igreja
const FALAS = {
  gideao: ["Time da Palavra", "Oi, pastor. Eu sou o Gideão Garimpo.", "Assim que o culto termina, eu ouço a pregação inteira e marco cada trecho que se sustenta sozinho, com o minuto exato.", "Nenhuma boa palavra do seu domingo fica esquecida no YouTube."],
  eliseu: ["Time da Palavra", "Sou o Eliseu Edição.", "Pego os trechos do Gideão e faço vídeos verticais, com legenda, enquadramento no rosto e trilha baixa.", "Sua igreja posta cortes toda semana, sem um voluntário editando de madrugada."],
  lucas: ["Time da Palavra", "Eu sou o Lucas Lição.", "Da mesma pregação eu escrevo o estudo dos grupos, o devocional da semana e um resumo do sermão.", "Os grupos estudam o que foi pregado, e a igreja inteira caminha no mesmo texto."],
  rute: ["Time da Palavra", "Sou a Rute Revisão.", "Antes de qualquer coisa sair, eu confiro com o que foi pregado: nenhum corte tira frase do contexto, nenhum estudo inventa.", "O senhor publica tranquilo, porque a mensagem continua sendo a sua."],
  marcos: ["Time da Comunicação", "Eu sou o Marcos Mensagem.", "Escrevo as legendas, os carrosséis e os convites, numa linguagem que chega a quem ainda não conhece a igreja.", "O que foi pregado vira conversa nas redes, e não só aviso."],
  bezalel: ["Time da Comunicação", "Sou o Bezalel Branding.", "Crio a identidade da igreja uma vez, com marca, cores e letras, e desenho as artes de cada ministério, de cada ciclo da EBD e de cada evento.", "A igreja aparece com a mesma cara em tudo, do boletim ao Instagram."],
  hirao: ["Time da Comunicação", "Eu sou o Hirão Hotsite.", "Cuido do site da igreja e faço as páginas de evento, de inscrição e o link da bio.", "Quem quer ir ao acampamento se inscreve em um minuto, pelo celular."],
  filipe: ["Time da Comunicação", "Sou o Filipe Farol.", "Acompanho o que o bairro está falando e trago pautas que fazem ponte com o evangelho e com o que a igreja já faz.", "A igreja fala com quem mora perto sobre o que importa para essa pessoa."],
  tabita: ["Time da Comunicação", "Eu sou a Tabita Tom.", "Antes de qualquer peça sair, confiro a voz, o tom e a marca da igreja. Nada sai com erro, com exagero ou fora do jeito de vocês.", "Tudo o que a igreja publica tem o jeito da igreja."],
  josue: ["Projetos", "Oi, pastor. Eu sou o Josué Jornada.", "Quando o senhor quiser começar um congresso, um acampamento ou o aniversário da igreja, eu faço as perguntas, proponho caminhos de tema e monto o plano de trás para frente, com o que cada time faz.", "O senhor tem com quem pensar o projeto, e nada fica esquecido."],
  dorcas: ["Time da Comunicação", "Sou a Dorcas Disparo.", "Organizo o calendário, agendo em cada rede e mando pelo WhatsApp para os membros. Tudo sai no pacote da semana, depois do seu sim.", "A semana inteira tem conteúdo, e ninguém da equipe precisa lembrar de postar."],
  priscila: ["Time do Ensino", "Oi! Eu sou a Priscila Programa.", "O líder de cada classe me entrega o tema, os livros-base e a essência do que quer ensinar. Eu monto o ciclo, inclusive a classe de novos membros e o plano de leitura, e distribuo o trabalho para o time.", "Cada classe recebe o curso inteiro, com começo, meio e fim."],
  apolo: ["Time do Ensino", "Sou o Apolo Aula.", "Escrevo cada encontro e o guia do professor, para todas as idades, das crianças aos adultos, com o texto bíblico no centro e a aplicação no fim.", "O professor chega no domingo sabendo o que ensinar e como conduzir a turma."],
  sara: ["Time do Ensino", "Eu sou a Sara Slide.", "Monto os slides e o material de apoio de cada aula, sempre na identidade daquela classe.", "A turma vê uma apresentação bonita e coerente do primeiro ao último encontro."],
  natanael: ["Time do Ensino", "Eu sou o Natanael Norma.", "Leio tudo antes de chegar ao professor e confiro com a confissão de fé da igreja.", "O conselho pode confiar: o que se ensina na EBD é o que a igreja confessa."],
  esdras: ["Time do Ensino", "Oi! Eu sou o Esdras Explica.", "Fico no grupo de WhatsApp de cada classe e conheço o material dela inteiro. Quando alguém me chama com uma dúvida, explico com outras palavras, abro o versículo e mostro onde está na aula. O que passa do material eu levo ao professor.", "No sábado o professor recebe as dúvidas da semana e sabe quem precisa de atenção, e no fim do ciclo o líder do Ensino recebe o relatório de cada classe."],
  lidia: ["Time do Cuidado", "Oi, eu sou a Lídia Lar.", "Atendo quem chega pelo link da bio a qualquer hora: horários, endereço, ministério infantil. Quando a pessoa quer visitar, aviso o acolhimento na hora.", "Quem bate à porta da igreja pela internet nunca fica sem resposta."],
  isabel: ["Time do Cuidado", "Oi, pastor. Eu sou a Isabel Integra.", "Acompanho cada visitante depois do primeiro domingo: as boas-vindas, o convite para um grupo, a classe de novos membros. E lembro o líder do grupo de ligar em até 36 horas.", "Quem visitou a igreja não se perde entre o domingo e o grupo."],
  epafras: ["Time do Cuidado · módulo opcional", "Sou o Epafras Escuta.", "Leio os grupos da igreja que o conselho autorizou, e não respondo em nenhum. À noite mando um boletim curto e ponho na sua semana o que pede cuidado: a visita, a ligação, o aniversário, o pedido de oração.", "O senhor sabe da irmã internada no mesmo dia, e a visita já aparece marcada."],
  tercio: ["Time do Governo", "Oi, pastor. Eu sou o Tércio Tinta.", "O secretário me manda as notas ou a gravação da reunião, e no dia seguinte ele tem o rascunho da ata e o quadro de decisões, com dono e prazo. Depois eu lembro cada dono antes do prazo, mantenho o rol de membros em dia e monto o relatório do ano.", "Nenhuma decisão do conselho fica só na memória de alguém."],
  febe: ["Time do Governo", "Sou a Febe Folhinha.", "Cuido da agenda oficial da igreja. Quando alguém tenta marcar no mesmo salão e horário, eu aviso na hora. Os outros agentes consultam a mesma agenda.", "A igreja inteira olha para um calendário só."],
};
const NOMES = { gideao: "Gideão Garimpo", eliseu: "Eliseu Edição", lucas: "Lucas Lição", rute: "Rute Revisão", marcos: "Marcos Mensagem", dorcas: "Dorcas Disparo", priscila: "Priscila Programa", apolo: "Apolo Aula", sara: "Sara Slide", natanael: "Natanael Norma", esdras: "Esdras Explica", lidia: "Lídia Lar", josue: "Josué Jornada", bezalel: "Bezalel Branding", hirao: "Hirão Hotsite", filipe: "Filipe Farol", tabita: "Tabita Tom", isabel: "Isabel Integra", epafras: "Epafras Escuta", tercio: "Tércio Tinta", febe: "Febe Folhinha" };
function abreAgente(id) {
  fecha();
  const [min, ...falas] = FALAS[id];
  const w = h(`<div class="ag-modal"><div class="ag-perfil"><img src="assets/avatares/${id}.webp" alt=""><b>${NOMES[id]}</b><span>${min}</span></div><div class="ag-chat"></div></div>`);
  caixa.append(w); modal.classList.add("on");
  const chat = $(".ag-chat", w);
  conversa = gsap.timeline()
    .fromTo($(".ag-perfil img", w), { scale: .6, filter: "blur(10px)", autoAlpha: 0 }, { scale: 1, filter: "blur(0px)", autoAlpha: 1, duration: .6, ease: "back.out(1.6)" })
    .fromTo($$(".ag-perfil b, .ag-perfil span", w), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .4, stagger: .1 }, .3);
  falas.forEach((t, k) => {
    const at = .7 + k * 1.9;
    const b = h(`<div class="fala-ag${k === falas.length - 1 ? " forte" : ""}"><span class="digita"><i></i><i></i><i></i></span></div>`);
    conversa.add(() => { chat.append(b); gsap.fromTo(b, { autoAlpha: 0, y: 20, scale: .9, transformOrigin: "0% 0%" }, { autoAlpha: 1, y: 0, scale: 1, duration: .35, ease: "back.out(2)" }); gsap.to($$(".digita i", b), { y: -6, duration: .3, yoyo: true, repeat: 3, stagger: .12 }); }, at)
      .add(() => { b.textContent = t; gsap.fromTo(b, { filter: "blur(6px)" }, { filter: "blur(0px)", duration: .3 }); }, at + .9);
  });
}
function fecha() { conversa && conversa.kill(); conversa = null; modal.classList.remove("on"); caixa.innerHTML = ""; }
modal.addEventListener("click", e => { if (e.target === modal || e.target.closest(".fecha")) fecha(); });
addEventListener("keydown", e => { if (e.key === "Escape") fecha(); });
// tocar num agente, em qualquer cena, abre a apresentação dele
document.addEventListener("click", e => {
  const alvo = e.target.closest(".equipe > div, .assina, .selo-rute");
  const img = alvo && $("img", alvo), m = img && img.getAttribute("src").match(/avatares\/(\w+)\.webp/);
  if (m && FALAS[m[1]]) { e.stopPropagation(); abreAgente(m[1]); }
}, true);

// ================= INÍCIO: a abertura em 3D mora no abertura.js =================
// o módulo carrega depois deste arquivo; se a cena entrar antes, ele pega o pedido pendente
const ato = n => () => ({ enter() { window.ABERTURA ? window.ABERTURA.ato(n) : (window.ABERTURA_PEND = n); }, leave() {} });
const i1 = ato(1), i2 = ato(2);

// ================= TIMES =================
const TIMES = [
  { id: "palavra", nome: "Palavra", rostos: ["gideao", "eliseu", "lucas", "rute"], dor: "Sua pregação de domingo chega a quem não estava no culto?", bem: "Cada sermão vira cortes, estudo e posts para a semana inteira, e quem assistiu encontra o caminho até a igreja." },
  { id: "ensino", nome: "Ensino", rostos: ["priscila", "apolo", "sara", "natanael", "esdras"], dor: "A EBD depende de um professor que prepara tudo sozinho na véspera?", bem: "O trimestre chega planejado, com aulas, guia do professor e slides, revisados contra a confissão da igreja. E a classe tira dúvidas durante a semana." },
  { id: "comunicacao", nome: "Comunicação", rostos: ["bezalel", "marcos", "hirao", "dorcas"], dor: "O Instagram da sua igreja é um mural de avisos?", bem: "Conteúdo que edifica quem está dentro e conversa com quem está fora. E cada evento sai pronto, da arte à inscrição." },
  { id: "cuidado", nome: "Cuidado", rostos: ["lidia", "isabel", "epafras"], dor: "Quem visitou a igreja no domingo recebeu uma mensagem durante a semana?", bem: "O visitante é recebido na hora, o acolhimento é avisado e ninguém some sem que o pastor saiba." },
  { id: "governo", nome: "Governo", rostos: ["tercio", "febe"], dor: "Você ainda é o lembrete da sua igreja?", bem: "O que foi decidido tem dono e prazo, o domingo tem gente e a agenda é uma só. E você volta a pastorear." },
];
function t1() {
  const box = $("#t1-cartoes");
  const cards = TIMES.map(t => {
    const ativo = !!document.getElementById("v-" + t.id);
    const c = h(`<${ativo ? "a" : "div"} class="cartao${ativo ? " ativo" : ""}" ${ativo ? `href="#${t.id}"` : ""}>
      <h3>${t.nome}</h3>
      <div class="rosto">${t.rostos.map(r => `<img src="assets/avatares/${r}.webp" alt="">`).join("")}</div>
      <p class="dor">${t.dor}</p>
      <span class="ir">${ativo ? "Ver o time" : "Em breve"}</span></${ativo ? "a" : "div"}>`);
    box.append(c);
    return c;
  });
  gsap.set(["#t1-tit", "#t1-sub", ...cards], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#t1-tit", foco, { ...nitido, duration: .8 })
    .fromTo("#t1-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo(cards, { autoAlpha: 0, y: 70, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "power3.out", stagger: .14 }, .5);
  const vida = gsap.timeline({ paused: true });
  cards.forEach((c, i) => vida.to($(".rosto", c), { y: -6, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut" }, i * .3));
  // passar o dedo ou o mouse: o cartão sobe, os rostos se abrem em leque e a pergunta acende
  cards.forEach(c => {
    const imgs = $$(".rosto img", c);
    const sobe = gsap.timeline({ paused: true })
      .to(c, { y: -18, scale: 1.035, borderColor: "#ffac13", boxShadow: "0 30px 60px rgba(0,0,0,.6)", duration: .35, ease: "power2.out" }, 0)
      .to(imgs, { x: i => i * 6, y: -10, rotation: i => (i - 1.5) * 7, scale: 1.08, duration: .4, ease: "back.out(2)" }, 0)
      .to($(".dor", c), { color: "#ffac13", duration: .3 }, 0);
    c.addEventListener("pointerenter", () => sobe.play());
    c.addEventListener("pointerleave", () => sobe.reverse());
  });
  vida.to(".cartao.ativo .ir", { scale: 1.04, duration: .9, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  return { enter() { tl.restart(); vida.play(); }, leave() { tl.pause(0); vida.pause(0); } };
}

// ================= PALAVRA 1: a chamada =================
const EQUIPE_PALAVRA = [["gideao", "Gideão Garimpo"], ["eliseu", "Eliseu Edição"], ["lucas", "Lucas Lição"], ["rute", "Rute Revisão"], ["marcos", "Marcos Mensagem"], ["dorcas", "Dorcas Disparo"]];
function p1() {
  const eq = $("#p1-eq");
  EQUIPE_PALAVRA.forEach(([id, nome]) => eq.append(h(`<div><img src="assets/avatares/${id}.webp" alt=""><b>${nome}</b></div>`)));
  const sats = $$("#p1-orb .sat"), ang = { a: 0 };
  const gira = () => sats.forEach((s, i) => {
    const a = (ang.a + i * 360 / sats.length) * Math.PI / 180, z = Math.sin(a);
    gsap.set(s, { x: Math.cos(a) * 330, y: z * 250, scale: .8 + .25 * (z + 1) / 2, zIndex: z > 0 ? 3 : 1 });
  });
  gira();
  const orbita = gsap.to(ang, { a: 360, duration: 30, ease: "none", repeat: -1, paused: true, onUpdate: gira });
  gsap.set(["#p1-k", "#p1-h", "#p1-p", "#p1-orb", "#p1-dica", ...eq.children], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#p1-k", foco, { ...nitido, duration: .6 })
    .fromTo("#p1-h", foco, { ...nitido, duration: 1 }, .2)
    .fromTo("#p1-orb", { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "back.out(1.4)" }, .6)
    .fromTo("#p1-p", foco, { ...nitido, duration: .8 }, 1.4)
    .fromTo(eq.children, { autoAlpha: 0, y: 30, scale: .7 }, { autoAlpha: 1, y: 0, scale: 1, duration: .6, ease: "back.out(1.8)", stagger: .1 }, 2)
    .to("#p1-dica", { autoAlpha: 1, duration: .6 }, 3.6);
  const vida = gsap.timeline({ paused: true })
    .to("#p1-orb .nucleo", { y: -8, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to("#p1-dica i", { y: 8, duration: .8, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  return { enter() { tl.restart(); orbita.play(); vida.play(); }, leave() { tl.pause(0); orbita.pause(); vida.pause(0); } };
}

// ================= PALAVRA 2: o que sai da pregação =================
function p2() {
  const svg = $("#p2-liga");
  const ligas = ligacoes(svg, [
    "M400 665 H455",
    "M585 665 C615 665 610 410 650 410 H815",
    "M585 665 C615 665 605 300 660 300 H1240 C1290 300 1300 410 1315 410",
    "M585 665 C615 665 600 265 660 265 H1620 C1660 265 1670 410 1675 410",
    "M860 460 V525",
    "M1360 460 C1360 505 1240 490 1240 525",
    "M1360 460 C1360 505 1481 490 1481 525",
    "M1720 460 V525",
  ]);
  const [r0, r1, r2, r3, d1, d2, d3, d4] = ligas;
  const prods = ["#p2-cortes", "#p2-estudo", "#p2-info", "#p2-carr"].map(s => $(s));
  // selos da Rute, um por produto
  const selos = prods.map(p => { const c = h(`<span class="ck">✓</span>`); p.append(c); return c; });
  const leque = $$("#p2-carr .leque img");
  gsap.set(["#p2-tit", "#p2-fonte", "#p2-gid", "#p2-eli", "#p2-luc", "#p2-mar", ...prods, "#p2-rute", "#p2-cap", ...selos], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#p2-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#p2-fonte", { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: .7, ease: "power3.out" }, .3);
  desenha(tl, r0, 1, .4); pop(tl, "#p2-gid", 1.2);
  desenha(tl, r1, 2); desenha(tl, r2, 2, 1); desenha(tl, r3, 2, 1.1);
  pop(tl, "#p2-eli", 2.5); pop(tl, "#p2-luc", 2.8); pop(tl, "#p2-mar", 3);
  desenha(tl, d1, 3.3, .3); desenha(tl, d2, 3.5, .3); desenha(tl, d3, 3.5, .3); desenha(tl, d4, 3.6, .3);
  // os produtos saem dos agentes, grandes
  tl.set(prods[0], { autoAlpha: 1 }, 3.6)
    .fromTo($$("#p2-cortes .corte"), { autoAlpha: 0, y: -140, scale: .3, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: .8, ease: "back.out(1.4)", stagger: .16 }, 3.6)
    .fromTo("#p2-cortes em", { autoAlpha: 0 }, { autoAlpha: 1, duration: .4 }, 4.3);
  pop(tl, prods[1], 4.1, { y: 0 }); pop(tl, prods[2], 4.4, { y: 0 });
  tl.set(prods[3], { autoAlpha: 1 }, 4.6)
    .fromTo(leque, { autoAlpha: 0, y: -100 }, { autoAlpha: 1, y: 0, duration: .7, ease: "back.out(1.4)", stagger: .1 }, 4.6);
  // a Rute confere e carimba
  tl.fromTo("#p2-rute", { autoAlpha: 0, x: -60 }, { autoAlpha: 1, x: 0, duration: .6, ease: "power3.out" }, 5.8)
    .fromTo(selos, { autoAlpha: 0, scale: 2.4, rotation: -30 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: .45, ease: "back.out(2.2)", stagger: .22 }, 6.2)
    .fromTo("#p2-cap", foco, { ...nitido, duration: .7 }, 7.4);
  const pulsos = [r0, r1, r2, r3].map((r, i) => pulso(svg, r, 1.6, i * .3));
  const vida = gsap.timeline({ paused: true });
  prods.forEach((p, i) => vida.to(p, { y: -6, duration: 2 + i * .3, yoyo: true, repeat: -1, ease: "sine.inOut" }, i * .25));
  $$("#p2-cortes .corte").forEach(c => c.addEventListener("click", e => { e.stopPropagation(); abre("video", c.dataset.v); }));
  $("#p2-estudo").addEventListener("click", () => abre("estudo"));
  $("#p2-info").addEventListener("click", () => abre("imagem", "assets/img/infografico.webp"));
  $("#p2-carr").addEventListener("click", () => abre("carrossel"));
  let dc = null;
  return {
    enter() { zeraLigas(ligas); tl.restart(); dc = gsap.delayedCall(7, () => { pulsos.forEach(p => p.restart(true)); vida.restart(); }); },
    leave() { dc && dc.kill(); tl.pause(0); pulsos.forEach(p => p.pause(0)); vida.pause(0); },
  };
}

// ================= PALAVRA 3: para todas as redes =================
const ICONE = {
  ig: `<svg viewBox="0 0 72 72"><defs><linearGradient id="igg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".5" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect x="4" y="4" width="64" height="64" rx="18" fill="url(#igg)"/><rect x="18" y="18" width="36" height="36" rx="11" fill="none" stroke="#fff" stroke-width="5"/><circle cx="36" cy="36" r="8" fill="none" stroke="#fff" stroke-width="5"/><circle cx="50" cy="22" r="3" fill="#fff"/></svg>`,
  yt: `<svg viewBox="0 0 72 72"><rect x="4" y="14" width="64" height="44" rx="14" fill="#ff0033"/><path d="M30 26 L48 36 L30 46 Z" fill="#fff"/></svg>`,
  tt: `<svg viewBox="0 0 72 72"><rect x="4" y="4" width="64" height="64" rx="18" fill="#111"/><path d="M40 16 V44 A9 9 0 1 1 31 35 M40 16 C42 24 48 27 54 27" fill="none" stroke="#25f4ee" stroke-width="6" stroke-linecap="round" transform="translate(-2 -1)"/><path d="M40 16 V44 A9 9 0 1 1 31 35 M40 16 C42 24 48 27 54 27" fill="none" stroke="#fe2c55" stroke-width="6" stroke-linecap="round" transform="translate(2 1)"/><path d="M40 16 V44 A9 9 0 1 1 31 35 M40 16 C42 24 48 27 54 27" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`,
  x: `<svg viewBox="0 0 72 72"><rect x="4" y="4" width="64" height="64" rx="18" fill="#111" stroke="#444" stroke-width="2"/><path d="M22 20 L50 52 M50 20 L22 52" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>`,
  wa: `<svg viewBox="0 0 72 72"><circle cx="36" cy="34" r="28" fill="#25d366"/><path d="M14 64 L20 50 L30 58 Z" fill="#25d366"/><path d="M27 24 C25 30 34 44 46 46 L50 41 L44 37 L41 40 C37 38 33 34 31 30 L34 27 L31 21 Z" fill="#fff"/></svg>`,
};
const CANAIS = [["ig", "Instagram", "publicações"], ["yt", "YouTube", "vídeos"], ["tt", "TikTok", "vídeos"], ["x", "X", "publicações"], ["wa", "WhatsApp", "envios"]];
function p3() {
  const box = $("#p3-canais");
  const tiles = CANAIS.map(([id, nome, un]) => { const t = h(`<div class="canal">${ICONE[id]}<b>${nome}</b><span><i>0</i> ${un}</span></div>`); box.append(t); return t; });
  const cy = i => 340 + i * 138 + 58;
  const svg = $("#p3-liga");
  const ligas = ligacoes(svg, CANAIS.map((_, i) => `M710 680 C900 680 980 ${cy(i)} 1175 ${cy(i)}`));
  const fotos = ["assets/vid/c1-jesus-me-ama.jpg", "assets/vid/c2-o-guarda-pediu-perdao.jpg", "assets/img/carr-1.webp", "assets/img/infografico.webp", "assets/vid/c3-o-fardo-que-ele-tira.jpg"];
  const voo = $("#p3-voo"), avioes = Array.from({ length: 15 }, (_, i) => { const im = h(`<img src="${fotos[i % fotos.length]}" alt="">`); voo.append(im); gsap.set(im, { autoAlpha: 0 }); return im; });
  const conta = tiles.map(() => 0);
  const soma = i => { conta[i]++; $("i", tiles[i]).textContent = conta[i]; gsap.fromTo(tiles[i], { borderColor: "#ffac13" }, { borderColor: "#ffffff18", duration: .8 }); gsap.fromTo($("svg", tiles[i]), { scale: 1.25 }, { scale: 1, duration: .5, ease: "back.out(3)" }); };
  const voos = gsap.timeline({ paused: true, repeat: -1 });
  avioes.forEach((im, k) => {
    const i = k % 5, at = k * .42;
    voos.fromTo(im, { x: 300, scale: .5 }, { x: 1150, duration: 1.1, ease: "power1.inOut" }, at)
      .fromTo(im, { y: 640 }, { y: cy(i) - 40, duration: 1.1, ease: "power2.out" }, at)
      .fromTo(im, { autoAlpha: 0 }, { keyframes: { autoAlpha: [0, 1, 1, 0], scale: [.5, 1, .9, .4] }, duration: 1.1 }, at)
      .add(() => soma(i), at + 1.05);
  });
  gsap.set(["#p3-tit", "#p3-sub", "#p3-pilha", "#p3-dor", ...tiles], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#p3-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#p3-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo("#p3-pilha", { autoAlpha: 0, x: -80, rotation: -6 }, { autoAlpha: 1, x: 0, rotation: 0, duration: .8, ease: "power3.out" }, .6);
  pop(tl, "#p3-dor", 1.1);
  ligas.forEach((l, i) => desenha(tl, l, 1.6 + i * .12, .6));
  tl.fromTo(tiles, { autoAlpha: 0, x: 80, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .6, ease: "power3.out", stagger: .12 }, 1.8)
    .add(() => voos.play(0), 2.8);
  const vida = gsap.to("#p3-pilha img", { y: -8, duration: 1.6, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .3, paused: true });
  return {
    enter() { conta.fill(0); tiles.forEach(t => { $("i", t).textContent = 0; }); zeraLigas(ligas); tl.restart(); vida.play(); },
    leave() { tl.pause(0); voos.pause(0); vida.pause(0); avioes.forEach(a => gsap.set(a, { autoAlpha: 0 })); },
  };
}

// ================= PALAVRA 4: o mês agendado =================
const CHIP = { ig: ["Insta", "#e1306c"], yt: ["YouTube", "#ff0033"], tt: ["TikTok", "#25f4ee"], x: ["X", "#e7e7e7"], wa: ["Zap", "#25d366"] };
// o que sai em cada dia da semana depois do domingo (seg a sáb); o domingo leva o culto ao vivo
const SEMANA = [["ig", "wa"], ["tt", "yt"], ["ig", "x"], ["ig", "tt"], ["wa", "yt"], ["ig", "x"]];
function p4() {
  const ini = new Date(2026, 9, 1).getDay(), dias = 31;
  $(".sem", $("#p4-mes")).innerHTML = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map(d => `<span>${d}</span>`).join("");
  const grade = $(".grade", $("#p4-mes")), celulas = [];
  for (let i = 0; i < ini; i++) grade.append(h(`<div class="dia vazio"></div>`));
  for (let d = 1; d <= dias; d++) {
    const dom = (ini + d - 1) % 7 === 0;
    const c = h(`<div class="dia${dom ? " dom" : ""}"><small>${d}</small><div class="chips"></div></div>`);
    grade.append(c); celulas.push(c);
  }
  // pacotes: um por domingo, e o do domingo anterior cobre o começo do mês
  const domingos = [-3, 4, 11, 18, 25];
  const fotos = ["c3-o-fardo-que-ele-tira", "c1-jesus-me-ama", "c2-o-guarda-pediu-perdao", "c3-o-fardo-que-ele-tira", "c1-jesus-me-ama"];
  const fila = $("#p4-fila");
  const pacotes = domingos.map((s, k) => {
    const rot = s < 1 ? "27/9" : `${s}/10`;
    const p = h(`<div class="pacote"><img src="assets/vid/${fotos[k]}.jpg" alt=""><div><b>Pregação de ${rot}</b><span>cortes, estudo, carrossel</span></div></div>`);
    fila.append(p); return p;
  });
  const chips = domingos.map(s => {
    const lote = [];
    const poe = (d, tipo) => { if (d < 1 || d > dias) return; const [t, cor] = CHIP[tipo]; const c = h(`<span class="chip" style="background:${cor}">${t}</span>`); $(".chips", celulas[d - 1]).append(c); lote.push(c); };
    if (s >= 1) poe(s, "yt");
    SEMANA.forEach((tipos, j) => tipos.forEach(t => poe(s + 1 + j, t)));
    return lote;
  });
  const todos = chips.flat(), contaB = $("#p4-conta b");
  let n = 0;
  gsap.set(["#p4-tit", "#p4-sub", "#p4-dor", "#p4-mes", "#p4-conta", ...pacotes, ...todos], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#p4-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#p4-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo("#p4-mes", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .8, ease: "power3.out" }, .5)
    .fromTo(celulas, { autoAlpha: 0, scale: .85 }, { autoAlpha: 1, scale: 1, duration: .3, stagger: .015 }, .7)
    .fromTo(pacotes, { autoAlpha: 0, x: -80 }, { autoAlpha: 1, x: 0, duration: .5, ease: "power3.out", stagger: .12 }, .9)
    .to("#p4-conta", { autoAlpha: 1, duration: .4 }, 1.4);
  pop(tl, "#p4-dor", 1.2);
  chips.forEach((lote, k) => {
    const at = 2 + k * 1.5;
    tl.to(pacotes[k], { x: 26, borderColor: "#ffac13", duration: .3 }, at)
      .fromTo(lote, { autoAlpha: 0, y: -26, scale: .3 }, { autoAlpha: 1, y: 0, scale: 1, duration: .35, ease: "back.out(2.5)", stagger: .05, onUpdate() { contaB.textContent = n + Math.round(this.progress() * lote.length); }, onComplete() { n += lote.length; } }, at + .2)
      .to(pacotes[k], { x: 0, autoAlpha: .35, borderColor: "#ffffff1c", duration: .4 }, at + 1.2);
  });
  const vida = gsap.timeline({ paused: true })
    .to("#p4-dor img", { y: -7, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to(".dia.dom", { borderColor: "#ffac13", duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .3 }, 0);
  return { enter() { n = 0; contaB.textContent = 0; tl.restart(); vida.play(); }, leave() { tl.pause(0); vida.pause(0); n = 0; } };
}

// ================= PALAVRA 5: gente chegando =================
const CHEGADAS = [
  { nome: "Carla", ini: "C", cor: "#e1306c", de: "viu um corte no Instagram", msg: "Assisti o vídeo sobre o fardo que Jesus tira. Vocês têm culto à noite?", resp: "Oi, Carla! Temos culto domingo às 19h. Quer que alguém te receba na porta?", aviso: ["Carla vem domingo às 19h", "viu um corte no Instagram"] },
  { nome: "Rafael", ini: "R", cor: "#ffac13", de: "viu o carrossel", msg: "Moro perto da igreja. Posso ir no domingo com minha esposa?", resp: "Claro, Rafael! O culto da manhã é às 10h e tem estacionamento ao lado.", aviso: ["Rafael e a esposa, domingo 10h", "viu o carrossel"] },
  { nome: "Dona Lúcia", ini: "L", cor: "#25d366", de: "recebeu o estudo no WhatsApp", msg: "Gostei do estudo. Tem grupo perto do meu bairro?", resp: "Tem sim, toda quinta às 20h. Vou pedir para a líder falar com a senhora.", aviso: ["Dona Lúcia quer um grupo", "recebeu o estudo no WhatsApp"] },
  { nome: "Thiago", ini: "T", cor: "#ff0033", de: "assistiu a pregação no YouTube", msg: "Queria conversar com alguém sobre o que ouvi na pregação.", resp: "Vou avisar o pastor e a equipe de visita, Thiago. Qual o melhor horário para você?", aviso: ["Thiago quer conversar", "assistiu a pregação no YouTube"] },
  { nome: "Bia", ini: "B", cor: "#25f4ee", de: "viu um corte no TikTok", msg: "É a primeira vez que penso em ir numa igreja. Posso ir sozinha?", resp: "Pode sim, Bia. Vou pedir para alguém te esperar na entrada.", aviso: ["Bia vem pela primeira vez", "viu um corte no TikTok"] },
];
function p5() {
  const svg = $("#p5-liga");
  const [a, b] = ligacoes(svg, ["M760 660 C860 660 880 640 970 640", "M1110 640 H1375"]);
  const msgs = $("#p5-msgs"), avisos = $("#p5-avisos"), lid = $("#p5-lid");
  const fala = h(`<div class="fala"></div>`); lid.append(fala);
  const contaB = $("#p5-conta b");
  let k = 0, total = 0, prox = null, cartas = [], notas = [];
  const empilha = (lista, nova, gap, limite) => {
    const alt = nova.offsetHeight + gap;
    lista.forEach(c => gsap.to(c, { y: "+=" + alt, duration: .5, ease: "power2.inOut" }));
    lista.unshift(nova);
    while (lista.length > limite) { const v = lista.pop(); gsap.to(v, { autoAlpha: 0, duration: .3, onComplete: () => v.remove() }); }
  };
  // um ponto de luz que corre a ligação uma vez
  const corre = (p) => { const c = el("circle", { r: 8, class: "pulso" }, svg), L = +p.dataset.L, o = { t: 0 };
    return gsap.to(o, { t: 1, duration: .8, ease: "power1.inOut", onUpdate: () => { const q = p.getPointAtLength(o.t * L); c.setAttribute("cx", q.x); c.setAttribute("cy", q.y); }, onComplete: () => c.remove() }); };
  function chega() {
    const c = CHEGADAS[k % CHEGADAS.length]; k++;
    const m = h(`<div class="msg"><span class="ini" style="background:${c.cor}">${c.ini}</span><b>${c.nome}</b><small>${c.de}</small><p>${c.msg}</p></div>`);
    msgs.append(m); gsap.set(m, { y: 0 });
    empilha(cartas, m, 16, 4);
    gsap.fromTo(m, { autoAlpha: 0, x: -80, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .6, ease: "power3.out" });
    gsap.timeline()
      .add(corre(a), .5)
      .add(() => { fala.textContent = c.resp; }, 1.3)
      .fromTo(fala, { autoAlpha: 0, y: 14, scale: .9 }, { autoAlpha: 1, y: 0, scale: 1, duration: .4, ease: "back.out(2)" }, 1.3)
      .fromTo($("img", lid), { scale: 1 }, { scale: 1.08, duration: .2, yoyo: true, repeat: 1 }, 1.3)
      .add(corre(b), 2.2)
      .add(() => {
        const n = h(`<div class="aviso"><b>${c.aviso[0]}</b><span>${c.aviso[1]}</span></div>`);
        avisos.append(n); gsap.set(n, { position: "absolute", left: 0, right: 0, top: 0, y: 0 });
        empilha(notas, n, 14, 5);
        gsap.fromTo(n, { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: .5, ease: "back.out(1.8)" });
        total += 3 + (k * 7) % 4; contaB.textContent = total;
        gsap.fromTo(contaB, { scale: 1.4 }, { scale: 1, duration: .5, ease: "back.out(3)" });
      }, 3);
    if (k === CHEGADAS.length) gsap.fromTo("#p5-fecho", foco, { ...nitido, duration: .9, delay: 3.6 });
    if (k < CHEGADAS.length * 2) prox = gsap.delayedCall(3.8, chega); // ponytail: duas voltas e para, para o número não crescer sem fim
  }
  gsap.set(["#p5-tit", "#p5-sub", lid, "#p5-cel", "#p5-conta", "#p5-fecho", fala], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#p5-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#p5-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo("#p5-cel", { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: .8, ease: "power3.out" }, .7)
    .to("#p5-conta", { autoAlpha: 1, duration: .4 }, 1.2);
  pop(tl, lid, .9);
  desenha(tl, a, 1.3); desenha(tl, b, 1.5);
  tl.add(() => chega(), 2);
  const vida = gsap.to($("img", lid), { y: -7, duration: 1.9, yoyo: true, repeat: -1, ease: "sine.inOut", paused: true });
  const limpa = () => { prox && prox.kill(); prox = null; k = 0; total = 0; contaB.textContent = 0; cartas = []; notas = []; msgs.innerHTML = ""; avisos.innerHTML = ""; $$("circle.pulso", svg).forEach(c => c.remove()); };
  return { enter() { limpa(); zeraLigas([a, b]); tl.restart(); vida.play(); }, leave() { limpa(); tl.pause(0); vida.pause(0); gsap.set(["#p5-fecho", fala], { autoAlpha: 0 }); } };
}


// ================= ENSINO 1: a chamada =================
const AULAS = ["Criação", "Queda", "Redenção", "Consumação", "Trabalho", "Família", "Tecnologia", "Dinheiro", "Arte", "Ciência", "Corpo", "Cidade", "Missão"];
const EQUIPE_ENSINO = [["priscila", "Priscila Programa"], ["apolo", "Apolo Aula"], ["sara", "Sara Slide"], ["natanael", "Natanael Norma"], ["esdras", "Esdras Explica"]];
function e1() {
  const eq = $("#e1-eq");
  EQUIPE_ENSINO.forEach(([id, nome]) => eq.append(h(`<div><img src="assets/avatares/${id}.webp" alt=""><b>${nome}</b></div>`)));
  const torre = $("#e1-torre");
  // as 13 aulas se empilham: a de baixo fica por cima, para o título de cada uma aparecer
  const fichas = AULAS.map((t, i) => {
    const f = h(`<div class="ficha"><b>Aula ${i + 1}</b><span>${t}</span></div>`);
    torre.append(f);
    gsap.set(f, { top: 1010 - i * 62, zIndex: 13 - i, rotation: (rnd() - .5) * 5, x: (rnd() - .5) * 34 });
    return f;
  });
  gsap.set(["#e1-k", "#e1-h", "#e1-f", "#e1-dica", ...eq.children, ...fichas], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#e1-k", foco, { ...nitido, duration: .6 })
    .fromTo("#e1-h", foco, { ...nitido, duration: 1 }, .2)
    .fromTo(fichas, { autoAlpha: 0, y: -1100 }, { autoAlpha: 1, y: 0, duration: .55, ease: "power3.in", stagger: .14 }, .8)
    .fromTo("#e1-f", { autoAlpha: 0, scale: .8, filter: "blur(10px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: .8, ease: "back.out(2)" }, 2.9)
    .fromTo(eq.children, { autoAlpha: 0, y: 30, scale: .7 }, { autoAlpha: 1, y: 0, scale: 1, duration: .6, ease: "back.out(1.8)", stagger: .1 }, 3.4)
    .to("#e1-dica", { autoAlpha: 1, duration: .6 }, 4.4);
  // o peso: cada ficha que pousa amassa um pouco a pilha
  fichas.forEach((f, i) => tl.fromTo(torre, { scaleY: 1 }, { scaleY: .985, duration: .08, yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, .8 + i * .14 + .55));
  const vida = gsap.timeline({ paused: true })
    .to(torre, { rotation: 1.2, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut", transformOrigin: "50% 100%" }, 0)
    .to("#e1-dica i", { y: 8, duration: .8, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  return { enter() { tl.restart(); vida.play(); }, leave() { tl.pause(0); vida.pause(0); } };
}

// ================= ENSINO 2: como é hoje =================
function e2() {
  const svg = $("#e2-cena");
  // o livro
  const livro = el("g", { opacity: 0 }, svg);
  el("rect", { x: 230, y: 470, width: 240, height: 320, rx: 12, fill: "#3a3a3a", stroke: "#888", "stroke-width": 4 }, livro);
  el("rect", { x: 230, y: 470, width: 30, height: 320, fill: "#555" }, livro);
  [540, 580, 620].forEach(y => el("rect", { x: 290, y, width: 150, height: 12, rx: 6, fill: "#777" }, livro));
  const CORES = ["#3d6fb6", "#3f9b6a", "#8a5cc2", "#9a9a9a", "#a86b3c", "#2fa3a8"];
  const caps = [], profs = [];
  CORES.forEach((cor, i) => {
    const x = 760 + i * 190, y = 430;
    const cap = el("g", { opacity: 0 }, svg);
    el("rect", { x: x - 62, y: y - 78, width: 124, height: 156, rx: 10, fill: cor }, cap);
    const t = el("text", { x, y: y + 8, "text-anchor": "middle", fill: "#fff", "font-size": 26, "font-weight": 800 }, cap); t.textContent = `Cap. ${i + 1}`;
    caps.push({ cap, x, y });
    const p = el("g", { opacity: 0 }, svg);
    el("circle", { cx: x, cy: 640, r: 36, fill: "#3b3b3b", stroke: "#aaa", "stroke-width": 3 }, p);
    el("path", { d: `M${x - 62} 790 C${x - 62} 715 ${x - 32} 688 ${x} 688 C${x + 32} 688 ${x + 62} 715 ${x + 62} 790 Z`, fill: "#333", stroke: "#888", "stroke-width": 3 }, p);
    profs.push(p);
  });
  // o fio que deveria ligar os capítulos, e que se parte
  const pedacos = caps.slice(0, -1).map(({ x }, i) => el("path", { d: `M${x + 62} 430 Q${x + 95} ${i % 2 ? 400 : 460} ${x + 128} 430`, fill: "none", stroke: "#d2232a", "stroke-width": 6, "stroke-linecap": "round", opacity: 0 }, svg));
  gsap.set(["#e2-tit", "#e2-sub", "#e2-f"], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#e2-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#e2-sub", foco, { ...nitido, duration: .8 }, .3)
    .fromTo(livro, { opacity: 0, scale: .7, svgOrigin: "350 630" }, { opacity: 1, scale: 1, duration: .7, ease: "back.out(1.6)" }, .8)
    .to(profs, { opacity: 1, duration: .5, stagger: .1 }, 1.2);
  // os capítulos saem do livro e cada um vai para um professor
  caps.forEach(({ cap, x }, i) => tl.fromTo(cap, { opacity: 0, x: 350 - x, y: 200, scale: .4, rotation: 0, svgOrigin: `${x} 430` },
    { opacity: 1, x: 0, y: 0, scale: 1, rotation: (i % 2 ? 1 : -1) * (4 + i), duration: .8, ease: "power3.out" }, 1.8 + i * .15));
  tl.to(pedacos, { opacity: 1, duration: .3, stagger: .08 }, 3.1)
    // o fio se parte e cai
    .to(pedacos, { y: () => 260 + rnd() * 120, rotation: () => (rnd() - .5) * 80, transformOrigin: "center", opacity: 0, duration: 1.1, ease: "power2.in", stagger: .12 }, 4)
    .fromTo("#e2-f", { autoAlpha: 0, y: 30, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, 4.6);
  const vida = gsap.timeline({ paused: true });
  caps.forEach(({ cap }, i) => vida.to(cap, { y: -8, duration: 1.6 + i * .2, yoyo: true, repeat: -1, ease: "sine.inOut" }, i * .2));
  let dc = null;
  return { enter() { tl.restart(); dc = gsap.delayedCall(5, () => vida.restart()); }, leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); } };
}

// ================= ENSINO 3: o líder dá a essência =================
const ICONE_MAT = {
  biblia: `<svg viewBox="0 0 52 60"><rect x="6" y="4" width="40" height="52" rx="5" fill="#3a2a1a" stroke="#c9a25a" stroke-width="2"/><path d="M26 16 V40 M18 24 H34" stroke="#e8c27a" stroke-width="4" stroke-linecap="round"/></svg>`,
  livro: `<svg viewBox="0 0 52 60"><rect x="8" y="4" width="38" height="52" rx="4" fill="#3d5a8c"/><rect x="8" y="4" width="8" height="52" fill="#2c4470"/><rect x="21" y="14" width="18" height="4" rx="2" fill="#dfe7f5"/><rect x="21" y="22" width="12" height="4" rx="2" fill="#dfe7f5"/></svg>`,
  estudo: `<svg viewBox="0 0 52 60"><rect x="8" y="4" width="36" height="52" rx="4" fill="#f4efe6"/><rect x="14" y="14" width="24" height="3" rx="1.5" fill="#999"/><rect x="14" y="22" width="24" height="3" rx="1.5" fill="#999"/><rect x="14" y="30" width="16" height="3" rx="1.5" fill="#fe7003"/><rect x="14" y="38" width="24" height="3" rx="1.5" fill="#999"/></svg>`,
  artigo: `<svg viewBox="0 0 52 60"><path d="M8 4 H34 L44 14 V56 H8 Z" fill="#e9eef5"/><path d="M34 4 V14 H44" fill="#b9c4d4"/><rect x="14" y="22" width="24" height="3" rx="1.5" fill="#7b8aa3"/><rect x="14" y="30" width="24" height="3" rx="1.5" fill="#7b8aa3"/><rect x="14" y="38" width="18" height="3" rx="1.5" fill="#7b8aa3"/></svg>`,
  nota: `<svg viewBox="0 0 52 60"><path d="M26 8 C34 20 44 24 44 36 A18 18 0 0 1 8 36 C8 24 18 20 26 8 Z" fill="#ffac13"/><path d="M26 26 C29 31 33 33 33 38 A7 7 0 0 1 19 38 C19 33 23 31 26 26 Z" fill="#fff3d6"/></svg>`,
};
function e3() {
  const svg = $("#e3-liga"), box = $("#e3-classes"), matsBox = $("#e3-mats"), chipsBox = $("#e3-chips"), curso = $("#e3-curso");
  const ids = Object.keys(CLASSE), cy = i => 340 + i * 150 + 59, PX = 960, PY = 520, MY = k => 330 + k * 104;
  const AGS = ["#e3-apo", "#e3-sar", "#e3-nat"], AX = [760, 960, 1160];
  const cards = ids.map((id, i) => {
    const c = CLASSE[id], b = h(`<button class="classe" style="${vars(c)}"><b>${c.nome}</b><span>${c.tema}</span></button>`);
    b.style.top = (cy(i) - 59) + "px"; box.append(b); b.onclick = () => { escolheu = true; roda(i); }; return b;
  });
  const rotulo = h(`<span class="mat-rot">O que o líder entregou</span>`); matsBox.append(rotulo);
  const chips = [0, 1, 2, 3, 4].map(() => { const c = h(`<span class="chip-b"></span>`); chipsBox.append(c); gsap.set(c, { autoAlpha: 0 }); return c; });
  const entrada = ligacoes(svg, ids.map((_, i) => `M715 ${cy(i)} C820 ${cy(i)} 820 ${PY} ${PX - 70} ${PY}`));
  const doLider = ligacoes(svg, ids.map((_, i) => `M352 ${MY(2) + 46} C366 ${MY(2) + 46} 366 ${cy(i)} 378 ${cy(i)}`));
  const time = ligacoes(svg, AX.map(x => `M${PX} ${PY + 70} C${PX} 720 ${x} 720 ${x} 830`));
  const [entrega] = ligacoes(svg, [`M${PX + 70} ${PY} H1370`]);
  let mats = [];
  function montaMats(id) {
    const c = CLASSE[id];
    mats.forEach(m => m.remove());
    mats = c.mats.map(([tipo, rot], k) => {
      const m = h(`<div class="mat ${tipo}" style="${vars(c)}">${ICONE_MAT[tipo]}<b>${rot}</b></div>`);
      m.style.top = MY(k) + "px"; matsBox.append(m); return m;
    });
  }
  // o curso que a Priscila entrega: três montes, cada um abre o encontro na aba certa
  function montaCurso(id) {
    const c = CLASSE[id], R = c.real, f = "assets/ebd/e1/";
    curso.setAttribute("style", vars(c));
    curso.innerHTML = `<small>Curso completo</small><h3>${c.tema}<br><i>9 encontros</i></h3>`;
    const ent = h(`<div class="entregas"></div>`);
    [["estudo", "Material de estudo", R ? `<img src="${f}a01.webp" alt="">` : papelMock(c, "Encontro 1")],
     ["slides", "Slides", R ? `<img src="${f}s01.webp" alt="">` : slideMock(id, 1)],
     ["extra", R ? "Infográfico" : "Atividade", R ? `<img src="${f}info.webp" alt="">` : papelMock(c, "Atividade")]].forEach(([aba, rot, face]) => {
      const e = h(`<button class="entrega ${aba}"><span class="monte"><i></i><i></i><span class="face">${face}</span></span><em>${rot}</em></button>`);
      e.onclick = () => abreEncontro(id, 1, aba);
      ent.append(e);
    });
    curso.append(ent);
    gsap.set(curso.children, { autoAlpha: 0 });
  }
  let run = null, escolheu = false;
  function roda(i) {
    run && run.kill();
    const id = ids[i], c = CLASSE[id];
    zeraLigas([...entrada, ...doLider, ...time, entrega]);
    cards.forEach((b, k) => { b.classList.toggle("on", k === i); gsap.to(b, { opacity: k === i ? 1 : .45, scale: k === i ? 1.04 : 1, duration: .3 }); });
    montaMats(id); montaCurso(id);
    chips.forEach((ch, k) => { ch.textContent = c.mats[k][1]; ch.style.borderColor = c.ac; gsap.set(ch, { autoAlpha: 0 }); });
    run = gsap.timeline();
    // o material do líder aparece, inteiro e legível
    run.fromTo(mats, { autoAlpha: 0, x: -60, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .45, ease: "power3.out", stagger: .1 }, 0);
    desenha(run, doLider[i], .6, .3);
    desenha(run, entrada[i], .8, .6);
    // tudo vai para a Priscila; o original fica, apagadinho
    chips.forEach((ch, k) => {
      const at = 1 + k * .2;
      run.fromTo(ch, { autoAlpha: 0, x: 90, y: MY(k) + 26, scale: .9 }, { autoAlpha: 1, duration: .15 }, at)
        .to(ch, { x: PX - 140, y: PY - 20, scale: .35, duration: .8, ease: "power2.in" }, at + .1)
        .to(ch, { autoAlpha: 0, duration: .12 }, at + .85)
        .to(mats[k], { opacity: .55, duration: .4 }, at + .1);
    });
    run.fromTo("#e3-pri img", { scale: 1 }, { scale: 1.15, duration: .2, yoyo: true, repeat: 3, ease: "sine.inOut" }, 2.1);
    // ela distribui para o time, e cada um faz a sua parte
    time.forEach((l, k) => desenha(run, l, 2.5 + k * .08, .45));
    AGS.forEach((a, k) => run.fromTo(a + " img", { scale: 1 }, { scale: 1.2, duration: .22, yoyo: true, repeat: 1, ease: "sine.inOut" }, 2.9 + k * .22));
    // e é ela quem entrega o curso
    desenha(run, entrega, 3.9, .5);
    run.fromTo("#e3-pri img", { scale: 1 }, { scale: 1.12, duration: .2, yoyo: true, repeat: 1 }, 3.9)
      .fromTo(curso.children, { autoAlpha: 0, y: 40, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .6, ease: "back.out(1.6)", stagger: .15 }, 4.2)
      .fromTo($$(".entrega", curso), { y: 60, scale: .6 }, { y: 0, scale: 1, duration: .6, ease: "back.out(1.8)", stagger: .14 }, 4.4);
  }
  gsap.set(["#e3-tit", "#e3-sub", "#e3-pri", rotulo, ...AGS, ...cards], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#e3-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#e3-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo(rotulo, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4 }, .5)
    .fromTo(cards, { autoAlpha: 0, x: -80, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .6, ease: "power3.out", stagger: .12 }, .5);
  pop(tl, "#e3-pri", .9);
  AGS.forEach((a, k) => pop(tl, a, 1.1 + k * .1));
  tl.add(() => { if (!escolheu) roda(1); }, 1.8); // abre sozinho nos adolescentes, que é o material real
  const vida = gsap.timeline({ paused: true })
    .to(AGS.map(a => a + " img"), { y: -6, duration: 1.7, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .25 }, 0)
    .to("#e3-curso", { y: -6, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  return {
    enter() { escolheu = false; curso.innerHTML = ""; mats.forEach(m => m.remove()); mats = []; zeraLigas([...entrada, ...doLider, ...time, entrega]); tl.restart(); vida.restart(); },
    leave() { run && run.kill(); tl.pause(0); vida.pause(0); cards.forEach(b => { b.classList.remove("on"); gsap.set(b, { opacity: 1, scale: 1 }); }); },
  };
}

// ================= ENSINO 4: cada classe, sua trilha =================
function e4() {
  const box = $("#e4-trilhas"), svg = $("#e4-fio");
  const X = j => 150 + j * 190, topo = i => 330 + i * 165;
  const ids = Object.keys(CLASSE);
  const linhas = ids.map((id, i) => {
    const c = CLASSE[id];
    const r = h(`<span class="trilha-rot" style="${vars(c)}">${c.nome}<i>${c.tema}</i></span>`); r.style.top = (topo(i) - 44) + "px"; box.append(r);
    // cada encontro é um slide na frente e o material de estudo atrás: as duas entregas
    const cards = c.titulos.map((t, j) => {
      const face = c.real ? `<img src="assets/ebd/capa-${pad(j + 1)}.webp" alt="${t}">` : slideMock(id, j + 1);
      const e = h(`<button class="enc" style="${vars(c)}"><span class="papel"></span><span class="frente">${face}</span></button>`);
      gsap.set(e, { left: X(j), top: topo(i) });
      e.onclick = () => abreEncontro(id, j + 1);
      box.append(e); return e;
    });
    // o fio de cada classe, na cor dela, atravessa a trilha inteira
    const y = topo(i) + 108;
    let d = `M${X(0) + 20} ${y}`;
    for (let j = 0; j < 9; j++) d += ` Q${X(j) + 108} ${y + (j % 2 ? -14 : 14)} ${X(j) + 196} ${y}`;
    const fio = ligacoes(svg, [d])[0]; fio.style.stroke = c.ac;
    return { r, cards, fio };
  });
  gsap.set(["#e4-tit", "#e4-f", "#e4-nat", ...linhas.flatMap(l => [l.r, ...l.cards])], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true }).fromTo("#e4-tit", foco, { ...nitido, duration: .7 });
  linhas.forEach(({ r, cards, fio }, k) => {
    const at = .5 + k * .9;
    tl.fromTo(r, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: .4 }, at)
      .fromTo(cards, { autoAlpha: 0, y: 30, scale: .7 }, { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: "back.out(1.8)", stagger: .07 }, at + .1)
      .to(fio, { strokeDashoffset: 0, duration: .9, ease: "power1.inOut" }, at + .2);
  });
  tl.fromTo("#e4-f", { autoAlpha: 0, y: 30, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, 4.3)
    .fromTo("#e4-nat", { autoAlpha: 0, scale: 2, filter: "blur(8px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: .6, ease: "back.out(1.6)" }, 4.9);
  // vida: um brilho corre cada fio, como quem segue a linha de domingo a domingo
  const vida = gsap.timeline({ paused: true });
  linhas.forEach(({ fio, cards }, i) => {
    vida.add(pulso(svg, fio, 3.2, i * .6).play(), 0);
    vida.to(cards.map(e => $(".papel", e)), { rotation: 9, duration: 1.6, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .12 }, i * .3);
  });
  let dc = null;
  return {
    enter() { zeraLigas(linhas.map(l => l.fio)); tl.restart(); dc = gsap.delayedCall(5.2, () => vida.restart()); },
    leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); $$("circle.pulso", svg).forEach(c => gsap.set(c, { attr: { opacity: 0 } })); },
  };
}

// ================= ENSINO 5: domingo na sala =================
function e5() {
  const svg = $("#e5-cena");
  const tela = el("rect", { x: 1130, y: 280, width: 540, height: 320, rx: 18, fill: "none", stroke: "#4a4a4a", "stroke-width": 4 }, svg);
  const prof = el("g", { opacity: 0 }, svg);
  el("circle", { cx: 1060, cy: 560, r: 40, fill: "#3b3b3b", stroke: "#ffac13", "stroke-width": 3 }, prof);
  el("path", { d: "M985 720 C985 640 1020 610 1060 610 C1100 610 1135 640 1135 720 Z", fill: "#333", stroke: "#ffac13", "stroke-width": 3, "stroke-opacity": .6 }, prof);
  const braco = el("path", { d: "M1110 640 L1170 560", stroke: "#ffac13", "stroke-width": 10, "stroke-linecap": "round" }, prof);
  const alunos = [];
  [[820, 26, 9], [920, 30, 8], [1035, 34, 7]].forEach(([y, r, n], i) => {
    for (let j = 0; j < n; j++) {
      const x = 1180 + j * (r * 2.9 + 10) + (i % 2) * 20 - i * 40;
      const g = el("g", { opacity: 0 }, svg);
      const c = el("circle", { cx: x, cy: y, r, fill: "#2a2a2a", stroke: "#666", "stroke-width": 3 }, g);
      el("path", { d: `M${x - r * 1.4} ${y + r * 2.6} Q${x} ${y + r * .8} ${x + r * 1.4} ${y + r * 2.6} Z`, fill: "#262626" }, g);
      alunos.push({ g, c, x, y, r });
    }
  });
  // ideias que sobem da turma
  const ideias = alunos.filter((_, i) => i % 3 === 0).map(a => el("circle", { cx: a.x, cy: a.y - a.r - 10, r: 7, fill: "#ffac13", opacity: 0 }, svg));
  const frases = $$("#e5-frases p");
  gsap.set(["#e5-tit", "#e5-tela", ...frases], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#e5-tit", foco, { ...nitido, duration: .7 })
    .fromTo(tela, { opacity: 0 }, { opacity: 1, duration: .5 }, .3)
    .fromTo("#e5-tela", { autoAlpha: 0, scale: .9, filter: "blur(10px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: .8, ease: "power3.out" }, .5)
    .fromTo(prof, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8, ease: "back.out(1.5)" }, .8)
    .to(alunos.map(a => a.g), { opacity: 1, duration: .4, stagger: .04 }, 1.1)
    .to(alunos.map(a => a.c), { attr: { stroke: "#ffac13", fill: "#3a2a12" }, duration: .4, stagger: { each: .06, from: "random" } }, 2.2);
  frases.forEach((f, i) => tl.fromTo(f, { autoAlpha: 0, x: -60, filter: "blur(10px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .7, ease: "power3.out" }, 2.4 + i * 1.1));
  const vida = gsap.timeline({ paused: true })
    .to(braco, { attr: { d: "M1110 640 L1180 540" }, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to(prof, { y: -5, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  ideias.forEach((d, i) => vida.fromTo(d, { attr: { opacity: 0 }, y: 0 }, { keyframes: { attr: [{ opacity: 1 }, { opacity: 0 }] }, y: -70, duration: 2.2, repeat: -1, ease: "power1.out" }, 2.5 + i * .5));
  return { enter() { tl.restart(); vida.restart(); }, leave() { tl.pause(0); vida.pause(0); } };
}

// ================= ENSINO 6: o Esdras no grupo da classe =================
// a conversa é sobre o Encontro 07 real do Adolas (Abraão: a promessa e o selo)
const GRUPO_EBD = [
  ["Theo", "#25f4ee", "Esdras, por que só Deus passou entre os animais? O Abraão não tinha que passar também?"],
  ["esd", "Quem passava pelo corredor dizia: se eu quebrar a promessa, que eu fique como esses animais. Abraão estava num sono profundo, e só a tocha de Deus passou. Deus assinou sozinho.", "Gênesis 15.17 · Encontro 07, ponto 3"],
  ["Júlia", "#e1306c", "E o que isso tem a ver com Jesus?"],
  ["esd", "Na ceia, Jesus chamou o próprio sangue de sangue da aliança. O preço que Deus aceitou no corredor foi pago na cruz. Leva essa para a classe no domingo!", "Mateus 26.28 · Encontro 07, ponto 6"],
];
function e6() {
  const svg = $("#e6-liga"), conv = $("#e6-conversa"), janela = conv.parentNode;
  const [ida, volta, aoProf, aoLider] = ligacoes(svg, ["M650 560 C760 560 800 600 895 600", "M895 640 C800 640 760 700 650 700", "M1025 600 C1120 600 1160 450 1270 450", "M1025 620 C1120 620 1160 800 1270 800"]);
  const msgs = GRUPO_EBD.map(([quem, a, b]) => quem === "esd"
    ? h(`<div class="zm esd"><b><img src="assets/avatares/esdras.webp" alt="">Esdras Explica</b>${a}<span class="ref">${b}</span></div>`)
    : h(`<div class="zm"><b style="color:${a}">${quem}</b>${b}</div>`));
  msgs.forEach(m => conv.append(m));
  gsap.set(["#e6-tit", "#e6-sub", "#e6-cel", "#e6-esd", "#e6-prof", "#e6-lider", "#e6-f", ...$$("#e6-fecho .cta"), ...msgs], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#e6-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#e6-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo("#e6-cel", { autoAlpha: 0, x: -80 }, { autoAlpha: 1, x: 0, duration: .8, ease: "power3.out" }, .6);
  pop(tl, "#e6-esd", 1);
  // pergunta, o fio vai ao Esdras, a resposta volta para o grupo
  let at = 1.6;
  msgs.forEach((m, i) => {
    const dele = i % 2 === 1;
    if (dele) { desenha(tl, volta, at - .5, .5); tl.fromTo("#e6-esd img", { scale: 1 }, { scale: 1.12, duration: .2, yoyo: true, repeat: 1 }, at - .5); }
    tl.fromTo(m, { autoAlpha: 0, y: 24, scale: .92, transformOrigin: "0% 0%" }, { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: "back.out(2)" }, at);
    // como no celular: a janela rola até a mensagem nova, e depois a pessoa rola à vontade
    // (medido na hora, porque a vista está escondida quando a cena é montada)
    tl.add(() => {
      const sobe = m.offsetTop + m.offsetHeight - janela.clientHeight;
      if (sobe > janela.scrollTop) gsap.to(janela, { scrollTop: sobe, duration: .4, ease: "power2.out" });
    }, at);
    if (!dele) desenha(tl, ida, at + .5, .5);
    at += dele ? 2.4 : 1.2;
  });
  desenha(tl, aoProf, at, .6);
  tl.fromTo("#e6-prof", { autoAlpha: 0, x: 60, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .6, ease: "power3.out" }, at + .4)
    .fromTo($$("#e6-prof li"), { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: .35, stagger: .15 }, at + .8);
  at += 2;
  desenha(tl, aoLider, at, .6);
  tl.fromTo("#e6-lider", { autoAlpha: 0, x: 60, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .6, ease: "power3.out" }, at + .4)
    .fromTo("#e6-f", { autoAlpha: 0, y: 30, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, at + 1.4)
    .fromTo($$("#e6-fecho .cta"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .5, ease: "back.out(2)", stagger: .12 }, at + 2.2);
  const vida = gsap.timeline({ paused: true })
    .to("#e6-esd img", { y: -6, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to("#e6-cel", { y: -8, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  return { enter() { zeraLigas([ida, volta, aoProf, aoLider]); janela.scrollTop = 0; tl.restart(); vida.restart(); }, leave() { tl.pause(0); vida.pause(0); } };
}

// ================= COMUNICAÇÃO: a identidade da igreja de exemplo, que o Bezalel cria =================
const MARCA = `<svg class="mk" viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M10 54 V30 A20 20 0 0 1 50 30 V54"/><path d="M20 46 A10 10 0 0 1 40 46" stroke="var(--pa)"/><path d="M10 50 Q30 40 50 50"/></svg>`;
// uma peça na identidade da igreja: cada ministério troca só o acento
const peca = (k, t, s, w, hh, o = {}) => h(`<div class="peca${o.cls ? " " + o.cls : ""}" style="--pb:${o.pb || "#1d2b53"};--pa:${o.pa || "#ff6b4a"};--pt:${o.pt || "#f6efe4"};width:${w}px;height:${hh}px;font-size:${o.fs || Math.min(w / 16, hh / 12)}px">${MARCA}<i class="faixa"></i><small>${k}</small><strong>${t}</strong><span>${s}</span></div>`);

// ================= COMUNICAÇÃO: o feed da igreja de exemplo =================
// três tipos de publicação: aviso (o mural de hoje), para dentro (edifica) e para fora (conversa)
const AVISOS_FEED = [["Culto de jovens", "sábado, 19h30"], ["Santa Ceia", "domingo"], ["Congresso", "inscrições abertas"], ["Chá das mulheres", "dia 12"], ["Aniversário da igreja", "38 anos"], ["Ensaio do coral", "sábado, 16h"], ["Acampamento", "novembro"], ["Culto de oração", "quarta, 20h"], ["EBD", "novo trimestre"], ["Mutirão", "sábado, 8h"], ["Reunião de pais", "domingo"], ["Bazar", "dia 20"]];
const FEED_VIVO = [
  ["den", "Devocional da semana", "Salmo 23"], ["fora", "Você também sentiu a chuva de ontem?", "a igreja ajuda"], ["den", "O fardo que ele tira", "corte de domingo"],
  ["fora", "Enem no domingo", "uma palavra para quem vai prestar"], ["av", "Congresso Inteiro", "inscrições abertas"], ["den", "O Seu Antônio conta", "testemunho"],
  ["fora", "Primeira vez numa igreja?", "o que esperar"], ["den", "Estudo do grupo", "Oseias 11"], ["fora", "Café na praça", "sábado, 9h"],
];
const tile = (tipo, t, s, cor) => `<div class="tile t-${tipo}"><b>${t}</b><i>${s}</i><span class="cor">&#9829; ${cor}</span></div>`;

// ================= COMUNICAÇÃO 1: a chamada =================
const EQUIPE_COM = [["bezalel", "Bezalel Branding"], ["marcos", "Marcos Mensagem"], ["hirao", "Hirão Hotsite"], ["dorcas", "Dorcas Disparo"], ["filipe", "Filipe Farol"], ["tabita", "Tabita Tom"]];
function m1() {
  const eq = $("#m1-eq");
  EQUIPE_COM.forEach(([id, nome]) => eq.append(h(`<div><img src="assets/avatares/${id}.webp" alt=""><b>${nome}</b></div>`)));
  const grade = $("#m1-grade");
  const casas = AVISOS_FEED.slice(0, 9).map(([t, s], i) => { const c = h(`<div class="casa">${tile("av", t, s, 2)}</div>`); grade.append(c); return c; });
  const vira = (i, html) => gsap.timeline()
    .to(casas[i], { rotationY: 90, duration: .22, ease: "power2.in" })
    .add(() => { casas[i].innerHTML = html; })
    .to(casas[i], { rotationY: 0, duration: .32, ease: "back.out(2)" });
  const paraAvisos = () => casas.forEach((c, i) => { gsap.set(c, { rotationY: 0 }); c.innerHTML = tile("av", ...AVISOS_FEED[i], 2); });
  gsap.set(["#m1-k", "#m1-h", "#m1-f", "#m1-dica", "#m1-cel", ...eq.children], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#m1-k", foco, { ...nitido, duration: .6 })
    .fromTo("#m1-h", foco, { ...nitido, duration: 1 }, .2)
    .fromTo("#m1-cel", { autoAlpha: 0, y: 80, rotation: 4 }, { autoAlpha: 1, y: 0, rotation: -3, duration: 1, ease: "power3.out" }, .5)
    .fromTo(casas, { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .4, ease: "back.out(2)", stagger: .06 }, .9);
  // o mural vira feed: casa por casa, do aviso para o que edifica e conversa
  [4, 0, 2, 1, 6, 3, 8, 5, 7].forEach((i, k) => tl.add(() => vira(i, tile(...FEED_VIVO[i], 20 + (i * 17) % 60)), 2.4 + k * .22));
  tl.fromTo("#m1-f", { autoAlpha: 0, scale: .8, filter: "blur(10px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: .8, ease: "back.out(2)" }, 3.2)
    .fromTo(eq.children, { autoAlpha: 0, y: 30, scale: .7 }, { autoAlpha: 1, y: 0, scale: 1, duration: .6, ease: "back.out(1.8)", stagger: .08 }, 3.7)
    .to("#m1-dica", { autoAlpha: 1, duration: .6 }, 4.6);
  const vida = gsap.timeline({ paused: true })
    .to("#m1-cel", { y: -10, rotation: -2, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to("#m1-dica i", { y: 8, duration: .8, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  let dc = null;
  return { enter() { paraAvisos(); tl.restart(); dc = gsap.delayedCall(4.5, () => vida.restart()); }, leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); paraAvisos(); } };
}

// ================= COMUNICAÇÃO 2: hoje, o mural =================
function m2() {
  const grade = $("#m2-grade");
  AVISOS_FEED.concat(AVISOS_FEED).forEach(([t, s], i) => grade.append(h(tile("av", t, s, 1 + (i * 7) % 3))));
  const svg = $("#m2-cena");
  const viz = pessoa(svg, "#ffac13");
  const dedo = el("path", { d: "M0 0 v-60", stroke: "#ffac13", "stroke-width": 10, "stroke-linecap": "round", opacity: 0 }, svg);
  gsap.set(["#m2-tit", "#m2-sub", "#m2-perfil", "#m2-balao", "#m2-f"], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#m2-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#m2-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo("#m2-perfil", { autoAlpha: 0, x: -80 }, { autoAlpha: 1, x: 0, duration: .8, ease: "power3.out" }, .6)
    .fromTo(viz, { opacity: 0, x: 1180, y: 900, scale: 3.6 }, { opacity: 1, duration: .6 }, 1.2)
    // a vizinha rola o feed: aviso, aviso, aviso
    .to(grade, { y: -560, duration: 3.2, ease: "power1.inOut" }, 1.8)
    .to(viz, { attr: { stroke: "#8a8a8a" }, duration: 2.4 }, 2.2)
    .fromTo("#m2-balao", { autoAlpha: 0, scale: .6, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: .5, ease: "back.out(2.4)" }, 4.2)
    .to("#m2-balao", { autoAlpha: 0, duration: .4 }, 6.2)
    .to(viz, { x: 2050, opacity: 0, duration: 1.4, ease: "power1.in" }, 6.3)
    .fromTo("#m2-f", { autoAlpha: 0, y: 30, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, 6.6);
  const vida = gsap.to("#m2-perfil", { y: -8, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut", paused: true });
  let dc = null;
  return {
    enter() { gsap.set(grade, { y: 0 }); gsap.set(viz, { attr: { stroke: "#ffac13" } }); tl.restart(); dc = gsap.delayedCall(7.4, () => vida.restart()); },
    leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); },
  };
}

// ================= COMUNICAÇÃO 3: o feed que vive =================
const CONVERSAS = [
  ["Joana", "comentário", "Que palavra! Mandei para a minha mãe."],
  ["Paulo", "direct", "Moro aqui perto. Vocês recebem doações para quem perdeu tudo na chuva?"],
  ["Lídia Lar", "resposta", "Recebemos sim, Paulo! Sábado, das 9h às 12h, no salão. Quer que alguém da diaconia te procure?"],
  ["Bruna", "direct", "Nunca fui numa igreja. Posso ir de calça jeans?"],
  ["Lídia Lar", "resposta", "Pode, Bruna! Domingo às 10h. Vou pedir para alguém te esperar na porta."],
];
function m3() {
  const grade = $("#m3-grade"), svg = $("#m3-liga"), conv = $("#m3-conv");
  const casas = FEED_VIVO.map(() => { const c = h(`<div class="casa vazia"></div>`); grade.append(c); return c; });
  // quem faz cada publicação: o corte vem da Palavra, o resto da Comunicação
  const DONO = ["#m3-gid", "#m3-fil", "#m3-gid", "#m3-fil", "#m3-bez", "#m3-mar", "#m3-mar", "#m3-mar", "#m3-bez"];
  const AY = { "#m3-gid": 420, "#m3-mar": 600, "#m3-bez": 780, "#m3-fil": 960 };
  const ligas = ligacoes(svg, Object.values(AY).map(y => `M330 ${y} C520 ${y} 560 640 735 640`));
  const bolhas = CONVERSAS.map(([quem, onde, txt]) => h(`<div class="cv${quem === "Lídia Lar" ? " lid" : ""}"><small>${quem} &middot; ${onde}</small>${txt}</div>`));
  gsap.set(["#m3-tit", "#m3-sub", "#m3-cel", "#m3-leg", "#m3-lid", ...Object.keys(AY)], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#m3-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#m3-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo("#m3-cel", { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: .8, ease: "power3.out" }, .5);
  Object.keys(AY).forEach((a, k) => pop(tl, a, .8 + k * .12));
  ligas.forEach((l, k) => desenha(tl, l, 1.2 + k * .1, .6));
  // cada publicação sai do agente e pousa no feed
  [4, 0, 1, 2, 3, 5, 6, 7, 8].forEach((i, k) => {
    const at = 2 + k * .38, dono = DONO[i];
    tl.fromTo(dono + " img", { scale: 1 }, { scale: 1.15, duration: .15, yoyo: true, repeat: 1 }, at)
      .add(() => { casas[i].classList.remove("vazia"); casas[i].innerHTML = tile(...FEED_VIVO[i], 20 + (i * 17) % 60); }, at + .1)
      .fromTo(casas[i], { x: -420, y: AY[dono] - 640, scale: .4, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: .6, ease: "power3.out" }, at + .1);
  });
  tl.fromTo("#m3-leg", { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 5.6);
  pop(tl, "#m3-lid", 5.8);
  // e começam as conversas: de quem está dentro e de quem está fora
  bolhas.forEach((b, k) => tl.add(() => { conv.append(b); gsap.fromTo(b, { autoAlpha: 0, y: 30, scale: .9 }, { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: "back.out(2)" }); if (b.classList.contains("lid")) gsap.fromTo("#m3-lid img", { scale: 1 }, { scale: 1.15, duration: .2, yoyo: true, repeat: 1 }); }, 6 + k * .9));
  const pulsos = ligas.map((l, i) => pulso(svg, l, 1.6, i * .4));
  const vida = gsap.timeline({ paused: true }).to("#m3-cel", { y: -8, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  const limpa = () => { conv.innerHTML = ""; casas.forEach(c => { c.className = "casa vazia"; c.innerHTML = ""; gsap.set(c, { clearProps: "all" }); }); };
  let dc = null;
  return {
    enter() { limpa(); zeraLigas(ligas); tl.restart(); dc = gsap.delayedCall(5.5, () => { pulsos.forEach(p => p.restart(true)); vida.restart(); }); },
    leave() { dc && dc.kill(); tl.pause(0); pulsos.forEach(p => p.pause(0)); vida.pause(0); limpa(); },
  };
}

// ================= COMUNICAÇÃO 4: um projeto inteiro =================
const PAPO = [
  ["p", "Vamos pensar o congresso de jovens do ano que vem."],
  ["j", "Para quem é, quando, quantos jovens e o que eles devem levar para casa?"],
  ["p", "Jovens da cidade, uns 200. Que a vida inteira é de Cristo."],
  ["j", "Proponho o tema Inteiro, com Romanos 12.1. Aqui está o plano de 90 dias e o que cada time faz."],
];
const ONDAS = [["90 dias", "anúncio"], ["60 dias", "1º lote"], ["30 dias", "preletores"], ["7 dias", "últimas vagas"], ["o dia", "contagem"]];
function m4() {
  const papo = $("#m4-papo"), svg = $("#m4-liga");
  const falas = PAPO.map(([quem, t]) => { const f = h(`<div class="pp ${quem}"><small>${quem === "p" ? "O pastor" : "Josué Jornada"}</small>${t}</div>`); papo.append(f); return f; });
  $("#m4-arte-in").append(peca("Congresso de jovens", "Inteiro", "Romanos 12.1 · 14 a 16/11", 230, 288, { pa: "#ffd23f" }), peca("Inscrições", "Inteiro", "200 vagas", 130, 231, { pb: "#ff6b4a", pa: "#ffd23f", pt: "#1d2b53", fs: 11 }));
  $("#m4-pag-in").innerHTML = `<div class="pg-cab">${MARCA}<span>Esperança do Vale</span></div><div class="pg-corpo"><small>Congresso de jovens</small><b>Inteiro</b><span>14 a 16/11 &middot; R$ 120</span><u>Nome</u><u>Idade</u><u>WhatsApp</u><i>Pagar com Pix ou cartão</i></div>`;
  const linha = $("#m4-linha");
  const marcos = ONDAS.map(([d, o]) => { const m = h(`<div class="marco"><i></i><b>${d}</b><span>${o}</span></div>`); linha.append(m); return m; });
  const pvs = $$("#m4-pac .pv"), voln = $("#m4-voln");
  const [ida] = ligacoes(svg, ["M560 1105 C700 1105 680 470 735 470"]);
  gsap.set(["#m4-tit", "#m4-sub", "#m4-jos", "#m4-ok", "#m4-tab", ...falas, ...pvs, ...marcos], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#m4-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#m4-sub", foco, { ...nitido, duration: .7 }, .3);
  pop(tl, "#m4-jos", .6);
  falas.forEach((f, k) => tl.fromTo(f, { autoAlpha: 0, y: 24, scale: .92 }, { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: "back.out(2)" }, 1.1 + k * 1.05));
  tl.fromTo("#m4-ok", { autoAlpha: 0, scale: .5 }, { autoAlpha: 1, scale: 1, duration: .5, ease: "back.out(2.5)" }, 5.4);
  desenha(tl, ida, 5.8, .5);
  // o pacote se monta: cada parte com o seu dono
  pvs.forEach((p, k) => tl.fromTo(p, { autoAlpha: 0, y: 50, scale: .85, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: .6, ease: "back.out(1.6)" }, 6.2 + k * .35));
  tl.fromTo(marcos, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .35, ease: "back.out(2.5)", stagger: .18 }, 7.1)
    .fromTo(".onda-linha", { "--p": 0 }, { "--p": 1, duration: 1, ease: "power1.inOut" }, 7.1)
    .to({ n: 0 }, { n: 3, duration: 1.2, ease: "power2.out", onUpdate() { voln.textContent = Math.round(this.targets()[0].n); } }, 7.4)
    .fromTo("#m4-tab", { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: .5, ease: "power3.out" }, 8.4);
  const vida = gsap.timeline({ paused: true })
    .to(pvs, { y: -6, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .3 }, 0)
    .to("#m4-ok", { scale: 1.04, duration: .9, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  let dc = null;
  return {
    enter() { zeraLigas([ida]); voln.textContent = 0; tl.restart(); dc = gsap.delayedCall(9, () => vida.restart()); },
    leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); },
  };
}

// ================= COMUNICAÇÃO 5: gente chegando =================
const CHEGAM = [
  ["inscrição", "Rafa, 17 anos", "vem com dois amigos da escola"],
  ["direct", "Paulo", "Vi o post da chuva. Como eu ajudo?"],
  ["inscrição", "Lívia, 19 anos", "primeira vez num congresso"],
  ["comentário", "Dona Marta", "Que bom ver a igreja falando com o bairro."],
  ["direct", "Bruna", "Posso visitar no domingo?"],
  ["inscrição", "Caio, 16 anos", "o pai pagou no Pix"],
];
function m5() {
  const box = $("#m5-chegam"), nB = $("#m5-n"), barra = $("#m5-barra");
  const itens = CHEGAM.map(([tipo, quem, t]) => { const c = h(`<div class="ch"><span class="tipo">${tipo}</span><b>${quem}</b><p>${t}</p></div>`); box.append(c); return c; });
  const lema = $$("#m5-lema p"), btns = $$("#m5-fecho .cta");
  gsap.set(["#m5-tit", "#m5-inscr", ...itens, ...lema, ...btns], { autoAlpha: 0 });
  const conta = { n: 0 };
  const tl = gsap.timeline({ paused: true })
    .fromTo("#m5-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#m5-inscr", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .7, ease: "power3.out" }, .4)
    .fromTo(conta, { n: 0 }, { n: 187, duration: 4.2, ease: "power2.out", onUpdate() { nB.textContent = Math.round(conta.n); barra.style.width = (conta.n / 200 * 100) + "%"; } }, .9)
    .fromTo(itens, { autoAlpha: 0, x: -50, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .5, ease: "power3.out", stagger: .55 }, 1.2);
  lema.forEach((p, i) => tl.fromTo(p, { autoAlpha: 0, x: -40, filter: "blur(10px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, 4.6 + i * .8));
  tl.fromTo(btns, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .5, ease: "back.out(2)", stagger: .12 }, 7.2);
  const vida = gsap.to(itens, { y: -5, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .25, paused: true });
  let dc = null;
  return { enter() { nB.textContent = 0; barra.style.width = "0%"; tl.restart(); dc = gsap.delayedCall(7.5, () => vida.restart()); }, leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); } };
}

// ================= CUIDADO 1: a chamada =================
const EQUIPE_CUIDADO = [["lidia", "Lídia Lar"], ["isabel", "Isabel Integra"], ["epafras", "Epafras Escuta"]];
// uma pessoa desenhada na origem, para mover com x, y e scale
const pessoa = (svg, cor = "#777") => {
  const g = el("g", { stroke: cor, "stroke-width": 4, opacity: 0 }, svg);
  el("circle", { cx: 0, cy: -60, r: 18, fill: "#2a2a2a" }, g);
  el("path", { d: "M-30 0 C-30 -28 -16 -38 0 -38 C16 -38 30 -28 30 0 Z", fill: "#262626" }, g);
  return g;
};
function c1() {
  const eq = $("#c1-eq");
  EQUIPE_CUIDADO.forEach(([id, nome]) => eq.append(h(`<div><img src="assets/avatares/${id}.webp" alt=""><b>${nome}</b></div>`)));
  const svg = $("#c1-cena");
  // a porta da igreja, aberta e acesa
  const luz = el("path", { d: "M1400 900 V640 A110 110 0 0 1 1620 640 V900 Z", fill: "#3a2a12", opacity: 0 }, svg);
  const [porta] = ligacoes(svg, ["M1380 900 V640 A130 130 0 0 1 1640 640 V900"]);
  porta.setAttribute("style", porta.getAttribute("style") + ";fill:none;stroke:#ffac13;stroke-width:7;stroke-linejoin:round");
  const [chao] = ligacoes(svg, ["M1150 900 H1880"]);
  chao.setAttribute("style", chao.getAttribute("style") + ";stroke:#4a4a4a;stroke-width:4");
  const halo = el("circle", { cx: 1510, cy: 720, r: 220, fill: "none", stroke: "#ffac13", "stroke-width": 3, opacity: 0 }, svg);
  const defs = el("defs", {}, svg), cp = el("clipPath", { id: "c1-lid" }, defs); el("circle", { cx: 1510, cy: 430, r: 50 }, cp);
  const lid = el("g", { opacity: 0 }, svg);
  el("image", { href: "assets/avatares/lidia.webp", x: 1460, y: 380, width: 100, height: 100, "clip-path": "url(#c1-lid)" }, lid);
  el("circle", { cx: 1510, cy: 430, r: 50, fill: "none", stroke: "#ffac13", "stroke-width": 4 }, lid);
  // gente que chega de longe e entra pela porta; ao chegar, ganha a cor da casa
  const gente = gsap.timeline({ paused: true });
  for (let i = 0; i < 9; i++) {
    const p = pessoa(svg), x0 = i % 2 ? 1150 + rnd() * 200 : 1700 + rnd() * 180;
    gente.fromTo(p, { x: x0, y: 1150, scale: 1.1 }, { x: 1510, y: 890, scale: .55, duration: 4.2, ease: "power1.in", repeat: -1, repeatDelay: 1.2, keyframes: { opacity: [0, 1, 1, 1, 0] } }, i * .6)
      .fromTo(p, { attr: { stroke: "#777" } }, { attr: { stroke: "#ffac13" }, duration: 1, repeat: -1, repeatDelay: 4.4 }, i * .6 + 3);
  }
  gsap.set(["#c1-k", "#c1-h", "#c1-f", "#c1-dica", ...eq.children], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#c1-k", foco, { ...nitido, duration: .6 })
    .fromTo("#c1-h", foco, { ...nitido, duration: 1 }, .2)
    .add(() => { zeraLigas([porta, chao]); }, 0);
  desenha(tl, chao, .6, .8); desenha(tl, porta, .9, 1.2);
  tl.to(luz, { opacity: 1, duration: 1 }, 1.8)
    .fromTo(lid, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .7, ease: "back.out(1.8)" }, 2)
    .add(() => gente.play(0), 2.2)
    .fromTo("#c1-f", { autoAlpha: 0, scale: .8, filter: "blur(10px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: .8, ease: "back.out(2)" }, 2.6)
    .fromTo(eq.children, { autoAlpha: 0, y: 30, scale: .7 }, { autoAlpha: 1, y: 0, scale: 1, duration: .6, ease: "back.out(1.8)", stagger: .1 }, 3.1)
    .to("#c1-dica", { autoAlpha: 1, duration: .6 }, 4.2);
  const vida = gsap.timeline({ paused: true })
    .fromTo(halo, { attr: { r: 160, opacity: .6 } }, { attr: { r: 300, opacity: 0 }, duration: 2.6, repeat: -1, ease: "power1.out" }, 0)
    .to(luz, { opacity: .7, duration: 1.5, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to(lid, { y: -8, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to("#c1-dica i", { y: 8, duration: .8, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  let dc = null;
  return {
    enter() { tl.restart(); dc = gsap.delayedCall(2, () => vida.restart()); },
    leave() { dc && dc.kill(); tl.pause(0); gente.pause(0); vida.pause(0); gsap.set(luz, { opacity: 0 }); },
  };
}

// ================= CUIDADO 2: como é hoje =================
function c2() {
  const svg = $("#c2-cena");
  // o cartão do visitante
  const cartao = el("g", { opacity: 0 }, svg);
  el("rect", { x: 220, y: 420, width: 300, height: 360, rx: 14, fill: "#f4efe6" }, cartao);
  el("rect", { x: 220, y: 420, width: 300, height: 16, rx: 6, fill: "#fe7003" }, cartao);
  const tt = el("text", { x: 248, y: 486, fill: "#2a2a2a", "font-size": 26, "font-weight": 800 }, cartao); tt.textContent = "Cartão do visitante";
  ["Nome", "Telefone", "Bairro", "Como conheceu"].forEach((r, i) => {
    const t = el("text", { x: 248, y: 540 + i * 62, fill: "#8a8172", "font-size": 17, "font-weight": 700 }, cartao); t.textContent = r;
    el("rect", { x: 248, y: 556 + i * 62, width: 244, height: 3, fill: "#c9c2b6" }, cartao);
  });
  // a letra de quem preenche
  const letra = [0, 1, 2, 3].map(i => {
    let d = `M252 ${550 + i * 62}`;
    for (let j = 0; j < 7 + (i % 2) * 3; j++) d += ` q8 -14 14 0 t14 0`;
    return el("path", { d, fill: "none", stroke: "#2c4470", "stroke-width": 3, "stroke-linecap": "round", opacity: 0 }, cartao);
  });
  letra.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.L = L; });
  // a caixa de cartões, já com a semana passada dentro
  const caixa = el("g", { opacity: 0 }, svg);
  const velhos = [0, 1, 2, 3].map(i => el("rect", { x: 760 + i * 16, y: 700 - i * 6, width: 260, height: 120, rx: 8, fill: "#d9d2c4", stroke: "#b8b0a0", "stroke-width": 2, transform: `rotate(${(i - 1.5) * 4} ${890 + i * 16} 760)` }, caixa));
  el("path", { d: "M720 760 H1100 L1080 960 H740 Z", fill: "#2e2e2e", stroke: "#666", "stroke-width": 4, "stroke-linejoin": "round" }, caixa);
  const tc = el("text", { x: 910, y: 880, "text-anchor": "middle", fill: "#9a9a9a", "font-size": 24, "font-weight": 700 }, caixa); tc.textContent = "Cartões de visitante";
  // a semana que passa sem contato
  const DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb"];
  const dias = DIAS.map((d, i) => {
    const g = el("g", { opacity: 0 }, svg), x = 1220 + i * 104;
    const r = el("rect", { x, y: 420, width: 88, height: 88, rx: 16, fill: "#262626", stroke: "#444", "stroke-width": 3 }, g);
    const t = el("text", { x: x + 44, y: 474, "text-anchor": "middle", fill: "#b9b9b9", "font-size": 24, "font-weight": 800 }, g); t.textContent = d;
    const xis = el("path", { d: `M${x + 30} 540 l28 28 M${x + 58} 540 l-28 28`, stroke: "#6a6a6a", "stroke-width": 5, "stroke-linecap": "round", opacity: 0 }, g);
    return { g, r, xis };
  });
  const semMsg = el("text", { x: 1532, y: 640, "text-anchor": "middle", fill: "#8a8a8a", "font-size": 28, "font-weight": 700, opacity: 0 }, svg); semMsg.textContent = "nenhuma mensagem";
  // a visitante, que esfria e vai embora
  const vis = pessoa(svg, "#ffac13");
  gsap.set(vis, { x: 1540, y: 900, scale: 1.6 });
  gsap.set(["#c2-tit", "#c2-sub", "#c2-f"], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#c2-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#c2-sub", foco, { ...nitido, duration: .8 }, .3)
    .fromTo(cartao, { opacity: 0, y: 40, svgOrigin: "370 600" }, { opacity: 1, y: 0, duration: .7, ease: "back.out(1.6)" }, .7)
    .to(vis, { opacity: 1, duration: .6 }, .9)
    .to(caixa, { opacity: 1, duration: .6 }, 1.1);
  letra.forEach((p, i) => tl.set(p, { opacity: 1 }, 1.3 + i * .35).to(p, { strokeDashoffset: 0, duration: .35, ease: "none" }, 1.3 + i * .35));
  // o cartão vai para a caixa e some entre os outros
  tl.to(cartao, { x: 560, y: 260, scale: .55, rotation: 8, svgOrigin: "370 600", duration: .9, ease: "power2.inOut" }, 3)
    .to(cartao, { opacity: 0, duration: .3 }, 3.75)
    .fromTo(velhos, { y: 0 }, { y: -10, duration: .12, yoyo: true, repeat: 1, stagger: .03 }, 3.8);
  dias.forEach(({ g, r, xis }, i) => {
    const at = 4.2 + i * .45;
    tl.fromTo(g, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .3, ease: "back.out(2)" }, at)
      .to(r, { attr: { stroke: "#ffac13" }, duration: .15 }, at)
      .to(r, { attr: { stroke: "#444" }, duration: .3 }, at + .3)
      .to(xis, { opacity: 1, duration: .2 }, at + .25)
      .to(vis, { attr: { stroke: gsap.utils.interpolate("#ffac13", "#4a4a4a", (i + 1) / 6) }, duration: .4 }, at + .2);
  });
  tl.to(semMsg, { opacity: 1, duration: .5 }, 5.6)
    .to(vis, { x: 1980, opacity: 0, duration: 1.6, ease: "power1.in" }, 7.2)
    .fromTo("#c2-f", { autoAlpha: 0, y: 30, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, 7.4);
  const vida = gsap.timeline({ paused: true, repeat: -1 });
  velhos.forEach((v, i) => vida.to(v, { y: -5, duration: 1.4, yoyo: true, repeat: 1, ease: "sine.inOut" }, i * .3));
  vida.to(semMsg, { opacity: .45, duration: 1.2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0);
  let dc = null;
  return {
    enter() { gsap.set(vis, { x: 1540, opacity: 0, attr: { stroke: "#ffac13" } }); tl.restart(); dc = gsap.delayedCall(8.4, () => vida.restart()); },
    leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); },
  };
}

// ================= CUIDADO 3: do primeiro oi ao grupo =================
const IC = {
  cel: `<svg viewBox="0 0 52 52"><rect x="15" y="4" width="22" height="44" rx="5"/><path d="M22 41 H30"/><path d="M20 15 H32 M20 22 H28"/></svg>`,
  igreja: `<svg viewBox="0 0 52 52"><path d="M8 48 V26 L26 12 L44 26 V48 Z"/><path d="M26 12 V3 M21 7 H31"/><path d="M21 48 V36 A5 5 0 0 1 31 36 V48"/></svg>`,
  msg: `<svg viewBox="0 0 52 52"><path d="M6 10 H46 V36 H22 L12 45 V36 H6 Z"/><path d="M18 23 C18 19 23 18 26 22 C29 18 34 19 34 23 C34 28 26 31 26 31 C26 31 18 28 18 23 Z"/></svg>`,
  relogio: `<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="21" stroke="#444"/><circle class="arco" cx="26" cy="26" r="21" transform="rotate(-90 26 26)"/><text x="26" y="31" text-anchor="middle">0h</text></svg>`,
  grupo: `<svg viewBox="0 0 52 52"><circle cx="26" cy="16" r="6"/><circle cx="11" cy="24" r="5"/><circle cx="41" cy="24" r="5"/><path d="M14 46 C14 34 19 28 26 28 C33 28 38 34 38 46"/><path d="M2 44 C2 37 5 33 11 33 M50 44 C50 37 47 33 41 33"/></svg>`,
};
const ETAPAS = [
  [270, "Sábado, 22h", "Pergunta o horário pelo link da bio", "cel"],
  [610, "Domingo, 10h", "Visita o culto, e a recepção já sabe o nome dela", "igreja"],
  [950, "Segunda", "Recebe as boas-vindas da igreja", "msg"],
  [1290, "Em até 36 horas", "O líder do grupo liga para ela", "relogio"],
  [1630, "Quinta, 20h", "Chega ao grupo da casa", "grupo"],
];
function c3() {
  const svg = $("#c3-liga"), box = $("#c3-etapas"), Y = 640;
  let d = `M140 ${Y} L${ETAPAS[0][0]} ${Y}`;
  ETAPAS.slice(1).forEach(([x], i) => { const x0 = ETAPAS[i][0]; d += ` Q${(x0 + x) / 2} ${Y + (i % 2 ? 46 : -46)} ${x} ${Y}`; });
  d += ` L1790 ${Y}`;
  const [trilho] = ligacoes(svg, [d]);
  const L = +trilho.dataset.L;
  // onde, no comprimento do trilho, fica cada parada (o x só cresce, então basta uma busca binária)
  const naX = x => { let a = 0, b = L; for (let k = 0; k < 30; k++) { const m = (a + b) / 2; trilho.getPointAtLength(m).x < x ? a = m : b = m; } return a; };
  const paradas = ETAPAS.map(([x]) => naX(x));
  const nos = ETAPAS.map(([x]) => el("circle", { cx: x, cy: Y, r: 14, fill: "#262626", stroke: "#555", "stroke-width": 4, opacity: 0 }, svg));
  const ligaAg = ligacoes(svg, ["M270 540 V620", "M1120 540 C1120 590 950 580 950 620", "M1120 540 C1120 590 1290 580 1290 620"]);
  const etapas = ETAPAS.map(([x, quando, oque, ic]) => {
    const e = h(`<div class="etapa" style="left:${x}px"><span class="ic">${IC[ic]}</span><small>${quando}</small><b>${oque}</b></div>`);
    box.append(e); return e;
  });
  const arco = $(".arco", etapas[3]), horas = $("text", etapas[3]), C = 2 * Math.PI * 21;
  arco.style.strokeDasharray = C;
  // a visitante que anda pelo trilho
  const vis = el("g", { opacity: 0 }, svg);
  el("circle", { r: 26, fill: "#ffac13" }, vis);
  const ini = el("text", { y: 9, "text-anchor": "middle", fill: "#1a1a1a", "font-size": 26, "font-weight": 800 }, vis); ini.textContent = "C";
  const nome = el("text", { y: -40, "text-anchor": "middle", fill: "#f2f2f2", "font-size": 22, "font-weight": 800 }, vis); nome.textContent = "Carla";
  const pos = { l: paradas[0] };
  const poe = () => { const q = trilho.getPointAtLength(pos.l); vis.setAttribute("transform", `translate(${q.x} ${q.y})`); };
  gsap.set(["#c3-tit", "#c3-sub", "#c3-lid", "#c3-isa", "#c3-f", ...etapas], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#c3-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#c3-sub", foco, { ...nitido, duration: .7 }, .3);
  desenha(tl, trilho, .6, 1.2);
  tl.to(nos, { opacity: 1, duration: .3, stagger: .12 }, 1.2);
  pop(tl, "#c3-lid", 1.4); pop(tl, "#c3-isa", 1.6);
  ligaAg.forEach((p, i) => desenha(tl, p, 1.8 + i * .1, .4));
  tl.add(() => { pos.l = paradas[0]; poe(); }, 2.2).to(vis, { opacity: 1, duration: .4 }, 2.2);
  const chega = (i, at) => {
    tl.to(nos[i], { attr: { fill: "#3a2a12", stroke: "#ffac13", r: 18 }, duration: .3 }, at)
      .fromTo(etapas[i], { autoAlpha: 0, y: 40, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .55, ease: "back.out(1.6)" }, at);
  };
  chega(0, 2.3);
  tl.fromTo("#c3-lid img", { scale: 1 }, { scale: 1.15, duration: .2, yoyo: true, repeat: 1 }, 2.4);
  let at = 3.2;
  for (let i = 1; i < ETAPAS.length; i++) {
    tl.to(pos, { l: paradas[i], duration: .9, ease: "power2.inOut", onUpdate: poe }, at);
    chega(i, at + .8);
    if (i === 2 || i === 3) tl.fromTo("#c3-isa img", { scale: 1 }, { scale: 1.15, duration: .2, yoyo: true, repeat: 1 }, at + .8);
    if (i === 3) {
      // o relógio das 36 horas: o líder liga antes de acabar
      const o = { h: 0 };
      tl.to(o, { h: 20, duration: 1.2, ease: "power1.inOut", onUpdate: () => { horas.textContent = Math.round(o.h) + "h"; arco.style.strokeDashoffset = C * (1 - o.h / 36); } }, at + 1)
        .add(() => { horas.textContent = "✓"; }, at + 2.3);
      at += 1.6;
    }
    at += 1.5;
  }
  tl.fromTo("#c3-f", { autoAlpha: 0, y: 30, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, at);
  const corre = pulso(svg, trilho, 4);
  const vida = gsap.timeline({ paused: true })
    .to($$("#c3-lid img, #c3-isa img"), { y: -6, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .4 }, 0);
  let dc = null;
  return {
    enter() {
      zeraLigas([trilho, ...ligaAg]); horas.textContent = "0h"; arco.style.strokeDashoffset = C; gsap.set(vis, { opacity: 0 });
      gsap.set(nos, { attr: { fill: "#262626", stroke: "#555", r: 14 } });
      tl.restart(); dc = gsap.delayedCall(at + 1, () => { corre.restart(true); vida.restart(); });
    },
    leave() { dc && dc.kill(); tl.pause(0); corre.pause(0); vida.pause(0); },
  };
}

// ================= CUIDADO 4: o boletim da noite =================
const GRUPOS = [
  ["Grupo de quinta", "#25d366", ["Quinta tem estudo normal?", "A irmã Marta foi internada hoje cedo", "Vamos orar por ela"]],
  ["Mulheres", "#e1306c", ["O avô da Sônia faleceu", "O velório é amanhã às 9h", "Quem pode levar um lanche?"]],
  ["Louvor", "#ffac13", ["Domingo o Léo não pode tocar", "Alguém conhece um baixista?", "Ensaio sábado às 16h"]],
  ["Casais", "#25f4ee", ["Pedro e Ana vão ser pais!", "Que alegria, glória a Deus", "Jantar dos casais dia 30"]],
  ["Jovens", "#a78bfa", ["Quem vai no acampamento?", "Inscrição até sexta", "Culto de sábado às 19h30"]],
  ["Diaconia", "#ff5a3c", ["Cestas montadas para sábado", "Faltam duas famílias para visitar", "Obrigado, irmãos"]],
];
const BOLETIM = [
  ["acao", "Pede sua ação", "A irmã Marta foi internada", "grupo de quinta"],
  ["acao", "Pede sua ação", "Luto na família da Sônia", "grupo das mulheres"],
  ["lider", "Ver com o líder", "Louvor sem baixista no domingo", "grupo do louvor"],
  ["grat", "Motivo de gratidão", "Pedro e Ana esperam o primeiro filho", "grupo de casais"],
];
function c4() {
  const box = $("#c4-grupos"), svg = $("#c4-liga"), avisos = $("#c4-avisos"), contaB = $("#c4-conta b"), hora = $("#c4-hora");
  const cy = i => 350 + i * 108 + 48;
  const tiles = GRUPOS.map(([nome, cor, msgs], i) => {
    const t = h(`<div class="grupo" style="top:${cy(i) - 48}px"><span class="ini" style="background:${cor}">${nome[0]}</span><div><b>${nome}</b><span>${msgs[0]}</span></div><em>0</em></div>`);
    box.append(t); return t;
  });
  const ligas = ligacoes(svg, GRUPOS.map((_, i) => `M630 ${cy(i)} C760 ${cy(i)} 760 640 885 640`));
  const [saida] = ligacoes(svg, ["M1035 640 H1375"]);
  const notas = BOLETIM.map(([tipo, rot, oque, de]) => h(`<div class="aviso ${tipo}"><small>${rot}</small><b>${oque}</b><span>${de}</span></div>`));
  const conta = GRUPOS.map(() => 0);
  let total = 0;
  // as mensagens correm nos grupos o dia inteiro; o Epafras só lê
  const fluxo = gsap.timeline({ paused: true, repeat: -1 });
  for (let k = 0; k < 18; k++) {
    const i = (k * 5) % GRUPOS.length, at = k * .38, t = tiles[i];
    fluxo.add(() => {
      const [, , msgs] = GRUPOS[i];
      conta[i]++; total += 4 + (k % 5);
      $("span", $("div", t)).textContent = msgs[conta[i] % msgs.length];
      $("em", t).textContent = conta[i]; contaB.textContent = total;
      gsap.fromTo(t, { borderColor: "#25d366" }, { borderColor: "#ffffff1c", duration: .8 });
      gsap.fromTo($("em", t), { scale: 1.4 }, { scale: 1, duration: .4, ease: "back.out(3)" });
    }, at);
  }
  const pulsos = ligas.map((l, i) => pulso(svg, l, 1.3, i * .25));
  gsap.set(["#c4-tit", "#c4-sub", "#c4-epa", "#c4-cel", "#c4-conta", hora, ...tiles], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#c4-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#c4-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo(tiles, { autoAlpha: 0, x: -80, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .55, ease: "power3.out", stagger: .09 }, .5)
    .fromTo("#c4-cel", { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: .8, ease: "power3.out" }, .8)
    .to(["#c4-conta", hora], { autoAlpha: 1, duration: .4 }, 1.2);
  pop(tl, "#c4-epa", 1);
  ligas.forEach((l, i) => desenha(tl, l, 1.2 + i * .08, .6));
  tl.add(() => { fluxo.play(0); pulsos.forEach(p => p.restart(true)); }, 1.8);
  // o relógio anda até as 22h
  const o = { m: 18 * 60 };
  tl.to(o, { m: 22 * 60, duration: 4.5, ease: "none", onUpdate: () => { const m = Math.round(o.m / 5) * 5; hora.textContent = `${Math.floor(m / 60)}:${pad(m % 60)}`; } }, 1.8)
    .fromTo(hora, { scale: 1 }, { scale: 1.25, duration: .25, yoyo: true, repeat: 1 }, 6.3)
    .fromTo("#c4-epa img", { scale: 1 }, { scale: 1.15, duration: .2, yoyo: true, repeat: 3, ease: "sine.inOut" }, 6.4);
  desenha(tl, saida, 6.6, .5);
  notas.forEach((n, i) => tl.add(() => { avisos.append(n); gsap.fromTo(n, { autoAlpha: 0, y: -30, scale: .9 }, { autoAlpha: 1, y: 0, scale: 1, duration: .5, ease: "back.out(1.8)" }); }, 7.1 + i * .55));
  const vida = gsap.to("#c4-epa img", { y: -7, duration: 1.9, yoyo: true, repeat: -1, ease: "sine.inOut", paused: true });
  return {
    enter() { conta.fill(0); total = 0; contaB.textContent = 0; hora.textContent = "18:00"; avisos.innerHTML = ""; tiles.forEach((t, i) => { $("em", t).textContent = 0; $("span", $("div", t)).textContent = GRUPOS[i][2][0]; }); zeraLigas([...ligas, saida]); tl.restart(); vida.play(); },
    leave() { tl.pause(0); fluxo.pause(0); pulsos.forEach(p => p.pause(0)); vida.pause(0); avisos.innerHTML = ""; },
  };
}

// ================= CUIDADO 5: ninguém esquecido =================
const IC_AG = {
  hospital: `<svg viewBox="0 0 54 54"><rect x="6" y="6" width="42" height="42" rx="10"/><path d="M27 16 V38 M16 27 H38"/></svg>`,
  luto: `<svg viewBox="0 0 54 54"><rect x="20" y="22" width="14" height="26" rx="3"/><path d="M27 22 V16"/><path d="M27 4 C33 11 33 15 27 16 C21 15 21 11 27 4 Z"/></svg>`,
  bolo: `<svg viewBox="0 0 54 54"><rect x="8" y="26" width="38" height="22" rx="4"/><path d="M8 34 C14 38 20 30 27 34 C34 38 40 30 46 34"/><path d="M19 26 V18 M27 26 V16 M35 26 V18"/></svg>`,
  oracao: `<svg viewBox="0 0 54 54"><path d="M27 46 C27 46 8 34 8 20 C8 12 18 8 27 17 C36 8 46 12 46 20 C46 34 27 46 27 46 Z"/></svg>`,
  cafe: `<svg viewBox="0 0 54 54"><path d="M8 20 H38 V34 A12 12 0 0 1 26 46 H20 A12 12 0 0 1 8 34 Z"/><path d="M38 24 H42 A6 6 0 0 1 42 36 H38"/><path d="M18 6 C15 10 21 12 18 16 M28 6 C25 10 31 12 28 16"/></svg>`,
};
const SEMANA_PASTOR = [
  ["seg", "hospital", "Visitar a irmã Marta no hospital", "do boletim da noite"],
  ["ter", "luto", "Ligar para a família da Sônia", "luto na família"],
  ["qua", "bolo", "Os 80 anos da Dona Cida", "aniversário"],
  ["qui", "oracao", "Orar com o Marcos pelo emprego", "pedido de oração"],
  ["sex", "cafe", "Café com a Carla, que visitou domingo", "da Isabel Integra"],
];
function c5() {
  const ag = $("#c5-agenda");
  const linhas = SEMANA_PASTOR.map(([dia, ic, oque, de]) => { const l = h(`<div class="compromisso"><span class="dia-c">${dia}</span>${IC_AG[ic]}<div><b>${oque}</b><span>${de}</span></div></div>`); ag.append(l); return l; });
  const lema = $$("#c5-lema p"), btns = $$("#c5-fecho .cta");
  gsap.set(["#c5-tit", "#c5-sub", "#c5-epa", ...linhas, ...lema, ...btns], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#c5-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#c5-sub", foco, { ...nitido, duration: .7 }, .3);
  pop(tl, "#c5-epa", .6);
  // cada pedido sai do Epafras e pousa na semana do pastor
  linhas.forEach((l, i) => {
    const at = 1.3 + i * .6;
    tl.fromTo("#c5-epa img", { scale: 1 }, { scale: 1.12, duration: .15, yoyo: true, repeat: 1 }, at)
      .fromTo(l, { autoAlpha: 0, x: 900, y: 100 - i * 130, scale: .3, filter: "blur(8px)" }, { autoAlpha: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", duration: .8, ease: "power3.out" }, at + .1)
      .fromTo($(".dia-c", l), { scale: 1.5 }, { scale: 1, duration: .4, ease: "back.out(3)" }, at + .8);
  });
  lema.forEach((p, i) => tl.fromTo(p, { autoAlpha: 0, x: -40, filter: "blur(10px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, 4.8 + i * .7));
  tl.fromTo(btns, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .5, ease: "back.out(2)", stagger: .12 }, 6.4);
  const vida = gsap.timeline({ paused: true })
    .to("#c5-epa img", { y: -7, duration: 1.9, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to($$(".dia-c", ag), { scale: 1.08, duration: .9, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .3 }, 1);
  let dc = null;
  return { enter() { tl.restart(); dc = gsap.delayedCall(7, () => vida.restart()); }, leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); } };
}

// ================= GOVERNO 1: a chamada =================
const EQUIPE_GOVERNO = [["tercio", "Tércio Tinta"], ["febe", "Febe Folhinha"]];
// os lembretes que hoje moram na cabeça do pastor, onde caem bagunçados, e o agente que fica com cada um
const LEMBRETES = [
  ["Cobrar o orçamento do salão", 0, 150, 430], ["Quem usa o salão no sábado?", 1, 590, 470], ["Passar a limpo a ata de setembro", 0, 1030, 420],
  ["Data do retiro dos jovens", 1, 1470, 460], ["Marcar a data do batismo", 1, 240, 700], ["Quatro membros novos no rol", 0, 690, 750],
  ["Montar o relatório do ano", 0, 1130, 690],
]
const COL_G1 = [640, 1280];
function g1() {
  const box = $("#g1-bil");
  const donos = EQUIPE_GOVERNO.map(([id, nome], i) => {
    const d = h(`<div class="assina g-dono" style="left:${COL_G1[i]}px;top:470px"><img src="assets/avatares/${id}.webp" alt=""><b>${nome}</b></div>`);
    box.append(d); return d;
  });
  // onde cada lembrete pousa na coluna do seu dono
  const fila = [0, 0, 0, 0];
  const bils = LEMBRETES.map(([txt, dono, x, y]) => {
    const b = h(`<div class="g-bil"><i>✓</i>${txt}</div>`);
    box.append(b);
    b.dataset.x = x; b.dataset.y = y; b.dataset.r = (rnd() - .5) * 10;
    b.dataset.cx = COL_G1[dono] - 180; b.dataset.cy = 575 + fila[dono]++ * 112;
    return b;
  });
  const checks = bils.map(b => $("i", b));
  gsap.set(["#g1-k", "#g1-h", "#g1-rot", "#g1-f", "#g1-dica", ...donos, ...bils, ...checks], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#g1-k", foco, { ...nitido, duration: .6 })
    .fromTo("#g1-h", foco, { ...nitido, duration: 1 }, .2)
    .fromTo("#g1-rot", foco, { ...nitido, duration: .5 }, .8);
  // a semana cai em lembretes soltos, devagar o bastante para ler
  bils.forEach((b, i) => tl.fromTo(b, { autoAlpha: 0, x: +b.dataset.x, y: +b.dataset.y - 120, rotation: 0, scale: .7 },
    { autoAlpha: 1, x: +b.dataset.x, y: +b.dataset.y, rotation: +b.dataset.r, scale: 1, duration: .5, ease: "back.out(1.6)" }, 1.1 + i * .4));
  // chegam os quatro donos, e cada lembrete vai para a coluna do seu, sem sumir
  tl.to("#g1-rot", { autoAlpha: 0, duration: .4 }, 5.2);
  donos.forEach((d, i) => pop(tl, d, 5.4 + i * .12));
  bils.forEach((b, i) => {
    const at = 6.1 + i * .22, dono = LEMBRETES[i][1];
    tl.to(b, { x: +b.dataset.cx, y: +b.dataset.cy, rotation: 0, duration: .8, ease: "power3.inOut" }, at)
      .to(b, { borderColor: "#ffac13", backgroundColor: "#2e2616", color: "#f2f2f2", duration: .3 }, at + .7)
      .fromTo(checks[i], { autoAlpha: 0, scale: 2 }, { autoAlpha: 1, scale: 1, duration: .35, ease: "back.out(3)" }, at + .75)
      .fromTo($("img", donos[dono]), { scale: 1 }, { scale: 1.15, duration: .15, yoyo: true, repeat: 1 }, at + .7);
  });
  tl.fromTo("#g1-f", { autoAlpha: 0, y: 30, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, 8.4)
    .to("#g1-dica", { autoAlpha: 1, duration: .6 }, 9.2);
  // enquanto o pastor lê, os lembretes tremem de leve; depois de organizados, quem respira são os donos
  const treme = gsap.timeline({ paused: true });
  bils.forEach((b, i) => treme.to(b, { rotation: `+=${i % 2 ? 2 : -2}`, duration: .9, yoyo: true, repeat: 3, ease: "sine.inOut" }, i * .15));
  tl.add(() => treme.restart(), 4.4).add(() => treme.pause(), 6);
  const vida = gsap.timeline({ paused: true })
    .to($$(".g-dono img", box), { y: -7, duration: 1.9, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .3 }, 0)
    .to("#g1-dica i", { y: 8, duration: .8, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  let dc = null;
  return {
    enter() { gsap.set(bils, { borderColor: "#00000000", backgroundColor: "#f4efe6", color: "#2a2a2a" }); tl.restart(); dc = gsap.delayedCall(9.4, () => vida.restart()); },
    leave() { dc && dc.kill(); tl.pause(0); treme.pause(0); vida.pause(0); },
  };
}

// ================= GOVERNO 2: como é hoje =================
const PAUTAS = [
  ["Março", ["Reforma do salão social", "Calendário do semestre", "Recepção de membros", "Compra de cadeiras"]],
  ["Junho", ["Culto de fim de ano", "Reforma do salão social", "Relatório das mulheres", "Retiro dos casais"]],
  ["Setembro", ["Congresso de jovens", "Rol de membros", "Reforma do salão social", "Orçamento de 2027"]],
];
function g2() {
  const box = $("#g2-pautas");
  const folhas = PAUTAS.map(([mes, itens], i) => {
    const f = h(`<div class="papel-avisos g-pauta" style="left:${130 + i * 570}px;top:${400 + i * 20}px;transform:rotate(${(i - 1) * 2}deg)"><b>Pauta de ${mes.toLowerCase()}</b><ol>${itens.map(t => `<li${t.startsWith("Reforma") ? ' class="volta"' : ""}><i>•</i>${t}</li>`).join("")}</ol></div>`);
    box.append(f); return f;
  });
  const voltas = $$(".volta", box);
  const selos = voltas.map((v, i) => { const s = h(`<em class="g-selo">${i ? "de novo" : "decidido"}</em>`); v.append(s); return s; });
  gsap.set(["#g2-tit", "#g2-sub", "#g2-f", "#g2-bolha", "#g2-sem", ...folhas, ...selos], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#g2-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#g2-sub", foco, { ...nitido, duration: .8 }, .3);
  folhas.forEach((f, i) => {
    const at = .9 + i * 1.3;
    tl.fromTo(f, { autoAlpha: 0, y: 80, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .7, ease: "power3.out" }, at)
      .fromTo(voltas[i], { backgroundColor: "#ffac1300" }, { backgroundColor: "#ffac1366", duration: .3 }, at + .7)
      .fromTo(selos[i], { autoAlpha: 0, scale: 1.8 }, { autoAlpha: 1, scale: 1, duration: .4, ease: "back.out(3)" }, at + .8);
  });
  tl.fromTo("#g2-bolha", { autoAlpha: 0, y: 40, scale: .9 }, { autoAlpha: 1, y: 0, scale: 1, duration: .6, ease: "back.out(1.8)" }, 5)
    .to("#g2-sem", { autoAlpha: 1, duration: .5 }, 6.2)
    .fromTo("#g2-f", { autoAlpha: 0, y: 30, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, 6.6);
  const vida = gsap.timeline({ paused: true })
    .to(selos, { scale: 1.1, duration: .8, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .3 }, 0)
    .to("#g2-sem", { opacity: .4, duration: 1.1, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  let dc = null;
  return { enter() { tl.restart(); dc = gsap.delayedCall(7.5, () => vida.restart()); }, leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); } };
}

// ================= GOVERNO 3: da ata ao feito (momento-herói) =================
const DECISOES = [
  ["Orçamentos da reforma", "Marcos", "4 nov"],
  ["Classe de novos membros", "Pr. Davi", "1º nov"],
  ["Rol com os novos membros", "Secretário", "21 out"],
  ["Compra das cadeiras novas", "Diaconia", "20 nov"],
  ["Resposta aos jovens", "Pr. Davi", "20 out"],
];
const COLS_G3 = [["Decidido", 640], ["Andando", 1060], ["Feito", 1480]];
function g3() {
  const cols = $("#g3-cols"), linhas = $("#g3-linhas"), nB = $("#g3-n");
  COLS_G3.forEach(([nome, x]) => cols.append(h(`<div class="g-col" style="left:${x}px"><span>${nome}</span></div>`)));
  const heads = $$(".g-col", cols);
  for (let i = 0; i < 9; i++) linhas.append(h(`<i style="width:${60 + (i * 37) % 40}%"></i>`));
  const ls = $$("i", linhas);
  const cards = DECISOES.map(([oque, quem, ate], i) => {
    const c = h(`<div class="g-dec" style="left:640px;top:${430 + i * 104}px"><b>${oque}</b><span>${quem} · até ${ate}</span><em>lembrete enviado</em></div>`);
    cols.append(c); return c;
  });
  const lembr = cards.map(c => $("em", c));
  gsap.set(["#g3-tit", "#g3-sub", "#g3-ata", "#g3-ter", "#g3-placar", ...heads, ...cards, ...lembr], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#g3-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#g3-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo("#g3-ata", { autoAlpha: 0, x: -60, rotation: -3 }, { autoAlpha: 1, x: 0, rotation: 0, duration: .7, ease: "power3.out" }, .6);
  pop(tl, "#g3-ter", .8);
  // o Tércio escreve a ata
  tl.fromTo(ls, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: .18, ease: "none", stagger: .14 }, 1.2)
    .fromTo("#g3-ter img", { scale: 1 }, { scale: 1.12, duration: .2, yoyo: true, repeat: 5, ease: "sine.inOut" }, 1.2)
    .fromTo(heads, { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: .4, stagger: .12 }, 2.2);
  // cada decisão sai da ata com dono e prazo
  cards.forEach((c, i) => tl.fromTo(c, { autoAlpha: 0, x: -360, y: 0, scale: .5 }, { autoAlpha: 1, x: 0, scale: 1, duration: .55, ease: "power3.out" }, 2.6 + i * .18));
  // o Tércio leva cada uma ao dono, e todas começam a andar
  cards.forEach((c, i) => {
    const at = 4.2 + i * .14;
    tl.fromTo(lembr[i], { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .3, ease: "back.out(3)" }, at)
      .to(c, { x: 420, duration: .6, ease: "power2.inOut" }, at + .25)
      .to(lembr[i], { autoAlpha: 0, duration: .3 }, at + 1.2);
  });
  tl.fromTo("#g3-ter img", { scale: 1 }, { scale: 1.12, duration: .2, yoyo: true, repeat: 3 }, 4.2);
  // quatro ficam prontas; a reforma segue andando
  const n = { v: 0 };
  [1, 2, 3, 4].forEach((ci, k) => {
    const at = 6 + k * .45;
    tl.to(cards[ci], { x: 840, y: -104, duration: .6, ease: "power3.inOut" }, at)
      .to(cards[ci], { borderColor: "#25d366", duration: .3 }, at + .5)
      .to(n, { v: k + 1, duration: .2, onUpdate: () => { nB.textContent = Math.round(n.v); } }, at + .5);
  });
  // a próxima reunião abre com o placar
  tl.fromTo("#g3-placar", { autoAlpha: 0, scale: .6, filter: "blur(10px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: .7, ease: "back.out(1.8)" }, 6)
    .fromTo("#g3-placar", { boxShadow: "0 0 0 0 #ffac1300" }, { boxShadow: "0 0 80px 10px #ffac1388", duration: .5, yoyo: true, repeat: 1 }, 8.1)
    .fromTo(heads[2], { color: "#b9b9b9" }, { color: "#25d366", duration: .4 }, 8.1);
  const vida = gsap.timeline({ paused: true })
    .to($$("#g3-ter img"), { y: -7, duration: 1.9, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .4 }, 0)
    .to("#g3-n", { scale: 1.08, duration: .9, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  let dc = null;
  return {
    enter() { nB.textContent = 0; gsap.set(cards, { borderColor: "#ffffff1c" }); tl.restart(); dc = gsap.delayedCall(9, () => vida.restart()); },
    leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); },
  };
}

// ================= GOVERNO 5: uma agenda, um ano em ordem =================
// novembro de 2026 começa num domingo
const EVENTOS = [[1, "Santa Ceia"], [3, "Mulheres"], [6, "Ensaio do louvor"], [8, "Novos membros"], [14, "Jovens · salão"], [18, "Conselho"], [28, "Congresso · Josué"]];
const REL = [["12", "membros recebidos"], ["5", "batismos"], ["3", "transferências"], ["38", "decisões cumpridas"]];
function g5() {
  const cal = $("#g5-cal"), meses = $("#g5-meses"), nums = $("#g5-nums");
  cal.append(h(`<div class="g-cal-cab"><b>Novembro de 2026</b><span>dom</span><span>seg</span><span>ter</span><span>qua</span><span>qui</span><span>sex</span><span>sáb</span></div>`));
  const grade = h(`<div class="g-cal-grade"></div>`); cal.append(grade);
  const dias = [];
  for (let d = 1; d <= 30; d++) { const c = h(`<div class="g-dia"><small>${d}</small></div>`); grade.append(c); dias[d] = c; }
  const chips = EVENTOS.map(([d, t]) => { const c = h(`<span class="g-ev">${t}</span>`); dias[d].append(c); return c; });
  const mulheres = h(`<span class="g-ev choque">Mulheres · salão</span>`); dias[14].append(mulheres);
  "jan fev mar abr mai jun jul ago set out nov dez".split(" ").forEach(m => meses.append(h(`<i>${m}</i>`)));
  const ms = $$("i", meses);
  REL.forEach(([n, t]) => nums.append(h(`<p><b>${n}</b>${t}</p>`)));
  const lema = $$("#g5-lema p"), btns = $$("#g5-fecho .cta");
  gsap.set(["#g5-tit", "#g5-sub", "#g5-feb", "#g5-aviso", "#g5-rel", cal, ...chips, mulheres, ...ms, ...lema, ...btns], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#g5-tit", foco, { ...nitido, duration: .7 })
    .fromTo("#g5-sub", foco, { ...nitido, duration: .7 }, .3)
    .fromTo(cal, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .7, ease: "power3.out" }, .6);
  pop(tl, "#g5-feb", .9);
  // os calendários de cada departamento caem numa agenda só
  chips.forEach((c, i) => tl.fromTo(c, { autoAlpha: 0, x: 500, y: -200, scale: .4 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: .6, ease: "power3.out" }, 1.4 + i * .25));
  // o choque de salão aparece na hora de marcar, e as mulheres vão para o dia 21
  tl.fromTo(mulheres, { autoAlpha: 0, x: 500, y: -200, scale: .4 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: .6, ease: "power3.out" }, 3.4)
    .to(dias[14], { borderColor: "#ff5a3c", backgroundColor: "#3d1d1a", duration: .25, yoyo: true, repeat: 3 }, 4)
    .fromTo("#g5-aviso", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .5, ease: "back.out(2)" }, 4.1)
    .fromTo("#g5-feb img", { scale: 1 }, { scale: 1.15, duration: .2, yoyo: true, repeat: 3 }, 4.1)
    .to(mulheres, { autoAlpha: 0, duration: .25 }, 5)
    .add(() => { dias[21].append(mulheres); mulheres.classList.remove("choque"); mulheres.textContent = "Mulheres · salão"; }, 5.3)
    .fromTo(mulheres, { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: .45, ease: "back.out(2)", immediateRender: false }, 5.3)
    // o ano inteiro passa, e o relatório já está montado
    .fromTo(ms, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .25, stagger: .09 }, 6)
    .to(ms, { backgroundColor: "#2e2616", borderColor: "#ffac13", duration: .2, stagger: .09 }, 6.2)
    .fromTo("#g5-rel", { autoAlpha: 0, x: 60, filter: "blur(10px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .7, ease: "power3.out" }, 7.3)
    .fromTo($$("p", nums), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .4, stagger: .12 }, 7.6);
  lema.forEach((p, i) => tl.fromTo(p, { autoAlpha: 0, x: -40, filter: "blur(10px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .8, ease: "power3.out" }, 8.4 + i * .7));
  tl.fromTo(btns, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .5, ease: "back.out(2)", stagger: .12 }, 9.8);
  const vida = gsap.timeline({ paused: true })
    .to("#g5-feb img", { y: -7, duration: 1.9, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to(chips, { y: -3, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: .2 }, 0);
  let dc = null;
  return {
    enter() { dias[14].append(mulheres); mulheres.classList.add("choque"); gsap.set(dias[14], { borderColor: "#ffffff14", backgroundColor: "#262626" }); gsap.set(ms, { backgroundColor: "#262626", borderColor: "#ffffff1c" }); tl.restart(); dc = gsap.delayedCall(10.4, () => vida.restart()); },
    leave() { dc && dc.kill(); tl.pause(0); vida.pause(0); },
  };
}

// ================= rotas, cenas e navegação =================
const VISTAS = { inicio: $("#v-inicio"), times: $("#v-times"), palavra: $("#v-palavra"), ensino: $("#v-ensino"), comunicacao: $("#v-comunicacao"), cuidado: $("#v-cuidado"), governo: $("#v-governo") };
const motores = { i1: i1(), i2: i2(), t1: t1(), p1: p1(), p2: p2(), p3: p3(), p4: p4(), p5: p5(), e1: e1(), e2: e2(), e3: e3(), e4: e4(), e5: e5(), e6: e6(), m1: m1(), m2: m2(), m3: m3(), m4: m4(), m5: m5(), c1: c1(), c2: c2(), c3: c3(), c4: c4(), c5: c5(), g1: g1(), g2: g2(), g3: g3(), g5: g5() };
const pontos = $("#pontos");
let vista = null, cena = null;
function ativa(id) {
  if (cena === id) return;
  cena && motores[cena] && motores[cena].leave();
  cena = id;
  motores[id] && motores[id].enter();
  $$("button", pontos).forEach(b => b.classList.toggle("on", b.dataset.c === id));
}
function mostra(v) {
  if (!VISTAS[v]) v = "inicio";
  fecha();
  cena && motores[cena] && motores[cena].leave(); cena = null;
  for (const k in VISTAS) VISTAS[k].hidden = k !== v;
  if (v !== "inicio") window.ABERTURA && window.ABERTURA.para();
  vista = v;
  VISTAS[v].scrollTop = 0;
  $$("#barra a").forEach(a => a.classList.toggle("on", a.dataset.v === v || (!!VISTAS[v].dataset.nome && a.dataset.v === "times")));
  $("#barra-time").textContent = VISTAS[v].dataset.nome || "";
  const secs = $$(".dobra", VISTAS[v]);
  pontos.innerHTML = "";
  if (secs.length > 1) secs.forEach(s => { const b = h(`<button aria-label="Cena"></button>`); b.dataset.c = s.id; b.onclick = () => s.scrollIntoView({ behavior: "smooth" }); pontos.append(b); });
  ativa(secs[0].id);
}
for (const k in VISTAS) {
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (vista === k && en.isIntersecting && en.intersectionRatio >= .6) ativa(en.target.id);
  }), { root: VISTAS[k], threshold: [.6] });
  $$(".dobra", VISTAS[k]).forEach(s => io.observe(s));
}
addEventListener("hashchange", () => mostra(location.hash.slice(1)));
mostra(location.hash.slice(1) || "inicio");

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
    const p = el("path", { d }, svg);
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
    mats: [["biblia", "Bíblia"], ["livro", "Livro-base do líder"], ["livro", "Confissão de Westminster"], ["artigo", "Artigos de cosmovisão"], ["nota", "Essência: toda a vida sob Cristo"]] },
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
  marcos: ["Comunicação", "Eu sou o Marcos Mensagem.", "Escrevo as legendas, os carrosséis e os convites, numa linguagem que chega a quem ainda não conhece a igreja.", "O que foi pregado vira conversa nas redes, e não só aviso."],
  dorcas: ["Comunicação", "Sou a Dorcas Disparo.", "Organizo o calendário, agendo em cada rede e mando pelo WhatsApp para os membros. Só publico depois do seu sim.", "A semana inteira tem conteúdo, e ninguém da equipe precisa lembrar de postar."],
  priscila: ["Time do Ensino", "Oi! Eu sou a Priscila Programa.", "O líder de cada classe me entrega o tema, os livros-base e a essência do que quer ensinar. Eu monto o ciclo e distribuo o trabalho para o time.", "Cada classe recebe o curso inteiro, com começo, meio e fim."],
  apolo: ["Time do Ensino", "Sou o Apolo Aula.", "Escrevo cada encontro e o guia do professor, com o texto bíblico no centro e a aplicação no fim.", "O professor chega no domingo sabendo o que ensinar e como conduzir a turma."],
  sara: ["Time do Ensino", "Eu sou a Sara Slide.", "Monto os slides e o material de apoio de cada aula, sempre na identidade daquela classe.", "A turma vê uma apresentação bonita e coerente do primeiro ao último encontro."],
  calebe: ["Time do Ensino", "Sou o Calebe Catecismo.", "Cuido das versões para crianças e adolescentes, da classe de catecúmenos e do plano de leitura.", "Os pequenos aprendem a mesma verdade, no tamanho certo para a idade deles."],
  natanael: ["Time do Ensino", "Eu sou o Natanael Norma.", "Leio tudo antes de chegar ao professor e confiro com a confissão de fé da igreja.", "O conselho pode confiar: o que se ensina na EBD é o que a igreja confessa."],
  lidia: ["Cuidado", "Oi, eu sou a Lídia Lar.", "Atendo quem chega pelo link da bio a qualquer hora: horários, endereço, ministério infantil. Quando a pessoa quer visitar, aviso o acolhimento na hora.", "Quem bate à porta da igreja pela internet nunca fica sem resposta."],
};
const NOMES = { gideao: "Gideão Garimpo", eliseu: "Eliseu Edição", lucas: "Lucas Lição", rute: "Rute Revisão", marcos: "Marcos Mensagem", dorcas: "Dorcas Disparo", priscila: "Priscila Programa", apolo: "Apolo Aula", sara: "Sara Slide", calebe: "Calebe Catecismo", natanael: "Natanael Norma", lidia: "Lídia Lar" };
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

// ================= INÍCIO 1: domingo =================
function i1() {
  const svg = $("#i1-cena");
  const cruz = el("g", { opacity: 0 }, svg);
  el("rect", { x: 1384, y: 120, width: 32, height: 380, rx: 6, fill: "none", stroke: "#ffac13", "stroke-width": 3, opacity: .5 }, cruz);
  el("rect", { x: 1300, y: 200, width: 200, height: 32, rx: 6, fill: "none", stroke: "#ffac13", "stroke-width": 3, opacity: .5 }, cruz);
  const pastor = el("g", { opacity: 0 }, svg);
  el("circle", { cx: 1400, cy: 470, r: 48, fill: "#3b3b3b", stroke: "#ffac13", "stroke-width": 3, "stroke-opacity": .7 }, pastor);
  el("path", { d: "M1310 640 C1310 560 1350 530 1400 530 C1450 530 1490 560 1490 640 Z", fill: "#333", stroke: "#ffac13", "stroke-width": 3, "stroke-opacity": .55 }, pastor);
  el("path", { d: "M1290 640 H1510 L1540 780 H1260 Z", fill: "#262626", stroke: "#fe7003", "stroke-width": 4, "stroke-opacity": .8 }, pastor);
  const livro = el("path", { d: "M1360 640 L1400 628 L1440 640 L1440 664 L1400 652 L1360 664 Z", fill: "#ffac13", opacity: .85 }, pastor);
  const cab = [];
  [[850, 24, 8], [925, 28, 8], [1010, 33, 9], [1110, 38, 9]].forEach(([y, r, n], i) => {
    for (let j = 0; j < n; j++) {
      const x = 990 + j * (r * 3.3 + 8) + (i % 2) * 24;
      const g = el("g", { opacity: 0 }, svg);
      el("circle", { cx: x, cy: y, r, fill: "#2a2a2a", stroke: "#ffac13", "stroke-width": 2, "stroke-opacity": .35 }, g);
      el("path", { d: `M${x - r * 1.4} ${y + r * 3} Q${x} ${y + r * .8} ${x + r * 1.4} ${y + r * 3} Z`, fill: "#262626" }, g);
      cab.push(g);
    }
  });
  const cels = [];
  for (let i = 0; i < 12; i++) {
    const g = el("g", { opacity: 0 }, svg), w = 56 + rnd() * 24, hh = w * 1.75;
    el("rect", { x: -w / 2, y: -hh / 2, width: w, height: hh, rx: 12, fill: "#1a1a1a", stroke: "#ffac13", "stroke-width": 3 }, g);
    el("path", { d: "M-8 -12 L12 0 L-8 12 Z", fill: i % 3 === 0 ? "#ff0033" : "#ffac13" }, g);
    cels.push({ g, x: 1000 + rnd() * 880, y0: 800 - rnd() * 80, s: .7 + rnd() * .5 });
  }
  const celulares = gsap.timeline({ paused: true });
  cels.forEach((c, i) => {
    gsap.set(c.g, { x: c.x, y: c.y0, scale: c.s });
    celulares.fromTo(c.g, { y: c.y0, opacity: 0 }, { y: -80, duration: 7 + rnd() * 3, ease: "none", repeat: -1, keyframes: { opacity: [0, .9, .9, 0] } }, i * .55);
  });
  const vida = gsap.timeline({ paused: true })
    .to(pastor, { y: -6, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to(livro, { opacity: .5, duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to($("#i1-dica i"), { y: 8, duration: .8, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  gsap.set(["#i1-h", "#i1-p", "#i1-dica"], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#i1-h", foco, { ...nitido, duration: 1 })
    .to(cruz, { opacity: 1, duration: 1.4 }, .2)
    .fromTo(pastor, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: "back.out(1.4)" }, .5)
    .to(cab, { opacity: 1, duration: .5, stagger: .05 }, 1)
    .fromTo("#i1-p", foco, { ...nitido, duration: .9 }, 2)
    .add(() => celulares.play(), 3)
    .to("#i1-dica", { autoAlpha: 1, duration: .6 }, 4.5);
  return { enter() { tl.restart(); vida.play(); }, leave() { tl.pause(0); celulares.pause(0); vida.pause(0); } };
}

// ================= INÍCIO 2: a igreja acende =================
const SALAS = [
  { nome: "Palavra", efeito: ["a pregação alcança", "a semana inteira"], ag: "gideao", x: 1090, y: 500, w: 660, hgt: 230 },
  { nome: "Ensino", efeito: ["aulas prontas", "e revisadas"], ag: "priscila", x: 1090, y: 760, w: 150, hgt: 260 },
  { nome: "Comunicação", efeito: ["a igreja fala", "com clareza"], ag: "bezalel", x: 1260, y: 760, w: 150, hgt: 260 },
  { nome: "Cuidado", efeito: ["ninguém fica", "sem resposta"], ag: "lidia", x: 1430, y: 760, w: 150, hgt: 260 },
  { nome: "Governo", efeito: ["decisões", "cumpridas"], ag: "tercio", x: 1600, y: 760, w: 150, hgt: 260 },
];
function i2() {
  const svg = $("#i2-cena");
  const predio = el("g", {}, svg);
  const tracos = [
    el("path", { d: "M1040 470 L1420 250 L1800 470", fill: "none", stroke: "#ffac13", "stroke-width": 5, "stroke-linejoin": "round" }, predio),
    el("path", { d: "M1060 470 V1050 H1780 V470", fill: "none", stroke: "#5a5a5a", "stroke-width": 4 }, predio),
    el("path", { d: "M1420 250 V150 M1385 185 H1455", fill: "none", stroke: "#ffac13", "stroke-width": 6, "stroke-linecap": "round" }, predio),
  ];
  tracos.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const defs = el("defs", {}, svg);
  const salas = SALAS.map((s, i) => {
    const g = el("g", { opacity: 0 }, svg);
    const r = el("rect", { x: s.x, y: s.y, width: s.w, height: s.hgt, rx: 14, fill: "#262626", stroke: "#444", "stroke-width": 3 }, g);
    const grande = i === 0, cx = grande ? s.x + 90 : s.x + s.w / 2, cy = grande ? s.y + s.hgt / 2 : s.y + 62, R = grande ? 56 : 40;
    const cp = el("clipPath", { id: "sala" + i }, defs); el("circle", { cx, cy, r: R }, cp);
    el("image", { href: `assets/avatares/${s.ag}.webp`, x: cx - R, y: cy - R, width: R * 2, height: R * 2, "clip-path": `url(#sala${i})` }, g);
    el("circle", { cx, cy, r: R, fill: "none", stroke: "#ffac13", "stroke-width": 3 }, g);
    const tx = grande ? s.x + 180 : cx, anchor = grande ? "start" : "middle", ty = grande ? s.y + 100 : s.y + 140;
    const t = el("text", { x: tx, y: ty, "text-anchor": anchor, fill: "#f2f2f2", "font-size": grande ? 44 : 19, "font-weight": 800 }, g); t.textContent = s.nome;
    s.efeito.forEach((linha, k) => { const e = el("text", { x: tx, y: ty + (grande ? 46 : 32) + k * (grande ? 36 : 26), "text-anchor": anchor, fill: "#b9b9b9", "font-size": grande ? 30 : 18, "font-weight": 500 }, g); e.textContent = linha; });
    return { g, r };
  });
  // a porta e as pessoas que chegam
  el("rect", { x: 1385, y: 1035, width: 70, height: 15, rx: 4, fill: "#ffac13", opacity: .8 }, svg);
  const pessoas = gsap.timeline({ paused: true });
  for (let i = 0; i < 14; i++) {
    const lado = i % 2 ? 1 : -1, x0 = 1420 + lado * (420 + rnd() * 260);
    const p = el("circle", { cx: 0, cy: 0, r: 9, fill: "#ffac13", opacity: 0 }, svg);
    pessoas.fromTo(p, { attr: { cx: x0, cy: 1120 + rnd() * 40 } }, { attr: { cx: 1420, cy: 1060 }, duration: 5 + rnd() * 2, ease: "none", repeat: -1, keyframes: { opacity: [0, 1, 1, 0] } }, i * .7);
  }
  gsap.set(["#i2-h", "#i2-p", "#i2-cta"], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#i2-h", foco, { ...nitido, duration: 1 })
    .to(tracos, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut", stagger: .2 }, .3)
    .fromTo("#i2-p", foco, { ...nitido, duration: .9 }, 1.2);
  salas.forEach((s, i) => {
    const at = 1.8 + i * .55;
    tl.fromTo(s.g, { opacity: 0, scale: .9, transformOrigin: "center" }, { opacity: 1, scale: 1, duration: .6, ease: "back.out(1.5)" }, at)
      .to(s.r, { attr: { fill: "#3a2a12", stroke: "#ffac13" }, duration: .5 }, at + .3);
  });
  tl.add(() => pessoas.play(), 3).fromTo("#i2-cta", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6, ease: "back.out(2)" }, 4.8);
  const vida = gsap.timeline({ paused: true, repeat: -1 });
  salas.forEach((s, i) => vida.to(s.r, { attr: { fill: "#4a3312" }, duration: .9, yoyo: true, repeat: 1, ease: "sine.inOut" }, i * 1.2));
  return { enter() { tl.restart(); gsap.delayedCall(5, () => vida.restart()); }, leave() { tl.pause(0); pessoas.pause(0); vida.pause(0); } };
}

// ================= TIMES =================
const TIMES = [
  { id: "palavra", nome: "Palavra", rostos: ["gideao", "eliseu", "lucas", "rute"], dor: "Sua pregação de domingo chega a quem não estava no culto?", bem: "Cada sermão vira cortes, estudo e posts para a semana inteira, e quem assistiu encontra o caminho até a igreja." },
  { id: "ensino", nome: "Ensino", rostos: ["priscila", "apolo", "sara", "natanael"], dor: "A EBD depende de um professor que prepara tudo sozinho na véspera?", bem: "O trimestre chega planejado, com aulas, guia do professor e slides, revisados contra a confissão da igreja." },
  { id: "comunicacao", nome: "Comunicação", rostos: ["bezalel", "marcos", "hirao", "dorcas"], dor: "Os avisos da igreja ficam presos no púlpito e no grupo do WhatsApp?", bem: "Tudo o que sai para fora ganha forma, texto e data, com a identidade da sua igreja." },
  { id: "cuidado", nome: "Cuidado", rostos: ["lidia", "isabel", "epafras", "ana"], dor: "Quem visitou a igreja no domingo recebeu uma mensagem durante a semana?", bem: "O visitante é recebido na hora, o acolhimento é avisado e ninguém some sem que o pastor saiba." },
  { id: "governo", nome: "Governo", rostos: ["tercio", "zacarias", "jetro", "febe"], dor: "As decisões do conselho se perdem entre uma reunião e outra?", bem: "Atas, prazos e escalas em dia, e a liderança livre para cuidar de gente." },
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
const EQUIPE_ENSINO = [["priscila", "Priscila Programa"], ["apolo", "Apolo Aula"], ["sara", "Sara Slide"], ["calebe", "Calebe Catecismo"], ["natanael", "Natanael Norma"]];
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
  const AGS = ["#e3-apo", "#e3-sar", "#e3-cal", "#e3-nat"], AX = [700, 880, 1060, 1240];
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
  const frases = $$("#e5-frases p"), btns = $$("#e5-fecho .cta");
  gsap.set(["#e5-tit", "#e5-tela", ...frases, ...btns], { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .fromTo("#e5-tit", foco, { ...nitido, duration: .7 })
    .fromTo(tela, { opacity: 0 }, { opacity: 1, duration: .5 }, .3)
    .fromTo("#e5-tela", { autoAlpha: 0, scale: .9, filter: "blur(10px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: .8, ease: "power3.out" }, .5)
    .fromTo(prof, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8, ease: "back.out(1.5)" }, .8)
    .to(alunos.map(a => a.g), { opacity: 1, duration: .4, stagger: .04 }, 1.1)
    .to(alunos.map(a => a.c), { attr: { stroke: "#ffac13", fill: "#3a2a12" }, duration: .4, stagger: { each: .06, from: "random" } }, 2.2);
  frases.forEach((f, i) => tl.fromTo(f, { autoAlpha: 0, x: -60, filter: "blur(10px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .7, ease: "power3.out" }, 2.4 + i * 1.1));
  tl.fromTo(btns, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .5, ease: "back.out(2)", stagger: .12 }, 6);
  const vida = gsap.timeline({ paused: true })
    .to(braco, { attr: { d: "M1110 640 L1180 540" }, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0)
    .to(prof, { y: -5, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);
  ideias.forEach((d, i) => vida.fromTo(d, { attr: { opacity: 0 }, y: 0 }, { keyframes: { attr: [{ opacity: 1 }, { opacity: 0 }] }, y: -70, duration: 2.2, repeat: -1, ease: "power1.out" }, 2.5 + i * .5));
  return { enter() { tl.restart(); vida.restart(); }, leave() { tl.pause(0); vida.pause(0); } };
}

// ================= rotas, cenas e navegação =================
const VISTAS = { inicio: $("#v-inicio"), times: $("#v-times"), palavra: $("#v-palavra"), ensino: $("#v-ensino") };
const motores = { i1: i1(), i2: i2(), t1: t1(), p1: p1(), p2: p2(), p3: p3(), p4: p4(), p5: p5(), e1: e1(), e2: e2(), e3: e3(), e4: e4(), e5: e5() };
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

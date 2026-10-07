// Apresentação do Seminário 3. Cada <section> é uma dobra com passos.
// Avança: rodinha, seta para baixo/direita, Page Down, passador. Volta: o contrário.
// Ensaio: #5 na URL abre direto na 5ª seção.
// Vídeo: o play abre em tela cheia; fechar (X, fundo ou Esc) zera, e o próximo play recomeça.

const NS = "http://www.w3.org/2000/svg";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
// aleatório com semente, para o desenho sair igual a cada abertura
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
// linha que se desenha: pathLength=1 e dashoffset de 1 a 0
const linha = (d, cls, parent) => el("path", { d, class: cls, pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, parent);
const desenha = { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" };
// troca de legenda: um <span> por passo, um aparece e o anterior sai
function legendas(box, textos) {
  box.innerHTML = textos.map(t => `<span style="opacity:0">${t}</span>`).join("");
  return $$("span", box);
}
function troca(tl, spans, k, pos) {
  if (k > 0) tl.to(spans[k - 1], { opacity: 0, y: -20, duration: 0.3 }, pos);
  tl.fromTo(spans[k], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, k > 0 ? ">-0.1" : pos);
}
// o cartão do vídeo só mostra a capa; o play abre o vídeo em tela cheia
const modal = $("#modal"), mv = $("video", modal);
const aberto = () => modal.classList.contains("on");
function abreVideo(src) {
  $$("audio").forEach(a => a.pause());
  mv.src = src;
  mv.currentTime = 0;
  modal.classList.add("on");
  mv.play();
}
function fechaVideo() {
  mv.pause();
  modal.classList.remove("on");
  mv.removeAttribute("src");
  mv.load();
}
modal.addEventListener("click", e => {
  e.stopPropagation();
  if (e.target === modal || e.target.closest(".fecha")) fechaVideo();
});
$$(".tela").forEach(tela => tela.addEventListener("click", e => {
  e.stopPropagation();
  abreVideo($("video", tela).getAttribute("src"));
}));
// imagem em tela cheia: clicar num item de um grupo [data-luz] abre ele, e as setas passam pelos outros do grupo
const luz = $("#luz"), luzImg = $("img", luz);
let lista = [], at = 0;
const luzAberta = () => luz.classList.contains("on");
function mostraLuz(n) {
  at = (n + lista.length) % lista.length;
  luzImg.src = lista[at].src; luzImg.alt = lista[at].alt;
  luz.classList.toggle("varias", lista.length > 1);
  $(".cont", luz).textContent = `${at + 1} de ${lista.length}`;
}
const fechaLuz = () => luz.classList.remove("on");
$$("[data-luz]").forEach(img => img.addEventListener("click", e => {
  e.stopPropagation();
  lista = $$(`[data-luz="${img.dataset.luz}"]`);
  mostraLuz(lista.indexOf(img));
  luz.classList.add("on");
}));
luz.addEventListener("click", e => {
  e.stopPropagation();
  if (e.target === luz || e.target.closest(".fecha")) fechaLuz();
  else if (e.target.closest(".ant")) mostraLuz(at - 1);
  else if (e.target.closest(".prox")) mostraLuz(at + 1);
});

// ================= motor =================
const secs = [];
function secao(id, build) {
  const node = document.getElementById(id);
  const tl = gsap.timeline({ paused: true });
  let n = 0;
  const passo = () => tl.addLabel("s" + n++);
  const s = { id, node, tl, on: null, sai: null };
  build(tl, node, passo, s);
  s.n = n;
  secs.push(s);
}
let I = 0, K = 0, tw = null;
function mostra() {
  const s = secs[I];
  s.on && s.on(K);
  const antes = secs.slice(0, I).reduce((a, x) => a + x.n, 0);
  const total = secs.reduce((a, x) => a + x.n, 0);
  $("#barra i").style.width = ((antes + K + 1) / total) * 100 + "%";
  $("#barra").classList.toggle("md", s.node.classList.contains("md"));
  // em tela 16:10 (tablet) sobra faixa em cima e embaixo: ela pega a cor do fundo da dobra
  document.body.style.background = s.node.classList.contains("md") ? "#212121" : "#05070F";
  history.replaceState(null, "", "#" + (I + 1));
}
function vai(k) {
  const s = secs[I];
  K = k;
  tw && tw.kill();
  tw = s.tl.tweenTo("s" + k);
  mostra();
}
function entra(i, k, voltando) {
  const velha = secs[I];
  if (velha && i !== I) {
    gsap.to(velha.node, { autoAlpha: 0, duration: 0.5 });
    $$("video,audio", velha.node).forEach(m => m.pause());
    velha.sai && velha.sai();
  }
  I = i; K = k;
  const s = secs[i];
  tw && tw.kill();
  gsap.fromTo(s.node, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
  if (voltando) s.tl.seek("s" + k, false); // false: roda os onUpdate, senão os contadores voltam zerados
  else { s.tl.seek(0); tw = s.tl.tweenTo("s" + k); }
  mostra();
}
function proximo() {
  const s = secs[I];
  if (K < s.n - 1) vai(K + 1);
  else if (I < secs.length - 1) entra(I + 1, 0);
}
function anterior() {
  if (K > 0) vai(K - 1);
  else if (I > 0) entra(I - 1, secs[I - 1].n - 1, true);
}
addEventListener("keydown", e => {
  if (aberto()) { if (e.key === "Escape") fechaVideo(); return; } // com o vídeo aberto, as teclas são dele
  if (luzAberta()) {
    e.preventDefault();
    if (e.key === "Escape") fechaLuz();
    if (["ArrowRight", "ArrowDown", "PageDown"].includes(e.key)) mostraLuz(at + 1);
    if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) mostraLuz(at - 1);
    return;
  }
  if (["ArrowDown", "ArrowRight", "PageDown"].includes(e.key)) { e.preventDefault(); proximo(); }
  if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); anterior(); }
  if (e.key === "Home") entra(0, 0);
  if (e.key === "f") document.documentElement.requestFullscreen?.();
});
let roda = 0, travado = false;
addEventListener("wheel", e => {
  e.preventDefault();
  if (travado || aberto() || luzAberta()) return;
  roda += e.deltaY;
  if (Math.abs(roda) < 40) return;
  roda > 0 ? proximo() : anterior();
  roda = 0; travado = true;
  setTimeout(() => (travado = false), 650);
}, { passive: false });
document.addEventListener("click", e => { if (e.target.closest("[data-next]")) proximo(); });

// toque (tablet): arrastar para a esquerda ou para cima avança, para o outro lado volta.
// No carrossel, o arrasto passa os slides; com uma imagem aberta, passa as imagens.
let tx = null, ty = null, alvo = null;
addEventListener("touchstart", e => {
  if (e.touches.length !== 1) return (tx = null);
  tx = e.touches[0].clientX; ty = e.touches[0].clientY; alvo = e.target;
}, { passive: true });
addEventListener("touchend", e => {
  if (tx === null || (aberto() && alvo.closest("video"))) return (tx = null); // no vídeo aberto, os controles nativos cuidam do toque
  const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
  tx = null;
  const dist = Math.max(Math.abs(dx), Math.abs(dy));
  if (dist < 12) {
    e.preventDefault(); // o clique nativo não chega: o toque é tratado só aqui
    // toque em algo clicável (vídeo, botão, print, QR) ou com vídeo/imagem aberta: vira clique
    if (aberto() || luzAberta() || alvo.closest("button,a,video,audio,.tela,[data-luz],.a-ondas,#nav")) {
      alvo.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: t.clientX, clientY: t.clientY }));
      return;
    }
    // toque no resto da tela: metade direita avança, metade esquerda volta
    t.clientX > innerWidth / 2 ? proximo() : anterior();
    return;
  }
  if (dist < 50 || aberto()) return;
  const frente = Math.abs(dx) > Math.abs(dy) ? dx < 0 : dy < 0;
  if (luzAberta()) return mostraLuz(at + (frente ? 1 : -1));
  if (alvo && alvo.closest("#k-insta")) return $(frente ? "#k-prox" : "#k-ant").click();
  frente ? proximo() : anterior();
}, { passive: false });
$("#nav-ant").onclick = e => { e.stopPropagation(); anterior(); };
$("#nav-prox").onclick = e => { e.stopPropagation(); proximo(); };
$("#nav-tela").onclick = e => {
  e.stopPropagation();
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
};
function ajusta() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  $("#stage").style.transform = `translate(-50%,-50%) scale(${k})`;
}
addEventListener("resize", ajusta);
$("#stage").style.transformOrigin = "50% 50%";
ajusta();

// ================= 1. O desafio =================
secao("desafio", (tl, node, passo, s) => {
  const svg = $("#d-mundo");
  // rede do algoritmo em volta da foto
  const rede = el("g", { opacity: 0 }, svg);
  const nos = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rnd() * 0.3;
    const r = 330 + rnd() * 90;
    let x = 465 + Math.cos(a) * r * 0.75, y = 560 + Math.sin(a) * r * 1.15;
    x = Math.min(x, 840);
    nos.push([x, Math.max(120, Math.min(1040, y))]);
  }
  nos.forEach((p, i) => {
    const q = nos[(i + 1) % nos.length], q2 = nos[(i + 5) % nos.length];
    el("line", { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: "#35F0FF", "stroke-width": 1.5, opacity: 0.5 }, rede);
    if (i % 3 === 0) el("line", { x1: p[0], y1: p[1], x2: q2[0], y2: q2[1], stroke: "#9B7BFF", "stroke-width": 1, opacity: 0.35 }, rede);
  });
  nos.forEach(p => el("circle", { cx: p[0], cy: p[1], r: 7, fill: "#35F0FF", class: "pulsa" }, rede));
  // o feed que se empilha
  const feed = [];
  for (let i = 0; i < 9; i++) {
    const g = el("g", { opacity: 0 }, svg);
    el("rect", { x: -52, y: -30, width: 104, height: 60, rx: 10, fill: "#0C1226", stroke: i % 2 ? "#9B7BFF" : "#35F0FF", "stroke-width": 2 }, g);
    el("rect", { x: -40, y: -18, width: 30, height: 36, rx: 5, fill: i % 2 ? "#9B7BFF" : "#35F0FF", opacity: 0.6 }, g);
    el("rect", { x: -2, y: -14, width: 42, height: 7, rx: 3, fill: "#8C9AC0" }, g);
    el("rect", { x: -2, y: 2, width: 30, height: 7, rx: 3, fill: "#8C9AC0" }, g);
    g.setAttribute("transform", "translate(465 560) scale(.2)");
    feed.push(g);
  }
  const contaFeed = el("text", { x: 785, y: 250, "text-anchor": "middle", fill: "#35F0FF", "font-family": "Manrope", "font-weight": 800, "font-size": 26, opacity: 0 }, svg);
  contaFeed.textContent = "posts hoje: 0";
  // a balança: internet de um lado, igreja local do outro
  const bal = el("g", { opacity: 0 }, svg);
  const PX = 1460, PY = 790, BR = 250;
  el("path", { d: `M${PX} ${PY} L${PX - 40} 1000 H${PX + 40} Z`, fill: "#0C1226", stroke: "#1E2A4F", "stroke-width": 3 }, bal);
  const viga = el("line", { x1: PX - BR, y1: PY, x2: PX + BR, y2: PY, stroke: "#EEF3FF", "stroke-width": 6, "stroke-linecap": "round" }, bal);
  el("circle", { cx: PX, cy: PY, r: 12, fill: "#35F0FF" }, bal);
  const prato = lado => {
    const g = el("g", {}, bal);
    el("path", { d: "M-80 0 L0 -110 L80 0", fill: "none", stroke: "#8C9AC0", "stroke-width": 2 }, g);
    el("path", { d: "M-95 0 H95 A95 30 0 0 1 -95 0 Z", fill: "#0C1226", stroke: lado ? "#9B7BFF" : "#35F0FF", "stroke-width": 3 }, g);
    return g;
  };
  const pE = prato(0), pD = prato(1);
  const rotE = el("text", { y: 80, "text-anchor": "middle", fill: "#EEF3FF", "font-family": "Manrope", "font-weight": 700, "font-size": 24 }, pE);
  rotE.textContent = "internet";
  const igreja = el("g", { transform: "translate(0 -8)" }, pD);
  el("path", { d: "M-40 0 V-50 L0 -80 L40 -50 V0 Z M-12 0 V-26 H12 V0 M0 -80 V-112 M-12 -100 H12", fill: "none", stroke: "#9B7BFF", "stroke-width": 4, "stroke-linejoin": "round" }, igreja);
  const rotD = el("text", { y: 80, "text-anchor": "middle", fill: "#EEF3FF", "font-family": "Manrope", "font-weight": 700, "font-size": 24 }, pD);
  rotD.textContent = "igreja local";
  const ang = { a: 0 };
  const poeBal = () => {
    const r = (ang.a * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
    viga.setAttribute("x1", PX - BR * c); viga.setAttribute("y1", PY - BR * sn);
    viga.setAttribute("x2", PX + BR * c); viga.setAttribute("y2", PY + BR * sn);
    pE.setAttribute("transform", `translate(${PX - BR * c} ${PY - BR * sn + 110})`);
    pD.setAttribute("transform", `translate(${PX + BR * c} ${PY + BR * sn + 110})`);
  };
  poeBal();

  const frases = $$(".frase", node);
  // passo 0: a foto entra, a rede liga
  tl.fromTo("#d-live", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" })
    .to(rede, { opacity: 1, duration: 0.8 }, "-=0.3")
    .fromTo(frases[0], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5");
  passo();
  // passo 1: publicar várias vezes por dia
  const cont = { n: 0 };
  tl.to(frases[0], { opacity: 0, y: -30, duration: 0.3 })
    .fromTo(frases[1], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 })
    .to(rede, { opacity: 0.2, duration: 0.5 }, "<")
    .to(contaFeed, { opacity: 1, duration: 0.3 }, "<");
  feed.forEach((g, i) => {
    tl.to(g, { opacity: 1, duration: 0.01 }, `>-${i ? 0.18 : 0}`)
      .to(g, { attr: { transform: `translate(785 ${935 - i * 72}) scale(1)` }, duration: 0.45, ease: "back.out(1.4)" }, "<");
  });
  tl.to(cont, { n: 9, duration: 9 * 0.27, ease: "none", onUpdate: () => (contaFeed.textContent = "posts hoje: " + Math.round(cont.n)) }, "<-1.9");
  passo();
  // passo 2: trocar as prioridades
  tl.to(frases[1], { opacity: 0, y: -30, duration: 0.3 })
    .fromTo(frases[2], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 })
    .to(bal, { opacity: 1, duration: 0.4 }, "<")
    .to(contaFeed, { opacity: 0, duration: 0.3 }, "<");
  // os posts caem no prato da internet, e a balança pende para esse lado
  const noPrato = (i, a) => {
    const r = (a * Math.PI) / 180;
    return `translate(${PX - BR * Math.cos(r) + ((i % 3) - 1) * 46} ${PY - BR * Math.sin(r) + 80 - Math.floor(i / 3) * 34}) scale(.42)`;
  };
  feed.forEach((g, i) => tl.to(g, { attr: { transform: noPrato(i, 0) }, duration: 0.45, ease: "power2.in" }, `>-${i ? 0.36 : 0}`));
  tl.to(ang, { a: -14, duration: 1.2, ease: "power3.out", onUpdate: poeBal })
    .to(feed, { attr: { transform: i => noPrato(i, -14) }, duration: 1.2, ease: "power3.out" }, "<")
    .to(igreja, { opacity: 0.25, duration: 1 }, "<");
  passo();
  s.on = k => {
    $("#d-num").textContent = k + 1 + " de 3";
    $("#d-btn").textContent = k < 2 ? "Próxima frase" : "Continuar";
  };
});

// ================= grafo do fluxo (usado em 2a e na recapitulação) =================
const REDES = [["Shorts", "#FF0033"], ["Instagram", "#E1306C"], ["TikTok", "#25F4EE"], ["Kwai", "#FF8A00"]];
function grafo(svg, ativo) {
  const G = {};
  const grupo = nome => (G[nome] = el("g", { class: "gr", "data-g": nome, opacity: ativo ? 1 : 0 }, svg));
  const txt = (g, x, y, t, cls = "rotulo", anchor = "middle") => { const e = el("text", { x, y, class: cls, "text-anchor": anchor }, g); e.textContent = t; return e; };
  const L = ativo ? (d, cls, p) => el("path", { d, class: cls }, p) : linha;
  G.lig = {};
  const lig = (nome, d, cls = "lig") => (G.lig[nome] = L(d, cls, svg));
  // ligações primeiro, para ficarem por baixo
  lig("PY", "M262 560 H330");
  lig("YT", "M660 560 H728");
  for (let i = 0; i < 3; i++) lig("TC" + i, `M852 560 C900 560 ${970 + i * 100} 420 ${970 + i * 100} 284`);
  lig("TE", "M852 560 C890 560 890 488 930 488");
  lig("TI", "M852 560 C890 560 890 638 930 638");
  lig("TK", "M852 560 C890 560 890 798 930 798");
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++)
    lig(`C${i}N${j}`, `M${970 + i * 100} 140 C${970 + i * 100} 80 1250 ${120 + j * 72} 1294 ${120 + j * 72}`, "lig v");
  lig("EL", "M1150 488 H1294");
  lig("IS", "M1150 638 C1250 638 1250 600 1294 600");
  lig("IA", "M1150 638 C1250 638 1250 680 1294 680");
  lig("KN", "M1150 798 H1294");
  const fontes = [[1450, 120], [1490, 192], [1450, 264], [1430, 336], [1566, 488], [1456, 600], [1546, 680], [1576, 798]];
  fontes.forEach(([x, y], i) => { const ty = 470 + (y - 470) * 0.25; lig("Q" + i, `M${x} ${y} C${x + 80} ${y} 1680 ${ty} 1712 ${ty}`); });
  lig("QI", "M1790 625 V722");

  let g = grupo("P");
  el("circle", { cx: 190, cy: 560, r: 72, class: "no" }, g);
  el("rect", { x: 174, y: 515, width: 32, height: 54, rx: 16, fill: "#35F0FF" }, g);
  el("path", { d: "M160 555 a30 30 0 0 0 60 0 M190 586 V604 M174 604 H206", fill: "none", stroke: "#35F0FF", "stroke-width": 4, "stroke-linecap": "round" }, g);
  txt(g, 190, 672, "Pregar");
  g = grupo("Y");
  el("image", { href: "assets/img/sermao.jpg", x: 330, y: 467, width: 330, height: 186, preserveAspectRatio: "xMidYMid slice" }, g);
  el("rect", { x: 330, y: 467, width: 330, height: 186, rx: 14, fill: "none", stroke: "#EEF3FF", "stroke-width": 2 }, g);
  el("rect", { x: 465, y: 538, width: 60, height: 42, rx: 12, fill: "#FF0033" }, g);
  el("path", { d: "M488 548 L506 559 L488 570 Z", fill: "#fff" }, g);
  el("rect", { x: 330, y: 649, width: 330, height: 4, fill: "#ffffff33" }, g);
  el("rect", { x: 330, y: 649, width: 120, height: 4, fill: "#FF0033" }, g);
  txt(g, 495, 700, "Culto no YouTube");
  g = grupo("T");
  const hex = Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + (k * Math.PI) / 3; return `${790 + 62 * Math.cos(a)},${560 + 62 * Math.sin(a)}`; }).join(" ");
  el("polygon", { points: hex, class: "no", stroke: "#9B7BFF" }, g);
  el("circle", { cx: 790, cy: 560, r: 36, fill: "none", stroke: "#35F0FF", "stroke-width": 4, "stroke-dasharray": "14 10", class: "gira" }, g);
  const ia = txt(g, 790, 568, "IA", "rotulo"); ia.setAttribute("fill", "#35F0FF");
  txt(g, 790, 660, "Tratamento");
  g = grupo("C");
  const cortes = ["c1-jesus-me-ama", "c2-o-guarda-pediu-perdao", "c3-o-fardo-que-ele-tira"];
  cortes.forEach((c, i) => {
    const cg = el("g", { class: "corte-mini" }, g);
    el("image", { href: `assets/vid/${c}.jpg`, x: 930 + i * 100, y: 142, width: 80, height: 142, preserveAspectRatio: "xMidYMid slice" }, cg);
    el("rect", { x: 930 + i * 100, y: 142, width: 80, height: 142, rx: 10, fill: "none", stroke: "#35F0FF", "stroke-width": 2 }, cg);
  });
  txt(g, 1070, 318, "3 cortes", "sub");
  g = grupo("N");
  REDES.forEach(([n, c], j) => {
    el("circle", { cx: 1320, cy: 120 + j * 72, r: 26, fill: "#0C1226", stroke: c, "stroke-width": 4 }, g);
    el("circle", { cx: 1320, cy: 120 + j * 72, r: 9, fill: c }, g);
    txt(g, 1360, 128 + j * 72, n, "rotulo", "start");
  });
  const card = (nome, y, titulo, cor) => {
    const cg = grupo(nome);
    el("rect", { x: 930, y: y - 48, width: 220, height: 96, rx: 14, class: "card", stroke: cor }, cg);
    el("rect", { x: 950, y: y - 28, width: 40, height: 56, rx: 6, fill: cor, opacity: 0.7 }, cg);
    txt(cg, 1004, y + 8, titulo, "rotulo", "start").setAttribute("font-size", "22");
    return cg;
  };
  card("E", 488, "Estudo", "#35F0FF");
  card("I", 638, "Infográfico", "#9B7BFF");
  card("K", 798, "Carrossel", "#35F0FF");
  const alvo = (nome, y, titulo, cor) => {
    const cg = grupo(nome);
    el("circle", { cx: 1320, cy: y, r: 26, fill: "#0C1226", stroke: cor, "stroke-width": 4 }, cg);
    txt(cg, 1360, y + 8, titulo, "rotulo", "start").setAttribute("font-size", "22");
    return cg;
  };
  alvo("L", 488, "Líderes de grupos", "#25D366");
  alvo("S", 600, "Stories", "#E1306C");
  alvo("A", 680, "Grupo de avisos", "#25D366");
  alvo("X", 798, "Quem não é crente", "#9B7BFF");
  g = grupo("R"); // o raio do automático
  el("path", { d: "M1262 616 l-14 22 h12 l-4 18 l16 -24 h-12 z", fill: "#9B7BFF" }, g);
  txt(g, 1250, 740, "fim do culto", "sub");
  g = grupo("Q");
  el("circle", { cx: 1790, cy: 470, r: 80, class: "no pulsa-forte", stroke: "#35F0FF" }, g);
  el("circle", { cx: 1772, cy: 450, r: 16, fill: "#35F0FF" }, g);
  el("circle", { cx: 1812, cy: 450, r: 16, fill: "#9B7BFF" }, g);
  el("path", { d: "M1744 500 a28 24 0 0 1 56 0 M1784 500 a28 24 0 0 1 56 0", fill: "none", stroke: "#EEF3FF", "stroke-width": 5 }, g);
  txt(g, 1790, 585, "Equipe de visita");
  txt(g, 1790, 611, "e aconselhamento", "sub");
  g = grupo("IG");
  el("path", { d: "M1750 840 V790 L1790 760 L1830 790 V840 Z M1778 840 V814 H1802 V840 M1790 760 V728 M1778 740 H1802", fill: "none", stroke: "#35F0FF", "stroke-width": 4, "stroke-linejoin": "round" }, g);
  txt(g, 1790, 880, "Igreja local");
  return G;
}
// bolinhas que correm pelas ligações até a equipe (comentários virando conversa)
function corrente(svg, G) {
  const tl = gsap.timeline({ repeat: -1, paused: true });
  Object.keys(G.lig).filter(k => /^Q\d$/.test(k)).forEach((k, i) => {
    const p = G.lig[k], L = p.getTotalLength();
    for (let n = 0; n < 2; n++) {
      const b = el("circle", { r: 7, fill: "#EEF3FF", opacity: 0 }, svg);
      const o = { t: 0 };
      tl.fromTo(o, { t: 0 }, { t: 1, duration: 1.4, ease: "none", onUpdate: () => { const q = p.getPointAtLength(o.t * L); b.setAttribute("cx", q.x); b.setAttribute("cy", q.y); b.setAttribute("opacity", o.t > 0.02 && o.t < 0.95 ? 1 : 0); } }, i * 0.25 + n * 1.2);
    }
  });
  return tl;
}

// ================= 2a. O fluxo =================
secao("fluxo", (tl, node, passo, s) => {
  const svg = $("#f-grafo"), G = grafo(svg, false);
  const leg = legendas($("#f-leg"), [
    "Uma ação do pastor: preparar a pregação e pregar.",
    "O culto vai ao ar no YouTube.",
    "A pregação é tratada com IA: transcrição, análise e cortes.",
    "Saem 3 cortes, cada um com uma mensagem completa.",
    "Cada corte vai para 4 redes: <em>12 postagens</em>.",
    "Um estudo bíblico vai para os líderes dos pequenos grupos.",
    "O resumo vai aos stories e ao grupo de avisos <em>quando o culto acaba</em>.",
    "Um carrossel fala com quem ainda não é crente.",
    "Quem comenta é chamado pela equipe de visita e aconselhamento.",
  ]);
  const ap = (g, pos) => tl.fromTo(G[g], { opacity: 0, scale: 0.85, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, pos);
  const li = (nomes, pos) => tl.to(nomes.map(n => G.lig[n]), { ...desenha, stagger: 0.05 }, pos);
  ap("P"); troca(tl, leg, 0, "<"); passo();
  troca(tl, leg, 1); li(["PY"], "<"); ap("Y", "-=0.2"); passo();
  troca(tl, leg, 2); li(["YT"], "<"); ap("T", "-=0.2"); passo();
  troca(tl, leg, 3); li(["TC0", "TC1", "TC2"], "<"); ap("C", "-=0.2"); passo();
  troca(tl, leg, 4); ap("N", "<");
  li(Object.keys(G.lig).filter(k => /^C\dN\d$/.test(k)), "<"); passo();
  troca(tl, leg, 5); li(["TE"], "<"); ap("E", "-=0.3"); li(["EL"]); ap("L", "-=0.2"); passo();
  troca(tl, leg, 6); li(["TI"], "<"); ap("I", "-=0.3"); ap("R"); li(["IS", "IA"], "<"); ap("S", "-=0.2"); ap("A", "<"); passo();
  troca(tl, leg, 7); li(["TK"], "<"); ap("K", "-=0.3"); li(["KN"]); ap("X", "-=0.2"); passo();
  troca(tl, leg, 8); ap("Q", "<"); li(Object.keys(G.lig).filter(k => /^Q\d$/.test(k)), "<"); li(["QI"]); ap("IG", "-=0.2"); passo();
  const fluxo = corrente(svg, G);
  s.on = k => (k === 8 ? fluxo.play() : fluxo.pause(0));
  s.sai = () => fluxo.pause(0);
});

// ================= 2b. Os cortes =================
secao("cortes", (tl, node, passo) => {
  $$(".redes", node).forEach(r => (r.innerHTML = REDES.map(([n, c]) => `<span class="rede" style="--c:${c}"><i></i>${n}</span>`).join("")));
  tl.fromTo(".corte", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" });
  passo();
  const n = { v: 0 };
  tl.to("#c-cont", { opacity: 1, duration: 0.3 });
  $$(".rede", node).forEach((r, i) =>
    tl.to(r, { opacity: 1, color: "#EEF3FF", borderColor: getComputedStyle(r).getPropertyValue("--c").trim(), duration: 0.2 }, `>-0.08`));
  tl.to(n, { v: 12, duration: 12 * 0.12, ease: "none", onUpdate: () => ($("#c-cont b").textContent = Math.round(n.v)) }, "<-1.3");
  passo();
});

// ================= 2c. Grupo e infográfico =================
secao("grupo", (tl, node, passo) => {
  tl.fromTo("#g-estudo", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" })
    .fromTo("#g-info", { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }, "<0.15")
    .fromTo("#g-raio", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" });
  passo();
});

// ================= 2d. O carrossel =================
secao("carrossel", (tl, node, passo) => {
  const trilho = $("#k-trilho"), pontos = $("#k-pontos");
  for (let i = 1; i <= 8; i++) {
    trilho.insertAdjacentHTML("beforeend", `<img src="assets/carrossel/slide-${i}.png" alt="Slide ${i} do carrossel">`);
    pontos.insertAdjacentHTML("beforeend", "<i></i>");
  }
  let at = 0;
  const poe = n => {
    at = Math.max(0, Math.min(7, n));
    trilho.style.transform = `translateX(${-at * 600}px)`;
    $("#k-cont").textContent = at + 1 + "/8";
    $$("i", pontos).forEach((p, i) => p.classList.toggle("on", i === at));
  };
  $("#k-ant").onclick = e => { e.stopPropagation(); poe(at - 1); };
  $("#k-prox").onclick = e => { e.stopPropagation(); poe(at + 1); };
  poe(0);
  tl.fromTo("#k-insta", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" })
    .fromTo("#k-qr", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, "<0.15");
  passo();
});

// ================= 2e. Recapitulação =================
secao("recap", (tl, node, passo, s) => {
  const svg = $("#r-grafo"), G = grafo(svg, true);
  const todos = [...$$(".gr", svg), ...Object.values(G.lig)];
  const leg = legendas($("#r-leg"), [
    "<em>1</em> pregação",
    "<em>3</em> cortes em <em>4</em> redes: <em>12</em> postagens",
    "<em>1</em> estudo bíblico, enviado sozinho aos grupos",
    "<em>1</em> resumo, postado no grupo de avisos automaticamente",
    "<em>1</em> carrossel para quem ainda não é crente",
    "Tudo conectado à equipe de visita e à igreja local",
  ]);
  const realce = (gs, ls) => {
    const on = [...gs.map(g => G[g]), ...ls.map(l => G.lig[l])];
    tl.to(todos.filter(x => !on.includes(x)), { opacity: 0.12, duration: 0.4 }, ">-0.2")
      .to(on, { opacity: 1, duration: 0.4 }, "<");
  };
  tl.fromTo(svg, { opacity: 0 }, { opacity: 1, duration: 0.6 }); troca(tl, leg, 0, "<"); realce(["P", "Y"], ["PY"]); passo();
  troca(tl, leg, 1); realce(["C", "N", "T"], Object.keys(G.lig).filter(k => /^(C\dN\d|TC\d)$/.test(k))); passo();
  troca(tl, leg, 2); realce(["E", "L", "T"], ["TE", "EL"]); passo();
  troca(tl, leg, 3); realce(["I", "R", "S", "A", "T"], ["TI", "IS", "IA"]); passo();
  troca(tl, leg, 4); realce(["K", "X", "T"], ["TK", "KN"]); passo();
  troca(tl, leg, 5); tl.to(todos, { opacity: 1, duration: 0.5 }, "<"); passo();
  const fluxo = corrente(svg, G);
  s.on = k => (k === 5 ? fluxo.play() : fluxo.pause(0));
  s.sai = () => fluxo.pause(0);
});

// ================= 2f. Fechamento =================
secao("fecho", (tl, node, passo) => {
  tl.fromTo("#fe-a", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
    .fromTo("#fe-b", { opacity: 0, scale: 0.8, transformOrigin: "0% 50%" }, { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, "-=0.1");
  passo();
  tl.fromTo("#fe-c", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" });
  passo();
});

// ================= 3. A régua =================
const COLS = 40, LINS = 10, X0 = 290, DX = 38; // a multidão começa depois do pregador
const grupoDe = c => (c < 4 ? 0 : c < 16 ? 1 : 2); // 1/10, 3/10, 6/10
secao("regua", (tl, node, passo) => {
  const svg = $("#rg-mundo");
  const pontos = [[], [], []];
  for (let c = 0; c < COLS; c++) for (let r = 0; r < LINS; r++) {
    const p = el("circle", { cx: X0 + c * DX, cy: 360 + r * 38, r: 10, fill: "#2A3350", opacity: 0 }, svg);
    pontos[grupoDe(c)].push(p);
  }
  const blocos = [["Crentes", 0, 4, "#35F0FF"], ["Sensibilizados", 4, 16, "#9B7BFF"], ["Não conhecem a Cristo", 16, 40, "#EEF3FF"]];
  const regua = blocos.map(([t, a, b, cor]) => {
    const g = el("g", { opacity: 0 }, svg);
    const x1 = X0 - 18 + a * DX, x2 = X0 - 18 + b * DX - 8;
    el("rect", { x: x1, y: 760, width: x2 - x1, height: 14, rx: 7, fill: cor, opacity: 0.35, class: "barra-regua" }, g);
    const e = el("text", { x: x1, y: 830, fill: cor, "font-family": "Manrope", "font-weight": 800, "font-size": 32 }, g);
    e.textContent = t;
    return g;
  });
  // o pregador fala desde o começo da dobra: ondas que avançam em direção à multidão
  const ondas = el("g", { opacity: 0, transform: "translate(200 531)" }, svg);
  [0, 1, 2].forEach(i => el("path", { d: "M0 -46 A70 70 0 0 1 0 46", fill: "none", stroke: "#35F0FF", "stroke-width": 4, "stroke-linecap": "round", class: "avanca", style: `animation-delay:${i * 0.6}s` }, ondas));

  tl.fromTo("#rg-preg", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6 })
    .to(ondas, { opacity: 1, duration: 0.4 }, "<0.3")
    .fromTo("#rg-tit", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }, "<");
  passo();
  tl.to("#rg-tit", { y: -420, scale: 0.42, duration: 0.7, ease: "power2.inOut" })
    .fromTo("#rg-perg", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
  passo();
  tl.to([...pontos[0], ...pontos[1], ...pontos[2]], { opacity: 1, duration: 0.3, stagger: { each: 0.002, from: "start" } })
    .to(regua, { opacity: 1, duration: 0.4, stagger: 0.15 }, "-=0.4");
  passo();
  tl.to(pontos[0], { fill: "#35F0FF", attr: { r: 12 }, duration: 0.4, stagger: 0.01 })
    .to(regua[0].querySelector("rect"), { opacity: 1, duration: 0.3 }, "<");
  passo();
  const alguns = pontos[1].filter(() => rnd() < 0.65);
  tl.to(alguns, { fill: "#9B7BFF", duration: 0.4, stagger: 0.008 })
    .to(regua[1].querySelector("rect"), { opacity: 1, duration: 0.3 }, "<");
  passo();
  tl.to(pontos[2], { fill: "#3A4466", duration: 0.4 })
    .to(regua[2].querySelector("rect"), { opacity: 1, duration: 0.3 }, "<")
    .fromTo(regua[2], { scale: 1, transformOrigin: "0% 50%" }, { scale: 1.08, duration: 0.5, ease: "back.out(2)" }, "<")
    .fromTo("#rg-rod", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
  passo();
});

// ================= 4. Meu foco (aqui começa a Missão Digital) =================
secao("foco", (tl, node, passo, s) => {
  const svg = $("#fo-mundo");
  const pts = [];
  for (let c = 16; c < COLS; c++) for (let r = 0; r < LINS; r++) {
    const x0 = X0 + c * DX, y0 = 360 + r * 38;
    const p = el("circle", { cx: x0, cy: y0, r: 10, fill: "#3A4466" }, svg);
    pts.push({ p, x0, y0, x1: 60 + rnd() * 1800, y1: 60 + rnd() * 960 });
  }
  // onde a pessoa está: no jogo, na internet
  const jogo = el("image", { href: "assets/img/controle-laranja-3d.webp", x: 1030, y: 480, width: 160, height: 160, opacity: 0 }, svg);
  const eu = pts[117].p; // um ponto, uma pessoa
  const caminho = linha("M1200 560 C1270 560 1250 660 1345 690 C1450 720 1560 700 1680 690", "", svg);
  caminho.setAttribute("fill", "none"); caminho.setAttribute("stroke", "#FE7003"); caminho.setAttribute("stroke-width", 4);
  caminho.setAttribute("stroke-dasharray", "1");
  tl.fromTo("#foco .grade", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0)
    .to(pts.map(o => o.p), { attr: { cx: i => pts[i].x1, cy: i => pts[i].y1 }, fill: "#4a4a4a", opacity: 0.6, duration: 1.2, ease: "power2.inOut" }, 0)
    .to(eu, { attr: { cx: 1200, cy: 560, r: 18 }, fill: "#FE7003", opacity: 1, duration: 1.2, ease: "power2.inOut" }, 0)
    .fromTo(jogo, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, 0.8)
    .fromTo("#fo-a", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
  passo();
  const viaja = { t: 0 }, L = caminho.getTotalLength();
  tl.fromTo("#fo-b", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
    .to(pts.filter(o => o.p !== eu).map(o => o.p), { opacity: 0.25, duration: 0.5 }, "<")
    .fromTo("#fo-chat", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" })
    .fromTo("#fo-igreja", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, "<0.2")
    .to(caminho, { strokeDashoffset: 0, duration: 1.4, ease: "power1.inOut" })
    .to(viaja, { t: 1, duration: 1.4, ease: "power1.inOut", onUpdate: () => { const q = caminho.getPointAtLength(viaja.t * L); eu.setAttribute("cx", q.x); eu.setAttribute("cy", q.y); } }, "<");
  passo();
  tl.to([...pts.map(o => o.p), caminho], { opacity: 0, duration: 0.4 })
    .to(["#fo-chat", "#fo-igreja", jogo], { opacity: 0.15, duration: 0.4 }, "<")
    .fromTo("#fo-frentes", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 })
    .from("#fo-frentes span", { opacity: 0, y: 20, stagger: 0.15, duration: 0.4 }, "-=0.2");
  passo();
  // depois da primeira viagem, outras pessoas seguem o mesmo caminho, em loop
  const bolas = [0, 1].map(() => el("circle", { r: 14, fill: "#FFAC13", opacity: 0 }, svg));
  const loop = gsap.timeline({ repeat: -1, paused: true });
  bolas.forEach((b, n) => {
    const o = { t: 0 };
    loop.fromTo(o, { t: 0 }, { t: 1, duration: 2.4, ease: "power1.inOut", onUpdate: () => {
      const q = caminho.getPointAtLength(o.t * L);
      b.setAttribute("cx", q.x); b.setAttribute("cy", q.y);
      b.setAttribute("opacity", o.t > 0.02 && o.t < 0.97 ? 1 : 0);
    } }, 1.6 + n * 1.4); // espera a primeira viagem terminar
  });
  s.on = k => (k === 1 ? loop.play() : loop.pause(0));
  s.sai = () => loop.pause(0);
});

// ================= 5. Gank =================
secao("gank", (tl, node, passo) => {
  const leg = legendas($("#gk-leg"), [
    "A igreja entra junta na live de alguém.",
    "Um culto jovem: 15, 20, 30 pessoas com o celular na mão.",
    "Todos entram ao mesmo tempo.",
    "Quem está transmitindo se emociona.",
    "E ouve por que estamos ali.",
    "", // na foto e no vídeo, a tela fica para eles
  ]);
  const chat = $("#gk-chat");
  const msg = (nome, cor, t) => `<p><b style="color:${cor}">${nome}</b>${t}</p>`;
  chat.innerHTML = msg("lucas_77", "#9AA0FF", "joga muito") + msg("gab", "#7CE0A8", "kkkk") + msg("rafa.mt", "#FFB86B", "gg");
  const novas = [["ana.b", "boa noite!!"], ["joao_pedro", "chegamos ❤"], ["bia", "que live boa"], ["mateus", "salve salve"], ["dani", "❤❤❤"], ["pr.leo", "Deus te abençoe!"], ["carol", "tamo junto"], ["igor", "primeira vez aqui"], ["lia", "❤"], ["davi", "boa noite!"], ["sara", "que massa"], ["tiago", "❤❤"]];
  const cores = ["#B388FF", "#FFAC13", "#7CE0A8", "#FF8FB1", "#8FD3FF"];
  novas.forEach(([n, t], i) => chat.insertAdjacentHTML("beforeend", msg(n, cores[i % 5], t)));
  const ps = $$("p", chat).slice(3);
  gsap.set(ps, { height: 0, opacity: 0 });
  const jov = $("#gk-jovens");
  const pessoa = `<span class="pj"><svg viewBox="0 0 38 54"><circle cx="19" cy="9" r="8" fill="#FFAC13"/><path d="M4 54c0-18 6-28 15-28s15 10 15 28z" fill="#FE7003"/><rect x="24" y="30" width="10" height="16" rx="2" fill="#fff"/></svg></span>`;
  jov.innerHTML = pessoa.repeat(24);
  const figs = $$(".pj", jov);
  const views = { v: 4 };

  tl.fromTo("#gk-stream", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }); troca(tl, leg, 0, "<"); passo();
  troca(tl, leg, 1); tl.to(figs, { opacity: 1, duration: 0.25, stagger: 0.03 }, "<"); passo();
  troca(tl, leg, 2);
  tl.to(figs, { x: (i) => 1670 - (720 + figs[i].offsetLeft), y: (i) => 450 - (800 + figs[i].offsetTop), scale: 0.3, opacity: 0, duration: 0.8, stagger: 0.03, ease: "power2.in" }, "<")
    .to(views, { v: 31, duration: 1.2, onUpdate: () => ($("#gk-views").textContent = Math.round(views.v)) }, "<0.3")
    .to(ps, { height: "auto", opacity: 1, duration: 0.15, stagger: 0.09 }, "<");
  passo();
  troca(tl, leg, 3);
  tl.to("#gk-cam", { boxShadow: "0 0 40px #B388FF", borderColor: "#fff", duration: 0.4 }, "<")
    .fromTo("#gk-fala", { opacity: 0, scale: 0.6, transformOrigin: "100% 100%" }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" });
  passo();
  troca(tl, leg, 4);
  tl.fromTo("#gk-msg", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "<");
  passo();
  troca(tl, leg, 5);
  tl.to(["#gk-stream", "#gk-msg"], { opacity: 0, duration: 0.4 }, "<")
    .fromTo("#gk-real", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 });
  passo();
});

// ================= 6. Nínive Digital =================
secao("ninive", (tl, node, passo, s) => {
  const svg = $("#nv-mapa");
  el("rect", { x: 0, y: 0, width: 1100, height: 760, rx: 26, fill: "#191919", stroke: "#3a3a3a", "stroke-width": 2 }, svg);
  el("path", { d: "M0 520 C180 470 260 600 420 560 S700 640 760 760 H0 Z", fill: "#14202b" }, svg); // água
  el("path", { d: "M640 0 C620 120 760 160 860 140 S1040 60 1100 90 V0 Z", fill: "#1d281d" }, svg); // mata
  el("path", { d: "M80 120 C300 160 380 300 560 330 S900 420 1040 620", fill: "none", stroke: "#2c2c2c", "stroke-width": 26, "stroke-linecap": "round" }, svg); // estrada
  el("circle", { cx: 560, cy: 330, r: 110, fill: "none", stroke: "#FFD74033", "stroke-width": 2, "stroke-dasharray": "8 8" }, svg);
  const cid = el("text", { x: 560, y: 210, "text-anchor": "middle", fill: "#FFD740", "font-family": "Montserrat", "font-weight": 800, "font-size": 20, opacity: 0.8 }, svg);
  cid.textContent = "cidade";
  const players = [];
  for (let i = 0; i < 34; i++) {
    const x = 70 + rnd() * 960, y = 60 + rnd() * 640;
    players.push([x, y]);
    el("circle", { cx: x, cy: y, r: 9, fill: "#E8E8E8", class: "vaga", style: `animation-delay:${-rnd() * 4}s` }, svg);
  }
  const portal = el("g", { opacity: 0 }, svg);
  el("circle", { cx: 70, cy: 690, r: 46, fill: "none", stroke: "#FFD740", "stroke-width": 4, class: "gira" , "stroke-dasharray": "20 10" }, portal);
  const time = [], baloes = [];
  for (let i = 0; i < 12; i++) {
    const [px, py] = players[i * 2 + 1];
    const t = el("circle", { cx: 70, cy: 690, r: 10, fill: "#FFD740", opacity: 0 }, svg);
    time.push([t, px + 22, py - 6]);
    const b = el("g", { opacity: 0, transform: `translate(${px + 8} ${py - 46})` }, svg);
    el("rect", { x: -4, y: -20, width: 46, height: 30, rx: 10, fill: "#fff" }, b);
    const tx = el("text", { x: 19, y: 2, "text-anchor": "middle", fill: "#111", "font-family": "Montserrat", "font-weight": 900, "font-size": 18 }, b);
    tx.textContent = "…";
    const cruz = el("path", { d: "M19 -14 V6 M11 -6 H27", stroke: "#FE7003", "stroke-width": 4, "stroke-linecap": "round", opacity: 0 }, b);
    baloes.push([b, tx, cruz]);
  }
  const leg = legendas($("#nv-leg"), [
    "Muitas igrejas, um fim de semana, um jogo.",
    "Entramos juntos e encontramos quem joga.",
    "Na amizade, apresentamos Cristo.",
    "Agora, no Aion.",
    "Depoimento do segundo dia de jogo.",
  ]);
  tl.fromTo(svg, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.6 }); troca(tl, leg, 0, "<"); passo();
  troca(tl, leg, 1); tl.to(portal, { opacity: 1, duration: 0.3 }, "<");
  time.forEach(([t, x, y], i) => tl.to(t, { opacity: 1, attr: { cx: x, cy: y }, duration: 0.9, ease: "power2.inOut" }, i ? "<0.06" : ">"));
  passo();
  troca(tl, leg, 2);
  baloes.forEach(([b], i) => tl.to(b, { opacity: 1, duration: 0.25 }, i ? "<0.05" : "<"));
  baloes.forEach(([b, tx, cruz], i) => tl.to(tx, { opacity: 0, duration: 0.15 }, i ? "<0.05" : ">0.3").to(cruz, { opacity: 1, duration: 0.15 }, "<"));
  passo();
  troca(tl, leg, 3); tl.fromTo("#nv-video", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "<"); passo();
  troca(tl, leg, 4);
  tl.to(svg, { opacity: 0, duration: 0.4 }, "<").fromTo("#nv-audio", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 });
  passo();

  // áudio: ondas que andam com o tempo e trechos que aparecem na hora da fala
  // ponytail: tempos tirados do Whisper num áudio ruidoso; conferir ouvindo
  const audio = $("audio", node), ondas = $("#nv-ondas"), trecho = $("#nv-trecho");
  const N = 90;
  ondas.innerHTML = Array.from({ length: N }, () => `<i style="height:${20 + rnd() * 80}%"></i>`).join("");
  const barras = $$("i", ondas);
  const TRECHOS = [[6, "Conheci ele faz um tempo. A gente joga junto."], [24.5, "Ficou só eu e ele."], [27, "Ele tava meio triste."], [33, "Conversei um pouquinho com ele."], [37.5, "Orei com ele."], [41, "Acabou a oração, ele tava chorando."], [50, "O privilégio de falar do amor de Deus através dos games."]];
  audio.addEventListener("timeupdate", () => {
    const t = audio.currentTime, f = t / (audio.duration || 61);
    barras.forEach((b, i) => b.classList.toggle("pass", i / N <= f));
    const atual = TRECHOS.filter(x => x[0] <= t).pop();
    const novo = atual ? atual[1] : "";
    if (trecho.textContent !== novo) { trecho.textContent = novo; gsap.fromTo(trecho, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }); }
  });
  const bt = $("#nv-play");
  bt.onclick = e => { e.stopPropagation(); audio.paused ? (audio.play(), $$("video").forEach(v => v.pause())) : audio.pause(); };
  // controle: recomeçar do zero e clicar nas ondas para pular para aquele ponto
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  audio.addEventListener("timeupdate", () => ($("#nv-tempo").textContent = `${mmss(audio.currentTime)} / ${mmss(audio.duration || 61)}`));
  $("#nv-zero").onclick = e => { e.stopPropagation(); audio.currentTime = 0; audio.play(); };
  ondas.addEventListener("click", e => {
    e.stopPropagation();
    const r = ondas.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * (audio.duration || 61);
  });
  audio.addEventListener("play", () => bt.classList.add("on"));
  audio.addEventListener("pause", () => bt.classList.remove("on"));
});

// ================= 7. Conteúdo com jogos =================
secao("conteudo", (tl, node, passo) => {
  const svg = $("#ct-trilha");
  const X = [220, 590, 960, 1330, 1700], Y = 80;
  const segs = X.slice(1).map((x, i) => linha(`M${X[i] + 56} ${Y} H${x - 56}`, "", svg));
  segs.forEach(p => { p.setAttribute("stroke", "#FE7003"); p.setAttribute("stroke-width", 4); p.setAttribute("fill", "none"); });
  const nomes = ["O jogo que ele ama", "Imersão na história", "Jesus", "Comentários", "Grupo no WhatsApp"];
  const est = X.map((x, i) => {
    const g = el("g", { opacity: 0 }, svg);
    el("circle", { cx: x, cy: Y, r: 54, fill: "#2a2a2a", stroke: i === 2 ? "#FFAC13" : "#FE7003", "stroke-width": i === 2 ? 6 : 3 }, g);
    const t = el("text", { x, y: Y + 98 }, g); t.textContent = nomes[i];
    return g;
  });
  el("image", { href: "assets/img/controle-laranja-3d.webp", x: X[0] - 40, y: Y - 40, width: 80, height: 80 }, est[0]);
  el("clipPath", { id: "cp-blas" }, svg).appendChild(el("circle", { cx: X[1], cy: Y, r: 48 }));
  el("image", { href: "assets/img/blas-thumb.png", x: X[1] - 48, y: Y - 85, width: 96, height: 171, "clip-path": "url(#cp-blas)", preserveAspectRatio: "xMidYMid slice" }, est[1]);
  el("path", { d: `M${X[2]} ${Y - 32} V${Y + 32} M${X[2] - 22} ${Y - 12} H${X[2] + 22}`, stroke: "#FFAC13", "stroke-width": 9, "stroke-linecap": "round" }, est[2]);
  el("image", { href: "assets/img/balao-chat-laranja-3d.webp", x: X[3] - 38, y: Y - 38, width: 76, height: 76 }, est[3]);
  el("path", { d: `M${X[4]} ${Y - 30} a30 30 0 0 0 -26 45 l-5 16 17 -5 a30 30 0 1 0 14 -56z`, fill: "#25D366" }, est[4]);
  const ns = $$(".numeros b.vis", node).map(b => ({ b, v: 0, alvo: +b.dataset.n }));

  tl.to(est[0], { opacity: 1, duration: 0.4 })
    .to(segs[0], desenha).to(est[1], { opacity: 1, duration: 0.4 }, "-=0.2")
    .fromTo("#ct-video", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "<")
    .fromTo("#ct-num", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "<0.2");
  ns.forEach(o => tl.to(o, { v: o.alvo, duration: 1.2, ease: "power2.out", onUpdate: () => (o.b.textContent = (+o.v).toFixed(1).replace(".", ",")) }, "<"));
  passo();
  tl.to(segs[1], desenha).fromTo(est[2], { opacity: 0, scale: 0.6, transformOrigin: "50% 40%" }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, "-=0.2");
  passo();
  tl.to(segs[2], desenha).to(est[3], { opacity: 1, duration: 0.4 }, "-=0.2")
    .fromTo("#ct-coments img", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.25, ease: "power2.out" });
  passo();
  tl.to(segs[3], desenha).to(est[4], { opacity: 1, duration: 0.4 }, "-=0.2")
    .fromTo("#ct-zap", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, "<")
    .to("#ct-coments img", { x: 30, opacity: 0.55, duration: 0.5, stagger: 0.08 }, "<");
  passo();
});

// ================= 8. Agradecimento =================
secao("fim", (tl, node, passo) => {
  tl.fromTo("#fim-obg", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" })
    .fromTo("#fim-nomes", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
  passo();
});

// abre na seção do endereço (#n) ou na primeira
const h = parseInt(location.hash.slice(1), 10);
entra(h >= 1 && h <= secs.length ? h - 1 : 0, 0);

// no tablet, arrastar o dedo sobre uma imagem iniciava o "arrastar imagem" nativo, que engolia os toques seguintes
$$("img").forEach(i => (i.draggable = false));
addEventListener("dragstart", e => e.preventDefault());

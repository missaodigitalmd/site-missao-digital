// Abertura em 3D: a mesa do pastor coberta pela semana (ato 1) e a igreja que se organiza como em Atos 6 (ato 2).
// O app.js chama ABERTURA.ato(1) e ABERTURA.ato(2) quando as cenas i1 e i2 entram. Desenho: ../desenho-pagina.md, rodada 4.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const gsap = window.gsap;
const vista = document.getElementById("v-inicio");
const canvas = document.getElementById("ab-canvas");
const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
// aleatório com semente: a mesa sai igual a cada abertura
let semente = 7;
const rnd = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646;
const entre = (a, b) => a + rnd() * (b - a);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (e) {
  document.body.classList.add("sem3d");
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const FUNDO = new THREE.Color("#15120e");
const scene = new THREE.Scene();
scene.background = FUNDO;
scene.fog = new THREE.FogExp2(FUNDO, 0.045);
const camera = new THREE.PerspectiveCamera(38, 16 / 10, 0.1, 80);
scene.add(camera);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 320), 0.6, 0.38, 1.0);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ================= texturas desenhadas em canvas =================
const tela = (w, h, desenha) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  desenha(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
};
const quebra = (ctx, texto, larg) => {
  const linhas = []; let atual = "";
  texto.split(" ").forEach(p => { const t = atual ? atual + " " + p : p; if (ctx.measureText(t).width > larg && atual) { linhas.push(atual); atual = p; } else atual = t; });
  linhas.push(atual); return linhas;
};
const madeira = tela(1024, 1024, (g, w, h) => {
  g.fillStyle = "#5a3a22"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    const y = rnd() * h, a = .03 + rnd() * .07;
    g.strokeStyle = rnd() > .5 ? `rgba(70,44,26,${a})` : `rgba(10,6,3,${a * 1.4})`;
    g.lineWidth = 1 + rnd() * 5; g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= w; x += 64) g.lineTo(x, y + Math.sin(x / 140 + i) * 6 + (rnd() - .5) * 3);
    g.stroke();
  }
});
madeira.wrapS = madeira.wrapT = THREE.RepeatWrapping; madeira.repeat.set(2, 1.4);
const pagina = tela(512, 700, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#efe2c4"); gr.addColorStop(1, "#f7eedb");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(60,40,20,.55)";
  for (let col = 0; col < 2; col++) for (let y = 70; y < h - 50; y += 17) {
    const x0 = 46 + col * 222, larg = 190 - (rnd() < .12 ? 70 : 0);
    if (rnd() < .04) continue;
    g.fillRect(x0, y, larg, 6);
  }
  g.fillStyle = "rgba(150,40,30,.8)"; g.font = "800 30px Georgia, serif"; g.fillText("6", 46, 52); g.fillText("ATOS", 360, 40);
});
const disco = tela(128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.25, "rgba(255,220,170,.55)"); gr.addColorStop(1, "rgba(255,180,90,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const raio = tela(64, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, h, 0, 0);
  gr.addColorStop(0, "rgba(255,214,150,0)"); gr.addColorStop(.08, "rgba(255,214,150,.9)"); gr.addColorStop(1, "rgba(255,170,60,0)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
const rotulo = (texto, cor = "#f2ede7", tam = 64) => tela(512, 128, (g, w, h) => {
  g.font = `800 ${tam}px Montserrat, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = cor; g.fillText(texto, w / 2, h / 2);
});

// ================= a mesa =================
const mesa = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), new THREE.MeshStandardMaterial({ map: madeira, roughness: .5, metalness: 0, color: "#ffffff" }));
mesa.rotation.x = -Math.PI / 2; mesa.receiveShadow = true; scene.add(mesa);

// a Bíblia aberta em Atos 6
const biblia = new THREE.Group(); scene.add(biblia);
const capa = new THREE.Mesh(new THREE.BoxGeometry(2.7, .12, 1.86), new THREE.MeshStandardMaterial({ color: "#3a1c15", roughness: .55 }));
capa.position.y = .06; capa.castShadow = capa.receiveShadow = true; biblia.add(capa);
const matPag = new THREE.MeshStandardMaterial({ map: pagina, emissiveMap: pagina, emissive: new THREE.Color("#ffc27a"), emissiveIntensity: .45, roughness: .9 });
[-1, 1].forEach(lado => {
  const geo = new THREE.PlaneGeometry(1.26, 1.72, 28, 1);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), u = (x + .63) / 1.26, s = lado < 0 ? 1 - u : u; p.setY(i, .2 + Math.sin(s * Math.PI * .5) * .1 - s * s * .06); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, matPag); m.position.x = lado * .64; m.receiveShadow = true; biblia.add(m);
});
const fita = new THREE.Mesh(new THREE.BoxGeometry(.05, .01, 1.2), new THREE.MeshStandardMaterial({ color: "#8e1d1d", roughness: .6 }));
fita.position.set(.15, .31, .45); fita.rotation.y = .15; biblia.add(fita);
biblia.rotation.y = -.08;

// o abajur
const abajur = new THREE.Group(); scene.add(abajur); abajur.position.set(-3.1, 0, -1.5);
const metal = new THREE.MeshStandardMaterial({ color: "#2b2b2b", roughness: .35, metalness: .8 });
const base = new THREE.Mesh(new THREE.CylinderGeometry(.42, .5, .1, 32), metal); base.position.y = .05; base.castShadow = true; abajur.add(base);
const haste = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 2.6, 12), metal); haste.position.set(.35, 1.25, .15); haste.rotation.z = -.28; haste.castShadow = true; abajur.add(haste);
const cupula = new THREE.Mesh(new THREE.ConeGeometry(.55, .7, 32, 1, true), new THREE.MeshStandardMaterial({ color: "#c46a16", roughness: .4, metalness: .3, side: THREE.DoubleSide }));
cupula.position.set(.95, 2.5, .45); cupula.rotation.z = .9; abajur.add(cupula);
const lampada = new THREE.Mesh(new THREE.SphereGeometry(.16, 16, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 2.6, 1.3) }));
lampada.position.set(1.12, 2.32, .52); abajur.add(lampada);
const foco = new THREE.SpotLight("#ffb766", 24, 16, .8, .8, 1.4);
foco.position.set(-2.0, 2.3, -.95); foco.target.position.set(.1, 0, .1);
foco.castShadow = true; foco.shadow.mapSize.set(1024, 1024); foco.shadow.bias = -.0004; foco.shadow.radius = 4;
scene.add(foco, foco.target);
scene.add(new THREE.HemisphereLight("#6b7aa6", "#2a1a10", .35));
const recorte = new THREE.DirectionalLight("#8aa0ff", .55); recorte.position.set(4, 5, -6); scene.add(recorte);
const luzBiblia = new THREE.PointLight("#ffbf70", 1.5, 5, 1.8); luzBiblia.position.set(0, .9, .1); scene.add(luzBiblia);

// segundo plano: a parede e a janela com as luzes da cidade, desfocadas pela distância
const parede = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), new THREE.MeshStandardMaterial({ color: "#2a2018", roughness: 1 }));
parede.position.set(0, 5, -9); scene.add(parede);
const janela = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.4), new THREE.MeshBasicMaterial({ color: "#0c1220" }));
janela.position.set(3.2, 4.2, -8.95); scene.add(janela);
const cidade = Array.from({ length: 46 }, (_, i) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: disco, color: ["#ffb35c", "#ffd9a0", "#7fa0ff", "#ff8a3c"][i % 4], transparent: true, opacity: entre(.25, .7), blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  s.position.set(3.2 + entre(-3.3, 3.3), 2.3 + Math.pow(rnd(), 2) * 2.2, -8.9); s.scale.setScalar(entre(.18, .55)); s.userData.f = entre(0, 6); scene.add(s); return s;
});
const caixilho = new THREE.MeshStandardMaterial({ color: "#1a140f", roughness: .8 });
[[3.2, 4.2, 7.2, .12], [3.2, 4.2, .12, 4.6], [3.2, 6.45, 7.2, .14], [3.2, 1.95, 7.2, .14]].forEach(([x, y, w, h]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), caixilho); m.position.set(x, y, -8.9); scene.add(m); });

// a xícara e o celular
const celular = new THREE.Group(); celular.position.set(2.05, .025, 1.05); celular.rotation.y = -.35; scene.add(celular);
const corpo = new THREE.Mesh(new THREE.BoxGeometry(.56, .05, 1.1), new THREE.MeshStandardMaterial({ color: "#111", roughness: .3, metalness: .6 })); corpo.castShadow = true; celular.add(corpo);
// a tela bloqueada, cheia de notificações
const texCel = tela(256, 520, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#2a2140"); gr.addColorStop(1, "#140f1c"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = "#fff"; g.font = "700 64px Montserrat, sans-serif"; g.textAlign = "center"; g.fillText("22:47", w / 2, 110);
  ["Grupo da igreja · 214", "Secretaria · arte?", "Líder do louvor", "Visitante · domingo", "Conselho · ata"].forEach((t, i) => {
    g.fillStyle = "rgba(255,255,255,.16)"; g.beginPath(); g.roundRect(14, 160 + i * 66, w - 28, 54, 14); g.fill();
    g.fillStyle = "#fff"; g.font = "700 19px Montserrat, sans-serif"; g.textAlign = "left"; g.fillText(t, 28, 193 + i * 66);
  });
});
const telaCel = new THREE.Mesh(new THREE.PlaneGeometry(.5, 1.02), new THREE.MeshBasicMaterial({ map: texCel, color: "#222" }));
telaCel.rotation.x = -Math.PI / 2; telaCel.position.y = .027; celular.add(telaCel);
const brilhoCel = { v: 0 };

// ================= os bilhetes da semana =================
// [texto, dia, ministério que recebe no ato 2]; os quatro "fica" são do pastor e caem primeiro, no fundo da pilha
const FICA = ["pregar", "orar", "visitar", "aconselhar"];
const TAREFAS = [
  ["arte do congresso", "seg", "com"], ["ata do conselho", "seg", "gov"], ["responder o visitante", "seg", "cui"], ["cobrar o orçamento", "ter", "gov"],
  ["post da semana", "ter", "com"], ["aula da EBD", "ter", "ens"], ["página de inscrição", "ter", "com"], ["boletim de domingo", "qua", "com"],
  ["orçamento do acampamento", "qua", "jos"], ["214 mensagens no grupo", "qua", "cui"], ["cortes do culto", "qua", "pal"], ["convite do aniversário", "qui", "com"],
  ["slides da EBD", "qui", "ens"], ["rol de membros", "qui", "gov"], ["legenda do Instagram", "qui", "com"], ["reunião de pais", "sex", "ens"],
  ["agenda do mês", "sex", "gov"], ["story do culto jovem", "sex", "com"], ["planejar o congresso", "sex", "jos"], ["pedido de oração da Dona Cida", "sáb", "cui"],
  ["reservar o salão", "sáb", "gov"], ["estudo do grupo", "sáb", "pal"], ["aniversariantes do mês", "seg", "cui"], ["resumo do sermão", "ter", "pal"],
  ["inscrições pendentes", "qua", "jos"], ["foto do batismo", "qui", "com"], ["e-mail da denominação", "sex", "gov"], ["trilha dos adolescentes", "sáb", "ens"],
  ["visitante de domingo sem retorno", "seg", "cui"], ["banner da fachada", "ter", "com"], ["devocional da semana", "qua", "pal"], ["reforma do salão", "qui", "gov"],
];
const PAPEL = ["#f5ecd6", "#ffe48a", "#ffd2a6", "#f2f2ea", "#d9ecff", "#ffe48a"];
const geoBilhete = (() => {
  const g = new THREE.PlaneGeometry(.92, .7, 8, 1); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / .46; p.setY(i, .022 * x * x); }
  g.computeVertexNormals(); return g;
})();
function texBilhete(texto, dia, papel, ouro) {
  return tela(512, 390, (g, w, h) => {
    g.fillStyle = papel; g.fillRect(0, 0, w, h);
    const sombra = g.createLinearGradient(0, 0, 0, h); sombra.addColorStop(0, "rgba(255,255,255,.18)"); sombra.addColorStop(1, "rgba(0,0,0,.12)");
    g.fillStyle = sombra; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(w / 2 - 70, 0, 140, 34);
    g.fillStyle = ouro ? "#8a4b00" : "#c2410c"; g.font = "800 34px Montserrat, sans-serif"; g.fillText(ouro ? "do pastor" : dia, 34, 80);
    // a palavra mais longa precisa caber na largura do bilhete
    let fs = ouro ? 96 : 58; g.font = `800 ${fs}px Montserrat, sans-serif`;
    while (Math.max(...texto.split(" ").map(p => g.measureText(p).width)) > w - 68) { fs -= 4; g.font = `800 ${fs}px Montserrat, sans-serif`; }
    g.fillStyle = "#2a2420";
    const linhas = quebra(g, texto, w - 68), lh = fs * 1.08;
    linhas.forEach((l, i) => g.fillText(l, 34, (ouro ? 200 : 160) + i * lh));
    g.strokeStyle = "rgba(0,0,0,.08)"; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
  });
}
const bilhetes = [];
const novoBilhete = (texto, dia, min, fica) => {
  // os do pastor parecem bilhetes comuns no ato 1; só viram ouro quando a semana sai de cima deles
  const tex = texBilhete(texto, fica ? "seg" : dia, PAPEL[bilhetes.length % PAPEL.length], false);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: .85, side: THREE.DoubleSide, emissive: new THREE.Color(fica ? "#ffb347" : "#ffffff"), emissiveMap: tex, emissiveIntensity: 0 });
  const m = new THREE.Mesh(geoBilhete, mat); m.castShadow = true; m.receiveShadow = true; m.rotation.order = "YXZ"; m.visible = false; scene.add(m);
  const b = { m, min, fica, pouso: null, cai: null, comum: tex, ouro: fica ? texBilhete(texto, dia, "#ffe2a0", true) : null };
  bilhetes.push(b); return b;
};
FICA.forEach(t => novoBilhete(t, "", null, true));
TAREFAS.forEach(([t, d, min]) => novoBilhete(t, d, min, false));
TAREFAS.slice(0, 22).forEach(([t, d, min]) => novoBilhete(t, ["sex", "sáb", "seg"][bilhetes.length % 3], min, false)); // a semana se repete
// onde cada um pousa: a pilha cresce sobre a Bíblia e transborda
bilhetes.forEach((b, i) => {
  const r = i < 4 ? .3 : .4 + Math.min(1.25, i / 34), a = rnd() * Math.PI * 2;
  b.pouso = { x: Math.cos(a) * r * entre(.3, 1) * 1.2, y: .26 + i * .016, z: Math.sin(a) * r * entre(.3, 1) * .75, ry: entre(-.7, .7), rx: entre(-.05, .05) };
  b.cai = { x: b.pouso.x + entre(-3, 3), y: entre(4.5, 6.5), z: b.pouso.z + entre(-2, 1), ry: entre(-3, 3), rx: entre(-1.2, 1.2) };
});

// ================= o organograma do ato 2 =================
const ORG = {
  dir: { nome: "o diretor", av: "diretor", p: [.55, 4.6, -3.6], r: .48 },
  jos: { nome: "Projetos", av: "josue", p: [1.95, 4.8, -3.6], r: .33 },
  pal: { nome: "Palavra", av: "gideao", p: [-1.9, 3.3, -3.6], r: .4 },
  ens: { nome: "Ensino", av: "priscila", p: [-.68, 2.7, -3.6], r: .4 },
  com: { nome: "Comunicação", av: "bezalel", p: [.55, 2.4, -3.6], r: .4 },
  cui: { nome: "Cuidado", av: "lidia", p: [1.78, 2.7, -3.6], r: .4 },
  gov: { nome: "Governo", av: "tercio", p: [3.0, 3.3, -3.6], r: .4 },
};
const org = new THREE.Group(); org.position.x = .5; scene.add(org);
const carrega = new THREE.TextureLoader();
const matLinha = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.1, .25), transparent: true, opacity: 0 });
const linhas = [];
for (const k in ORG) {
  const o = ORG[k], g = new THREE.Group(); g.position.set(...o.p); org.add(g);
  const anel = new THREE.Mesh(new THREE.TorusGeometry(o.r, .024, 12, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, .52, .1), transparent: true }));
  const tex = carrega.load(`assets/avatares/${o.av}.webp`); tex.colorSpace = THREE.SRGBColorSpace;
  const rosto = new THREE.Mesh(new THREE.CircleGeometry(o.r * .92, 48), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false, toneMapped: false, color: "#d8d0c6" }));
  const nome = new THREE.Sprite(new THREE.SpriteMaterial({ map: rotulo(o.nome), transparent: true, depthWrite: false, fog: false, toneMapped: false, color: "#e9e2d8" }));
  nome.scale.set(1.5, .375, 1); nome.position.y = -o.r - .26;
  // o rosto, o anel e o nome desenham por último: as linhas e os sinais passam por trás deles
  [anel, rosto, nome].forEach(m => { m.renderOrder = 5; m.material.depthTest = false; });
  g.add(anel, rosto, nome); g.scale.setScalar(.001);
  o.g = g; o.anel = anel; o.recebe = 0;
  if (k !== "dir") {
    const a = new THREE.Vector3(...ORG.dir.p), z = new THREE.Vector3(...o.p);
    const curva = new THREE.QuadraticBezierCurve3(a, new THREE.Vector3((a.x + z.x) / 2, Math.max(a.y, z.y) + (k === "jos" ? .1 : .5), a.z), z);
    const tubo = new THREE.Mesh(new THREE.TubeGeometry(curva, 40, .012, 6), matLinha); org.add(tubo);
    linhas.push({ k, curva });
  }
}
// sinais que correm do diretor para cada ministério (vida do ato 2)
const sinais = linhas.map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: disco, color: "#ffb24a", blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); s.scale.setScalar(.22); org.add(s); return s; });

// o feixe que sai da Bíblia no momento-herói
// cilindro aberto com borda macia: some de lado (fresnel) e some para cima
const feixe = new THREE.Mesh(new THREE.CylinderGeometry(1.2, .76, 4.4, 48, 1, true), new THREE.ShaderMaterial({
  uniforms: { uO: { value: 0 }, uCor: { value: new THREE.Color(1, .74, .42) } },
  vertexShader: `varying vec2 vUv; varying float vF; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.); vec3 n = normalize(normalMatrix * normal); vF = abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform float uO; uniform vec3 uCor; varying vec2 vUv; varying float vF; void main(){ float a = pow(vF, 2.2) * smoothstep(.04, .3, vUv.y) * pow(1. - vUv.y, 1.6); gl_FragColor = vec4(uCor * a * uO, 1.); }`,
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
}));
feixe.position.set(0, 2.5, .05); scene.add(feixe);

// poeira na luz do abajur: profundidade e ar
const NP = 520, poeira = new Float32Array(NP * 3), vel = new Float32Array(NP);
for (let i = 0; i < NP; i++) { poeira[i * 3] = entre(-4.5, 4.5); poeira[i * 3 + 1] = entre(0, 5); poeira[i * 3 + 2] = entre(-3, 3); vel[i] = entre(.02, .09); }
const geoPo = new THREE.BufferGeometry(); geoPo.setAttribute("position", new THREE.BufferAttribute(poeira, 3));
const matPo = new THREE.PointsMaterial({ map: disco, size: .06, color: "#ffd29a", transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false });
scene.add(new THREE.Points(geoPo, matPo));
// primeiro plano: bokeh grande e desfocado passando perto da câmera
const bokeh = Array.from({ length: 7 }, (_, i) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: disco, color: i % 2 ? "#ff9a3c" : "#ffd7a0", transparent: true, opacity: .045, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.setScalar(entre(.5, 1.1)); s.position.set(entre(.2, 1.8), entre(-.9, .9), -entre(1.6, 2.6)); s.userData.f = entre(0, 6); camera.add(s); return s;
});

// rastros de luz dos bilhetes em voo
const RASTRO = 14;
const rastros = bilhetes.map(() => {
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RASTRO * 3), 3));
  const cores = new Float32Array(RASTRO * 3); for (let i = 0; i < RASTRO; i++) { const f = 1 - i / RASTRO; cores[i * 3] = 2 * f; cores[i * 3 + 1] = 1 * f; cores[i * 3 + 2] = .2 * f; }
  geo.setAttribute("color", new THREE.BufferAttribute(cores, 3));
  const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  l.visible = false; l.frustumCulled = false; scene.add(l); return { l, pts: [] };
});

// ================= câmera =================
const cam = { x: 0, y: 1.75, z: 3.2, lx: 0, ly: .15, lz: -.15 };
const alvo = new THREE.Vector3();
const ponteiro = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener("pointermove", e => { ponteiro.tx = e.clientX / innerWidth - .5; ponteiro.ty = e.clientY / innerHeight - .5; });

// ================= ato 1: a semana cobre a Bíblia =================
const luz = { biblia: .5, bloom: .6, feixe: 0, sobe: 0, linhas: 0, abajur: 1 };
const ato1 = gsap.timeline({ paused: true });
function zeraCena() {
  bilhetes.forEach((b, i) => { b.m.visible = false; b.m.scale.setScalar(1); b.m.material.map = b.m.material.emissiveMap = b.comum; b.m.material.needsUpdate = true; b.m.material.emissiveIntensity = 0; b.voo = null; rastros[i].l.visible = false; });
  for (const k in ORG) { ORG[k].g.scale.setScalar(.001); ORG[k].recebe = 0; }
  Object.assign(luz, { biblia: .5, bloom: .6, feixe: 0, sobe: 0, linhas: 0, abajur: 1 });
  Object.assign(cam, { x: 0, y: 1.75, z: 3.2, lx: 0, ly: .15, lz: -.15 });
}
{
  let t = .6, passo = .62;
  bilhetes.forEach((b, i) => {
    const { pouso: P, cai: C } = b, m = b.m;
    ato1.add(() => { m.visible = true; }, t)
      .fromTo(m.position, { x: C.x, y: C.y, z: C.z }, { x: P.x, z: P.z, duration: .85, ease: "power1.out" }, t)
      .fromTo(m.position, { y: C.y }, { y: P.y, duration: .85, ease: "power2.in" }, t)
      .fromTo(m.rotation, { y: C.ry, x: C.rx - Math.PI * .1, z: entre(-.8, .8) }, { y: P.ry, x: P.rx, z: 0, duration: .85, ease: "power2.out" }, t)
      .to(m.position, { y: P.y + .03, duration: .08, yoyo: true, repeat: 1, ease: "sine.out" }, t + .85)
      .add(() => { brilhoCel.v = 1; }, t + .4);
    t += passo; passo = Math.max(.055, passo * .9);
  });
  const fim = t + .4;
  // a luz da Bíblia apaga conforme ela some debaixo da semana
  ato1.to(luz, { biblia: .04, duration: fim - 1.2, ease: "power1.in" }, 1.2)
    
    .to(cam, { x: .4, y: 5.4, z: 6.2, ly: .1, lz: -.2, duration: fim + 1.2, ease: "power2.inOut" }, 0)
    .fromTo("#i1-h span", { autoAlpha: 0, y: 40, filter: "blur(14px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "power3.out", stagger: .35 }, .3)
    .fromTo("#i1-f", { autoAlpha: 0, y: 30, filter: "blur(12px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out" }, fim - .6)
    .fromTo("#i1-dica", { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, fim + .6);
}

// ================= ato 2: como em Atos 6 =================
const ato2 = gsap.timeline({ paused: true });
const meta = k => new THREE.Vector3(...ORG[k].p).add(org.position);
{
  const ordem = ["dir", "jos", "pal", "ens", "com", "cui", "gov"];
  ato2.to(cam, { x: .2, y: 6.1, z: 9.4, lx: .3, ly: 2.35, lz: -2.2, duration: 2.4, ease: "power2.inOut" }, 0);
  ordem.forEach((k, i) => ato2.to(ORG[k].g.scale, { x: 1, y: 1, z: 1, duration: .8, ease: "back.out(1.7)" }, .7 + i * .14));
  ato2.to(luz, { linhas: 1, duration: .8 }, 1.4);
  // os bilhetes levantam da pilha, de cima para baixo, e voam ao dono
  const voam = bilhetes.filter(b => !b.fica).reverse();
  let t = 2.1, passo = .3;
  voam.forEach(b => {
    const m = b.m, alvoK = b.min;
    ato2.add(() => {
      const de = m.position.clone(), para = meta(alvoK);
      const meio = de.clone().lerp(para, .5); meio.y += 2.2 + rnd() * 1.2; meio.x += (rnd() - .5) * 2;
      b.voo = { curva: new THREE.QuadraticBezierCurve3(de, meio, para), u: 0, rot0: m.rotation.clone() };
      m.material.emissiveIntensity = .35;
    }, t)
      .to({}, { duration: 1.15, ease: "power2.inOut", onUpdate() { if (b.voo) b.voo.u = this.progress(); } }, t)
      .add(() => { m.visible = false; b.voo = null; const o = ORG[alvoK]; o.recebe++; gsap.fromTo(o.g.scale, { x: 1.22, y: 1.22, z: 1.22 }, { x: 1, y: 1, z: 1, duration: .45, ease: "back.out(3)" }); gsap.fromTo(o.anel.material.color, { r: 2.6, g: 1.4, b: .4 }, { r: 1.15, g: .52, b: .1, duration: .6 }); }, t + 1.15);
    t += passo; passo = Math.max(.05, passo * .9);
  });
  const livre = t + 1.2;
  // a Bíblia reaparece e a luz volta aos poucos
  ato2.to(luz, { biblia: .7, duration: livre - 2.5, ease: "power1.in" }, 2.5);
  // os quatro que ficam: viram ouro e se levantam diante da Bíblia
  const fica = bilhetes.filter(b => b.fica);
  fica.forEach((b, i) => {
    const m = b.m, x = (i - 1.5) * 1.02;
    ato2.add(() => { m.material.map = m.material.emissiveMap = b.ouro; m.material.needsUpdate = true; }, livre + .3 + i * .12);
    ato2.to(m.position, { x: x * .98 + .25, y: .62, z: 1.45, duration: 1.1, ease: "power3.inOut" }, livre + i * .12)
      .to(m.scale, { x: .86, y: .86, z: .86, duration: 1.1, ease: "power3.inOut" }, livre + i * .12)
      .to(m.rotation, { x: 1.25, y: 0, z: 0, duration: 1.1, ease: "power3.inOut" }, livre + i * .12)
      .to(m.material, { emissiveIntensity: .3, duration: .8 }, livre + .5 + i * .12);
  });
  // heroi: a Palavra descoberta acende de vez
  const h = livre + 1.3;
  ato2.to(luz, { biblia: 2.6, bloom: 1.05, feixe: 1, sobe: 1, duration: .5, ease: "power4.out" }, h) // heroi
    .to(luz, { biblia: 1.15, bloom: .72, feixe: .32, abajur: .3, duration: 2.2, ease: "power2.out" }, h + .5)
    .to(cam, { x: .45, y: 2.75, z: 7.7, lx: .5, ly: 1.85, lz: -1.4, duration: 2.6, ease: "power3.inOut" }, h - .4)
    .fromTo("#i2-k, #i2-h", { autoAlpha: 0, y: 40, filter: "blur(14px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out", stagger: .25 }, h + .2)
    .fromTo("#i2-v", { autoAlpha: 0, y: 30, filter: "blur(12px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out" }, h + 1.3)
    .fromTo("#i2-p", { autoAlpha: 0, y: 30, filter: "blur(12px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out" }, h + 3)
    .fromTo("#i2-cta", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6, ease: "back.out(2)" }, h + 4.2);
}
gsap.set(["#i1-h span", "#i1-f", "#i1-dica", "#i2-k", "#i2-h", "#i2-v", "#i2-p", "#i2-cta"], { autoAlpha: 0 });

// ================= quadro a quadro =================
let w = 0, hgt = 0;
function ajusta() {
  w = canvas.clientWidth; hgt = canvas.clientHeight;
  if (!w || !hgt) return;
  renderer.setSize(w, hgt, false); composer.setSize(w, hgt);
  bloom.resolution.set(w / 2, hgt / 2);
  camera.aspect = w / hgt;
  // deitado: a cena vai para a direita e o texto fica à esquerda; em pé: a cena desce e o texto fica em cima
  if (w > hgt) { camera.fov = 38; camera.setViewOffset(w, hgt, -w * .2, 0, w, hgt); }
  else { camera.fov = 50; camera.setViewOffset(w, hgt, 0, -hgt * .14, w, hgt); }
  camera.updateProjectionMatrix();
}
addEventListener("resize", ajusta);
const relogio = new THREE.Clock();
let rodando = false;
function quadro() {
  if (!rodando) return;
  requestAnimationFrame(quadro);
  if (vista.hidden || document.hidden) return;
  passo(Math.min(relogio.getDelta(), .05), relogio.elapsedTime);
}
function passo(dt, V) {
  if (canvas.clientWidth !== w || canvas.clientHeight !== hgt) ajusta();
  // vida: a câmera respira e segue o dedo de leve
  ponteiro.x += (ponteiro.tx - ponteiro.x) * .04; ponteiro.y += (ponteiro.ty - ponteiro.y) * .04;
  // em pé, a câmera se afasta do alvo para o organograma caber na largura
  const k = w > hgt ? 1 : 1 + (hgt / w - 1) * .45;
  alvo.set(cam.lx, cam.ly, cam.lz);
  camera.position.set(cam.lx + (cam.x - cam.lx) * k + Math.sin(V * .31) * .06 + ponteiro.x * .5, cam.ly + (cam.y - cam.ly) * k + Math.sin(V * .23) * .04 - ponteiro.y * .3, cam.lz + (cam.z - cam.lz) * k);
  camera.lookAt(alvo);
  // a luz da Palavra
  matPag.emissiveIntensity = luz.biblia * (1 + Math.sin(V * 1.7) * .04);
  luzBiblia.intensity = .4 + luz.biblia * 1.6;
  bloom.strength = luz.bloom;
  // quando a Palavra acende, o abajur recua
  foco.intensity = 24 * (.45 + .55 * luz.abajur); lampada.material.color.setRGB(4 * luz.abajur, 2.6 * luz.abajur, 1.3 * luz.abajur);
  feixe.material.uniforms.uO.value = luz.feixe * (.85 + Math.sin(V * 2.1) * .15);
  feixe.rotation.y = V * .08;
  matLinha.opacity = luz.linhas * .8;
  // o celular acende a cada bilhete, e apaga devagar
  brilhoCel.v = Math.max(0, brilhoCel.v - dt * 1.8);
  const lc = .13 + brilhoCel.v * .75; telaCel.material.color.setRGB(lc, lc, lc);
  celular.position.x = 2.05 + (brilhoCel.v > .7 ? Math.sin(V * 90) * .012 : 0);
  // poeira sobe; no momento-herói, sobe depressa
  const pos = geoPo.attributes.position.array;
  for (let i = 0; i < NP; i++) {
    pos[i * 3 + 1] += vel[i] * dt * (1 + luz.sobe * 9);
    pos[i * 3] += Math.sin(V * .5 + i) * dt * .03;
    if (pos[i * 3 + 1] > 5.5) pos[i * 3 + 1] = 0;
  }
  geoPo.attributes.position.needsUpdate = true;
  cidade.forEach(s => { s.material.opacity = .25 + .3 * (.5 + .5 * Math.sin(V * .7 + s.userData.f)); });
  bokeh.forEach(s => { s.position.x += Math.sin(V * .2 + s.userData.f) * dt * .05; s.position.y += Math.cos(V * .17 + s.userData.f) * dt * .04; });
  // bilhetes em voo, com rastro
  bilhetes.forEach((b, i) => {
    const r = rastros[i];
    if (b.voo) {
      const p = b.voo.curva.getPoint(b.voo.u);
      b.m.position.copy(p);
      b.m.rotation.set(b.voo.rot0.x + b.voo.u * 2.4, b.voo.rot0.y + b.voo.u * 4, 0);
      b.m.scale.setScalar(1 - b.voo.u * .78);
      r.pts.unshift(p.clone()); r.pts.length = Math.min(r.pts.length, RASTRO);
      const arr = r.l.geometry.attributes.position.array;
      for (let k = 0; k < RASTRO; k++) { const q = r.pts[Math.min(k, r.pts.length - 1)]; arr[k * 3] = q.x; arr[k * 3 + 1] = q.y; arr[k * 3 + 2] = q.z; }
      r.l.geometry.attributes.position.needsUpdate = true; r.l.visible = true;
    } else if (r.l.visible) { r.l.visible = false; r.pts.length = 0; }
  });
  // os ministérios respiram, e sinais correm do diretor para cada um
  for (const k in ORG) { const o = ORG[k]; o.g.position.y = o.p[1] + Math.sin(V * .9 + o.p[0]) * .05; o.g.quaternion.copy(camera.quaternion); }
  linhas.forEach((l, i) => { const u = (V * .35 + i * .17) % 1; sinais[i].position.copy(l.curva.getPoint(u)); sinais[i].material.opacity = luz.linhas * Math.sin(u * Math.PI) * .9; });
  // os quatro do pastor flutuam
  bilhetes.forEach((b, i) => { if (b.fica && b.m.material.emissiveIntensity > .15) b.m.position.y = .62 + Math.sin(V * 1.3 + i) * .03; });
  composer.render();
}
function liga() { if (!rodando) { rodando = true; relogio.getDelta(); requestAnimationFrame(quadro); } }

let atoAtual = 0;
const ABERTURA = {
  ato(n) {
    liga(); ajusta();
    if (n === atoAtual) return; // a mesma cena chamada de novo não reinicia
    ato2.pause(0); ato1.pause(0); zeraCena();
    if (n === 1) { ato1.restart(); if (calmo) ato1.progress(1, false); }
    else { ato1.progress(1, false); ato2.restart(); if (calmo) ato2.progress(1, false); }
    atoAtual = n;
  },
  para() { rodando = false; atoAtual = 0; },
};
window.ABERTURA = ABERTURA;
if (window.ABERTURA_PEND) ABERTURA.ato(window.ABERTURA_PEND);

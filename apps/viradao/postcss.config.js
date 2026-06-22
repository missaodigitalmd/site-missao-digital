// Isolamento de PostCSS (NAO REMOVER).
//
// Este app usa Tailwind v4, processado pelo plugin `@tailwindcss/vite` (ver
// vite.config.ts), NAO pelo PostCSS. Como ele vive aninhado dentro do projeto do
// site (Site/app), que tem o seu proprio postcss.config.js com Tailwind v3, sem
// este arquivo o PostCSS subiria a arvore de diretorios, acharia o config v3 do
// pai e o aplicaria no CSS v4 daqui, quebrando o build (erro "@layer base sem
// @tailwind base"). Este config local, vazio, corta essa busca: nenhum plugin
// PostCSS roda neste app.
export default { plugins: {} }

---
name: traducao-missao
description: Skill de tradução para o projeto Missão Digital. Cobre diretrizes de tom, glossário, processo de tradução PT→EN/ES, estrutura de locales, conteúdo dinâmico (Supabase) e adição de novos idiomas.
---

# Skill de Tradução — Missão Digital

> Tudo para a Glória de Deus. Cada palavra traduzida é parte do chamado.

---

## 1. Visão Geral

Este projeto é um site missionário focado em evangelização digital e cultura gamer.
- **Idioma padrão:** Português (pt-BR)
- **Idiomas traduzidos:** Inglês (en), Espanhol (es)
- **Tom de voz:** Acolhedor, missionário, gamer-friendly — **nunca comercial ou empresarial**
- **Público-alvo:** O mesmo para todos os idiomas (igrejas, líderes, gamers, jovens, famílias)
- **Detecção de idioma:** Parâmetro `?lang=` na URL, com fallback para `pt`

---

## 2. Tom e Voz

### Princípios
- O site comunica o Evangelho com autenticidade e proximidade
- Não é uma empresa vendendo produto — é uma família missionária convidando para caminhar junto
- A linguagem é quente, pessoal, apaixonada pela missão
- Referências à cultura gamer são naturais, não forçadas
- Versículos e referências bíblicas são parte orgânica do conteúdo

### Em cada idioma

| Aspecto | PT (original) | EN | ES |
|---------|--------------|-----|-----|
| Formalidade | Informal acolhedor | Informal acolhedor (mesma intensidade) | Informal acolhedor (mesma intensidade) |
| Pronome | "Você" | "You" | "Tú" (não usar "usted") |
| Tom espiritual | Direto, apaixonado | Direto, apaixonado | Direto, apaixonado |
| Gamificação | Termos nativos (gank, live, stream) | Mesmos termos (universais) | Mesmos termos (universais) |

### O que NUNCA fazer
- ❌ Usar linguagem corporativa ("soluções", "stakeholders", "KPIs")
- ❌ Tornar formal o que é pessoal
- ❌ Perder a urgência missionária ao traduzir
- ❌ Traduzir versículos "por conta" — sempre usar traduções oficiais

---

## 3. Glossário — Termos que NÃO traduzir

Estes termos são universais e devem permanecer como no original em todos os idiomas:

| Termo | Razão |
|-------|-------|
| WhatsApp | Nome de produto |
| PIX | Sistema de pagamento brasileiro |
| Checklist | Termo universal |
| Streaming / Stream / Live | Termos gamer universais |
| Gank | Termo gamer universal |
| E-mail | Universal |
| Ebook | Universal |
| Download / Upload | Universal |
| Online / Offline | Universal |
| App | Universal |
| Link | Universal |

---

## 4. Glossário — Nomes de Projetos

Os nomes dos projetos devem ser **traduzidos** quando possuem significado descritivo, mas mantidos quando são nomes próprios ou expressões universais:

| Português | Inglês | Espanhol | Observação |
|-----------|--------|----------|------------|
| DaoD (Digital ao Discipulado) | DaoD (Digital to Discipleship) | DaoD (Digital al Discipulado) | Acrônimo mantido, subtítulo traduzido |
| Gank Evangelístico | Evangelistic Gank | Gank Evangelístico | "Gank" é universal |
| Nínive Digital | Digital Nineveh | Nínive Digital | Referência bíblica — traduzir o nome bíblico |
| Campeonatos Evangelísticos | Evangelistic Tournaments | Torneos Evangelísticos | Traduzir integralmente |
| Imersão Missionária | Missionary Immersion | Inmersión Misionera | Traduzir integralmente |
| Missão Digital | Digital Mission | Misión Digital | Traduzir integralmente |
| Checklist do Novo Mapa Missionário | New Missionary Map Checklist | Checklist del Nuevo Mapa Misionero | "Checklist" universal, resto traduzido |
| IA a Serviço do Reino | AI for the Kingdom | IA al Servicio del Reino | Traduzir integralmente |
| Guia do DaoD | DaoD Guide | Guía del DaoD | "DaoD" mantido |
| Checklist Gank | Gank Checklist | Checklist Gank | Termos universais |
| Gamificação do Evangelho | Gamification of the Gospel | Gamificación del Evangelio | Traduzir integralmente |

---

## 5. Versículos Bíblicos

### Traduções oficiais a usar

| Idioma | Tradução | Exemplo |
|--------|----------|---------|
| **PT** | NVI (Nova Versão Internacional) ou ARA (Almeida Revista e Atualizada) | Usar a que já está no site |
| **EN** | NIV (New International Version) | Tradução mais popular e compreensível |
| **ES** | NVI (Nueva Versión Internacional) | Equivalente hispânica da NIV |

### Regra
- **Sempre** buscar o versículo na tradução oficial, nunca traduzir por conta
- Manter a referência (livro, capítulo, versículo) no formato do idioma
  - PT: `2 Coríntios 9:7`
  - EN: `2 Corinthians 9:7`
  - ES: `2 Corintios 9:7`

---

## 6. Estrutura de Arquivos de Tradução (Locales)

```
src/
├── i18n/
│   ├── i18n.ts              ← Configuração do react-i18next
│   └── locales/
│       ├── pt/
│       │   ├── common.json   ← Navbar, Footer, botões genéricos
│       │   ├── home.json     ← HeroSection, CampoSection, etc.
│       │   ├── apoie.json    ← Página Apoie + modais
│       │   ├── recursos.json ← Página Recursos
│       │   ├── projetos.json ← Páginas de projetos (DaoD, Gank, etc.)
│       │   ├── contato.json  ← Página Contato
│       │   ├── quem-somos.json ← Página Quem Somos
│       │   └── imersao.json  ← Página Imersão Missionária
│       ├── en/
│       │   └── (mesmos arquivos)
│       └── es/
│           └── (mesmos arquivos)
```

### Convenções de chaves

```json
{
  "hero": {
    "title": "O campo missionário está online",
    "subtitle": "A igreja precisa entrar no mundo digital...",
    "cta": "Conheça nossos projetos"
  },
  "section_name": {
    "title": "...",
    "description": "...",
    "items": {
      "item_1": {
        "title": "...",
        "description": "..."
      }
    }
  }
}
```

**Regras de nomenclatura:**
- Usar snake_case para chaves
- Agrupar por seção/componente
- Nunca usar o texto como chave (usar chaves semânticas)
- Manter a mesma hierarquia em todos os idiomas

---

## 7. Conteúdo Dinâmico (Supabase)

O conteúdo gerenciado pelo Admin (Recursos e Depoimentos) é traduzido via tabelas de tradução no Supabase.

### Tabelas envolvidas

| Tabela | Conteúdo | Tradução |
|--------|----------|----------|
| `recursos` | Dados base do recurso | `recursos_traducoes` (titulo, descricao, descricao_completa, arquivo_url por idioma) |
| `depoimentos` | Dados base do depoimento | `depoimentos_traducoes` (texto, cargo por idioma) |

### Fluxo de tradução dinâmica

1. Admin preenche conteúdo em **PT** (idioma principal)
2. Clica em **"✨ Traduzir com IA"** para EN e ES
3. IA traduz seguindo as diretrizes desta Skill
4. Admin revisa e salva

### Consulta com idioma

```typescript
// Ao buscar recursos, filtrar pelo idioma atual
const { data } = await supabase
  .from('recursos')
  .select(`
    *,
    recursos_traducoes!inner(titulo, descricao, descricao_completa, arquivo_url)
  `)
  .eq('recursos_traducoes.idioma', currentLocale)
  .eq('ativo', true);
```

### Diretrizes para IA de tradução
- Seguir o tom de voz desta Skill (acolhedor, não comercial)
- Manter termos universais do glossário sem traduzir
- Traduzir nomes de projetos conforme a tabela da Seção 4
- Versículos devem usar as traduções oficiais da Seção 5
- Manter o mesmo tamanho aproximado de texto (±20%)

---

## 8. Integração com react-i18next

### Configuração (`src/i18n/i18n.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar todos os namespaces
import ptCommon from './locales/pt/common.json';
import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
// ... demais namespaces

i18n.use(initReactI18next).init({
  resources: {
    pt: { common: ptCommon, /* ... */ },
    en: { common: enCommon, /* ... */ },
    es: { common: esCommon, /* ... */ },
  },
  lng: new URLSearchParams(window.location.search).get('lang') || 'pt',
  fallbackLng: 'pt',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### Uso em componentes

```tsx
import { useTranslation } from 'react-i18next';

function HeroSection() {
  const { t } = useTranslation('home');
  return (
    <h1>{t('hero.title')}</h1>
    <p>{t('hero.subtitle')}</p>
  );
}
```

### Troca de idioma

```tsx
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    // Atualiza a URL sem recarregar
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div>
      <button onClick={() => changeLanguage('pt')}>🇧🇷 PT</button>
      <button onClick={() => changeLanguage('en')}>🇺🇸 EN</button>
      <button onClick={() => changeLanguage('es')}>🇪🇸 ES</button>
    </div>
  );
}
```

---

## 9. Processo para Adicionar Novo Idioma

### Passo a passo

1. **Criar pasta de locale**
   ```
   src/i18n/locales/{novo-idioma}/
   ```

2. **Copiar JSONs do PT como base**
   ```bash
   cp -r src/i18n/locales/pt/* src/i18n/locales/{novo-idioma}/
   ```

3. **Traduzir cada JSON** seguindo as diretrizes desta Skill

4. **Adicionar ao i18n.ts**
   ```typescript
   import frCommon from './locales/fr/common.json';
   // ...
   resources: {
     // ... existentes
     fr: { common: frCommon, /* ... */ },
   },
   ```

5. **Adicionar tradução nas tabelas do Supabase**
   - Inserir registros em `recursos_traducoes` com `idioma = '{novo-idioma}'`
   - Inserir registros em `depoimentos_traducoes` com `idioma = '{novo-idioma}'`

6. **Adicionar botão no seletor de idioma**
   - Atualizar o componente `LanguageSelector`

7. **Adicionar versículos** na tradução oficial do idioma

8. **Revisar** todo o conteúdo antes de publicar

### Checklist de novo idioma

- [ ] Pasta de locale criada
- [ ] Todos os JSONs traduzidos
- [ ] Registrado no `i18n.ts`
- [ ] Conteúdo dinâmico do Supabase traduzido
- [ ] Versículos na tradução oficial
- [ ] Seletor de idioma atualizado
- [ ] Revisão geral feita
- [ ] Testado com `?lang={novo-idioma}`

---

## 10. Checklist Geral de Tradução

Antes de publicar qualquer tradução:

- [ ] Todos os textos visíveis usam `t()` (sem hardcoded)
- [ ] Versículos usam traduções oficiais (NIV/NVI)
- [ ] Termos universais mantidos sem tradução
- [ ] Nomes de projetos traduzidos conforme glossário
- [ ] Tom acolhedor e missionário preservado
- [ ] Conteúdo dinâmico (Supabase) traduzido via Admin
- [ ] Seletor de idioma funcional
- [ ] Deep link `?lang=` funciona corretamente
- [ ] Fallback para PT em caso de tradução ausente
- [ ] Layout não quebra com textos mais longos (alemão futuro = +30%)

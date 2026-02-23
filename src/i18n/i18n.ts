import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// PT
import ptCommon from './locales/pt/common.json';
import ptHome from './locales/pt/home.json';
import ptApoie from './locales/pt/apoie.json';
import ptRecursos from './locales/pt/recursos.json';
import ptContato from './locales/pt/contato.json';
import ptQuemSomos from './locales/pt/quem-somos.json';
import ptImersao from './locales/pt/imersao.json';
import ptProjetos from './locales/pt/projetos.json';

// EN
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enApoie from './locales/en/apoie.json';
import enRecursos from './locales/en/recursos.json';
import enContato from './locales/en/contato.json';
import enQuemSomos from './locales/en/quem-somos.json';
import enImersao from './locales/en/imersao.json';
import enProjetos from './locales/en/projetos.json';

// ES
import esCommon from './locales/es/common.json';
import esHome from './locales/es/home.json';
import esApoie from './locales/es/apoie.json';
import esRecursos from './locales/es/recursos.json';
import esContato from './locales/es/contato.json';
import esQuemSomos from './locales/es/quem-somos.json';
import esImersao from './locales/es/imersao.json';
import esProjetos from './locales/es/projetos.json';

// Detecta idioma via ?lang= ou fallback para PT
const urlLang = new URLSearchParams(window.location.search).get('lang');
const supportedLangs = ['pt', 'en', 'es'];
const detectedLang = urlLang && supportedLangs.includes(urlLang) ? urlLang : 'pt';

i18n.use(initReactI18next).init({
    resources: {
        pt: {
            common: ptCommon,
            home: ptHome,
            apoie: ptApoie,
            recursos: ptRecursos,
            contato: ptContato,
            'quem-somos': ptQuemSomos,
            imersao: ptImersao,
            projetos: ptProjetos,
        },
        en: {
            common: enCommon,
            home: enHome,
            apoie: enApoie,
            recursos: enRecursos,
            contato: enContato,
            'quem-somos': enQuemSomos,
            imersao: enImersao,
            projetos: enProjetos,
        },
        es: {
            common: esCommon,
            home: esHome,
            apoie: esApoie,
            recursos: esRecursos,
            contato: esContato,
            'quem-somos': esQuemSomos,
            imersao: esImersao,
            projetos: esProjetos,
        },
    },
    lng: detectedLang,
    fallbackLng: 'pt',
    defaultNS: 'common',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;

import { Heart, HandCoins, Handshake } from 'lucide-react';

export const caminhos = [
    {
        icone: Heart,
        titulo: 'Ore',
        descricao: 'Sua intercessão é essencial para nos fortalecer e abrir caminhos para que o Evangelho avance. Cadastre-se para receber nossos pedidos de oração e caminhe conosco em espírito.',
        acao: 'Quero orar por vocês',
        tipo: 'orar',
    },
    {
        icone: HandCoins,
        titulo: 'Contribua',
        descricao: 'Sua parceria financeira nos permite dedicar tempo e recursos para alcançar vidas e discipular cristãos. Cada oferta sustenta nossa família no campo e viabiliza ações em igrejas.',
        acao: 'Realizar oferta pontual',
        tipo: 'pix',
        pix: '6286425598',
    },
    {
        icone: Handshake,
        titulo: 'Coopere',
        descricao: 'Participe ativamente cooperando com seus dons e talentos. Venha como voluntário em ações, como igreja parceira que nos envia ou como multiplicador que leva nossos recursos para outros líderes.',
        acao: 'Cooperar',
        tipo: 'cooperar',
    },
];

export const formasCooperacao = [
    'Conexões com igrejas e líderes',
    'Voluntariado em ações evangelísticas',
    'Design e comunicação visual',
    'Desenvolvimento web/tecnologia',
    'Tradução/Libras',
    'Produção de conteúdo (vídeo, áudio, texto)',
    'Facilitação de workshops',
    'Outra habilidade',
];

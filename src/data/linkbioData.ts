export interface SocialCardData {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  glowColor: string;
  glowColorSecondary?: string;
  gradient?: string;
  frames: string[];
  iconType: 'globe' | 'tiktok' | 'instagram' | 'youtube' | 'kwai' | 'whatsapp' | 'missaodigital';
}

const makeInstaFrames = () =>
  Array.from({ length: 16 }, (_, i) =>
    `/images/linkbio/insta/instamd_${String(i).padStart(5, '0')}.png`
  );

export const WHATSAPP_LINK = 'https://chat.whatsapp.com/G5pQOj7DKECLiKtn1CfkKq';
export const SITE_LINK = 'https://missaodigitalmd.com';

export const socialCards: SocialCardData[] = [
  {
    id: 'site',
    label: 'MISSÃO DIGITAL',
    sublabel: 'missaodigitalmd.com',
    href: SITE_LINK,
    glowColor: '#FFAC13',
    glowColorSecondary: '#FE7003',
    gradient: 'linear-gradient(135deg, #FFAC13, #FE7003)',
    frames: [],
    iconType: 'missaodigital' as any,
  },
  {
    id: 'tiktok',
    label: 'TIKTOK',
    href: '#',
    glowColor: '#00F2EA',
    glowColorSecondary: '#FF0050',
    gradient: 'linear-gradient(135deg, #00F2EA, #FF0050)',
    frames: [],
    iconType: 'tiktok',
  },
  {
    id: 'instagram',
    label: 'INSTAGRAM',
    href: 'https://...',
    glowColor: '#DD2A7B',
    glowColorSecondary: '#F58529',
    gradient: 'linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)',
    frames: makeInstaFrames(),
    iconType: 'instagram',
  },
  {
    id: 'youtube',
    label: 'YOUTUBE',
    href: '#',
    glowColor: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000, #CC0000)',
    frames: [],
    iconType: 'youtube',
  },
  {
    id: 'kwai',
    label: 'KWAI',
    href: '#',
    glowColor: '#FF6A00',
    gradient: 'linear-gradient(135deg, #FF6A00, #EE0979)',
    frames: [],
    iconType: 'kwai',
  },
];

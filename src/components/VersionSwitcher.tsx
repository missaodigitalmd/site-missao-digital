import React from 'react';
import { useRouter } from '@/router';
import { cn } from '@/lib/utils';
import { THEME_COLOR } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

const versions = [
  { id: 'imersao-v1', label: 'V1: Hero-First', route: 'imersao-v1' as const },
  { id: 'imersao-v2', label: 'V2: Story-Driven', route: 'imersao-v2' as const },
  { id: 'imersao-v3', label: 'V3: Interactive-Rich', route: 'imersao-v3' as const },
];

export const VersionSwitcher: React.FC = () => {
  const { t } = useTranslation('common');
  const { currentRoute, navigate } = useRouter();

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full p-2">
      {versions.map((version) => (
        <button
          key={version.id}
          onClick={() => navigate(version.route)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
            currentRoute === version.route
              ? 'text-black'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          )}
          style={currentRoute === version.route ? {
            background: `linear-gradient(to right, ${THEME_COLOR}, #FE7003)`
          } : {}}
        >
          {t(`version_switcher.${version.id}`)}
        </button>
      ))
      }
    </div >
  );
};

export default VersionSwitcher;

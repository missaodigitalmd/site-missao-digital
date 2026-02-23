import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WhatsAppButtonProps {
  className?: string;
  message?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  className = '',
  message,
}) => {
  const { t } = useTranslation('common');
  const defaultMessage = t('whatsapp_button.message');
  const finalMessage = message ?? defaultMessage;
  const whatsappUrl = `https://wa.me/556286425598?text=${encodeURIComponent(finalMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-whatsapp rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse-whatsapp ${className}`}
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      aria-label={t('whatsapp_button.aria_label')}
    >
      <MessageCircle className="w-7 h-7 text-white" fill="white" />
    </a>
  );
};

export default WhatsAppButton;

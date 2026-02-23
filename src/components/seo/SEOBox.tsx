import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOBoxProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
}

export function SEOBox({
    title,
    description,
    image = '/og-image.webp',
    url = 'https://missaodigitalmd.com',
    type = 'website'
}: SEOBoxProps) {
    const { i18n } = useTranslation();
    const currentLang = i18n.language || 'pt';

    return (
        <Helmet htmlAttributes={{ lang: currentLang }}>
            {/* Basic HTML Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="Missão Digital" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Hreflang Tags for Internationalization */}
            <link rel="alternate" hrefLang="pt" href={`${url}`} />
            <link rel="alternate" hrefLang="en" href={`${url}/en`} />
            <link rel="alternate" hrefLang="es" href={`${url}/es`} />
            <link rel="alternate" hrefLang="x-default" href={`${url}`} />
        </Helmet>
    );
}

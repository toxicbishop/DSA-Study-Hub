import Head from 'next/head';
import { useRouter } from 'next/router';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  imageType?: string;
  imageWidth?: number | string;
  imageHeight?: number | string;
  imageAlt?: string;
  article?: boolean;
  type?: 'website' | 'article' | string;
  canonicalUrl?: string;
  path?: string;
  siteName?: string;
  noindex?: boolean;
}

const DEFAULT_SITE_NAME = 'DSA Study Hub';
const DEFAULT_TITLE = 'DSA Study Hub';
const DEFAULT_DESCRIPTION = 'The ultimate platform to learn DSA with interactive visualizations, roadmaps, and practice questions.';
const DEFAULT_BASE_URL = 'https://dsa-study-hub.vercel.app';
const DEFAULT_IMAGE_PATH = '/screenshots/Home.png';
const DEFAULT_IMAGE_WIDTH = 1912;
const DEFAULT_IMAGE_HEIGHT = 951;
const DEFAULT_IMAGE_TYPE = 'image/png';
const DEFAULT_IMAGE_ALT = 'DSA Study Hub - Interactive Data Structures & Algorithms';

function inferImageType(imagePath: string): string {
  const clean = imagePath.toLowerCase().split('?')[0];
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.gif')) return 'image/gif';
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  return DEFAULT_IMAGE_TYPE;
}

export const SEO = ({
  title,
  description,
  image,
  imageType,
  imageWidth,
  imageHeight,
  imageAlt,
  article,
  type,
  canonicalUrl,
  path,
  siteName = DEFAULT_SITE_NAME,
  noindex = false,
}: SEOProps) => {
  const router = useRouter();

  const rawTitle = title?.trim() || DEFAULT_TITLE;
  const fullTitle = rawTitle === siteName ? siteName : `${rawTitle} | ${siteName}`;
  const finalDesc = description?.trim() || DEFAULT_DESCRIPTION;

  // Derive canonical and Open Graph URL
  const cleanPath = path !== undefined
    ? path
    : (router?.asPath ? router.asPath.split('?')[0] : '');

  const computedUrl = cleanPath === '/' || !cleanPath
    ? `${DEFAULT_BASE_URL}/`
    : `${DEFAULT_BASE_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;

  const finalUrl = canonicalUrl || computedUrl;

  // Resolve absolute image URL
  const rawImage = image || DEFAULT_IMAGE_PATH;
  const fullImageUrl = rawImage.startsWith('http://') || rawImage.startsWith('https://')
    ? rawImage
    : `${DEFAULT_BASE_URL}${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`;

  const secureImageUrl = fullImageUrl.replace(/^http:\/\//i, 'https://');

  const isDefaultImage = !image || image === DEFAULT_IMAGE_PATH;
  const finalImageType = imageType || inferImageType(rawImage);
  const finalImageWidth = imageWidth !== undefined
    ? String(imageWidth)
    : (isDefaultImage ? String(DEFAULT_IMAGE_WIDTH) : undefined);
  const finalImageHeight = imageHeight !== undefined
    ? String(imageHeight)
    : (isDefaultImage ? String(DEFAULT_IMAGE_HEIGHT) : undefined);
  const finalImageAlt = imageAlt || (title && title !== siteName ? `${title} - ${siteName}` : DEFAULT_IMAGE_ALT);

  const ogType = type || (article ? 'article' : 'website');

  return (
    <Head>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDesc} />
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:secure_url" content={secureImageUrl} />
      {finalImageType && <meta property="og:image:type" content={finalImageType} />}
      {finalImageWidth && <meta property="og:image:width" content={finalImageWidth} />}
      {finalImageHeight && <meta property="og:image:height" content={finalImageHeight} />}
      <meta property="og:image:alt" content={finalImageAlt} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={secureImageUrl} />
      <meta name="twitter:image:alt" content={finalImageAlt} />

      {/* Robots & Viewport */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
  );
};

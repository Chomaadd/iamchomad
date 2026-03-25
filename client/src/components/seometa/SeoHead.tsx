import { Helmet } from "react-helmet-async";

const SITE_NAME = "Choiril Ahmad";
const SITE_URL = "https://iamchomad.my.id";
const DEFAULT_DESCRIPTION = "Personal website of Choiril Ahmad — Entrepreneur & Software Developer crafting digital experiences with precision and purpose.";
const DEFAULT_IMAGE = `${SITE_URL}/og-thumb.png`;

interface SeoHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  cardType?: "summary" | "summary_large_image";
  article?: {
    publishedTime?: string;
    tags?: string[];
  };
}

export function SeoHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  cardType = "summary",
  article,
}: SeoHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME}'s`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={`${SITE_NAME} logo`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />

      {type === "article" && article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {type === "article" && article?.tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      <meta name="twitter:card" content={cardType} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}

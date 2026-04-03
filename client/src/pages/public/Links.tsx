import { useLinkItems } from "@/hooks/use-links";
import { useSiteSettings } from "@/hooks/use-settings";
import { SeoHead } from "@/components/seometa/SeoHead";
import { useLanguage } from "@/hooks/use-language";
import { ExternalLink, Loader2, User } from "lucide-react";
import { LinkIcon } from "@/lib/social-icons";
import type { LinkItem } from "@shared/schema";

const DEFAULT_NAME = "Choiril Ahmad";
const DEFAULT_BIO = "Frontend Developer & Visual Designer";

const BORDER_STYLES: Record<string, string> = {
  default: "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/40",
  pill:    "rounded-full border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/40",
  sharp:   "rounded-md border border-white/25 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/40",
  dashed:  "rounded-2xl border-2 border-dashed border-white/30 bg-white/8 backdrop-blur-sm hover:bg-white/15 hover:border-white/50",
  glow:    "rounded-2xl border-0 bg-white/10 backdrop-blur-sm shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:bg-white/20",
};

const BORDER_STYLES_LIGHT: Record<string, string> = {
  default: "rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md hover:bg-accent/30",
  pill:    "rounded-full border border-border bg-card hover:border-primary/40 hover:shadow-md hover:bg-accent/30",
  sharp:   "rounded-md border border-border bg-card hover:border-primary/40 hover:shadow-md hover:bg-accent/30",
  dashed:  "rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary/50 hover:bg-accent/20",
  glow:    "rounded-2xl border-0 bg-card shadow-md hover:shadow-xl hover:shadow-primary/10",
};

export default function Links() {
  const { data: links, isLoading } = useLinkItems();
  const { data: settings } = useSiteSettings();
  const { t } = useLanguage();

  const activeLinks =
    links
      ?.filter((l: LinkItem) => l.isActive)
      .sort((a, b) => a.order - b.order) ?? [];

  const avatarUrl = settings?.linksAvatarUrl;
  const name = settings?.linksName || DEFAULT_NAME;
  const bio = settings?.linksBio || DEFAULT_BIO;
  const backgroundUrl = settings?.linksBackgroundUrl;
  const borderStyle = (settings?.linksBorderStyle || "default") as keyof typeof BORDER_STYLES;

  const hasBg = !!backgroundUrl;
  const cardClass = hasBg ? BORDER_STYLES[borderStyle] ?? BORDER_STYLES.default : BORDER_STYLES_LIGHT[borderStyle] ?? BORDER_STYLES_LIGHT.default;

  return (
    <>
      <SeoHead
        title="Links"
        description="All of Choiril Ahmad's important links in one place — social media, portfolio, contact, and more."
        url="/links"
      />
      <div
        className="min-h-screen flex flex-col items-center justify-start py-16 px-4 relative transition-all duration-300"
        style={
          backgroundUrl
            ? {
                backgroundImage: `url(${backgroundUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
              }
            : undefined
        }
      >
        {/* Overlay for bg image */}
        {hasBg && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
        )}

        <div className={`w-full max-w-md flex flex-col items-center gap-8 relative z-10`}>
          {/* Profile */}
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Avatar — larger */}
            <div
              className={`w-32 h-32 rounded-full overflow-hidden shrink-0 ${
                hasBg
                  ? "ring-4 ring-white/30 shadow-xl"
                  : "ring-4 ring-border shadow-md"
              } bg-muted flex items-center justify-center`}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  data-testid="img-links-avatar"
                />
              ) : (
                <User
                  size={44}
                  className={hasBg ? "text-white/60" : "text-muted-foreground"}
                  data-testid="img-links-avatar-placeholder"
                />
              )}
            </div>

            <div>
              <h1
                className={`text-2xl font-serif font-bold tracking-tight ${hasBg ? "text-white" : ""}`}
                data-testid="text-links-name"
              >
                {name}
              </h1>
              <p
                className={`text-sm mt-1 ${hasBg ? "text-white/70" : "text-muted-foreground"}`}
                data-testid="text-links-bio"
              >
                {bio}
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="w-full flex flex-col gap-3">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className={`w-6 h-6 animate-spin ${hasBg ? "text-white/60" : "text-muted-foreground"}`} />
              </div>
            )}

            {!isLoading && activeLinks.length === 0 && (
              <p className={`text-center text-sm py-8 italic ${hasBg ? "text-white/60" : "text-muted-foreground"}`}>
                {t("links.empty")}
              </p>
            )}

            {activeLinks.map((link: LinkItem) => (
              <a
                key={link.id}
                href={link.url}
                target={link.url.startsWith("mailto:") ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className={`group flex items-center gap-4 w-full px-5 py-4 transition-all duration-200 ${cardClass}`}
                data-testid={`link-item-${link.id}`}
              >
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <LinkIcon url={link.url} emoji={link.icon} size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${hasBg ? "text-white" : "text-foreground"}`}>
                    {link.title}
                  </p>
                  {link.description && (
                    <p className={`text-xs mt-0.5 truncate ${hasBg ? "text-white/60" : "text-muted-foreground"}`}>
                      {link.description}
                    </p>
                  )}
                </div>
                <ExternalLink
                  size={14}
                  className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${hasBg ? "text-white/70" : "text-muted-foreground"}`}
                />
              </a>
            ))}
          </div>

          <p className={`text-xs text-center mt-4 ${hasBg ? "text-white/30" : "text-muted-foreground/50"}`}>
            iamchomad.my.id
          </p>
        </div>
      </div>
    </>
  );
}

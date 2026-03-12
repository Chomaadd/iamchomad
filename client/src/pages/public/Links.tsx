import { useLinkItems } from "@/hooks/use-links";
import { useSiteSettings } from "@/hooks/use-settings";
import { SeoHead } from "@/components/seometa/SeoHead";
import { ExternalLink, Loader2, User } from "lucide-react";
import { LinkIcon } from "@/lib/social-icons";
import type { LinkItem } from "@shared/schema";

const DEFAULT_NAME = "Choiril Ahmad";
const DEFAULT_BIO = "Frontend Developer & Visual Designer";

export default function Links() {
  const { data: links, isLoading } = useLinkItems();
  const { data: settings } = useSiteSettings();

  const activeLinks =
    links
      ?.filter((l: LinkItem) => l.isActive)
      .sort((a, b) => a.order - b.order) ?? [];

  const avatarUrl = settings?.linksAvatarUrl;
  const name = settings?.linksName || DEFAULT_NAME;
  const bio = settings?.linksBio || DEFAULT_BIO;

  return (
    <>
      <SeoHead
        title={`Links — ${name}`}
        description={`All links to find ${name} on the web — social media, portfolio, email, and more.`}
        url="https://iamchomad.my.id/links"
        image="https://iamchomad.my.id/og-image.png"
      />
      <div className="min-h-screen bg-background flex flex-col items-center justify-start py-16 px-4">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-24 h-24 rounded-full border-4 border-border shadow-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  data-testid="img-links-avatar"
                />
              ) : (
                <User
                  size={36}
                  className="text-muted-foreground"
                  data-testid="img-links-avatar-placeholder"
                />
              )}
            </div>
            <div>
              <h1
                className="text-2xl font-serif font-bold tracking-tight"
                data-testid="text-links-name"
              >
                {name}
              </h1>
              <p
                className="text-sm text-muted-foreground mt-1"
                data-testid="text-links-bio"
              >
                {bio}
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && activeLinks.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8 italic">
                No links yet.
              </p>
            )}

            {activeLinks.map((link: LinkItem) => (
              <a
                key={link.id}
                href={link.url}
                target={link.url.startsWith("mailto:") ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className="group flex items-center gap-4 w-full px-5 py-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md hover:bg-accent/30 transition-all duration-200"
                data-testid={`link-item-${link.id}`}
              >
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <LinkIcon url={link.url} emoji={link.icon} size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {link.title}
                  </p>
                  {link.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {link.description}
                    </p>
                  )}
                </div>
                <ExternalLink
                  size={14}
                  className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground/50 text-center mt-4">
            iamchomad.my.id
          </p>
        </div>
      </div>
    </>
  );
}

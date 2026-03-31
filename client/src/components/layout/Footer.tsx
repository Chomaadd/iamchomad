import { Github, Linkedin, Instagram, Mail, Send, Youtube } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useSiteSettings } from "@/hooks/use-settings";

export function Footer() {
  const { t } = useLanguage();
  const { data: settings } = useSiteSettings();
  const ownerName = settings?.resumeFullName || "Choiril Ahmad";

  return (
    <footer className="bg-transparent text-muted-foreground py-5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium">
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="opacity-30 hidden md:inline">/</span>
          <span className="text-foreground font-semibold">{ownerName}</span>
          <span className="opacity-30 hidden md:inline">/</span>
          <span className="italic">{t("footer.rights")}</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Chomaadd"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-200"
            aria-label="GitHub"
            data-testid="link-social-github"
          >
            <Github size={20} strokeWidth={1.5} />
          </a>
          <a
            href="https://youtube.com/c/iamchomad"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-200"
            aria-label="YouTube"
            data-testid="link-social-youtube"
          >
            <Youtube size={20} strokeWidth={1.5} />
          </a>
          <a
            href="https://instagram.com/iamchomad"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-200"
            aria-label="Instagram"
            data-testid="link-social-instagram"
          >
            <Instagram size={20} strokeWidth={1.5} />
          </a>
          <a
            href="https://t.me/iamchomad"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-200"
            aria-label="Telegram"
            data-testid="link-social-telegram"
          >
            <Send size={20} strokeWidth={1.5} />
          </a>
          <a
            href="mailto:iamchoirilfk@gmail.com"
            className="hover:text-foreground transition-colors duration-200"
            aria-label="Email"
            data-testid="link-social-email"
          >
            <Mail size={20} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </footer>
  );
}

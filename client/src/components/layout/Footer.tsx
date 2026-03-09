import { Github, Linkedin, Instagram, Mail, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-transparent text-muted-foreground py-5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium">
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="opacity-30 hidden md:inline">/</span>
          <span className="text-foreground font-semibold">Choiril Ahmad</span>
          <span className="opacity-30 hidden md:inline">/</span>
          <span className="italic">Crafting digital experiences with precision</span>
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
            href="https://linkedin.com/in/iamchomad"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-200"
            aria-label="LinkedIn"
            data-testid="link-social-linkedin"
          >
            <Linkedin size={20} strokeWidth={1.5} />
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

import { Github, Linkedin, Instagram, Mail, Send, Heart } from "lucide-react";

export function Footer() {
  const socials = [
    { href: "https://github.com/Chomaadd", icon: Github, label: "GitHub" },
    { href: "https://linkedin.com/in/iamchomad", icon: Linkedin, label: "LinkedIn" },
    { href: "https://instagram.com/iamchomad", icon: Instagram, label: "Instagram" },
    { href: "https://t.me/iamchomad", icon: Send, label: "Telegram" },
    { href: "mailto:iamchoirilfk@gmail.com", icon: Mail, label: "Email" },
  ];

  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <span className="font-serif text-lg font-bold tracking-tight">Choiril Ahmad</span>
            <p className="text-sm text-muted-foreground">Crafting digital experiences with precision</p>
          </div>

          <div className="flex items-center gap-3">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-accent/60 hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all duration-200 hover:scale-110"
                aria-label={label}
                data-testid={`link-social-${label.toLowerCase()}`}
              >
                <Icon size={18} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Choiril Ahmad</span>
          <span className="inline-flex items-center gap-1">
            — Made with <Heart size={12} className="text-rose-400 fill-rose-400" /> in Indonesia
          </span>
        </div>
      </div>
    </footer>
  );
}

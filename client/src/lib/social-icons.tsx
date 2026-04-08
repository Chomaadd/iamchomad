import {
  SiInstagram, SiX, SiGithub, SiLinkedin, SiYoutube, SiTiktok,
  SiFacebook, SiSpotify, SiBehance, SiDribbble, SiMedium,
  SiTelegram, SiDiscord, SiWhatsapp, SiSnapchat, SiPinterest,
  SiReddit, SiTwitch, SiThreads, SiFigma, SiNotion, SiSubstack,
  SiPatreon, SiKofi, SiDevdotto, SiHashnode, SiCodepen,
  SiSoundcloud, SiApplemusic, SiLastdotfm,
} from "react-icons/si";
import { MdEmail, MdLink } from "react-icons/md";
import type { ComponentType } from "react";

export interface SocialPlatform {
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  label: string;
}

const DOMAIN_MAP: Record<string, SocialPlatform> = {
  "instagram.com": { icon: SiInstagram, color: "#E1306C", label: "Instagram" },
  "x.com": { icon: SiX, color: "#000000", label: "X (Twitter)" },
  "twitter.com": { icon: SiX, color: "#000000", label: "Twitter" },
  "github.com": { icon: SiGithub, color: "#181717", label: "GitHub" },
  "linkedin.com": { icon: SiLinkedin, color: "#0A66C2", label: "LinkedIn" },
  "youtube.com": { icon: SiYoutube, color: "#FF0000", label: "YouTube" },
  "youtu.be": { icon: SiYoutube, color: "#FF0000", label: "YouTube" },
  "tiktok.com": { icon: SiTiktok, color: "#000000", label: "TikTok" },
  "facebook.com": { icon: SiFacebook, color: "#1877F2", label: "Facebook" },
  "fb.com": { icon: SiFacebook, color: "#1877F2", label: "Facebook" },
  "spotify.com": { icon: SiSpotify, color: "#1DB954", label: "Spotify" },
  "open.spotify.com": { icon: SiSpotify, color: "#1DB954", label: "Spotify" },
  "behance.net": { icon: SiBehance, color: "#1769FF", label: "Behance" },
  "dribbble.com": { icon: SiDribbble, color: "#EA4C89", label: "Dribbble" },
  "medium.com": { icon: SiMedium, color: "#000000", label: "Medium" },
  "telegram.org": { icon: SiTelegram, color: "#26A5E4", label: "Telegram" },
  "t.me": { icon: SiTelegram, color: "#26A5E4", label: "Telegram" },
  "discord.com": { icon: SiDiscord, color: "#5865F2", label: "Discord" },
  "discord.gg": { icon: SiDiscord, color: "#5865F2", label: "Discord" },
  "whatsapp.com": { icon: SiWhatsapp, color: "#25D366", label: "WhatsApp" },
  "wa.me": { icon: SiWhatsapp, color: "#25D366", label: "WhatsApp" },
  "snapchat.com": { icon: SiSnapchat, color: "#FFFC00", label: "Snapchat" },
  "pinterest.com": { icon: SiPinterest, color: "#E60023", label: "Pinterest" },
  "reddit.com": { icon: SiReddit, color: "#FF4500", label: "Reddit" },
  "twitch.tv": { icon: SiTwitch, color: "#9146FF", label: "Twitch" },
  "threads.net": { icon: SiThreads, color: "#000000", label: "Threads" },
  "figma.com": { icon: SiFigma, color: "#F24E1E", label: "Figma" },
  "notion.so": { icon: SiNotion, color: "#000000", label: "Notion" },
  "substack.com": { icon: SiSubstack, color: "#FF6719", label: "Substack" },
  "patreon.com": { icon: SiPatreon, color: "#FF424D", label: "Patreon" },
  "ko-fi.com": { icon: SiKofi, color: "#FF5E5B", label: "Ko-fi" },
  "dev.to": { icon: SiDevdotto, color: "#0A0A0A", label: "Dev.to" },
  "hashnode.com": { icon: SiHashnode, color: "#2962FF", label: "Hashnode" },
  "codepen.io": { icon: SiCodepen, color: "#000000", label: "CodePen" },
  "soundcloud.com": { icon: SiSoundcloud, color: "#FF3300", label: "SoundCloud" },
  "music.apple.com": { icon: SiApplemusic, color: "#FC3C44", label: "Apple Music" },
  "last.fm": { icon: SiLastdotfm, color: "#D51007", label: "Last.fm" },
};

function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url.startsWith("http") ? url : `https://${url}`);
    return hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function detectPlatform(url: string): SocialPlatform | null {
  const domain = extractDomain(url);
  if (!domain) return null;

  for (const [key, platform] of Object.entries(DOMAIN_MAP)) {
    if (domain === key || domain.endsWith(`.${key}`)) {
      return platform;
    }
  }
  return null;
}

export function isEmailUrl(url: string): boolean {
  return url.startsWith("mailto:");
}

interface LinkIconProps {
  url: string;
  emoji?: string | null;
  size?: number;
}

export function LinkIcon({ url, emoji, size = 22 }: LinkIconProps) {
  if (emoji) {
    return <span style={{ fontSize: size }} aria-hidden="true">{emoji}</span>;
  }

  if (isEmailUrl(url)) {
    return <MdEmail size={size} style={{ color: "#6366F1" }} />;
  }

  const platform = detectPlatform(url);
  if (platform) {
    const Icon = platform.icon as any;
    return <Icon size={size} style={{ color: platform.color }} />;
  }

  return <MdLink size={size} className="text-muted-foreground" />;
}

export function LinkIconPreview({ url, emoji }: { url: string; emoji?: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <div className="w-8 h-8 flex items-center justify-center">
        <LinkIcon url={url} emoji={emoji || null} size={20} />
      </div>
      {!emoji && (() => {
        if (isEmailUrl(url)) return <span className="text-xs text-muted-foreground">Email</span>;
        const platform = detectPlatform(url);
        if (platform) return <span className="text-xs text-muted-foreground">{platform.label} terdeteksi</span>;
        return <span className="text-xs text-muted-foreground">Ikon default</span>;
      })()}
      {emoji && <span className="text-xs text-muted-foreground">Custom emoji</span>}
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Palette, Code, PenTool, Mail, ExternalLink, Sparkles, Zap, Globe, ArrowRight, Music, BookOpen, Briefcase, MapPin, Gamepad2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { SeoHead } from "@/components/seometa/SeoHead";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-settings";

interface LanyardData {
  discord_status: "online" | "idle" | "dnd" | "offline";
  spotify?: {
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
  } | null;
  activities?: Array<{
    type: number;
    name: string;
    state?: string;
    details?: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  online: "bg-green-500",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-400",
};


const skillCategories = [
  {
    key: "programming",
    icon: Code,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    items: [
      { name: "TypeScript", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      { name: "JavaScript", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
      { name: "React", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
      { name: "Node.js", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
      { name: "Express", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
      { name: "Python", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
    ],
  },
  {
    key: "design",
    icon: Palette,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    items: [
      { name: "Figma", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
      { name: "Canva", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
      { name: "Adobe Illustrator", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
      { name: "Procreate", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
    ],
  },
  {
    key: "tools",
    icon: Zap,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    items: [
      { name: "MongoDB", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
      { name: "Git & GitHub", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
      { name: "VS Code", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      { name: "Postman", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
      { name: "Docker", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
    ],
  },
  {
    key: "softskills",
    icon: Globe,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    items: [
      { name: "Leadership", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
      { name: "Problem Solving", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
      { name: "Communication", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
      { name: "Creative Thinking", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    ],
  },
];

export default function About() {
  const { t } = useLanguage();
  const { data: settings } = useSiteSettings();
  const [lanyard, setLanyard] = useState<LanyardData | null>(null);

  useEffect(() => {
    const discordId = settings?.lanyardDiscordId;
    if (!discordId) return;
    let cancelled = false;
    const fetchLanyard = () => {
      fetch(`https://api.lanyard.rest/v1/users/${discordId}`)
        .then(r => r.json())
        .then(data => { if (!cancelled && data.success) setLanyard(data.data); })
        .catch(() => {});
    };
    fetchLanyard();
    const interval = setInterval(fetchLanyard, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [settings?.lanyardDiscordId]);

  const listeningText = lanyard?.spotify
    ? `${lanyard.spotify.song} — ${lanyard.spotify.artist}`
    : settings?.nowListening ?? null;

  const playingGame = lanyard?.activities
    ? lanyard.activities.find((a) => a.type === 0) ?? null
    : null;

  const hasNow = !!(settings && (
    settings.lanyardDiscordId || settings.nowListening || settings.nowReading ||
    settings.nowWorking || settings.nowLocation || playingGame
  ));

  const highlights = [
    { icon: Palette, title: t("about.highlight.creative"), desc: t("about.highlight.creative.desc") },
    { icon: Code, title: t("about.highlight.digital"), desc: t("about.highlight.digital.desc") },
    { icon: PenTool, title: t("about.highlight.editorial"), desc: t("about.highlight.editorial.desc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="About"
        description="Learn about Choiril Ahmad — Entrepreneur & Software Developer from Indonesia, crafting digital experiences with precision and purpose."
        url="/about"
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">

        {/* ── HERO ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start mb-24">

          {/* LEFT – Photo card */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="lg:sticky lg:top-24">
              {/* Photo inside a styled panel */}
              <div className="relative bg-card border border-border/60 rounded-3xl overflow-hidden soft-shadow-lg">
                {/* Ambient top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-violet-500/60 to-primary/20 z-10" />

                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={settings?.aboutImageUrl || "/image/iamchomad.png"}
                    alt="Profile Choiril Ahmad"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Overlay info bar at bottom of photo */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-6 py-5">
                  <p className="text-white font-bold text-lg leading-tight">Choiril Ahmad</p>
                  <p className="text-white/70 text-xs mt-0.5">Frontend Developer · Visual Designer</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { value: "3+", key: "about.stats.years" },
                  { value: "20+", key: "about.stats.projects" },
                  { value: "5+", key: "about.stats.brands" },
                ].map((s) => (
                  <div key={s.key} className="bg-card border border-border/60 rounded-2xl py-4 text-center soft-shadow hover:-translate-y-0.5 transition-transform">
                    <div className="text-2xl font-bold text-primary leading-none">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground font-medium mt-1">{t(s.key)}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT – Text content */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 uppercase tracking-wider">
              <Sparkles size={12} /> {t("about.badge")}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-about-heading">
              {t("about.heading")}{" "}
              <span className="gradient-text">{t("about.heading.highlight")}</span>
            </h1>

            <p className="text-lg font-medium text-foreground mb-4 leading-relaxed">
              {t("about.intro")}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {t("about.philosophy")}
            </p>

            {/* Experience quote-card */}
            <div className="border-l-4 border-primary/60 bg-primary/5 rounded-r-2xl pl-5 pr-5 py-5 mb-10">
              <h3 className="font-serif text-base font-bold text-foreground mb-2">
                {t("about.experience.title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("about.experience.desc")}
              </p>
            </div>

            {/* Highlight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {highlights.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="group bg-card border border-border/60 rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-default"
                  data-testid={`card-skill-${title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick CTA */}
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all" data-testid="button-quick-cta">
                <Mail size={15} /> {t("about.cta.contact")}
                <ArrowRight size={14} />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* ── NOW SECTION ── */}
        {hasNow && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="bg-card border border-border/60 rounded-2xl p-6 soft-shadow">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
                  <span className="text-base">📡</span>
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-foreground">{t("about.now.title")}</h2>
                  {lanyard && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[lanyard.discord_status] ?? "bg-gray-400"}`} />
                      <span className="text-[11px] text-muted-foreground">{t(`about.discord.${lanyard.discord_status}`) || t("about.discord.offline")} {t("about.discord.label")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cards grid — only renders if there's actual content */}
              {(listeningText || playingGame || settings?.nowReading || settings?.nowWorking || settings?.nowLocation) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {playingGame && (
                    <div className="flex items-start gap-3 p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                        <Gamepad2 size={16} className="text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-0.5">{t("about.now.playing")}</p>
                        <p className="text-xs text-foreground font-medium truncate">{playingGame.name}</p>
                        {playingGame.details && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{playingGame.details}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {listeningText && (
                    <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                      {lanyard?.spotify?.album_art_url ? (
                        <img src={lanyard.spotify.album_art_url} alt="album" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                          <Music size={16} className="text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">
                          {lanyard?.spotify ? t("about.now.listening.spotify") : t("about.now.listening.manual")}
                        </p>
                        <p className="text-xs text-foreground font-medium truncate">{listeningText}</p>
                      </div>
                    </div>
                  )}
                  {settings?.nowReading && (
                    <div className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                        <BookOpen size={16} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">{t("about.now.reading")}</p>
                        <p className="text-xs text-foreground font-medium truncate">{settings.nowReading}</p>
                      </div>
                    </div>
                  )}
                  {settings?.nowWorking && (
                    <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                        <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">{t("about.now.working")}</p>
                        <p className="text-xs text-foreground font-medium truncate">{settings.nowWorking}</p>
                      </div>
                    </div>
                  )}
                  {settings?.nowLocation && (
                    <div className="flex items-start gap-3 p-3 bg-green-500/5 rounded-xl border border-green-500/10">
                      <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
                        <MapPin size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-0.5">{t("about.now.location")}</p>
                        <p className="text-xs text-foreground font-medium truncate">{settings.nowLocation}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/60 italic">
                  {settings?.lanyardDiscordId
                    ? t("about.now.waiting")
                    : t("about.now.empty")}
                </p>
              )}
            </div>
          </motion.section>
        )}

        {/* ── SKILLS SECTION ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
              <Zap size={12} /> Tech Stack
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-skills-heading">
              {t("about.skills.title")}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
              {t("about.skills.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {skillCategories.map(({ key, icon: CatIcon, color, bg, items }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border/60 rounded-2xl p-6 soft-shadow hover:shadow-md hover:-translate-y-0.5 transition-all"
                data-testid={`card-skillcat-${key}`}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <CatIcon size={16} className={color} />
                  </div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-foreground">
                    {t(`about.skills.${key}`)}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map(({ name, color: c }) => (
                    <span
                      key={name}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${c}`}
                      data-testid={`badge-skill-${name.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mt-20 mb-8"
        >
          <div className="relative rounded-3xl overflow-hidden">
            {/* Dark gradient background — fixed dark color, works in both light & dark mode */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
            <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />

            <div className="relative px-10 md:px-16 py-14 md:py-20 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-6 uppercase tracking-wider">
                <Sparkles size={12} /> Let's Connect
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white" data-testid="text-cta-heading">
                {t("about.cta.title")}
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto">
                {t("about.cta.desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/contact">
                  <Button size="lg" className="gap-2 px-8 rounded-full bg-white text-zinc-950 hover:bg-white/90 shadow-lg" data-testid="button-cta-contact">
                    <Mail size={18} /> {t("about.cta.contact")}
                  </Button>
                </Link>
                <Link href="/links">
                  <Button variant="outline" size="lg" className="gap-2 px-8 rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white" data-testid="button-cta-links">
                    <ExternalLink size={18} /> {t("about.cta.links")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

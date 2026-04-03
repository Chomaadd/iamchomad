import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Palette, Code, PenTool, Mail, ExternalLink, Sparkles, Zap, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { SeoHead } from "@/components/seometa/SeoHead";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-settings";

const skillCategories = [
  {
    key: "programming",
    icon: Code,
    color: "text-blue-500",
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
    color: "text-purple-500",
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
    color: "text-amber-500",
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
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    items: [
      { name: "Leadership", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
      { name: "Problem Solving", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
      { name: "Communication", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
      { name: "Creative Thinking", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    ],
  },
];

const stats = [
  { label: "Years Learning", value: "3+" },
  { label: "Projects Built", value: "20+" },
  { label: "Brands Created", value: "5+" },
];

export default function About() {
  const { t } = useLanguage();
  const { data: settings } = useSiteSettings();

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Left – photo */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="sticky top-24 space-y-5">
              {/* Photo frame */}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/20 via-violet-500/10 to-primary/5 blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-700" />
                <div className="relative rounded-2xl overflow-hidden ring-1 ring-border/40">
                  <img
                    src={settings?.aboutImageUrl || "/image/iamchomad.png"}
                    alt="Profile Choiril Ahmad"
                    className="w-full aspect-[4/5] object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="bg-card border border-border/60 rounded-xl p-4 text-center soft-shadow hover-lift transition-all">
                    <div className="text-xl font-bold text-primary">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right – content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 uppercase tracking-wider">
              <Sparkles size={12} /> {t("about.badge")}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-about-heading">
              {t("about.heading")}{" "}
              <span className="gradient-text">{t("about.heading.highlight")}</span>
            </h1>

            <div className="space-y-5 text-muted-foreground leading-relaxed mb-8">
              <p className="text-lg font-medium text-foreground">
                {t("about.intro")}
              </p>
              <p>{t("about.philosophy")}</p>
            </div>

            {/* Experience card */}
            <div className="bg-card border border-border/60 rounded-2xl p-6 soft-shadow mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles size={15} className="text-primary" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  {t("about.experience.title")}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t("about.experience.desc")}
              </p>
            </div>

            {/* Highlight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {highlights.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-card border border-border/60 rounded-xl p-5 hover-lift soft-shadow group cursor-default"
                  data-testid={`card-skill-${title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── SKILLS SECTION ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-28"
        >
          {/* Section header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/60" />
            <div className="text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-skills-heading">
                {t("about.skills.title")}
              </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/60" />
          </div>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            {t("about.skills.subtitle")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {skillCategories.map(({ key, icon: CatIcon, color, bg, items }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border/60 rounded-2xl p-6 soft-shadow hover:shadow-md transition-all hover:-translate-y-0.5"
                data-testid={`card-skillcat-${key}`}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                    <CatIcon size={15} className={color} />
                  </div>
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-foreground">
                    {t(`about.skills.${key}`)}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map(({ name, color: c }) => (
                    <span
                      key={name}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${c}`}
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
          transition={{ duration: 0.6 }}
          className="mt-24 mb-8"
        >
          <div className="relative bg-card border border-border/60 rounded-3xl p-10 md:p-16 text-center overflow-hidden soft-shadow-lg">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/10 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5 uppercase tracking-wider">
                <Mail size={12} /> {t("contact.badge")}
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4" data-testid="text-cta-heading">
                {t("about.cta.title")}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                {t("about.cta.desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/contact">
                  <Button size="lg" className="gap-2 px-8 rounded-full shadow-lg shadow-primary/20" data-testid="button-cta-contact">
                    <Mail size={18} /> {t("about.cta.contact")}
                  </Button>
                </Link>
                <Link href="/links">
                  <Button variant="outline" size="lg" className="gap-2 px-8 rounded-full" data-testid="button-cta-links">
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

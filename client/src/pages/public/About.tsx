import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Palette, Code, PenTool, Mail, ExternalLink } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { SeoHead } from "@/components/seometa/SeoHead";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-settings";

const skillCategories = [
  {
    key: "programming",
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
    items: [
      { name: "Figma", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
      { name: "Canva", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
      { name: "Adobe Illustrator", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
      { name: "Procreate", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
    ],
  },
  {
    key: "tools",
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
        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5"
          >
            <div className="sticky top-24">
              <div className="rounded-2xl overflow-hidden soft-shadow-lg">
                <img
                  src={settings?.aboutImageUrl || "/image/iamchomad.png"}
                  alt="Profile Choiril Ahmad"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {highlights.map(({ icon: Icon, title }) => (
                  <div key={title} className="bg-card border border-border/60 rounded-xl p-4 text-center soft-shadow" data-testid={`card-highlight-${title.toLowerCase().replace(/\s/g, '-')}`}>
                    <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <p className="text-xs font-semibold leading-tight">{title}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 uppercase tracking-wider">
              {t("about.badge")}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight" data-testid="text-about-heading">
              {t("about.heading")} <br />
              <span className="gradient-text">
                {t("about.heading.highlight")}
              </span>
            </h1>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg font-medium text-foreground">
                {t("about.intro")}
              </p>

              <p>
                {t("about.philosophy")}
              </p>

              <div className="bg-card border border-border/60 rounded-2xl p-6 my-8 soft-shadow">
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                  {t("about.experience.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("about.experience.desc")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                {highlights.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-card border border-border/60 rounded-xl p-5 hover-lift soft-shadow" data-testid={`card-skill-${title.toLowerCase().replace(/\s/g, '-')}`}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Skills & Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3" data-testid="text-skills-heading">
              {t("about.skills.title")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("about.skills.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillCategories.map(({ key, items }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-card border border-border/60 rounded-2xl p-6 soft-shadow"
                data-testid={`card-skillcat-${key}`}
              >
                <h3 className="font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
                  {t(`about.skills.${key}`)}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map(({ name, color }) => (
                    <span
                      key={name}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}
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

        {/* Call To Action */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-24 mb-8"
        >
          <div className="bg-card border border-border/60 rounded-3xl p-10 md:p-16 text-center soft-shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
            <div className="relative">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4" data-testid="text-cta-heading">
                {t("about.cta.title")}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                {t("about.cta.desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="gap-2 px-8 rounded-full"
                    data-testid="button-cta-contact"
                  >
                    <Mail size={18} />
                    {t("about.cta.contact")}
                  </Button>
                </Link>
                <Link href="/links">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 px-8 rounded-full"
                    data-testid="button-cta-links"
                  >
                    <ExternalLink size={18} />
                    {t("about.cta.links")}
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

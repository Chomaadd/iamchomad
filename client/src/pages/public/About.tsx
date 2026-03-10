import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Palette, Code, PenTool } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { SeoHead } from "@/components/seometa/SeoHead";

export default function About() {
  const { t } = useLanguage();

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5"
          >
            <div className="sticky top-24">
              <div className="rounded-2xl overflow-hidden soft-shadow-lg">
                <img
                  src="/image/iamchomad.png"
                  alt="Profile Choiril Ahmad"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {highlights.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-card border border-border/60 rounded-xl p-4 text-center soft-shadow" data-testid={`card-highlight-${title.toLowerCase().replace(/\s/g,'-')}`}>
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
                  <div key={title} className="bg-card border border-border/60 rounded-xl p-5 hover-lift soft-shadow" data-testid={`card-skill-${title.toLowerCase().replace(/\s/g,'-')}`}>
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
      </main>

      <Footer />
    </div>
  );
}

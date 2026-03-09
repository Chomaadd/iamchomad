import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Palette, Code, PenTool } from "lucide-react";

export default function About() {
  const highlights = [
    { icon: Palette, title: "Creative Direction", desc: "Guiding brand vision from conception to execution." },
    { icon: Code, title: "Digital Architecture", desc: "Structuring complex systems with intuitive grace." },
    { icon: PenTool, title: "Editorial Design", desc: "Crafting typography-driven narrative experiences." },
  ];

  return (
    <div className="min-h-screen bg-background">
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
              About Me
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight" data-testid="text-about-heading">
              Beginner Entrepreneur <br />
              <span className="gradient-text">
                & Software Developer.
              </span>
            </h1>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg font-medium text-foreground">
                With over a decade of experience bridging the gap between
                brutalist function and elegant form, I craft identities that
                resonate on a visceral level.
              </p>

              <p>
                My philosophy is simple: design is not just about making things
                look good. It is about distilling complexity into its purest,
                most potent form. Every line, every shadow, every code must
                prove its existence in the line.
              </p>

              <div className="bg-card border border-border/60 rounded-2xl p-6 my-8 soft-shadow">
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                  Experience & Philosophy
                </h3>
                <p className="text-muted-foreground">
                  I have collaborated with forward-thinking startups and
                  established luxury brands, redefining their digital presence. By
                  adopting a strict monochromatic foundation, I ensure that the
                  content itself takes center stage, supported by flawless
                  typography and structural integrity.
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

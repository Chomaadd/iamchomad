import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBrandItems } from "@/hooks/use-brand";
import { Loader2, ArrowUpRight, Layers } from "lucide-react";

export default function Memory() {
  const { data: items, isLoading } = useBrandItems();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
            <Layers size={14} /> Portfolio
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold" data-testid="text-brand-heading">
            Brand & Work
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
            Selected projects, visual identities, and architectural concepts.
          </p>
        </motion.header>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {items?.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 2) * 0.1 }}
              >
                <div className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover-lift soft-shadow hover:shadow-lg transition-all" data-testid={`card-brand-${item.id}`}>
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-4 right-4 bg-card/90 backdrop-blur text-foreground p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground shadow-lg"
                        data-testid={`link-brand-external-${item.id}`}
                      >
                        <ArrowUpRight size={18} />
                      </a>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors">{item.title}</h3>
                      {item.category && (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {items?.length === 0 && (
              <div className="col-span-full text-center py-24 bg-card border border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Layers size={28} className="text-primary" />
                </div>
                <p className="font-serif text-xl font-bold">No projects yet</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

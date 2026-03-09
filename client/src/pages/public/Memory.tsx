import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useMemoryItems } from "@/hooks/use-memory";
import { Loader2, ArrowUpRight, Camera } from "lucide-react";

export default function Memory() {
  const { data: items, isLoading } = useMemoryItems();

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
            <Camera size={14} /> Gallery
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold" data-testid="text-memory-heading">
            Memories Immortalized
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
            Sharing memorable moments with people you meet in this life.
          </p>
        </motion.header>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
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
                <div className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover-lift soft-shadow hover:shadow-lg transition-all" data-testid={`card-memory-${item.id}`}>
                  <div className="p-4">
                    <div className="overflow-hidden bg-muted rounded-xl aspect-[4/5] relative">
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
                          className="absolute top-3 right-3 bg-card/90 backdrop-blur text-foreground p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground shadow-lg"
                          data-testid={`link-memory-external-${item.id}`}
                        >
                          <ArrowUpRight size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {item.category && (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {items?.length === 0 && (
              <div className="col-span-full text-center py-24 bg-card border border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Camera size={28} className="text-primary" />
                </div>
                <p className="font-serif text-xl font-bold">No memories yet</p>
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

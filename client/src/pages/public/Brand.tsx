import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBrandItems } from "@/hooks/use-brand";
import { Loader2, ArrowUpRight } from "lucide-react";

export default function Brand() {
  const { data: items, isLoading } = useBrandItems();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <header className="mb-20 border-b-2 border-border pb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-6xl md:text-8xl font-bold"
          >
            Brand & Work.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground mt-6 max-w-2xl"
          >
            Selected projects, visual identities, and architectural concepts.
          </motion.p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {items?.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 2) * 0.1 }}
                className="group relative"
              >
                <div className="aspect-[4/3] border-2 border-border overflow-hidden bg-muted mb-6 relative">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                    />
                  )}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 bg-background text-foreground p-3 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity editorial-shadow-sm hover:translate-y-[-2px] hover:translate-x-[-2px]">
                      <ArrowUpRight size={20} />
                    </a>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-3xl font-bold">{item.title}</h3>
                    {item.category && <span className="text-xs font-bold uppercase tracking-widest border border-border px-2 py-1">{item.category}</span>}
                  </div>
                  <p className="text-muted-foreground mt-4">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

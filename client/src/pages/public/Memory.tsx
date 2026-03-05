import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useMemoryItems } from "@/hooks/use-memory";
import { Loader2, ArrowUpRight } from "lucide-react";

export default function Memory() {
  const { data: items, isLoading } = useMemoryItems();

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
            Memories Immortalized.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground mt-6 max-w-2xl"
          >
            Sharing memorable moments with people you meet in this life.
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
                <div className="border-4 border-border p-4 bg-card editorial-shadow-sm hover:editorial-shadow transition-all duration-500 rounded-[2rem] overflow-hidden">
                  <div className="overflow-hidden bg-muted mb-6 relative rounded-[1.5rem]">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        //className="w-full h-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-700" 
                      />
                    )}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 bg-background text-foreground p-3 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity editorial-shadow-sm hover:translate-y-[-2px] hover:translate-x-[-2px]">
                        <ArrowUpRight size={20} />
                      </a>
                    )}
                  </div>
                  <div className="px-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-3xl font-bold">{item.title}</h3>
                      {item.category && <span className="text-xs font-bold uppercase tracking-widest border border-border px-2 py-1">{item.category}</span>}
                    </div>
                    <p className="text-muted-foreground mt-4 leading-relaxed italic font-serif">{item.description}</p>
                  </div>
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
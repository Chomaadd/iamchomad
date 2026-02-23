import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5"
          >
            {/* about page professional portrait */}
            <div className="sticky top-32 border-2 border-primary editorial-shadow bg-muted overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop&grayscale=true" 
                alt="Profile" 
                className="w-full h-auto object-cover grayscale"
              />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 lg:pl-12"
          >
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-12 border-b-2 border-border pb-8">The Architect <br/><span className="italic font-light text-muted-foreground">of aesthetics.</span></h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-muted-foreground">
              <p className="text-xl font-medium text-foreground leading-relaxed">
                With over a decade of experience bridging the gap between brutalist function and elegant form, I craft identities that resonate on a visceral level.
              </p>
              
              <p>
                My philosophy is simple: design is not just about making things look good. It is about distilling complexity into its purest, most potent form. Every line, every shadow, every pixel must earn its right to exist on the canvas.
              </p>

              <h3 className="font-serif text-2xl text-foreground mt-12 mb-6">Experience & Philosophy</h3>
              
              <p>
                I have collaborated with forward-thinking startups and established luxury brands, redefining their digital presence. By adopting a strict monochromatic foundation, I ensure that the content itself takes center stage, supported by flawless typography and structural integrity.
              </p>
              
              <ul className="list-none pl-0 space-y-4 border-l-2 border-primary ml-4 pl-6 mt-8">
                <li><strong className="text-foreground">Creative Direction</strong> — Guiding brand vision from conception to execution.</li>
                <li><strong className="text-foreground">Digital Architecture</strong> — Structuring complex systems with intuitive grace.</li>
                <li><strong className="text-foreground">Editorial Design</strong> — Crafting typography-driven narrative experiences.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

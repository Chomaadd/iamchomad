import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border-2 border-primary rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border-2 border-primary rotate-45 animate-bounce" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center px-6"
      >
        <div className="mb-8 flex justify-center">
          <div className="p-6 border-4 border-primary editorial-shadow bg-card">
            <Compass className="h-24 w-24 text-primary animate-spin-slow" />
          </div>
        </div>

        <h1 className="font-serif text-8xl md:text-9xl font-bold tracking-tighter mb-4">404</h1>
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8 italic">Lost in the static.</h2>
        
        <p className="text-xl text-muted-foreground max-w-md mx-auto mb-12 leading-relaxed">
          The transmission you're looking for has been interrupted or doesn't exist in this frequency.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-lg h-14 px-8 border-2 border-primary editorial-shadow-sm hover:translate-y-[-2px] hover:translate-x-[-2px] transition-all">
              <Home className="w-5 h-5" /> Return Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto gap-2 text-lg h-14 px-8 border-2 border-border hover:bg-muted transition-all"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </Button>
        </div>
      </motion.div>

      <div className="absolute bottom-8 text-xs font-mono tracking-widest text-muted-foreground uppercase opacity-50">
        Choiril Ahmad / Portfolio / Error System
      </div>
    </div>
  );
}

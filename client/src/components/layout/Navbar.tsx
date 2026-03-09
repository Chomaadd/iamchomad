import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/brand", label: "Brand" },
    { href: "/memory", label: "Memory"},
    { href: "/music", label: "Sound" },
    { href: "/resume", label: "Resume" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain dark:invert" onError={(e) => e.currentTarget.style.display='none'} />
          <span className="font-serif text-2xl font-bold tracking-tighter">Choiril Ahmad</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`transition-colors hover:text-primary ${location === link.href ? "text-primary border-b-2 border-primary pb-1" : "text-muted-foreground"}`}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={toggleTheme} className="p-2 hover:bg-accent rounded-full transition-colors">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center space-x-4">
          <button onClick={toggleTheme} className="p-2">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 space-y-4">
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-serif ${location === link.href ? "font-bold text-primary" : "text-muted-foreground"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

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
    <header className="sticky top-0 z-40 w-full">
      <div className="glass">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain dark:invert transition-transform group-hover:scale-110" onError={(e) => e.currentTarget.style.display='none'} />
            <span className="font-serif text-xl font-bold tracking-tight">Choiril Ahmad</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {links.map((link) => {
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? "text-primary-foreground bg-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="w-px h-6 bg-border mx-2" />
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </nav>

          <div className="flex lg:hidden items-center gap-2">
            <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-accent transition-colors" data-testid="button-theme-toggle-mobile">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full hover:bg-accent transition-colors"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-full left-0 right-0 z-50 lg:hidden glass border-b border-border/50"
            >
              <div className="flex flex-col p-4 gap-1">
                {links.map((link) => {
                  const isActive = location === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

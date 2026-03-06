import { Github, Linkedin, Instagram, Mail, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-zinc-400 py-10 mt-20 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium">
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="text-zinc-700 hidden md:inline">/</span>
          <span className="text-white font-semibold">Choiril Ahmad</span>
          <span className="text-zinc-700 hidden md:inline">/</span>
          <span className="text-zinc-500 italic">Crafting digital experiences with precision</span>
        </div>
        
        <div className="flex items-center gap-6">
          <a 
            href="https://github.com/Chomaadd" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors duration-200"
            aria-label="GitHub"
          >
            <Github size={20} strokeWidth={1.5} />
          </a>
          <a 
            href="https://linkedin.com/in/iamchomad" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors duration-200"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} strokeWidth={1.5} />
          </a>
          <a 
            href="https://instagram.com/iamchomad" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors duration-200"
            aria-label="Instagram"
          >
            <Instagram size={20} strokeWidth={1.5} />
          </a>
          <a 
            href="https://t.me/iamchomad" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors duration-200"
            aria-label="Telegram"
          >
            <Send size={20} strokeWidth={1.5} />
          </a>
          <a 
            href="mailto:iamchoirilfk@gmail.com" 
            className="hover:text-white transition-colors duration-200"
            aria-label="Email"
          >
            <Mail size={20} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </footer>
  );
}

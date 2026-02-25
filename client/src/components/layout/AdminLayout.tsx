import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, FileText, Music, Image, Mail, LogOut, Loader2 } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/blog", label: "Journal", icon: FileText },
    { href: "/admin/brand", label: "Brand", icon: Image },
    { href: "/admin/music", label: "Music", icon: Music },
    { href: "/admin/messages", label: "Messages", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r-2 border-border bg-card flex flex-col">
        <div className="p-6 border-b-2 border-border">
          <h2 className="font-serif text-2xl font-bold tracking-tighter">Choiril Ahmad</h2>
          <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">Owner of CHOOMAD</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-none transition-all ${active ? 'bg-primary text-primary-foreground editorial-shadow-sm translate-x-[-2px] translate-y-[-2px]' : 'hover:bg-accent text-foreground'}`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t-2 border-border">
          <button 
            onClick={() => logout()}
            className="flex w-full items-center space-x-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b-2 border-border flex items-center justify-between px-8 bg-card shrink-0">
          <h1 className="font-serif text-xl font-semibold">Admin / {links.find(l => l.href === location)?.label || 'Overview'}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif text-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

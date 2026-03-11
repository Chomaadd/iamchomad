import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, FileText, Music, Image, Mail, LogOut, Loader2, Menu, X, Camera, ScrollText, BarChart2 } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/brand", label: "Brand", icon: Image },
    { href: "/admin/music", label: "Music", icon: Music },
    { href: "/admin/memory", label: "Memory", icon: Camera },
    { href: "/admin/resume", label: "Resume", icon: ScrollText },
    { href: "/admin/messages", label: "Messages", icon: Mail },
  ];

  const currentPage = links.find(l => l.href === location)?.label || "Overview";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 border-r border-border bg-card z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif text-lg font-bold shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-bold tracking-tight truncate">{user.name}</h2>
              <p className="text-xs text-muted-foreground tracking-wide uppercase">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-4 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Navigation</p>
          {links.map((link) => {
            const Icon = link.icon;
            const active = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 rounded-md group ${
                  active
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon size={18} className={active ? '' : 'group-hover:scale-110 transition-transform'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-8 bg-card/80 backdrop-blur-sm shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
              data-testid="button-toggle-sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Admin</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-semibold">{currentPage}</span>
            </div>
          </div>
          <Link href="/" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider" data-testid="link-view-site">
            View Site
          </Link>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Redirect } from "wouter";

export default function Login() {
  const { login, isLoggingIn, user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Redirect to="/admin" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      toast({ title: "Login Successful" });
    } catch (error: any) {
      toast({ title: "Access Denied", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, hsl(222 47% 6%) 0%, hsl(234 40% 12%) 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 60% 40%, hsl(234 89% 67%) 0%, transparent 60%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-10"
          style={{ background: "linear-gradient(90deg, transparent, hsl(234 89% 67%), transparent)" }}
        />

        <div className="relative p-12 pt-14">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "hsl(234 89% 64%)" }}
            >
              CA
            </div>
            <span className="text-white/60 text-sm tracking-widest uppercase font-medium">Admin Console</span>
          </div>
        </div>

        <div className="relative px-12 pb-16">
          <div className="mb-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(99,102,241,0.15)", color: "hsl(234 89% 75%)", border: "1px solid rgba(99,102,241,0.25)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Secure Access
            </div>
            <h1 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Choiril<br />Ahmad
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Personal portfolio management system. All content, projects, and creative works managed from here.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {["Blog & Stories", "Resume & CV", "Music & Brand"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full" style={{ background: "hsl(234 89% 64%)" }} />
                <span className="text-white/30 text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative p-12 pb-10">
          <p className="text-white/15 text-[10px] tracking-widest uppercase">iamchomad.my.id</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-[360px]">

          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "hsl(234 89% 64%)" }}
            >
              CA
            </div>
            <span className="text-muted-foreground text-xs tracking-widest uppercase">Admin Console</span>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-3">
              <ShieldCheck size={18} className="text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Authentication</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight" data-testid="text-login-title">
              Welcome back,<br />
              <span className="text-primary">Mad.</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-2">Sign in to manage your portfolio.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                Username
              </label>
              <input
                id="username"
                required
                autoComplete="username"
                value={credentials.username}
                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-muted/40 text-sm transition-all outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary border-border"
                placeholder="your username"
                data-testid="input-username"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-xl border bg-muted/40 text-sm transition-all outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary border-border"
                  placeholder="••••••••"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              data-testid="button-login"
            >
              {isLoggingIn ? (
                <><Loader2 size={16} className="animate-spin" /> Authenticating…</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground/40 mt-10 tracking-wider uppercase">
            iamchomad.my.id &middot; Admin
          </p>
        </div>
      </div>
    </div>
  );
}

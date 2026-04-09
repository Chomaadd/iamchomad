import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Redirect } from "wouter";
import { useLanguage } from "@/hooks/use-language";

export default function Login() {
  const { login, isLoggingIn, user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { data: settings } = useQuery<{ adminAvatarUrl?: string }>({
    queryKey: ["/api/settings"],
  });

  const avatarUrl = settings?.adminAvatarUrl || "/image/hellomaddy.jpg";

  if (user) return <Redirect to="/admin" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      toast({ title: t("admin.login.toast.success") });
    } catch (error: any) {
      toast({ title: t("admin.login.toast.error"), description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left photo panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] shrink-0 relative overflow-hidden">

        {/* Background photo */}
        <img
          src={avatarUrl}
          alt="Choiril Ahmad"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />

        {/* Gradient overlay — dark at top + heavier at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,10,20,0.55) 0%, rgba(8,10,20,0.15) 25%, rgba(8,10,20,0.65) 65%, rgba(8,10,20,0.97) 100%)",
          }}
        />

        {/* Top: Wordmark */}
        <div className="relative p-12 pt-14">
          <div className="flex items-center gap-3">
            <img src="/favicon-white.ico" alt="Logo" className="w-9 h-9 object-contain drop-shadow-lg" />
            <span className="text-white/70 text-sm tracking-widest uppercase font-medium">Admin Console</span>
          </div>
        </div>

        {/* Bottom: Name + tagline */}
        <div className="relative px-12 pb-16">
          <div className="mb-7">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{
                background: "rgba(99,102,241,0.18)",
                color: "hsl(234 89% 78%)",
                border: "1px solid rgba(99,102,241,0.28)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {t("admin.login.secure")}
            </div>
            <h1 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-xl">
              Choiril<br />Ahmad
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              {t("admin.login.tagline")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {["Blog & Stories", "Resume & CV", "Music & Brand"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full" style={{ background: "hsl(234 89% 64%)" }} />
                <span className="text-white/35 text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-12 pb-10">
          <p className="text-white/20 text-[10px] tracking-widest uppercase">iamchomad.my.id</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-[360px]">

          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <img src="/favicon-black.ico" alt="Logo" className="w-8 h-8 object-contain block dark:hidden" />
            <img src="/favicon-white.ico" alt="Logo" className="w-8 h-8 object-contain hidden dark:block" />
            <span className="text-muted-foreground text-xs tracking-widest uppercase">Admin Console</span>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-3">
              <ShieldCheck size={18} className="text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("admin.login.auth")}</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight" data-testid="text-login-title">
              {t("admin.login.welcome")}<br />
              <span className="text-primary">Mad.</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-2">{t("admin.login.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                {t("admin.login.username")}
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
                {t("admin.login.password")}
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
                <><Loader2 size={16} className="animate-spin" /> {t("admin.login.authenticating")}</>
              ) : (
                t("admin.login.submit")
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

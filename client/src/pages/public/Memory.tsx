import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useMemoryItems } from "@/hooks/use-memory";
import { Loader2, ArrowUpRight, Camera, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";

function useMemoryStatus() {
  return useQuery<{ unlocked: boolean }>({
    queryKey: ["/api/memory/status"],
  });
}

export default function Memory() {
  const { data: status, isLoading: statusLoading } = useMemoryStatus();
  const isUnlocked = status?.unlocked === true;
  const { data: items, isLoading: itemsLoading } = useMemoryItems(isUnlocked);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const verifyMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const res = await apiRequest("POST", "/api/memory/verify", { password: pwd });
      return res.json();
    },
    onSuccess: () => {
      setError("");
      setPassword("");
      queryClient.invalidateQueries({ queryKey: ["/api/memory/status"] });
    },
    onError: () => {
      setError(t("memory.locked.error"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setError("");
    verifyMutation.mutate(password);
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-md mx-auto px-6 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock size={36} className="text-primary" />
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3" data-testid="text-memory-locked">
              {t("memory.locked.heading")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t("memory.locked.desc")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder={t("memory.locked.placeholder")}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  autoFocus
                  data-testid="input-memory-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive font-medium"
                  data-testid="text-password-error"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={verifyMutation.isPending || !password.trim()}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="button-unlock-memory"
              >
                {verifyMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    {t("memory.locked.button")}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
            <Camera size={14} /> {t("memory.badge")}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold" data-testid="text-memory-heading">
            {t("memory.heading")}
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
            {t("memory.description")}
          </p>
        </motion.header>

        {itemsLoading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {items?.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 2) * 0.1 }}
              >
                <div className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover-lift soft-shadow hover:shadow-lg transition-all" data-testid={`card-memory-${item.id}`}>
                  <div className="p-4">
                    <div className="overflow-hidden bg-muted rounded-xl aspect-[4/5] relative">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-3 right-3 bg-card/90 backdrop-blur text-foreground p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground shadow-lg"
                          data-testid={`link-memory-external-${item.id}`}
                        >
                          <ArrowUpRight size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {item.category && (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {items?.length === 0 && (
              <div className="col-span-full text-center py-24 bg-card border border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Camera size={28} className="text-primary" />
                </div>
                <p className="font-serif text-xl font-bold">{t("memory.empty.title")}</p>
                <p className="text-sm text-muted-foreground mt-2">{t("memory.empty.desc")}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

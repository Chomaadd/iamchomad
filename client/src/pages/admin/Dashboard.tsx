import { AdminLayout } from "@/components/layout/AdminLayout";
import { usePosts } from "@/hooks/use-blog";
import { useContactMessages } from "@/hooks/use-contact";
import { useBrandItems } from "@/hooks/use-brand";
import { useMusicTracks } from "@/hooks/use-music";
import { useResumeItems } from "@/hooks/use-resume";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { FileText, Mail, Image, Music, TrendingUp, Clock, ScrollText, Briefcase, BookOpen, ExternalLink, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { AvailabilityStatus, NovelStory } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

export default function Dashboard() {
  const { data: posts } = usePosts();
  const { data: messages } = useContactMessages();
  const { data: brands } = useBrandItems();
  const { data: tracks } = useMusicTracks();
  const { data: resumeItems } = useResumeItems();
  const { data: settings } = useSiteSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateSiteSettings();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const availabilityOptions: { value: AvailabilityStatus; label: string; color: string; dot: string }[] = [
    { value: "open", label: t("home.activity.openwork"), color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    { value: "busy", label: t("home.activity.curentlybusy"), color: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    { value: "unavailable", label: t("home.activity.notavailable"), color: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400", dot: "bg-red-500" },
  ];

  const { data: novelStories } = useQuery<NovelStory[]>({ queryKey: ["/api/novel/stories/all"] });

  const unreadMessages = messages?.filter(m => !m.read).length || 0;

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t("admin.dashboard.greeting.morning")
    : hour < 18
    ? t("admin.dashboard.greeting.afternoon")
    : t("admin.dashboard.greeting.evening");

  const handleStatusChange = async (value: AvailabilityStatus, label: string) => {
    try {
      await updateSettings({ availabilityStatus: value, availabilityLabel: label });
      toast({ title: "Status updated", description: `Now showing "${label}" on your homepage.` });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const stats = [
    { label: t("admin.dashboard.stat.journal"), value: posts?.length || 0, icon: FileText, href: "/admin/blog", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", accent: "group-hover:bg-blue-500/15" },
    { label: t("admin.dashboard.stat.inquiries"), value: messages?.length || 0, icon: Mail, href: "/admin/messages", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", accent: "group-hover:bg-amber-500/15", badge: unreadMessages > 0 ? `${unreadMessages} ${t("admin.dashboard.stat.new")}` : undefined },
    { label: t("admin.dashboard.stat.brand"), value: brands?.length || 0, icon: Image, href: "/admin/brand", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", accent: "group-hover:bg-emerald-500/15" },
    { label: t("admin.dashboard.stat.music"), value: tracks?.length || 0, icon: Music, href: "/admin/music", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", accent: "group-hover:bg-purple-500/15" },
    { label: t("admin.dashboard.stat.resume"), value: resumeItems?.length || 0, icon: ScrollText, href: "/admin/resume", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", accent: "group-hover:bg-cyan-500/15" },
    { label: t("admin.dashboard.stat.novels"), value: novelStories?.length || 0, icon: BookOpen, href: "/admin/novel", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400", accent: "group-hover:bg-rose-500/15" },
  ];

  const recentMessages = messages?.slice(0, 3) || [];

  const avatarUrl = settings?.adminAvatarUrl || "/image/hellomaddy.jpg";

  const todayLabel = new Date().toLocaleDateString(
    language === "id" ? "id-ID" : "en-US",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-dashboard">

        {/* ── Welcome Hero Card ── */}
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 85% 50%, hsl(234 89% 67% / 0.07) 0%, transparent 65%)",
            }}
          />
          <div className="relative flex items-center gap-5 p-6 md:p-7">
            {/* Avatar */}
            <div className="w-[68px] h-[68px] md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 border border-border shadow-md">
              <img
                src={avatarUrl}
                alt="Choiril Ahmad"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-0.5">
                {greeting}
              </p>
              <h1 className="text-2xl md:text-[1.75rem] font-serif font-bold tracking-tight leading-none">
                Choiril Ahmad
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 truncate">{t("admin.dashboard.title")}</p>
            </div>

            {/* Right meta */}
            <div className="hidden md:flex flex-col items-end gap-2 shrink-0 text-right">
              <p className="text-[11px] text-muted-foreground leading-relaxed">{todayLabel}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                {t("admin.view_site")}
                <ExternalLink size={10} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className={`group relative border border-border rounded-xl p-4 bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200 flex flex-col gap-3`}
                data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                {stat.badge && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                    {stat.badge}
                  </span>
                )}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${stat.color} ${stat.accent}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold tracking-tight">{stat.value}</p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider leading-tight">{stat.label}</p>
                </div>
                <ChevronRight size={12} className="absolute bottom-3.5 right-3.5 text-muted-foreground/25 group-hover:text-primary/40 transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* ── Availability ── */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            <Briefcase size={15} className="text-muted-foreground" />
            <h2 className="font-semibold text-sm">{t("admin.dashboard.availability.title")}</h2>
            {settings && (
              <span className="ml-auto text-xs text-muted-foreground">
                {t("admin.dashboard.availability.currently")}:{" "}
                <span className="font-medium text-foreground">{settings.availabilityLabel}</span>
              </span>
            )}
          </div>
          <div className="p-4 flex flex-wrap gap-2.5">
            {availabilityOptions.map((opt) => {
              const isActive = settings?.availabilityStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value, opt.label)}
                  disabled={isPending || isActive}
                  data-testid={`button-availability-${opt.value}`}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all
                    ${isActive
                      ? `${opt.color} border-2 ring-2 ring-offset-1 ring-offset-card`
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                    }
                    disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? opt.dot : "bg-muted-foreground/40"} ${isActive ? "animate-pulse" : ""}`} />
                  {opt.label}
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider ml-0.5">
                      {t("admin.dashboard.availability.active")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Two Columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Messages */}
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-muted-foreground" />
                <h2 className="font-semibold text-sm">{t("admin.dashboard.messages.title")}</h2>
                {unreadMessages > 0 && (
                  <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full">{unreadMessages}</span>
                )}
              </div>
              <Link href="/admin/messages" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
                {t("admin.dashboard.messages.viewAll")} <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentMessages.length > 0 ? recentMessages.map(msg => (
                <div key={msg.id} className="px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{msg.name} &middot; {msg.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(msg.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground italic">
                  {t("admin.dashboard.messages.empty")}
                </div>
              )}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-muted-foreground" />
                <h2 className="font-semibold text-sm">{t("admin.dashboard.posts.title")}</h2>
              </div>
              <Link href="/admin/blog" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
                {t("admin.dashboard.posts.viewAll")} <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {posts && posts.length > 0 ? posts.slice(0, 3).map(post => (
                <div key={post.id} className="px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(post.createdAt || Date.now()).toLocaleDateString(
                          language === "id" ? "id-ID" : "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full shrink-0 ${
                      post.published
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {post.published ? t("admin.dashboard.posts.live") : t("admin.dashboard.posts.draft")}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground italic">
                  {t("admin.dashboard.posts.empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

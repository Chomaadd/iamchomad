import { AdminLayout } from "@/components/layout/AdminLayout";
import { usePosts } from "@/hooks/use-blog";
import { useContactMessages } from "@/hooks/use-contact";
import { useBrandItems } from "@/hooks/use-brand";
import { useMusicTracks } from "@/hooks/use-music";
import { useResumeItems } from "@/hooks/use-resume";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { FileText, Mail, Image, Music, TrendingUp, Clock, ScrollText, Briefcase, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { AvailabilityStatus, NovelStory } from "@shared/schema";

const availabilityOptions: { value: AvailabilityStatus; label: string; color: string; dot: string }[] = [
  { value: "open", label: "Open to Work", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  { value: "busy", label: "Currently Busy", color: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  { value: "unavailable", label: "Not Available", color: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400", dot: "bg-red-500" },
];

export default function Dashboard() {
  const { data: posts } = usePosts();
  const { data: messages } = useContactMessages();
  const { data: brands } = useBrandItems();
  const { data: tracks } = useMusicTracks();
  const { data: resumeItems } = useResumeItems();
  const { data: settings } = useSiteSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateSiteSettings();
  const { toast } = useToast();
  const { data: novelStories } = useQuery<NovelStory[]>({ queryKey: ["/api/novel/stories/all"] });

  const unreadMessages = messages?.filter(m => !m.read).length || 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const handleStatusChange = async (value: AvailabilityStatus, label: string) => {
    try {
      await updateSettings({ availabilityStatus: value, availabilityLabel: label });
      toast({ title: "Status updated", description: `Now showing "${label}" on your homepage.` });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const stats = [
    { label: "Journal Entries", value: posts?.length || 0, icon: FileText, href: "/admin/blog", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Inquiries", value: messages?.length || 0, icon: Mail, href: "/admin/messages", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", badge: unreadMessages > 0 ? `${unreadMessages} new` : undefined },
    { label: "Brand Assets", value: brands?.length || 0, icon: Image, href: "/admin/brand", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Music Tracks", value: tracks?.length || 0, icon: Music, href: "/admin/music", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { label: "Resume Items", value: resumeItems?.length || 0, icon: ScrollText, href: "/admin/resume", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
    { label: "Novels & Stories", value: novelStories?.length || 0, icon: BookOpen, href: "/admin/novel", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ];

  const recentMessages = messages?.slice(0, 3) || [];

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-dashboard">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{greeting},</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">System Overview</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="group relative border border-border rounded-lg p-5 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300"
                data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                {stat.badge && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {stat.badge}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <p className="text-3xl font-serif font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
                <TrendingUp size={14} className="absolute bottom-4 right-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
              </Link>
            );
          })}
        </div>

        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Briefcase size={16} className="text-muted-foreground" />
            <h2 className="font-semibold text-sm">Availability Status</h2>
            {settings && (
              <span className="ml-auto text-xs text-muted-foreground">
                Currently: <span className="font-medium text-foreground">{settings.availabilityLabel}</span>
              </span>
            )}
          </div>
          <div className="p-5 flex flex-wrap gap-3">
            {availabilityOptions.map((opt) => {
              const isActive = settings?.availabilityStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value, opt.label)}
                  disabled={isPending || isActive}
                  data-testid={`button-availability-${opt.value}`}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all
                    ${isActive ? `${opt.color} border-2 ring-2 ring-offset-1 ring-offset-card` : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"}
                    disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? opt.dot : "bg-muted-foreground/40"} ${isActive ? "animate-pulse" : ""}`} />
                  {opt.label}
                  {isActive && <span className="text-[10px] font-bold uppercase tracking-wider ml-1">Active</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground" />
                <h2 className="font-semibold text-sm">Recent Messages</h2>
              </div>
              <Link href="/admin/messages" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                View all
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentMessages.length > 0 ? recentMessages.map(msg => (
                <div key={msg.id} className="px-5 py-4 hover:bg-muted/30 transition-colors">
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
                <div className="px-5 py-8 text-center text-sm text-muted-foreground italic">No messages yet</div>
              )}
            </div>
          </div>

          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <h2 className="font-semibold text-sm">Recent Posts</h2>
              </div>
              <Link href="/admin/blog" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                View all
              </Link>
            </div>
            <div className="divide-y divide-border">
              {posts && posts.length > 0 ? posts.slice(0, 3).map(post => (
                <div key={post.id} className="px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full shrink-0 ${post.published ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                      {post.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground italic">No posts yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

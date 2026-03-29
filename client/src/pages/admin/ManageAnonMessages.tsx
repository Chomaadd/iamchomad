import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Trash2, MailOpen, MessageSquare, Loader2, Check, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { SiWhatsapp, SiInstagram } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import type { AnonMessage } from "@shared/schema";

const PAGE_URL = "https://iamchomad.my.id/pesan";

function formatDate(d?: Date | string) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} hari lalu`;
  return date.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function buildShareText(message: string) {
  return `💬 Pesan anonim untukku:\n\n"${message}"\n\nKirim pesan anonim juga di:\n${PAGE_URL}`;
}

function shareToWhatsApp(message: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText(message))}`, "_blank");
}

async function shareToInstagram(message: string, onCopied: () => void) {
  const text = buildShareText(message);
  if (navigator.share) {
    try { await navigator.share({ title: "Pesan Anonim", text, url: PAGE_URL }); return; } catch {}
  }
  await navigator.clipboard.writeText(text);
  onCopied();
}

export default function ManageAnonMessages() {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: messages, isLoading } = useQuery<AnonMessage[]>({
    queryKey: ["/api/anon-messages"],
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PATCH", `/api/anon-messages/${id}/read`).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/anon-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/anon-messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anon-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/anon-messages/unread-count"] });
      setDeletingId(null);
      toast({ title: "Message deleted." });
    },
    onError: () => toast({ title: "Failed to delete.", variant: "destructive" }),
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this message?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const handleCardClick = (id: string, isRead: boolean) => {
    setExpandedId(prev => prev === id ? null : id);
    if (!isRead) markReadMutation.mutate(id);
  };

  const handleCopied = (id: string) => {
    setCopiedId(id);
    toast({ title: "Text copied! Paste it into your Instagram caption/story." });
    setTimeout(() => setCopiedId(null), 3000);
  };

  const unread = messages?.filter(m => !m.isRead) ?? [];
  const read = messages?.filter(m => m.isRead) ?? [];
  const unreadCount = unread.length;

  const MessageCard = ({ msg }: { msg: AnonMessage }) => {
    const isExpanded = expandedId === msg.id;
    const isLong = msg.message.length > 120;

    return (
      <div
        onClick={() => handleCardClick(msg.id, msg.isRead)}
        className={`group rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
          msg.isRead
            ? "border-border bg-card hover:border-border/80 hover:shadow-sm"
            : "border-primary/25 bg-primary/[0.025] hover:border-primary/40 shadow-sm hover:shadow-md"
        }`}
        data-testid={`card-anon-message-${msg.id}`}
      >
        {/* Unread top bar */}
        {!msg.isRead && (
          <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        )}

        <div className="p-5">
          <div className="flex items-start gap-3">
            {/* Anonymous icon */}
            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg font-bold ${
              msg.isRead
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary"
            }`}>
              ?
            </div>

            <div className="flex-1 min-w-0">
              {/* Top row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">Anonymous</span>
                  {!msg.isRead && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary">
                      New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                    {formatDate(msg.createdAt)}
                  </span>
                  {(isLong || isExpanded) && (
                    isExpanded
                      ? <ChevronUp size={14} className="text-muted-foreground/40" />
                      : <ChevronDown size={14} className="text-muted-foreground/40" />
                  )}
                </div>
              </div>

              {/* Message bubble */}
              <div className={`mt-2.5 relative ${!msg.isRead ? "pl-3 border-l-2 border-primary/30" : ""}`}>
                <p
                  className={`text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap break-words transition-all ${
                    !isExpanded && isLong ? "line-clamp-3" : ""
                  }`}
                  data-testid={`text-anon-message-${msg.id}`}
                >
                  {msg.message}
                </p>
                {!isExpanded && isLong && (
                  <div className="mt-1">
                    <span className="text-xs text-primary font-medium">See more</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action row — visible when expanded */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {msg.isRead ? (
                  <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-medium">
                    <MailOpen size={11} /> Read
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                    <MessageSquare size={11} /> Unread
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* WhatsApp share */}
                <button
                  onClick={e => { e.stopPropagation(); shareToWhatsApp(msg.message); }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                  title="Share to WhatsApp"
                  data-testid={`button-share-wa-${msg.id}`}
                >
                  <SiWhatsapp size={12} /> WA
                </button>

                {/* Instagram share */}
                <button
                  onClick={e => { e.stopPropagation(); shareToInstagram(msg.message, () => handleCopied(msg.id)); }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-colors"
                  title="Share to Instagram"
                  data-testid={`button-share-ig-${msg.id}`}
                >
                  {copiedId === msg.id
                    ? <><Check size={12} className="text-green-500" /> Copied!</>
                    : <><SiInstagram size={12} /> IG</>
                  }
                </button>

                {/* Delete */}
                <button
                  onClick={e => handleDelete(msg.id, e)}
                  disabled={deletingId === msg.id}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  title="Delete messages"
                  data-testid={`button-delete-anon-${msg.id}`}
                >
                  {deletingId === msg.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <><Trash2 size={12} /> Delete</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Anonymous</p>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-anon-title">
            Anonymous Message
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {unreadCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-semibold">
              <MessageSquare size={13} />
              {unreadCount} unread
            </div>
          )}
          <span className="text-xs text-muted-foreground/60">{messages?.length ?? 0} total</span>
          <a
            href="/pesan"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <ExternalLink size={13} /> Submit Page
          </a>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 size={24} className="animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!messages || messages.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 text-3xl font-bold text-muted-foreground/20">
            ?
          </div>
          <p className="font-medium text-sm">No anonymous messages yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1 text-center max-w-xs">
            Share link{" "}
            <a href="/pesan" target="_blank" className="text-primary underline underline-offset-2">
              iamchomad.my.id/pesan
            </a>{" "}
            to start receiving messages
          </p>
        </div>
      )}

      {/* Unread section */}
      {!isLoading && unread.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unread</span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground">{unread.length}</span>
          </div>
          <div className="space-y-3">
            {unread.map(msg => <MessageCard key={msg.id} msg={msg} />)}
          </div>
        </div>
      )}

      {/* Read section */}
      {!isLoading && read.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Read</span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground">{read.length}</span>
          </div>
          <div className="space-y-3">
            {read.map(msg => <MessageCard key={msg.id} msg={msg} />)}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

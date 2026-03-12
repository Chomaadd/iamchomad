import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Trash2, MailOpen, Mail, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AnonMessage } from "@shared/schema";

function formatDate(d?: Date | string) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ManageAnonMessages() {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      setDeletingId(null);
      toast({ title: "Pesan dihapus." });
    },
    onError: () => toast({ title: "Gagal menghapus.", variant: "destructive" }),
  });

  const handleDelete = (id: string) => {
    if (confirm("Hapus pesan ini?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const handleMarkRead = (id: string, isRead: boolean) => {
    if (!isRead) markReadMutation.mutate(id);
  };

  const unreadCount = messages?.filter(m => !m.isRead).length ?? 0;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-anon-title">
            Pesan Anonim
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? (
              <span className="text-primary font-medium">{unreadCount} belum dibaca · </span>
            ) : null}
            {messages?.length ?? 0} total pesan ·{" "}
            <a
              href="/pesan"
              target="_blank"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Lihat halaman ↗
            </a>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : !messages || messages.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-xl">
          <MessageSquare size={36} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground italic">Belum ada pesan anonim masuk.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Share link{" "}
            <a href="/pesan" target="_blank" className="underline underline-offset-2 text-primary">
              iamchomad.my.id/pesan
            </a>{" "}
            untuk mulai menerima pesan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              onClick={() => handleMarkRead(msg.id, msg.isRead)}
              className={`group relative border rounded-xl p-5 bg-card transition-all duration-200 cursor-pointer ${
                msg.isRead
                  ? "border-border hover:border-border/80"
                  : "border-primary/30 bg-primary/5 hover:border-primary/50"
              }`}
              data-testid={`card-anon-message-${msg.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-0.5 shrink-0 ${msg.isRead ? "text-muted-foreground" : "text-primary"}`}>
                    {msg.isRead ? <MailOpen size={18} /> : <Mail size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {!msg.isRead && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                        Baru
                      </span>
                    )}
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words" data-testid={`text-anon-message-${msg.id}`}>
                      {msg.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(msg.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(msg.id);
                  }}
                  disabled={deletingId === msg.id}
                  className="shrink-0 p-2 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
                  title="Hapus pesan"
                  data-testid={`button-delete-anon-${msg.id}`}
                >
                  {deletingId === msg.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useContactMessages, useMarkMessageRead, useDeleteMessage } from "@/hooks/use-contact";
import { Check, Trash2, MailOpen, Mail as MailIcon, Inbox, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(d: any) {
  const date = new Date(d || Date.now());
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const COLORS = [
  "from-violet-500 to-indigo-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-sky-500 to-blue-500",
];

function getColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[hash];
}

export default function ManageMessages() {
  const { data: messages } = useContactMessages();
  const { mutateAsync: markRead } = useMarkMessageRead();
  const { mutateAsync: deleteMsg } = useDeleteMessage();
  const { toast } = useToast();
  const { confirm: showConfirm, ConfirmDialog } = useConfirm();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unread = messages?.filter(m => !m.read) ?? [];
  const read = messages?.filter(m => m.read) ?? [];

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markRead(id);
      toast({ title: "Marked as read." });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await showConfirm({ title: "Delete message?", description: "This action cannot be undone.", confirmLabel: "Delete" });
    if (ok) {
      try {
        await deleteMsg(id);
        toast({ title: "Message deleted." });
      } catch {
        toast({ title: "Error", variant: "destructive" });
      }
    }
  };

  const MessageCard = ({ msg }: { msg: any }) => {
    const isExpanded = expandedId === msg.id;
    const color = getColor(msg.name);
    return (
      <div
        onClick={() => setExpandedId(isExpanded ? null : msg.id)}
        className={`group rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
          msg.read
            ? "border-border bg-card hover:border-border/80 hover:shadow-sm"
            : "border-primary/25 bg-primary/[0.025] hover:border-primary/40 hover:shadow-md shadow-sm"
        }`}
        data-testid={`card-message-${msg.id}`}
      >
        {/* Unread accent top bar */}
        {!msg.read && (
          <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        )}

        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${color} shadow-sm`}>
              {getInitials(msg.name)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{msg.name}</span>
                    {!msg.read && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary">New</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">{msg.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground/60 tracking-wide whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                  {isExpanded ? <ChevronUp size={14} className="text-muted-foreground/40" /> : <ChevronDown size={14} className="text-muted-foreground/40" />}
                </div>
              </div>

              <p className="font-semibold text-sm mt-2 text-foreground/90">{msg.subject}</p>

              {/* Preview / full message */}
              <p className={`text-sm text-muted-foreground mt-1.5 leading-relaxed transition-all ${isExpanded ? "" : "line-clamp-2"}`}>
                {msg.message}
              </p>
            </div>
          </div>

          {/* Actions (visible when expanded) */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium ${msg.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                  {msg.read ? <MailOpen size={12} /> : <MailIcon size={12} />}
                  {msg.read ? "Read" : "Unread"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!msg.read && (
                  <button
                    onClick={(e) => handleMarkRead(msg.id, e)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    data-testid={`button-mark-read-${msg.id}`}
                  >
                    <Check size={12} /> Mark Read
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(msg.id, e)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  data-testid={`button-delete-message-${msg.id}`}
                >
                  <Trash2 size={12} /> Delete
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
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Inbox</p>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-messages-title">Inquiries</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
          {unread.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-semibold">
              <MailIcon size={13} />
              {unread.length} unread
            </div>
          )}
          <span className="text-xs text-muted-foreground/60">{messages?.length || 0} total</span>
        </div>
      </div>

      {/* Empty state */}
      {(!messages || messages.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Inbox size={28} className="text-muted-foreground/40" />
          </div>
          <p className="font-medium text-sm">Inbox is empty</p>
          <p className="text-xs text-muted-foreground/60 mt-1">New messages will appear here</p>
        </div>
      )}

      {/* Unread section */}
      {unread.length > 0 && (
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
      {read.length > 0 && (
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
      <ConfirmDialog />
    </AdminLayout>
  );
}

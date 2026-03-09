import { AdminLayout } from "@/components/layout/AdminLayout";
import { useContactMessages, useMarkMessageRead, useDeleteMessage } from "@/hooks/use-contact";
import { Button } from "@/components/ui/core";
import { Check, Trash2, MailOpen, Mail as MailIcon, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManageMessages() {
  const { data: messages } = useContactMessages();
  const { mutateAsync: markRead } = useMarkMessageRead();
  const { mutateAsync: deleteMsg } = useDeleteMessage();
  const { toast } = useToast();

  const unreadCount = messages?.filter(m => !m.read).length || 0;

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id);
      toast({ title: "Marked as read." });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this message?")) {
      try {
        await deleteMsg(id);
        toast({ title: "Message deleted." });
      } catch {
        toast({ title: "Error", variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-messages-title">Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {messages?.length || 0} messages{unreadCount > 0 && <span className="text-primary font-medium"> &middot; {unreadCount} unread</span>}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {messages?.map(msg => (
          <div
            key={msg.id}
            className={`group border rounded-lg transition-all duration-200 overflow-hidden ${
              msg.read 
                ? 'border-border bg-card' 
                : 'border-primary/30 bg-primary/[0.02]'
            }`}
            data-testid={`card-message-${msg.id}`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${msg.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    {msg.read ? <MailOpen size={16} /> : <MailIcon size={16} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{msg.subject}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {msg.name} &middot; <span className="font-mono">{msg.email}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 uppercase tracking-wider">
                  {new Date(msg.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-md p-4 text-sm leading-relaxed">
                {msg.message}
              </div>
              
              <div className="flex justify-end gap-2 mt-3">
                {!msg.read && (
                  <Button variant="outline" onClick={() => handleMarkRead(msg.id)} className="gap-1.5 text-xs h-8 px-3" data-testid={`button-mark-read-${msg.id}`}>
                    <Check size={13} /> Mark Read
                  </Button>
                )}
                <Button variant="ghost" onClick={() => handleDelete(msg.id)} className="gap-1.5 text-xs h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10" data-testid={`button-delete-message-${msg.id}`}>
                  <Trash2 size={13} /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}

        {messages?.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Inbox size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground italic">Inbox is empty.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

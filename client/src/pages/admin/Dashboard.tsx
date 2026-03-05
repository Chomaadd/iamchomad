import { AdminLayout } from "@/components/layout/AdminLayout";
import { usePosts } from "@/hooks/use-blog";
import { useContactMessages } from "@/hooks/use-contact";
import { useBrandItems } from "@/hooks/use-brand";
import { FileText, Mail, Image } from "lucide-react";

export default function Dashboard() {
  const { data: posts } = usePosts();
  const { data: messages } = useContactMessages();
  const { data: brands } = useBrandItems();

  const unreadMessages = messages?.filter(m => !m.read).length || 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-serif font-bold">System Overview</h1>
          <p className="text-muted-foreground mt-2">Welcome to your operational dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat Card 1 */}
          <div className="border-2 border-border p-6 bg-card flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-primary text-primary-foreground">
                <FileText size={24} />
              </div>
            </div>
            <div>
              <p className="text-5xl font-serif font-bold">{posts?.length || 0}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-2">Total Journal Entries</p>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="border-2 border-primary p-6 bg-card flex flex-col justify-between editorial-shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-primary text-primary-foreground">
                <Mail size={24} />
              </div>
              {unreadMessages > 0 && (
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-widest rounded-full animate-pulse">
                  {unreadMessages} Unread
                </span>
              )}
            </div>
            <div>
              <p className="text-5xl font-serif font-bold">{messages?.length || 0}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-2">Total Inquiries</p>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="border-2 border-border p-6 bg-card flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-primary text-primary-foreground">
                <Image size={24} />
              </div>
            </div>
            <div>
              <p className="text-5xl font-serif font-bold">{brands?.length || 0}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-2">Brand Assets</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

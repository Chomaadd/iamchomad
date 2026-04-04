import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Copy, Trash2, Link2, ExternalLink, Plus, MousePointerClick, RefreshCw } from "lucide-react";
import type { ShortUrl } from "@shared/schema";

const BASE_URL = window.location.origin;

function generateSlug() {
  return Math.random().toString(36).slice(2, 9);
}

export default function ManageShortUrls() {
  const { toast } = useToast();
  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState(generateSlug());
  const [isCustomSlug, setIsCustomSlug] = useState(false);

  const { data: urls = [], isLoading } = useQuery<ShortUrl[]>({
    queryKey: ["/api/short-urls"],
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/short-urls", { targetUrl, title: title || undefined, slug }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/short-urls"] });
      setTargetUrl("");
      setTitle("");
      setSlug(generateSlug());
      setIsCustomSlug(false);
      toast({ title: "Short URL created!", description: `${BASE_URL}/${slug}` });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Slug might already be taken.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/short-urls/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/short-urls"] });
      toast({ title: "Deleted" });
    },
  });

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: text });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUrl) return;
    createMutation.mutate();
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Short URLs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Buat tautan pendek seperti <span className="font-mono text-primary">{BASE_URL}/xuwkajs</span> yang redirect ke URL manapun.
          </p>
        </div>

        {/* Create Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-base">Buat Short URL Baru</h2>

          <div className="space-y-2">
            <Label htmlFor="targetUrl">URL Tujuan *</Label>
            <Input
              id="targetUrl"
              data-testid="input-target-url"
              type="url"
              placeholder="https://contoh.com/halaman-panjang"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Label / Nama (opsional)</Label>
            <Input
              id="title"
              data-testid="input-short-url-title"
              placeholder="Contoh: Link Portfolio"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">Slug</Label>
              {!isCustomSlug && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  onClick={() => setIsCustomSlug(true)}
                >
                  Edit manual
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">{BASE_URL}/</span>
              <Input
                id="slug"
                data-testid="input-slug"
                value={slug}
                onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")); setIsCustomSlug(true); }}
                className="font-mono"
                maxLength={12}
              />
              {!isCustomSlug && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  data-testid="button-regenerate-slug"
                  onClick={() => setSlug(generateSlug())}
                  title="Generate baru"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Slug hanya huruf kecil & angka, 4–12 karakter.</p>
          </div>

          {targetUrl && (
            <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm">
              <span className="text-muted-foreground">Preview: </span>
              <span className="font-mono text-primary">{BASE_URL}/{slug}</span>
              <span className="text-muted-foreground"> → </span>
              <span className="truncate">{targetUrl}</span>
            </div>
          )}

          <Button
            type="submit"
            data-testid="button-create-short-url"
            disabled={createMutation.isPending || !targetUrl || slug.length < 4}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Membuat..." : "Buat Short URL"}
          </Button>
        </form>

        {/* URL List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-base">
            Semua Short URL
            {urls.length > 0 && <span className="ml-2 text-muted-foreground font-normal text-sm">({urls.length})</span>}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : urls.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl py-12 text-center">
              <Link2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Belum ada short URL. Buat yang pertama!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urls.map(url => {
                const shortLink = `${BASE_URL}/${url.slug}`;
                return (
                  <div
                    key={url.id}
                    data-testid={`card-short-url-${url.id}`}
                    className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      {url.title && (
                        <p className="font-medium text-sm truncate">{url.title}</p>
                      )}
                      <button
                        type="button"
                        className="font-mono text-primary text-sm hover:underline truncate max-w-full text-left"
                        data-testid={`text-short-url-slug-${url.id}`}
                        onClick={() => copyToClipboard(shortLink)}
                      >
                        {shortLink}
                      </button>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{url.targetUrl}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
                        <MousePointerClick className="w-3 h-3" />
                        <span data-testid={`text-clicks-${url.id}`}>{url.clicks}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-copy-${url.id}`}
                        onClick={() => copyToClipboard(shortLink)}
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-open-${url.id}`}
                        onClick={() => window.open(shortLink, "_blank")}
                        title="Test link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-delete-short-url-${url.id}`}
                        onClick={() => deleteMutation.mutate(url.id)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

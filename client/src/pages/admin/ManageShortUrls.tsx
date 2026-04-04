import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Copy, Trash2, Link2, ExternalLink, Plus, MousePointerClick, RefreshCw, Clock, Infinity } from "lucide-react";
import type { ShortUrl } from "@shared/schema";

const BASE_URL = window.location.origin;

const EXPIRY_OPTIONS = [
  { value: "permanent", label: "Permanent ♾️", days: null },
  { value: "3",  label: "3 Hari",   days: 3 },
  { value: "7",  label: "7 Hari",   days: 7 },
  { value: "14", label: "14 Hari",  days: 14 },
  { value: "24", label: "24 Hari",  days: 24 },
  { value: "30", label: "1 Bulan",  days: 30 },
];

function generateSlug() {
  return Math.random().toString(36).slice(2, 9);
}

function formatExpiry(expiresAt: Date | string | null | undefined): {
  label: string;
  isExpired: boolean;
  isNearExpiry: boolean;
} {
  if (!expiresAt) return { label: "Permanent", isExpired: false, isNearExpiry: false };
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return { label: "Expired", isExpired: true, isNearExpiry: false };
  if (diffDays <= 2) return { label: `${diffDays}h lagi`, isExpired: false, isNearExpiry: true };
  return {
    label: exp.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    isExpired: false,
    isNearExpiry: false,
  };
}

export default function ManageShortUrls() {
  const { toast } = useToast();
  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState(generateSlug());
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [expiryDays, setExpiryDays] = useState("permanent");

  const { data: urls = [], isLoading } = useQuery<ShortUrl[]>({
    queryKey: ["/api/short-urls"],
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/short-urls", {
        targetUrl,
        title: title || undefined,
        slug,
        expiryDays,
      }).then(r => r.json()),
    onSuccess: (created: ShortUrl) => {
      queryClient.invalidateQueries({ queryKey: ["/api/short-urls"] });
      const savedSlug = created.slug;
      setTargetUrl("");
      setTitle("");
      setSlug(generateSlug());
      setIsCustomSlug(false);
      setExpiryDays("permanent");
      toast({ title: "Short URL dibuat!", description: `${BASE_URL}/${savedSlug}` });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Slug sudah dipakai.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/short-urls/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/short-urls"] });
      toast({ title: "Dihapus" });
    },
  });

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Tersalin!", description: text });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUrl || slug.length < 4) return;
    createMutation.mutate();
  }

  const activeUrls = urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date());
  const expiredUrls = urls.filter(u => u.expiresAt && new Date(u.expiresAt) <= new Date());

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

          <div className="grid grid-cols-2 gap-4">
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
              <Label>Masa Berlaku</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger data-testid="select-expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                onChange={e => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""));
                  setIsCustomSlug(true);
                }}
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
            <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm space-y-1">
              <div>
                <span className="text-muted-foreground">Preview: </span>
                <span className="font-mono text-primary">{BASE_URL}/{slug}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="truncate">{targetUrl}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                {expiryDays === "permanent"
                  ? <><Infinity className="w-3 h-3" /> Permanent — tidak akan expired</>
                  : <><Clock className="w-3 h-3" /> Aktif selama {EXPIRY_OPTIONS.find(o => o.value === expiryDays)?.label}</>
                }
              </div>
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

        {/* Active URL List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <UrlSection
              title="Aktif"
              urls={activeUrls}
              onCopy={copyToClipboard}
              onDelete={id => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
            />
            {expiredUrls.length > 0 && (
              <UrlSection
                title="Sudah Expired"
                urls={expiredUrls}
                onCopy={copyToClipboard}
                onDelete={id => deleteMutation.mutate(id)}
                isDeleting={deleteMutation.isPending}
                expired
              />
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function UrlSection({
  title, urls, onCopy, onDelete, isDeleting, expired = false,
}: {
  title: string;
  urls: ShortUrl[];
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  expired?: boolean;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-base flex items-center gap-2">
        {title}
        {urls.length > 0 && (
          <span className="text-muted-foreground font-normal text-sm">({urls.length})</span>
        )}
      </h2>

      {urls.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl py-10 text-center">
          <Link2 className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Belum ada short URL. Buat yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {urls.map(url => {
            const shortLink = `${BASE_URL}/${url.slug}`;
            const expiry = formatExpiry(url.expiresAt);
            return (
              <div
                key={url.id}
                data-testid={`card-short-url-${url.id}`}
                className={`bg-card border rounded-2xl px-5 py-4 flex items-center gap-4 ${
                  expired ? "border-border/50 opacity-60" : "border-border"
                }`}
              >
                <div className="flex-1 min-w-0">
                  {url.title && (
                    <p className="font-medium text-sm truncate">{url.title}</p>
                  )}
                  <button
                    type="button"
                    className="font-mono text-primary text-sm hover:underline truncate max-w-full text-left"
                    data-testid={`text-short-url-slug-${url.id}`}
                    onClick={() => onCopy(shortLink)}
                  >
                    {shortLink}
                  </button>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{url.targetUrl}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Expiry badge */}
                  <div className={`flex items-center gap-1 text-xs rounded-full px-2.5 py-1 ${
                    expiry.isExpired
                      ? "bg-destructive/10 text-destructive"
                      : expiry.isNearExpiry
                      ? "bg-orange-500/10 text-orange-500"
                      : "bg-muted/60 text-muted-foreground"
                  }`}>
                    {expiry.isExpired || expiry.isNearExpiry
                      ? <Clock className="w-3 h-3" />
                      : url.expiresAt
                      ? <Clock className="w-3 h-3" />
                      : <Infinity className="w-3 h-3" />
                    }
                    <span data-testid={`text-expiry-${url.id}`}>{expiry.label}</span>
                  </div>

                  {/* Click count */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
                    <MousePointerClick className="w-3 h-3" />
                    <span data-testid={`text-clicks-${url.id}`}>{url.clicks}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid={`button-copy-${url.id}`}
                    onClick={() => onCopy(shortLink)}
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
                    onClick={() => onDelete(url.id)}
                    disabled={isDeleting}
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
  );
}

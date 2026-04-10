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
import { useLanguage } from "@/hooks/use-language";

const BASE_URL = window.location.origin;

type ExpiryUnit = "permanent" | "seconds" | "minutes" | "hours" | "days" | "months";

const UNIT_MS: Record<Exclude<ExpiryUnit, "permanent">, number> = {
  seconds: 1_000,
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
  months: 30 * 86_400_000,
};

function computeExpiryMs(unit: ExpiryUnit, amount: number): number | null {
  if (unit === "permanent") return null;
  return amount * UNIT_MS[unit];
}

function generateSlug() {
  return Math.random().toString(36).slice(2, 9);
}

function formatExpiry(
  expiresAt: Date | string | null | undefined,
  lang: string = "id",
): { label: string; isExpired: boolean; isNearExpiry: boolean } {
  if (!expiresAt) return { label: lang === "id" ? "Permanent" : "Permanent", isExpired: false, isNearExpiry: false };
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();

  if (diffMs < 0) return { label: lang === "id" ? "Expired" : "Expired", isExpired: true, isNearExpiry: false };

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.ceil(diffMs / 86_400_000);

  if (diffSec < 60) return { label: `${diffSec}${lang === "id" ? "d" : "s"}`, isExpired: false, isNearExpiry: true };
  if (diffMin < 60) return { label: `${diffMin}m`, isExpired: false, isNearExpiry: diffMin < 10 };
  if (diffHrs < 24) return { label: `${diffHrs}${lang === "id" ? "j" : "h"}`, isExpired: false, isNearExpiry: diffHrs <= 2 };
  if (diffDays <= 3) return { label: lang === "id" ? `${diffDays} hari lagi` : `${diffDays} days left`, isExpired: false, isNearExpiry: true };
  return {
    label: exp.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" }),
    isExpired: false,
    isNearExpiry: false,
  };
}

export default function ManageShortUrls() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isID = language === "id";

  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState(generateSlug());
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [expiryUnit, setExpiryUnit] = useState<ExpiryUnit>("permanent");
  const [expiryAmount, setExpiryAmount] = useState(7);

  const UNIT_LABELS: Record<ExpiryUnit, string> = {
    permanent: isID ? "Permanent ♾️" : "Permanent ♾️",
    seconds: isID ? "Detik" : "Seconds",
    minutes: isID ? "Menit" : "Minutes",
    hours: isID ? "Jam" : "Hours",
    days: isID ? "Hari" : "Days",
    months: isID ? "Bulan" : "Months",
  };

  const expiryMs = computeExpiryMs(expiryUnit, expiryAmount);

  function expiryPreviewLabel(): string {
    if (expiryUnit === "permanent") return t("admin.shorturls.form.permanent");
    const amount = expiryAmount;
    switch (expiryUnit) {
      case "seconds": return `${amount} ${UNIT_LABELS.seconds}`;
      case "minutes": return `${amount} ${UNIT_LABELS.minutes}`;
      case "hours": return `${amount} ${UNIT_LABELS.hours}`;
      case "days": return `${amount} ${UNIT_LABELS.days}`;
      case "months": return `${amount} ${UNIT_LABELS.months}`;
    }
  }

  const { data: urls = [], isLoading } = useQuery<ShortUrl[]>({
    queryKey: ["/api/short-urls"],
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/short-urls", {
        targetUrl,
        title: title || undefined,
        slug,
        expiryMs: expiryMs ?? 0,
      }).then(r => r.json()),
    onSuccess: (created: ShortUrl) => {
      queryClient.invalidateQueries({ queryKey: ["/api/short-urls"] });
      const savedSlug = created.slug;
      setTargetUrl("");
      setTitle("");
      setSlug(generateSlug());
      setIsCustomSlug(false);
      setExpiryUnit("permanent");
      setExpiryAmount(7);
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
      toast({ title: t("admin.confirm.delete") });
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
          <h1 className="text-2xl font-bold">{t("admin.shorturls.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("admin.shorturls.form.preview")} <span className="font-mono text-primary">{BASE_URL}/xuwkajs</span> yang redirect ke URL manapun.
          </p>
        </div>

        {/* Create Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-base">{t("admin.shorturls.create.title")}</h2>

          <div className="space-y-2">
            <Label htmlFor="targetUrl">{t("admin.shorturls.form.targetUrl")}</Label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("admin.shorturls.form.label")}</Label>
              <Input
                id="title"
                data-testid="input-short-url-title"
                placeholder={isID ? "Contoh: Link Portfolio" : "Example: Portfolio Link"}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Expiry: unit select + amount input */}
            <div className="space-y-2">
              <Label>{t("admin.shorturls.form.expiry")}</Label>
              <div className="flex gap-2">
                {expiryUnit !== "permanent" && (
                  <Input
                    data-testid="input-expiry-amount"
                    type="number"
                    min={1}
                    value={expiryAmount}
                    onChange={e => setExpiryAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 shrink-0"
                  />
                )}
                <Select
                  value={expiryUnit}
                  onValueChange={v => setExpiryUnit(v as ExpiryUnit)}
                >
                  <SelectTrigger data-testid="select-expiry-unit" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(UNIT_LABELS) as ExpiryUnit[]).map(u => (
                      <SelectItem key={u} value={u}>{UNIT_LABELS[u]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">{t("admin.shorturls.form.slug")}</Label>
              {!isCustomSlug && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  onClick={() => setIsCustomSlug(true)}
                >
                  {t("admin.shorturls.form.editManual")}
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
            <p className="text-xs text-muted-foreground">{t("admin.shorturls.form.slugHint")}</p>
          </div>

          {targetUrl && (
            <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm space-y-1">
              <div>
                <span className="text-muted-foreground">{t("admin.shorturls.form.preview")}: </span>
                <span className="font-mono text-primary">{BASE_URL}/{slug}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="truncate">{targetUrl}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                {expiryUnit === "permanent"
                  ? <><Infinity className="w-3 h-3" /> {t("admin.shorturls.form.permanent")}</>
                  : <><Clock className="w-3 h-3" /> {t("admin.shorturls.form.activeFor")} {expiryPreviewLabel()}</>
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
            {createMutation.isPending ? t("admin.shorturls.form.creating") : t("admin.shorturls.form.submit")}
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
              title={t("admin.shorturls.section.active")}
              emptyLabel={t("admin.shorturls.empty")}
              urls={activeUrls}
              language={language}
              onCopy={copyToClipboard}
              onDelete={id => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
            />
            {expiredUrls.length > 0 && (
              <UrlSection
                title={t("admin.shorturls.section.expired")}
                emptyLabel={t("admin.shorturls.empty")}
                urls={expiredUrls}
                language={language}
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
  title, emptyLabel, urls, language, onCopy, onDelete, isDeleting, expired = false,
}: {
  title: string;
  emptyLabel: string;
  urls: ShortUrl[];
  language: string;
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
          <p className="text-muted-foreground text-sm">{emptyLabel}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {urls.map(url => {
            const shortLink = `${BASE_URL}/${url.slug}`;
            const expiry = formatExpiry(url.expiresAt, language);
            return (
              <div
                key={url.id}
                data-testid={`card-short-url-${url.id}`}
                className={`bg-card border rounded-2xl px-4 py-4 ${
                  expired ? "border-border/50 opacity-60" : "border-border"
                }`}
              >
                {/* Top row: info + action buttons */}
                <div className="flex items-start gap-3">
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

                  {/* Action buttons */}
                  <div className="flex items-center gap-0.5 shrink-0">
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

                {/* Bottom row: badges */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {/* Expiry badge */}
                  <div className={`flex items-center gap-1 text-xs rounded-full px-2.5 py-1 ${
                    expiry.isExpired
                      ? "bg-destructive/10 text-destructive"
                      : expiry.isNearExpiry
                      ? "bg-orange-500/10 text-orange-500"
                      : "bg-muted/60 text-muted-foreground"
                  }`}>
                    {url.expiresAt ? <Clock className="w-3 h-3" /> : <Infinity className="w-3 h-3" />}
                    <span data-testid={`text-expiry-${url.id}`}>{expiry.label}</span>
                  </div>

                  {/* Click count */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
                    <MousePointerClick className="w-3 h-3" />
                    <span data-testid={`text-clicks-${url.id}`}>{url.clicks}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

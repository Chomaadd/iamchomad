import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAnalytics } from "@/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Eye, TrendingUp, Calendar, Monitor, Smartphone, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SeoHead } from "@/components/seometa/SeoHead";
import { useLanguage } from "@/hooks/use-language";

const chartConfig = {
  views: { label: "Views", color: "hsl(var(--foreground))" },
};

const COLORS = ["hsl(var(--foreground))", "hsl(var(--muted-foreground))"];

function StatCard({ title, value, icon: Icon, sub }: { title: string; value: number | string; icon: React.ElementType; sub?: string }) {
  return (
    <Card data-testid={`card-stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold font-serif">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Icon size={22} className="text-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-16" />
          </div>
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getPageLabel(page: string) {
  if (page === '/') return 'Home';
  return page.replace(/^\//, '').replace(/\//g, ' / ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function Analytics() {
  const { data, isLoading } = useAnalytics();
  const { t } = useLanguage();

  return (
    <AdminLayout>
      <SeoHead
        title="Analytics — Admin"
        description="Site analytics dashboard"
        url="https://iamchomad.my.id/admin/analytics"
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold font-serif tracking-tight">{t("admin.analytics.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("admin.analytics.description")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title={t("admin.analytics.totalViews")} value={data?.totalViews ?? 0} icon={Eye} />
            <StatCard title={t("admin.analytics.today")} value={data?.todayViews ?? 0} icon={Calendar} sub={t("admin.analytics.today.sub")} />
            <StatCard title={t("admin.analytics.week")} value={data?.weekViews ?? 0} icon={TrendingUp} sub={t("admin.analytics.week.sub")} />
            <StatCard title={t("admin.analytics.month")} value={data?.monthViews ?? 0} icon={Globe} sub={t("admin.analytics.month.sub")} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("admin.analytics.chart.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-56 w-full">
                <BarChart data={data?.dailyViews ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v, i) => (i % 6 === 0 ? formatDate(v) : '')}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelFormatter={(v) => formatDate(v as string)} />}
                  />
                  <Bar dataKey="views" fill="var(--color-views)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("admin.analytics.device.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            {isLoading ? (
              <Skeleton className="h-40 w-40 rounded-full" />
            ) : (
              <>
                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.deviceBreakdown ?? []}
                        dataKey="views"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        strokeWidth={2}
                      >
                        {(data?.deviceBreakdown ?? []).map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [`${Number(val).toLocaleString()} views`, name]}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 text-sm">
                  {(data?.deviceBreakdown ?? []).map((d, i) => (
                    <div key={d.device} className="flex items-center gap-2" data-testid={`stat-device-${d.device.toLowerCase()}`}>
                      {d.device === 'Desktop' ? <Monitor size={14} /> : <Smartphone size={14} />}
                      <span className="text-muted-foreground">{d.device}</span>
                      <span className="font-semibold">{d.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("admin.analytics.topPages.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : !data?.topPages?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t("admin.analytics.topPages.empty")}</p>
          ) : (
            <div className="space-y-2" data-testid="list-top-pages">
              {data.topPages.map((p, i) => {
                const max = data.topPages[0]?.views ?? 1;
                const pct = Math.round((p.views / max) * 100);
                return (
                  <div key={p.page} className="flex items-center gap-3" data-testid={`row-top-page-${i}`}>
                    <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{getPageLabel(p.page)}</span>
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">{p.views.toLocaleString()} views</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-foreground rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

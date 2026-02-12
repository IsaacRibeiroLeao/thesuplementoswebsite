"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  LogOut,
  Package,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface MonthlySale {
  month: string
  total_orders: number
  revenue: number
  avg_ticket: number
}

interface DailySale {
  day: string
  total_orders: number
  revenue: number
}

interface TopProduct {
  product_name: string
  total_sold: number
  total_revenue: number
}

interface OrderRow {
  id: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  customer_city: string | null
  status: string
  created_at: string
}

const PIE_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5", "#fff7ed", "#ea580c", "#c2410c", "#9a3412", "#7c2d12"]

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([])
  const [dailySales, setDailySales] = useState<DailySale[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([])
  const [currentMonth, setCurrentMonth] = useState({
    revenue: 0,
    orders: 0,
    avgTicket: 0,
    growth: 0,
  })

  const fetchData = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session) {
      router.push("/admin/login")
      return
    }

    const [monthlyRes, dailyRes, topRes, ordersRes] = await Promise.all([
      supabase.from("monthly_sales").select("*").limit(12),
      supabase.from("daily_sales").select("*"),
      supabase.from("top_products").select("*"),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
    ])

    const monthly = (monthlyRes.data as MonthlySale[] | null) ?? []
    const daily = (dailyRes.data as DailySale[] | null) ?? []
    const top = (topRes.data as TopProduct[] | null) ?? []
    const orders = (ordersRes.data as OrderRow[] | null) ?? []

    setMonthlySales(monthly)
    setDailySales(daily)
    setTopProducts(top)
    setRecentOrders(orders)

    if (monthly.length > 0) {
      const current = monthly[0]
      const previous = monthly[1]
      const growth = previous && previous.revenue > 0
        ? ((current.revenue - previous.revenue) / previous.revenue) * 100
        : 0

      setCurrentMonth({
        revenue: current.revenue,
        orders: current.total_orders,
        avgTicket: current.avg_ticket,
        growth,
      })
    }

    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <BarChart3 className="mx-auto h-10 w-10 animate-pulse text-primary" />
          <p className="mt-3 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">
              THE&apos;s Suplementos — Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/orders"
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Package className="h-4 w-4" />
              Gerenciar Pedidos
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={DollarSign}
            label="Faturamento do Mes"
            value={formatCurrency(currentMonth.revenue)}
            color="text-green-500"
          />
          <StatCard
            icon={ShoppingBag}
            label="Pedidos no Mes"
            value={String(currentMonth.orders)}
            color="text-primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Ticket Medio"
            value={formatCurrency(currentMonth.avgTicket)}
            color="text-blue-500"
          />
          <StatCard
            icon={Package}
            label="Crescimento"
            value={`${currentMonth.growth >= 0 ? "+" : ""}${currentMonth.growth.toFixed(1)}%`}
            color={currentMonth.growth >= 0 ? "text-green-500" : "text-destructive"}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Faturamento Mensal">
            {monthlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[...monthlySales].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    stroke="hsl(240 5% 65%)"
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    stroke="hsl(240 5% 65%)"
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Receita"]}
                    labelFormatter={(label) => formatMonth(String(label))}
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 7%)",
                      border: "1px solid hsl(0 0% 14.9%)",
                      borderRadius: "8px",
                      color: "hsl(0 0% 93%)",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </ChartCard>

          <ChartCard title="Pedidos por Dia (Mes Atual)">
            {dailySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={formatDay}
                    stroke="hsl(240 5% 65%)"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(240 5% 65%)" fontSize={12} />
                  <Tooltip
                    formatter={(value) => [Number(value), "Pedidos"]}
                    labelFormatter={(label) => formatDay(String(label))}
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 7%)",
                      border: "1px solid hsl(0 0% 14.9%)",
                      borderRadius: "8px",
                      color: "hsl(0 0% 93%)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total_orders"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: "#f97316", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartCard title="Produtos Mais Vendidos" className="lg:col-span-1">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topProducts}
                    dataKey="total_sold"
                    nameKey="product_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                    fontSize={11}
                  >
                    {topProducts.map((entry) => (
                      <Cell key={entry.product_name} fill={PIE_COLORS[topProducts.indexOf(entry) % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${Number(value)} unidades`,
                      String(name),
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 7%)",
                      border: "1px solid hsl(0 0% 14.9%)",
                      borderRadius: "8px",
                      color: "hsl(0 0% 93%)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </ChartCard>

          <ChartCard title="Ultimos Pedidos" className="lg:col-span-2">
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Data</th>
                      <th className="pb-3 pr-4 font-medium">Itens</th>
                      <th className="pb-3 pr-4 font-medium">Total</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 pr-4 text-foreground">
                          {Array.isArray(order.items)
                            ? order.items.map((i) => i.name).join(", ")
                            : "-"}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-primary">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState />
            )}
          </ChartCard>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: Readonly<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
}>) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ChartCard({
  title,
  children,
  className = "",
}: Readonly<{
  title: string
  children: React.ReactNode
  className?: string
}>) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 ${className}`}>
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    confirmed: "bg-green-500/10 text-green-500",
    cancelled: "bg-red-500/10 text-red-500",
  }

  const labels: Record<string, string> = {
    pending: "Pendente",
    confirmed: "Confirmado",
    cancelled: "Cancelado",
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.pending}`}
    >
      {labels[status] ?? status}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="flex h-[300px] items-center justify-center">
      <p className="text-sm text-muted-foreground">Nenhum dado disponivel ainda.</p>
    </div>
  )
}

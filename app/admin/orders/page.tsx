"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/site-config"
import {
  Shield,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Trash2,
  Package,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  SortAsc,
  X,
} from "lucide-react"

interface OrderItem {
  name: string
  brand?: string
  price: number
  quantity: number
  type: string
}

interface Order {
  id: string
  user_id: string | null
  items: OrderItem[]
  total: number
  customer_city: string | null
  status: string
  created_at: string
}

const COLUMNS = [
  { key: "pending", label: "Pendente", color: "text-yellow-500", border: "border-yellow-500", bg: "bg-yellow-500", headerBg: "bg-yellow-500/10", icon: Clock },
  { key: "confirmed", label: "Confirmado", color: "text-blue-500", border: "border-blue-500", bg: "bg-blue-500", headerBg: "bg-blue-500/10", icon: CheckCircle },
  { key: "delivered", label: "Entregue", color: "text-green-500", border: "border-green-500", bg: "bg-green-500", headerBg: "bg-green-500/10", icon: Truck },
  { key: "cancelled", label: "Cancelado", color: "text-red-500", border: "border-red-500", bg: "bg-red-500", headerBg: "bg-red-500/10", icon: XCircle },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function nextStatus(current: string): string | null {
  const idx = COLUMNS.findIndex((c) => c.key === current)
  if (idx < 0 || idx >= 2) return null
  return COLUMNS[idx + 1].key
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "7d" | "30d">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest")
  const boardRef = useRef<HTMLDivElement>(null)

  const fetchOrders = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session) {
      router.push("/admin/login")
      return
    }

    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", session.session.user.id)
      .maybeSingle()

    if (!adminCheck) {
      router.push("/")
      return
    }

    const { data } = await supabase
      .from("orders" as any)
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      setAllOrders(
        (data as any[]).map((row) => ({
          id: row.id as string,
          user_id: row.user_id as string | null,
          items: Array.isArray(row.items) ? (row.items as OrderItem[]) : [],
          total: row.total as number,
          customer_city: row.customer_city as string | null,
          status: row.status as string,
          created_at: row.created_at as string,
        }))
      )
    }
  }, [router])

  useEffect(() => {
    setLoading(true)
    fetchOrders().finally(() => setLoading(false))
  }, [fetchOrders])

  async function onRefresh() {
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
  }

  const stats = useMemo(() => {
    const revenue = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0)
    return { revenue, total: allOrders.length }
  }, [allOrders])

  const filteredOrders = useMemo(() => {
    let result = allOrders

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      )
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = Date.now()
      const msMap = { today: 86400000, "7d": 604800000, "30d": 2592000000 }
      const cutoff = now - msMap[dateFilter]
      result = result.filter((o) => new Date(o.created_at).getTime() >= cutoff)
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortOrder === "highest") return b.total - a.total
      return a.total - b.total
    })

    return result
  }, [allOrders, searchQuery, dateFilter, sortOrder])

  const hasActiveFilters = searchQuery.trim() !== "" || dateFilter !== "all" || sortOrder !== "newest"

  const ordersByStatus = useMemo(() => {
    const map: Record<string, Order[]> = {}
    for (const col of COLUMNS) {
      map[col.key] = filteredOrders.filter((o) => o.status === col.key)
    }
    return map
  }, [filteredOrders])

  async function moveOrder(orderId: string, newStatus: string) {
    const { error } = await (supabase.from("orders" as any) as any)
      .update({ status: newStatus })
      .eq("id", orderId)

    if (!error) {
      setAllOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
    }
  }

  async function deleteOrder(orderId: string) {
    if (!confirm("Excluir este pedido?")) return
    const { error } = await (supabase.from("orders" as any) as any)
      .delete()
      .eq("id", orderId)
    if (!error) {
      setAllOrders((prev) => prev.filter((o) => o.id !== orderId))
      setExpandedId(null)
    }
  }

  function handleDragStart(e: React.DragEvent, orderId: string) {
    setDraggingId(orderId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", orderId)
  }

  function handleDragOver(e: React.DragEvent, colKey: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDropTarget(colKey)
  }

  function handleDragLeave() {
    setDropTarget(null)
  }

  function handleDrop(e: React.DragEvent, colKey: string) {
    e.preventDefault()
    const orderId = e.dataTransfer.getData("text/plain")
    if (orderId) {
      const order = allOrders.find((o) => o.id === orderId)
      if (order && order.status !== colKey) {
        moveOrder(orderId, colKey)
      }
    }
    setDraggingId(null)
    setDropTarget(null)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDropTarget(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="mx-auto h-10 w-10 animate-pulse text-primary" />
          <p className="mt-3 text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-base font-bold text-foreground">Pedidos</h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {stats.total}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 sm:flex">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">R$ {formatPrice(stats.revenue)}</span>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="shrink-0 border-b border-border bg-card/50 px-4 py-3 lg:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ID ou produto..."
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
            <Calendar className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            {([
              { key: "all", label: "Todos" },
              { key: "today", label: "Hoje" },
              { key: "7d", label: "7 dias" },
              { key: "30d", label: "30 dias" },
            ] as const).map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDateFilter(d.key)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  dateFilter === d.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
            <SortAsc className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            {([
              { key: "newest", label: "Recentes" },
              { key: "oldest", label: "Antigos" },
              { key: "highest", label: "Maior R$" },
              { key: "lowest", label: "Menor R$" },
            ] as const).map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSortOrder(s.key)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  sortOrder === s.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setDateFilter("all"); setSortOrder("newest") }}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Limpar
            </button>
          )}

          {/* Result count */}
          {hasActiveFilters && (
            <span className="text-[11px] text-muted-foreground">
              {filteredOrders.length} de {allOrders.length} pedidos
            </span>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div ref={boardRef} className="flex flex-1 gap-4 overflow-x-auto p-4 lg:p-6">
        {COLUMNS.map((col) => {
          const orders = ordersByStatus[col.key] ?? []
          const Icon = col.icon
          const isDropping = dropTarget === col.key && draggingId !== null

          return (
            <div
              key={col.key}
              className={`flex w-72 shrink-0 flex-col rounded-xl border-2 transition-colors lg:w-80 ${
                isDropping
                  ? `${col.border} bg-secondary/50`
                  : "border-border/50 bg-secondary/20"
              }`}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              {/* Column header */}
              <div className={`flex items-center gap-2.5 rounded-t-xl px-4 py-3 ${col.headerBg}`}>
                <Icon className={`h-4 w-4 ${col.color}`} />
                <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                <span className={`ml-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${col.bg} text-white`}>
                  {orders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2" style={{ maxHeight: "calc(100vh - 180px)" }}>
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10">
                    <Package className="h-8 w-8 text-muted-foreground/20" />
                    <p className="mt-2 text-xs text-muted-foreground/50">Nenhum pedido</p>
                  </div>
                ) : (
                  orders.map((order) => {
                    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
                    const isExpanded = expandedId === order.id
                    const isDragging = draggingId === order.id
                    const next = nextStatus(order.status)

                    return (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        onDragEnd={handleDragEnd}
                        className={`group cursor-grab rounded-lg border border-border bg-card shadow-sm transition-all active:cursor-grabbing ${
                          isDragging ? "opacity-40 scale-95" : "hover:shadow-md hover:border-border"
                        }`}
                      >
                        {/* Card header */}
                        <div className="flex items-start gap-2 px-3 pt-3 pb-2">
                          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">#{order.id.slice(0, 8)}</span>
                              <span className="text-[10px] text-muted-foreground">{timeAgo(order.created_at)}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span>{itemCount} {itemCount === 1 ? "item" : "itens"}</span>
                              <span className="font-semibold text-primary">R$ {formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="px-3 pb-2">
                          <p className="truncate text-[11px] text-muted-foreground/70">
                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                          </p>
                        </div>

                        {/* Expand toggle */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : order.id) }}
                          className="flex w-full items-center justify-center gap-1 border-t border-border/50 py-1.5 text-[10px] text-muted-foreground/60 transition-colors hover:bg-secondary/30 hover:text-muted-foreground"
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {isExpanded ? "Fechar" : "Detalhes"}
                        </button>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-border/50 px-3 pb-3 pt-2">
                            <div className="rounded-md border border-border/40 bg-secondary/20">
                              {order.items.map((item, idx) => (
                                <div
                                  key={`${order.id}-${idx}`}
                                  className={`flex items-center gap-2 px-2.5 py-1.5 ${
                                    idx < order.items.length - 1 ? "border-b border-border/30" : ""
                                  }`}
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[9px] font-bold text-primary">
                                    {item.quantity}x
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-medium text-foreground">{item.name}</p>
                                    {item.brand && <p className="text-[10px] text-primary">{item.brand}</p>}
                                  </div>
                                  <span className="text-[11px] font-semibold text-foreground">
                                    R$ {formatPrice(item.price * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="mt-2 flex gap-1.5">
                              {next && (
                                <button
                                  type="button"
                                  onClick={() => moveOrder(order.id, next)}
                                  className="flex flex-1 items-center justify-center gap-1 rounded-md bg-primary py-1.5 text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                  Mover
                                </button>
                              )}
                              {COLUMNS.filter((c) => c.key !== order.status).map((c) => {
                                if (c.key === next) return null
                                const CIcon = c.icon
                                return (
                                  <button
                                    key={c.key}
                                    type="button"
                                    onClick={() => moveOrder(order.id, c.key)}
                                    className={`flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-[10px] font-medium transition-colors hover:bg-secondary ${c.color}`}
                                    title={c.label}
                                  >
                                    <CIcon className="h-3 w-3" />
                                  </button>
                                )
                              })}
                              <button
                                type="button"
                                onClick={() => deleteOrder(order.id)}
                                className="flex items-center justify-center rounded-md border border-destructive/20 px-2 py-1.5 text-destructive transition-colors hover:bg-destructive/10"
                                title="Excluir"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

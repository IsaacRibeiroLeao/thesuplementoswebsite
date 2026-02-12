"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/site-config"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { CartProvider, useCart, type FavoriteOrder } from "@/lib/cart-context"
import {
  ArrowLeft,
  User,
  Mail,
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  Heart,
  Trash2,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Shield,
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
  items: OrderItem[]
  total: number
  status: string
  created_at: string
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: "Pendente", color: "text-yellow-500", bg: "bg-yellow-500", icon: Clock },
  confirmed: { label: "Confirmado", color: "text-blue-500", bg: "bg-blue-500", icon: CheckCircle },
  delivered: { label: "Entregue", color: "text-green-500", bg: "bg-green-500", icon: Truck },
  cancelled: { label: "Cancelado", color: "text-red-500", bg: "bg-red-500", icon: XCircle },
}

function ProfileContent() {
  const router = useRouter()
  const { user, loading: authLoading, signIn, signUp, signOut, isAdmin } = useAuth()
  const { favorites, loadFavorite, deleteFavorite, setIsOpen } = useCart()

  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"orders" | "favorites">("orders")

  // Auth form
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authMsg, setAuthMsg] = useState("")
  const [authError, setAuthError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchOrders = useCallback(async () => {
    if (!user) return
    setLoadingOrders(true)
    const { data } = await supabase
      .from("orders" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setOrders(
        (data as any[]).map((row) => ({
          id: row.id as string,
          items: Array.isArray(row.items) ? (row.items as OrderItem[]) : [],
          total: row.total as number,
          status: row.status as string,
          created_at: row.created_at as string,
        }))
      )
    }
    setLoadingOrders(false)
  }, [user])

  useEffect(() => {
    if (user) fetchOrders()
  }, [user, fetchOrders])

  async function handleAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!emailInput.trim() || !passwordInput.trim()) return
    setSubmitting(true)
    setAuthError("")
    setAuthMsg("")

    if (authMode === "login") {
      const { error } = await signIn(emailInput.trim(), passwordInput.trim())
      if (error) {
        setAuthError(error)
      }
    } else {
      const { error } = await signUp(emailInput.trim(), passwordInput.trim())
      if (error) {
        setAuthError(error)
      } else {
        setAuthMsg("Conta criada com sucesso! Verifique seu email para confirmar.")
      }
    }
    setSubmitting(false)
  }

  function handleLoadFavorite(fav: FavoriteOrder) {
    loadFavorite(fav)
    setIsOpen(true)
    router.push("/")
  }

  function handleDeleteFavorite(fav: FavoriteOrder) {
    if (!confirm(`Excluir "${fav.name}"?`)) return
    deleteFavorite(fav.id)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <User className="mx-auto h-10 w-10 animate-pulse text-primary" />
          <p className="mt-3 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Not logged in — show auth form
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="mb-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </a>
          </div>

          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {authMode === "login" ? "Entrar na conta" : "Criar conta"}
            </h1>
            <p className="text-sm text-muted-foreground">THE&apos;s Suplementos</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <p className="text-sm font-medium text-destructive">{authError}</p>
            )}
            {authMsg && (
              <p className="text-sm font-medium text-green-500">{authMsg}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "..." : authMode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <div className="mt-4 text-center">
            {authMode === "login" ? (
              <p className="text-sm text-muted-foreground">
                Nao tem conta?{" "}
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setAuthError(""); setAuthMsg("") }}
                  className="font-semibold text-primary hover:underline"
                >
                  Criar conta
                </button>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ja tem conta?{" "}
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setAuthError(""); setAuthMsg("") }}
                  className="font-semibold text-primary hover:underline"
                >
                  Entrar
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Logged in — show profile
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>
            <User className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Meu Perfil</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <a
                href="/admin"
                className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Shield className="h-4 w-4" />
                Admin
              </a>
            )}
          <button
            type="button"
            onClick={async () => { await signOut(); router.push("/") }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            Meus Pedidos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("favorites")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              activeTab === "favorites"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="h-4 w-4" />
            Favoritos ({favorites.length})
          </button>
        </div>

        {/* Orders tab */}
        {activeTab === "orders" && (
          <div className="mt-6">
            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Package className="h-10 w-10 animate-pulse text-primary" />
                <p className="mt-3 text-muted-foreground">Carregando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
                <Package className="h-14 w-14 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">Voce ainda nao fez nenhum pedido</p>
                <a
                  href="/"
                  className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Ver Produtos
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.pending
                  const Icon = statusInfo.icon
                  const isExpanded = expandedOrderId === order.id
                  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
                  const date = new Date(order.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  return (
                    <div key={order.id} className="overflow-hidden rounded-xl border border-border bg-card">
                      {order.status === "pending" && (
                        <div className="h-1 bg-yellow-500" />
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-secondary/30"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${statusInfo.bg}/10`}>
                          <Icon className={`h-5 w-5 ${statusInfo.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              #{order.id.slice(0, 8)}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusInfo.bg}/10 ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{itemCount} {itemCount === 1 ? "item" : "itens"}</span>
                            <span>R$ {formatPrice(order.total)}</span>
                            <span>{date}</span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border px-4 pb-4 pt-3">
                          <div className="rounded-lg border border-border/60 bg-secondary/20">
                            {order.items.map((item, idx) => (
                              <div
                                key={`${order.id}-${idx}`}
                                className={`flex items-center gap-3 px-3 py-2.5 ${
                                  idx < order.items.length - 1 ? "border-b border-border/40" : ""
                                }`}
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                                  {item.quantity}x
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                                  {item.brand && (
                                    <p className="text-[11px] text-primary">{item.brand}</p>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-foreground">
                                  R$ {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
                              <span className="text-sm font-bold text-foreground">Total</span>
                              <span className="text-sm font-bold text-primary">R$ {formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Favorites tab */}
        {activeTab === "favorites" && (
          <div className="mt-6">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
                <Heart className="h-14 w-14 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">Nenhum pedido favorito salvo</p>
                <p className="mt-1 max-w-xs text-center text-xs text-muted-foreground/70">
                  Adicione produtos ao carrinho e clique em &quot;Salvar como favorito&quot; para salvar aqui
                </p>
                <a
                  href="/"
                  className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Ver Produtos
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav) => {
                  const count = fav.items.reduce((s, i) => s + i.quantity, 0)
                  const total = fav.items.reduce((s, i) => s + i.price * i.quantity, 0)

                  return (
                    <div key={fav.id} className="overflow-hidden rounded-xl border border-border bg-card">
                      <div className="flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Heart className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground">{fav.name}</p>
                          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{count} {count === 1 ? "item" : "itens"}</span>
                            <span>R$ {formatPrice(total)}</span>
                            <span>
                              {new Date(fav.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleLoadFavorite(fav)}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Carregar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFavorite(fav)}
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Excluir favorito"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="border-t border-border/50 bg-secondary/20 px-4 py-2.5">
                        <p className="text-xs text-muted-foreground">
                          {fav.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProfileContent />
      </CartProvider>
    </AuthProvider>
  )
}

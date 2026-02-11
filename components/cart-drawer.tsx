"use client"

import { useState } from "react"
import { X, Plus, Minus, Trash2, ShoppingCart, Mail, LogOut, RotateCcw } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { formatPrice } from "@/lib/site-config"

export function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    sendOrder,
    lastOrder,
    loadLastOrder,
  } = useCart()
  const { user, signInWithEmail, signOut, loading: authLoading } = useAuth()
  const [emailInput, setEmailInput] = useState("")
  const [authMsg, setAuthMsg] = useState("")
  const [showLogin, setShowLogin] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!emailInput.trim()) return
    setSubmitting(true)
    setAuthMsg("")
    const { error } = await signInWithEmail(emailInput.trim())
    if (error) {
      setAuthMsg(error)
    } else {
      setAuthMsg("Link enviado! Verifique seu email.")
      setEmailInput("")
    }
    setSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-label="Fechar carrinho"
      />

      <div className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-background border-l border-border shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              Carrinho ({totalItems})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Fechar carrinho"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Auth section */}
        <div className="border-b border-border px-6 py-3">
          {authLoading ? null : user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="truncate text-muted-foreground">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-3 w-3" />
                Sair
              </button>
            </div>
          ) : showLogin ? (
            <div>
              <form onSubmit={handleEmailLogin} className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "..." : "Enviar"}
                </button>
              </form>
              {authMsg && (
                <p className="mt-1.5 text-xs text-muted-foreground">{authMsg}</p>
              )}
              <button
                type="button"
                onClick={() => { setShowLogin(false); setAuthMsg("") }}
                className="mt-1 text-xs text-muted-foreground underline hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              Entrar ou cadastrar com email
            </button>
          )}

          {user && lastOrder && lastOrder.length > 0 && (
            <button
              type="button"
              onClick={loadLastOrder}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <RotateCcw className="h-4 w-4" />
              Repetir ultimo pedido
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-center text-muted-foreground">
              Seu carrinho esta vazio
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ver Produtos
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-border/50 bg-card p-4"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <span className="text-lg font-bold text-primary/40">
                        {item.name.charAt(0)}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-snug">
                            {item.name}
                          </p>
                          {item.brand && (
                            <p className="text-xs text-primary">{item.brand}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remover item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-foreground transition-colors hover:bg-secondary/80"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-foreground transition-colors hover:bg-secondary/80"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          R$ {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-extrabold text-primary">
                  R$ {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => sendOrder()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--whatsapp))] py-3.5 text-base font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar Pedido via WhatsApp
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="mt-2 w-full rounded-lg py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Limpar Carrinho
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

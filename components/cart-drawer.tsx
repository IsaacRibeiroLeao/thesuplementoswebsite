"use client"

import { useState } from "react"
import { X, Plus, Minus, Trash2, ShoppingCart, Heart, RotateCcw, Check, ArrowRight } from "lucide-react"
import { useCart, type FavoriteOrder } from "@/lib/cart-context"
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
    favorites,
    saveFavorite,
    loadFavorite,
    deleteFavorite,
  } = useCart()
  const { user } = useAuth()
  const [showFavInput, setShowFavInput] = useState(false)
  const [favName, setFavName] = useState("")
  const [showFavList, setShowFavList] = useState(false)

  async function handleSaveFavorite() {
    const name = favName.trim() || "Meu pedido favorito"
    const { error } = await saveFavorite(name)
    if (error) {
      alert(error)
    } else {
      setFavName("")
      setShowFavInput(false)
    }
  }

  function handleLoadFavorite(fav: FavoriteOrder) {
    if (items.length > 0) {
      if (!confirm("Isso vai substituir os itens atuais do carrinho. Continuar?")) return
    }
    loadFavorite(fav)
    setShowFavList(false)
  }

  function handleDeleteFavorite(fav: FavoriteOrder) {
    if (!confirm(`Excluir "${fav.name}"?`)) return
    deleteFavorite(fav.id)
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

        {/* Quick actions */}
        {user && (
          <div className="flex gap-2 border-b border-border px-6 py-3">
            {lastOrder && lastOrder.length > 0 && (
              <button
                type="button"
                onClick={loadLastOrder}
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Ultimo pedido
              </button>
            )}
            {favorites.length > 0 && (
              <button
                type="button"
                onClick={() => setShowFavList(!showFavList)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  showFavList
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                }`}
              >
                <Heart className="h-3.5 w-3.5" />
                Favoritos ({favorites.length})
              </button>
            )}
          </div>
        )}

        {/* Favorites list */}
        {showFavList && favorites.length > 0 && (
          <div className="border-b border-border px-6 py-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Pedidos favoritos
            </p>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {favorites.map((fav) => {
                const count = fav.items.reduce((s, i) => s + i.quantity, 0)
                const total = fav.items.reduce((s, i) => s + i.price * i.quantity, 0)
                return (
                  <div key={fav.id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-card">
                    <button
                      type="button"
                      onClick={() => handleLoadFavorite(fav)}
                      className="flex flex-1 items-center gap-3 p-2.5 text-left transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Heart className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{fav.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {count} {count === 1 ? "item" : "itens"} · R$ {formatPrice(total)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary/60" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFavorite(fav)}
                      className="shrink-0 p-2.5 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Excluir favorito"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-center text-muted-foreground">
              Seu carrinho esta vazio
            </p>
            {user && favorites.length > 0 && !showFavList && (
              <button
                type="button"
                onClick={() => setShowFavList(true)}
                className="flex items-center gap-2 rounded-lg border border-primary/30 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              >
                <Heart className="h-4 w-4" />
                Carregar um favorito
              </button>
            )}
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

              {/* Save favorite / Clear */}
              <div className="mt-3 flex flex-col gap-1">
                {user && (
                  showFavInput ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={favName}
                        onChange={(e) => setFavName(e.target.value)}
                        placeholder="Nome do favorito"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveFavorite() }}
                        className="flex-1 rounded-lg border border-primary/30 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={handleSaveFavorite}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowFavInput(false); setFavName("") }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowFavInput(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/20 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                    >
                      <Heart className="h-4 w-4" />
                      Salvar como favorito
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full rounded-lg py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Limpar Carrinho
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

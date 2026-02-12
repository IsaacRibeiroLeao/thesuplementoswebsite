"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import { formatPrice, getWhatsAppLink } from "@/lib/site-config"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

export interface CartItem {
  id: string
  name: string
  brand: string
  price: number
  quantity: number
  type: "product" | "combo"
}

export interface FavoriteOrder {
  id: string
  name: string
  items: CartItem[]
  created_at: string
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  getWhatsAppCheckoutLink: () => string
  sendOrder: () => Promise<void>
  lastOrder: CartItem[] | null
  loadLastOrder: () => void
  favorites: FavoriteOrder[]
  saveFavorite: (name: string) => Promise<{ error: string | null }>
  loadFavorite: (fav: FavoriteOrder) => void
  deleteFavorite: (id: string) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [lastOrder, setLastOrder] = useState<CartItem[] | null>(null)
  const [favorites, setFavorites] = useState<FavoriteOrder[]>([])

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id)
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id))
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const getWhatsAppCheckoutLink = useCallback(() => {
    if (items.length === 0) return "#"

    let message = "Ola! Gostaria de fazer o seguinte pedido:\n\n"

    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*`
      if (item.brand) message += ` (${item.brand})`
      message += `\n   Qtd: ${item.quantity} x R$ ${formatPrice(item.price)}`
      if (item.quantity > 1) {
        message += ` = R$ ${formatPrice(item.price * item.quantity)}`
      }
      message += "\n\n"
    })

    message += `---\n*Total: R$ ${formatPrice(totalPrice)}*\n\nVi os produtos no site e gostaria de fechar o pedido!`

    return getWhatsAppLink(message)
  }, [items, totalPrice])

  const fetchLastOrder = useCallback(async () => {
    if (!user) {
      setLastOrder(null)
      return
    }
    try {
      const { data } = await supabase
        .from("orders" as any)
        .select("items")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if ((data as any)?.items && Array.isArray((data as any).items)) {
        setLastOrder((data as any).items as CartItem[])
      } else {
        setLastOrder(null)
      }
    } catch {
      setLastOrder(null)
    }
  }, [user])

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      return
    }
    const { data } = await supabase
      .from("favorite_orders" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setFavorites(data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: row.name as string,
        items: Array.isArray(row.items) ? row.items as CartItem[] : [],
        created_at: row.created_at as string,
      })))
    }
  }, [user])

  useEffect(() => {
    fetchLastOrder()
    fetchFavorites()
  }, [fetchLastOrder, fetchFavorites])

  const loadLastOrder = useCallback(() => {
    if (!lastOrder || lastOrder.length === 0) return
    setItems(lastOrder.map((item) => ({ ...item })))
    setIsOpen(true)
  }, [lastOrder])

  const saveFavorite = useCallback(async (name: string): Promise<{ error: string | null }> => {
    if (!user) return { error: "Voce precisa estar logado para salvar favoritos." }
    if (items.length === 0) return { error: "Carrinho vazio." }

    const { error } = await (supabase.from("favorite_orders" as any) as any).insert({
      user_id: user.id,
      name,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
      })),
    })

    if (error) return { error: error.message }
    await fetchFavorites()
    return { error: null }
  }, [user, items, fetchFavorites])

  const loadFavorite = useCallback((fav: FavoriteOrder) => {
    setItems(fav.items.map((item) => ({ ...item })))
    setIsOpen(true)
  }, [])

  const deleteFavorite = useCallback(async (id: string) => {
    await (supabase.from("favorite_orders" as any) as any).delete().eq("id", id)
    setFavorites((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const sendOrder = useCallback(async () => {
    if (items.length === 0) return

    try {
      const orderItems = items.map((item) => ({
        name: item.name,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
      }))

      await (supabase.from("orders" as any) as any).insert({
        user_id: user?.id ?? null,
        items: orderItems,
        total: totalPrice,
        status: "pending",
      })
    } catch (err) {
      console.error("Failed to save order:", err)
    }

    const link = getWhatsAppCheckoutLink()
    window.open(link, "_blank")
  }, [items, totalPrice, getWhatsAppCheckoutLink, user])

  const contextValue = useMemo(
    () => ({
      items,
      isOpen,
      setIsOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      getWhatsAppCheckoutLink,
      sendOrder,
      lastOrder,
      loadLastOrder,
      favorites,
      saveFavorite,
      loadFavorite,
      deleteFavorite,
    }),
    [items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, getWhatsAppCheckoutLink, sendOrder, lastOrder, loadLastOrder, favorites, saveFavorite, loadFavorite, deleteFavorite]
  )

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

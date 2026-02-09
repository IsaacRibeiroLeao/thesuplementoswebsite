"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { formatPrice, getWhatsAppLink } from "@/lib/site-config"

export interface CartItem {
  id: string
  name: string
  brand: string
  price: number
  quantity: number
  type: "product" | "combo"
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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

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
    setIsOpen(true)
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

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
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

"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { ProductsSection } from "@/components/products-section"
import { CombosSection } from "@/components/combos-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { DeliverySection } from "@/components/delivery-section"
import { Footer } from "@/components/footer"
import { FloatingWhatsApp } from "@/components/floating-whatsapp"
import { CartDrawer } from "@/components/cart-drawer"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import type { Category } from "@/lib/site-config"

export default function Page() {
  const [activeFilter, setActiveFilter] = useState<Category | "todos">("todos")
  const [toastText, setToastText] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((name: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToastText(name)
    setToastVisible(true)
    toastTimeout.current = setTimeout(() => setToastVisible(false), 2500)
  }, [])

  useEffect(() => {
    return () => { if (toastTimeout.current) clearTimeout(toastTimeout.current) }
  }, [])

  function handleCategorySelect(category: Category | "todos") {
    setActiveFilter(category)
    const el = document.getElementById("produtos")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <AuthProvider>
    <CartProvider>
      <main>
        <Header />
        <HeroSection />
        <CategoriesSection onSelectCategory={handleCategorySelect} />
        <ProductsSection activeFilter={activeFilter} onFilterChange={setActiveFilter} onAdd={showToast} />
        <CombosSection onAdd={showToast} />
        <TestimonialsSection />
        <DeliverySection />
        <Footer />
        <FloatingWhatsApp />
        <CartDrawer />

        {/* Toast */}
        <div
          className={`fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2.5 rounded-xl border border-[hsl(var(--whatsapp))]/30 bg-card px-5 py-3 shadow-2xl transition-all duration-300 ${
            toastVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
          }`}
        >
          <CheckCircle className="h-5 w-5 shrink-0 text-[hsl(var(--whatsapp))]" />
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            {toastText} adicionado ao carrinho
          </span>
        </div>
      </main>
    </CartProvider>
    </AuthProvider>
  )
}

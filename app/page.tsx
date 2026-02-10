"use client"

import { useState } from "react"
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
        <ProductsSection activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <CombosSection />
        <TestimonialsSection />
        <DeliverySection />
        <Footer />
        <FloatingWhatsApp />
        <CartDrawer />
      </main>
    </CartProvider>
    </AuthProvider>
  )
}

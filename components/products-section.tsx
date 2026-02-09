"use client"

import { ShoppingCart } from "lucide-react"
import { products, getWhatsAppLink, getProductWhatsAppMessage, formatPrice } from "@/lib/site-config"
import type { Category } from "@/lib/site-config"
import { useCart } from "@/lib/cart-context"

const filters: { id: Category | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "massa", label: "Ganhar Massa" },
  { id: "emagrecer", label: "Emagrecer" },
  { id: "energia", label: "Energia" },
  { id: "saude", label: "Saude" },
]

interface ProductsSectionProps {
  activeFilter: Category | "todos"
  onFilterChange: (filter: Category | "todos") => void
}

export function ProductsSection({ activeFilter, onFilterChange }: ProductsSectionProps) {
  const { addItem } = useCart()
  const filteredProducts =
    activeFilter === "todos" ? products : products.filter((p) => p.category === activeFilter)

  return (
    <section id="produtos" className="bg-secondary/30 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Nossos <span className="text-primary">Produtos</span>
          </h2>
          <p className="mt-3 text-muted-foreground">Suplementos originais com os melhores precos</p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30"
            >
              {product.badge && (
                <span className="absolute top-3 left-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {product.badge}
                </span>
              )}

              <div className="flex h-48 items-center justify-center bg-secondary/50">
                <span className="text-5xl font-extrabold text-primary/20">
                  {product.name.charAt(0)}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {product.brand}
                </span>
                <h3 className="mt-1 font-semibold text-foreground leading-snug">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{product.description}</p>

                <div className="mt-auto pt-4">
                  <div className="flex items-baseline gap-2">
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {"R$ "}
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    <span className="text-xl font-extrabold text-primary">
                      {"R$ "}
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          brand: product.brand,
                          price: product.price,
                          type: "product",
                        })
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Adicionar
                    </button>
                    <a
                      href={getWhatsAppLink(getProductWhatsAppMessage(product))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg bg-[hsl(var(--whatsapp))] px-3 py-2.5 text-[#0a0a0a] transition-opacity hover:opacity-90"
                      aria-label="Pedir via WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

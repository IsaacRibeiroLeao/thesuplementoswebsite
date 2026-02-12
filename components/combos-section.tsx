"use client"

import { Package, ShoppingCart } from "lucide-react"
import { combos, getWhatsAppLink, getComboWhatsAppMessage, formatPrice } from "@/lib/site-config"
import { useCart } from "@/lib/cart-context"

export function CombosSection({ onAdd }: { onAdd?: (name: string) => void }) {
  const { addItem } = useCart()

  return (
    <section id="combos" className="py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Combos <span className="text-primary">Exclusivos</span>
          </h2>
          <p className="mt-3 text-muted-foreground">Ofertas que voce so encontra aqui no site</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className="relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card"
            >
              <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {combo.badge}
              </span>

              <div className="flex items-center gap-3 border-b border-border/50 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{combo.name}</h3>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <ul className="flex-1 space-y-2">
                  {combo.products.map((product) => (
                    <li key={product} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {product}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-border/50 pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {"R$ "}
                      {formatPrice(combo.originalPrice)}
                    </span>
                    <span className="text-2xl font-extrabold text-primary">
                      {"R$ "}
                      {formatPrice(combo.comboPrice)}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addItem({
                          id: combo.id,
                          name: combo.name,
                          brand: "",
                          price: combo.comboPrice,
                          type: "combo",
                        })
                        onAdd?.(combo.name)
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Adicionar
                    </button>
                    <a
                      href={getWhatsAppLink(getComboWhatsAppMessage(combo))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg bg-[hsl(var(--whatsapp))] px-4 py-3 text-[#0a0a0a] transition-opacity hover:opacity-90"
                      aria-label="Pedir Combo via WhatsApp"
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

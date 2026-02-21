"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  CheckCircle,
  Truck,
  ShieldCheck,
  Package,
  ArrowLeft,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FloatingWhatsApp } from "@/components/floating-whatsapp"
import { CartDrawer } from "@/components/cart-drawer"
import { CartProvider, useCart } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import {
  products as staticProducts,
  formatPrice,
  getWhatsAppLink,
  categories,
  type Product,
  type Category,
} from "@/lib/site-config"
import { supabase } from "@/lib/supabase"

interface DBProduct {
  id: string
  name: string
  brand: string
  description: string
  price: number
  card_price: number | null
  original_price: number | null
  category: string
  badge: string | null
  image_url: string | null
  nutritional_images: string[] | null
  video_url: string | null
  in_stock: boolean
  sort_order: number
}

function dbToProduct(row: DBProduct): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    description: row.description,
    price: row.price,
    cardPrice: row.card_price ?? undefined,
    originalPrice: row.original_price ?? undefined,
    category: row.category as Category,
    badge: row.badge ?? undefined,
    image: row.image_url ?? undefined,
    nutritionalImages: row.nutritional_images?.length ? row.nutritional_images : undefined,
    videoUrl: row.video_url ?? undefined,
  }
}

function ProductDetailContent() {
  const params = useParams()
  const productId = params.id as string
  const { addItem, setIsOpen: setCartOpen } = useCart()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    async function fetchProduct() {
      // Try fetching all active products from DB
      const { data } = await (supabase.from("products" as any) as any)
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })

      if (data && data.length > 0) {
        const dbProducts = (data as DBProduct[]).map(dbToProduct)
        setAllProducts(dbProducts)
        setProduct(dbProducts.find((p) => p.id === productId) ?? null)
      } else {
        // Fallback to static
        setProduct(staticProducts.find((p) => p.id === productId) ?? null)
      }
    }
    fetchProduct()
  }, [productId])

  const loading = product === undefined
  const categoryLabel = product ? (categories.find((c) => c.id === product.category)?.label || product.category) : ""
  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0
  const installments = product ? product.price / 3 : 0
  const relatedProducts = product
    ? allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
    : []
  const [toastVisible, setToastVisible] = useState(false)
  const [toastText, setToastText] = useState("")
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current)
    }
  }, [])

  const showToast = useCallback((name: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToastText(name)
    setToastVisible(true)
    toastTimeout.current = setTimeout(() => setToastVisible(false), 2500)
  }, [])

  if (loading) {
    return (
      <main>
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center pt-[104px] lg:pt-[108px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return (
      <main>
        <Header />
        <div className="flex min-h-[60vh] flex-col items-center justify-center pt-[104px] lg:pt-[108px]">
          <Package className="h-16 w-16 text-muted-foreground/30" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Produto nao encontrado</h1>
          <p className="mt-2 text-muted-foreground">O produto que voce procura nao existe ou foi removido.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a loja
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const p = product // narrowed: Product (not undefined)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        type: "product",
      })
    }
    showToast(p.name)
    setCartOpen(true)
  }

  const handleWhatsApp = () => {
    const msg = `Ola! Gostaria de saber mais sobre o produto ${p.name} (${p.brand}) que vi no site por R$ ${formatPrice(p.price)}. Pode me ajudar?`
    window.open(getWhatsAppLink(msg), "_blank")
  }

  return (
    <main>
      <Header />

      <div className="pt-[104px] lg:pt-[108px]">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-secondary/30">
          <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-muted-foreground lg:px-8">
            <Link href="/" className="transition-colors hover:text-foreground">
              Inicio
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/#produtos" className="transition-colors hover:text-foreground">
              Produtos
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/#produtos" className="transition-colors hover:text-foreground">
              {categoryLabel}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-primary">{product.name}</span>
          </div>
        </div>

        {/* Product Detail */}
        <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Image */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary/30">
              {product.badge && (
                <span className="absolute top-4 left-4 z-10 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">
                  {product.badge}
                </span>
              )}
              <div className="flex aspect-square items-center justify-center p-8">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-[120px] font-extrabold text-primary/15 select-none">
                    {product.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              {/* Brand */}
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {product.brand}
              </span>

              {/* Name */}
              <h1 className="mt-2 text-2xl font-black text-foreground sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>

              {/* Description */}
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Divider */}
              <div className="my-5 border-t border-border" />

              {/* Price - PIX (main) */}
              <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--whatsapp))]/30 bg-[hsl(var(--whatsapp))]/5 px-4 py-3">
                <span className="rounded bg-[hsl(var(--whatsapp))] px-2 py-0.5 text-xs font-bold text-[#0a0a0a]">PIX</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[hsl(var(--whatsapp))] sm:text-3xl">
                    R$ {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      -{discount}%
                    </span>
                  )}
                </div>
              </div>

              {/* Cartao + installments */}
              {product.cardPrice && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-2.5">
                  <span className="rounded bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">CARTAO</span>
                  <span className="text-sm text-foreground">
                    <strong>R$ {formatPrice(product.cardPrice)}</strong>{" "}
                    <span className="text-muted-foreground">ou <strong className="text-foreground">3x de R$ {formatPrice(product.cardPrice / 3)}</strong> sem juros</span>
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="my-5 border-t border-border" />

              {/* Quantity + Add to cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-11 w-12 items-center justify-center text-sm font-bold text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2.5 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Adicionar ao carrinho
                </button>
              </div>

              {/* WhatsApp button */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-lg bg-[hsl(var(--whatsapp))] py-3 text-sm font-bold text-[#0a0a0a] transition-all hover:opacity-90"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Perguntar sobre este produto
              </button>

              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
                  <Truck className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Entrega Rapida</p>
                    <p className="text-[10px] text-muted-foreground">Teresina e Timon</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-bold text-foreground">100% Original</p>
                    <p className="text-[10px] text-muted-foreground">Garantia de qualidade</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
                  <Package className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Pague com Pix</p>
                    <p className="text-[10px] text-muted-foreground">Melhor preco</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nutritional Table Images */}
        {product.nutritionalImages && product.nutritionalImages.length > 0 && (
          <section className="border-t border-border py-12">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
                Tabela <span className="text-primary">Nutricional</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {product.nutritionalImages.map((img, idx) => (
                  <a
                    key={idx}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-xl border border-border bg-secondary/30 transition-all hover:border-primary/30"
                  >
                    <img
                      src={img}
                      alt={`Tabela nutricional ${idx + 1} - ${product.name}`}
                      className="h-auto w-full object-contain transition-transform group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Video */}
        {product.videoUrl && (
          <section className="border-t border-border bg-secondary/30 py-12">
            <div className="mx-auto max-w-4xl px-4 lg:px-8">
              <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
                Saiba <span className="text-primary">Mais</span>
              </h2>
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={product.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                    title={`Video sobre ${product.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border bg-secondary/30 py-12">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
                Produtos <span className="text-primary">Relacionados</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/produto/${rp.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30"
                  >
                    {rp.badge && (
                      <span className="absolute top-3 left-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                        {rp.badge}
                      </span>
                    )}
                    <div className="flex h-48 items-center justify-center bg-secondary/50">
                      {rp.image ? (
                        <img src={rp.image} alt={rp.name} className="h-full w-full object-contain p-4" />
                      ) : (
                        <span className="text-5xl font-extrabold text-primary/20">
                          {rp.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {rp.brand}
                      </span>
                      <h3 className="mt-1 font-semibold text-foreground leading-snug">{rp.name}</h3>
                      <div className="mt-auto pt-3">
                        <div className="flex items-baseline gap-2">
                          {rp.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              R$ {formatPrice(rp.originalPrice)}
                            </span>
                          )}
                          <span className="text-lg font-extrabold text-primary">
                            R$ {formatPrice(rp.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

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
  )
}

export default function ProductPage() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductDetailContent />
      </CartProvider>
    </AuthProvider>
  )
}

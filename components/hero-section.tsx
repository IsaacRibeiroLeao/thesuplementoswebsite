"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Package, Truck, CreditCard, ShieldCheck } from "lucide-react"
import { banners as staticBanners, type Banner } from "@/lib/site-config"
import { supabase } from "@/lib/supabase"

interface DBBanner {
  id: string
  title: string
  subtitle: string
  cta: string
  cta_link: string
  bg_color: string
  text_color: string
  highlight: string | null
  tags: string[]
  sort_order: number
  image_url: string | null
}

const infoItems = [
  { icon: Package, title: "Acompanhe seus Pedidos", subtitle: "com seguranca, clique aqui", link: "/profile" },
  { icon: Truck, title: "Entrega em Teresina e Timon", subtitle: "Rapida e com cuidado", link: "#entrega" },
  { icon: ShieldCheck, title: "Produtos 100% Originais", subtitle: "Garantia de qualidade!", link: "#produtos" },
  { icon: CreditCard, title: "Pague com Pix", subtitle: "Consulte as condicoes", link: "#produtos" },
]

function dbToBanner(row: DBBanner): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    cta: row.cta,
    ctaLink: row.cta_link,
    bgColor: row.bg_color,
    textColor: row.text_color,
    highlight: row.highlight ?? undefined,
    tags: row.tags ?? [],
    imageUrl: row.image_url ?? undefined,
  }
}

export function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>(staticBanners)
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    async function fetchBanners() {
      const { data } = await (supabase.from("banners" as any) as any)
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })

      if (data && data.length > 0) {
        setBanners((data as DBBanner[]).map(dbToBanner))
      }
    }
    fetchBanners()
  }, [])

  const goTo = useCallback((index: number) => {
    setCurrent(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }, [])

  const next = useCallback(() => {
    setBanners((prev) => {
      setCurrent((c) => (c + 1) % prev.length)
      return prev
    })
  }, [])

  const prev = useCallback(() => {
    setBanners((prev) => {
      setCurrent((c) => (c - 1 + prev.length) % prev.length)
      return prev
    })
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, next])

  const banner = banners[current] ?? banners[0]

  return (
    <section id="inicio" className="pt-[104px] lg:pt-[108px]">
      {/* Banner Carousel */}
      <div className="relative overflow-hidden">
        <div
          className={`relative flex min-h-[340px] items-center bg-gradient-to-r ${banner.bgColor} transition-all duration-700 sm:min-h-[400px] lg:min-h-[480px]`}
        >
          {/* Background image */}
          {banner.imageUrl && (
            <div className="pointer-events-none absolute inset-0">
              <img
                src={banner.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          {/* Decorative elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-white/5 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 h-[250px] w-[250px] rounded-full bg-white/5 blur-[60px]" />
          </div>

          {/* Content */}
          <div className="relative mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
            <div className="max-w-xl animate-fade-in-up">
              {banner.highlight && (
                <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold tracking-wider text-white backdrop-blur-sm">
                  {banner.highlight}
                </span>
              )}

              <h2 className={`text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl ${banner.textColor}`}>
                {banner.title}
              </h2>

              <p className="mt-3 text-base text-white/80 sm:text-lg lg:text-xl">
                {banner.subtitle}
              </p>

              {banner.tags && banner.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {banner.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 text-sm font-medium text-white/70"
                    >
                      <svg className="h-3.5 w-3.5 text-[hsl(var(--whatsapp))]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <a
                href={banner.ctaLink}
                className="mt-8 inline-flex items-center justify-center rounded-lg bg-[hsl(var(--whatsapp))] px-8 py-3.5 text-sm font-black tracking-[0.2em] text-[#0a0a0a] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[hsl(var(--whatsapp))]/30"
              >
                {banner.cta}
              </a>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 lg:left-4 lg:h-12 lg:w-12"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
          </button>
          <button
            type="button"
            onClick={() => { goTo((current + 1) % banners.length) }}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 lg:right-4 lg:h-12 lg:w-12"
            aria-label="Proximo banner"
          >
            <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === current ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border lg:grid-cols-4">
          {infoItems.map((item) => (
            <a
              key={item.title}
              href={item.link}
              className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-secondary/50 lg:px-6"
            >
              <item.icon className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-bold text-foreground sm:text-sm">{item.title}</p>
                <p className="text-[10px] text-muted-foreground sm:text-xs">{item.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

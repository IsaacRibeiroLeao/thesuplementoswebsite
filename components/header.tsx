"use client"

import { useState } from "react"
import Image from "next/image"
import { Menu, X, ShoppingCart, User, Shield, Search, Package } from "lucide-react"
import { siteConfig, getWhatsAppLink } from "@/lib/site-config"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

const navLinks = [
  { label: "PRODUTOS", href: "#produtos" },
  { label: "CATEGORIAS", href: "#categorias" },
  { label: "COMBOS", href: "#combos" },
  { label: "DEPOIMENTOS", href: "#depoimentos" },
  { label: "ENTREGA", href: "#entrega" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { totalItems, setIsOpen: setCartOpen } = useCart()
  const { user, isAdmin } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Row 1: Logo + Search + Icons */}
      <div className="bg-[#6E370D]">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 lg:h-16 lg:px-8">
          {/* Logo */}
          <a href="#inicio" className="shrink-0">
            <Image
              src="/521855140_18513816808021683_2074754106363160959_n.jpg"
              alt="THE's Suplementos"
              width={44}
              height={44}
              className="rounded-lg lg:h-12 lg:w-12"
            />
          </a>

          {/* Search bar — desktop */}
          <div className="relative hidden flex-1 lg:block lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Busque por produto..."
              className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/50 backdrop-blur-sm focus:border-white/40 focus:bg-white/15 focus:outline-none"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1 lg:hidden" />

          {/* Right icons */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Search toggle — mobile */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-lg p-2 text-primary-foreground transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Track orders */}
            <a
              href="/profile"
              className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-primary-foreground transition-colors hover:bg-white/10 lg:flex"
            >
              <Package className="h-4 w-4" />
              <div className="text-left">
                <p className="text-[10px] leading-tight font-medium opacity-70">Rastreio</p>
                <p className="text-xs font-bold leading-tight">Meus Pedidos</p>
              </div>
            </a>

            {/* Profile */}
            <a
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-primary-foreground transition-colors hover:bg-white/10 lg:px-3"
            >
              <User className="h-5 w-5" />
              <div className="hidden text-left lg:block">
                <p className="text-[10px] leading-tight font-medium opacity-70">
                  {user ? "Bem vindo," : "Bem vindo,"}
                </p>
                <p className="text-xs font-bold leading-tight">
                  {user ? "Meu Perfil" : "Entre ou cadastre-se"}
                </p>
              </div>
              {user && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[hsl(var(--whatsapp))] ring-1 ring-[#6E370D] lg:hidden" />
              )}
            </a>

            {/* Admin */}
            {isAdmin && (
              <a
                href="/admin"
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-white/20"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </a>
            )}

            {/* Cart */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative rounded-lg p-2 text-primary-foreground transition-colors hover:bg-white/10"
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--whatsapp))] text-[10px] font-bold text-[#0a0a0a]">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-primary-foreground transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="border-t border-white/10 px-4 py-2 lg:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Busque por produto..."
                autoFocus
                className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Category navigation */}
      <div className="border-b border-border/30 bg-[#5a2d0b]">
        <div className="mx-auto max-w-7xl">
          <nav className="hidden items-center lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-5 py-2.5 text-xs font-bold tracking-wider text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="ml-auto flex items-center gap-3 px-4">
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a
                href={getWhatsAppLink(siteConfig.whatsappGreeting)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </nav>

          {/* Mobile: scrollable categories */}
          <div className="flex overflow-x-auto scrollbar-hide lg:hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="shrink-0 px-4 py-2 text-[11px] font-bold tracking-wider text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="bg-[#6E370D]/98 backdrop-blur-md lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-white/10 py-3 text-sm font-bold tracking-wide text-white transition-opacity hover:opacity-80"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <a
                href="/profile"
                className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold text-white"
              >
                <Package className="h-5 w-5" />
                Acompanhe seus Pedidos
              </a>
              <div className="flex items-center gap-3">
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white transition-opacity hover:opacity-80"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a
                  href={getWhatsAppLink(siteConfig.whatsappGreeting)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[hsl(var(--whatsapp))] px-4 py-2.5 text-sm font-bold text-[#0a0a0a]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WHATSAPP
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

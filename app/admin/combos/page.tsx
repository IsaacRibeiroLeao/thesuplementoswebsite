"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Upload,
  ArrowLeft,
  Package,
} from "lucide-react"
import { formatPrice } from "@/lib/site-config"

interface DBProduct {
  id: string
  name: string
  brand: string
  price: number
  image_url: string | null
  active: boolean
}

interface ComboRow {
  id: string
  name: string
  products: string[]
  original_price: number
  combo_price: number
  badge: string | null
  image_url: string | null
  active: boolean
  sort_order: number
}

const EMPTY_COMBO: Omit<ComboRow, "id"> = {
  name: "",
  products: [],
  original_price: 0,
  combo_price: 0,
  badge: null,
  image_url: null,
  active: true,
  sort_order: 0,
}

export default function AdminCombosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [combos, setCombos] = useState<ComboRow[]>([])
  const [editing, setEditing] = useState<(ComboRow & { isNew?: boolean }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [productSearch, setProductSearch] = useState("")

  const fetchCombos = useCallback(async () => {
    const { data } = await (supabase.from("combos" as any) as any)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (data) setCombos(data as ComboRow[])
  }, [])

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/admin/login"); return }

      const { data: admin } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (!admin) { router.push("/"); return }
      setIsAdmin(true)
      const [_] = await Promise.all([fetchCombos(), fetchDbProducts()])
      setLoading(false)
    }
    init()
  }, [router, fetchCombos])

  async function fetchDbProducts() {
    const { data } = await (supabase.from("products" as any) as any)
      .select("id, name, brand, price, image_url, active")
      .eq("active", true)
      .order("name", { ascending: true })

    if (data) setDbProducts(data as DBProduct[])
  }

  function toggleProduct(productName: string, productPrice: number) {
    setSelectedProducts((prev) => {
      const exists = prev.includes(productName)
      const next = exists ? prev.filter((p) => p !== productName) : [...prev, productName]
      // Auto-calculate original price
      if (editing) {
        const total = next.reduce((sum, name) => {
          const found = dbProducts.find((p) => p.name === name)
          return sum + (found?.price ?? 0)
        }, 0)
        setEditing({ ...editing, products: next, original_price: Math.round(total * 100) / 100 })
      }
      return next
    })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    setUploading(true)
    const ext = file.name.split(".").pop()
    const path = `combos/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from("products").upload(path, file)
    if (error) {
      alert("Erro ao enviar imagem: " + error.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from("products").getPublicUrl(path)
    setEditing({ ...editing, image_url: urlData.publicUrl })
    setImagePreview(urlData.publicUrl)
    setUploading(false)
  }

  function removeImage() {
    if (!editing) return
    if (editing.image_url) {
      const path = editing.image_url.split("/products/").pop()
      if (path) supabase.storage.from("products").remove([path])
    }
    setEditing({ ...editing, image_url: null })
    setImagePreview(null)
  }

  function startNew() {
    const maxOrder = combos.length > 0 ? Math.max(...combos.map((c) => c.sort_order)) : -1
    setEditing({
      id: "",
      ...EMPTY_COMBO,
      sort_order: maxOrder + 1,
      isNew: true,
    } as ComboRow & { isNew?: boolean })
    setImagePreview(null)
    setSelectedProducts([])
    setProductSearch("")
  }

  function startEdit(combo: ComboRow) {
    setEditing({ ...combo })
    setImagePreview(combo.image_url)
    setSelectedProducts(combo.products)
    setProductSearch("")
  }

  function cancelEdit() {
    setEditing(null)
    setImagePreview(null)
    setSelectedProducts([])
    setProductSearch("")
  }

  async function saveCombo() {
    if (!editing || !editing.name.trim()) return
    setSaving(true)

    const payload = {
      name: editing.name.trim(),
      products: selectedProducts,
      original_price: editing.original_price,
      combo_price: editing.combo_price,
      badge: editing.badge?.trim() || null,
      image_url: editing.image_url,
      active: editing.active,
      sort_order: editing.sort_order,
    }

    if ((editing as any).isNew) {
      await (supabase.from("combos" as any) as any).insert(payload)
    } else {
      await (supabase.from("combos" as any) as any).update(payload).eq("id", editing.id)
    }

    await fetchCombos()
    setEditing(null)
    setImagePreview(null)
    setSelectedProducts([])
    setProductSearch("")
    setSaving(false)
  }

  async function toggleActive(id: string, active: boolean) {
    await (supabase.from("combos" as any) as any).update({ active: !active }).eq("id", id)
    await fetchCombos()
  }

  async function deleteCombo(id: string) {
    if (!confirm("Tem certeza que deseja excluir este combo?")) return
    await (supabase.from("combos" as any) as any).delete().eq("id", id)
    await fetchCombos()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </a>
            <span className="text-border">/</span>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Combos</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={startNew}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Novo Combo
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
        {/* Edit form */}
        {editing && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                {(editing as any).isNew ? "Novo Combo" : "Editar Combo"}
              </h2>
              <button type="button" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Nome do combo *
                </label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Kit Massa Muscular"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Produtos do combo *
                </label>
                {/* Selected products */}
                {selectedProducts.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {selectedProducts.map((name) => {
                      const prod = dbProducts.find((p) => p.name === name)
                      return (
                        <span
                          key={name}
                          className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {name}
                          {prod && <span className="text-primary/60">R$ {formatPrice(prod.price)}</span>}
                          <button
                            type="button"
                            onClick={() => toggleProduct(name, prod?.price ?? 0)}
                            className="ml-0.5 text-primary/50 hover:text-primary"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
                {/* Search */}
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Buscar produto para adicionar..."
                />
                {/* Product list */}
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-secondary/20">
                  {dbProducts.length === 0 ? (
                    <p className="px-3 py-4 text-center text-xs text-muted-foreground">Nenhum produto cadastrado no banco</p>
                  ) : (
                    dbProducts
                      .filter((p) => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((p) => {
                        const isSelected = selectedProducts.includes(p.name)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleProduct(p.name, p.price)}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/50 ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                              isSelected ? "border-primary bg-primary text-white" : "border-border"
                            }`}>
                              {isSelected && (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            {p.image_url && (
                              <img src={p.image_url} alt="" className="h-8 w-8 shrink-0 rounded object-contain" />
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-foreground">{p.name}</span>
                              <span className="ml-1.5 text-xs text-muted-foreground">{p.brand}</span>
                            </div>
                            <span className="shrink-0 text-xs font-bold text-primary">R$ {formatPrice(p.price)}</span>
                          </button>
                        )
                      })
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Preco original (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editing.original_price || ""}
                  onChange={(e) => setEditing({ ...editing, original_price: Number.parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="259.70"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Preco do combo (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editing.combo_price || ""}
                  onChange={(e) => setEditing({ ...editing, combo_price: Number.parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="229.90"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Badge (destaque)
                </label>
                <input
                  type="text"
                  value={editing.badge ?? ""}
                  onChange={(e) => setEditing({ ...editing, badge: e.target.value || null })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Economize R$ 29,80"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ordem
                </label>
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number.parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Ativo
                </label>
              </div>

              {/* Image upload */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Imagem do combo
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-24 w-24 rounded-lg border border-border object-contain bg-secondary/30"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                      <Upload className="h-5 w-5" />
                      {uploading ? "Enviando..." : "Enviar imagem"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Preview
              </label>
              <div className="max-w-sm overflow-hidden rounded-xl border border-border bg-card">
                {editing.badge && (
                  <span className="absolute top-3 right-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {editing.badge}
                  </span>
                )}
                <div className="relative flex items-center gap-3 border-b border-border/50 p-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="h-12 w-12 rounded-xl object-contain" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <h3 className="text-base font-bold text-foreground">{editing.name || "Nome do combo"}</h3>
                  {editing.badge && (
                    <span className="ml-auto rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {editing.badge}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <ul className="space-y-1.5">
                    {(selectedProducts.length > 0 ? selectedProducts : ["Produto 1", "Produto 2"]).map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-baseline gap-2 border-t border-border/50 pt-3">
                    {editing.original_price > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        R$ {formatPrice(editing.original_price)}
                      </span>
                    )}
                    <span className="text-xl font-extrabold text-primary">
                      R$ {formatPrice(editing.combo_price || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveCombo}
                disabled={saving || !editing.name.trim() || !editing.combo_price || selectedProducts.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        )}

        {/* Combo list */}
        {combos.length === 0 && !editing ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
            <Package className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground">Nenhum combo cadastrado</p>
            <button
              type="button"
              onClick={startNew}
              className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Cadastrar primeiro combo
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="mb-3 text-xs text-muted-foreground">
              {combos.length} combo{combos.length !== 1 ? "s" : ""}
            </p>
            {combos.map((combo) => (
              <div
                key={combo.id}
                className={`flex items-center gap-4 rounded-xl border bg-card p-4 transition-all ${
                  !combo.active ? "border-border/50 opacity-60" : "border-border"
                }`}
              >
                {/* Image */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
                  {combo.image_url ? (
                    <img src={combo.image_url} alt="" className="h-full w-full rounded-lg object-contain p-1" />
                  ) : (
                    <Package className="h-6 w-6 text-primary/30" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{combo.name}</span>
                    {combo.badge && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {combo.badge}
                      </span>
                    )}
                    {!combo.active && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {combo.products.join(" · ")}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xs text-muted-foreground line-through">
                      R$ {formatPrice(combo.original_price)}
                    </span>
                    <span className="text-sm font-extrabold text-primary">
                      R$ {formatPrice(combo.combo_price)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleActive(combo.id, combo.active)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title={combo.active ? "Desativar" : "Ativar"}
                  >
                    {combo.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(combo)}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCombo(combo.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

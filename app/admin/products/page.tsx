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
  Search,
} from "lucide-react"
import { formatPrice, categories } from "@/lib/site-config"

interface ProductRow {
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
  active: boolean
  sort_order: number
}

const EMPTY_PRODUCT: Omit<ProductRow, "id"> = {
  name: "",
  brand: "",
  description: "",
  price: 0,
  card_price: null,
  original_price: null,
  category: "massa",
  badge: null,
  image_url: null,
  nutritional_images: null,
  video_url: null,
  in_stock: true,
  active: true,
  sort_order: 0,
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [editing, setEditing] = useState<(ProductRow & { isNew?: boolean }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("todos")

  const fetchProducts = useCallback(async () => {
    const { data } = await (supabase.from("products" as any) as any)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })

    if (data) setProducts(data as ProductRow[])
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
      await fetchProducts()
      setLoading(false)
    }
    init()
  }, [router, fetchProducts])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    setUploading(true)
    const ext = file.name.split(".").pop()
    const path = `products/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from("products").upload(path, file)
    if (error) {
      alert("Erro ao enviar imagem: " + error.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from("products").getPublicUrl(path)
    const url = urlData.publicUrl

    setEditing({ ...editing, image_url: url })
    setImagePreview(url)
    setUploading(false)
  }

  function removeImage() {
    if (!editing) return
    if (editing.image_url) {
      const path = editing.image_url.split("/products/").pop()
      if (path) supabase.storage.from("products").remove([`products/${path}`])
    }
    setEditing({ ...editing, image_url: null })
    setImagePreview(null)
  }

  function startNew() {
    const maxOrder = products.length > 0 ? Math.max(...products.map((p) => p.sort_order)) : -1
    setEditing({
      id: "",
      ...EMPTY_PRODUCT,
      sort_order: maxOrder + 1,
      isNew: true,
    } as ProductRow & { isNew?: boolean })
    setImagePreview(null)
  }

  function startEdit(product: ProductRow) {
    setEditing({ ...product })
    setImagePreview(product.image_url)
  }

  function cancelEdit() {
    setEditing(null)
    setImagePreview(null)
  }

  async function saveProduct() {
    if (!editing || !editing.name.trim()) return
    setSaving(true)

    const payload = {
      name: editing.name.trim(),
      brand: editing.brand.trim(),
      description: editing.description.trim(),
      price: editing.price,
      card_price: editing.card_price != null && editing.card_price > 0 ? editing.card_price : null,
      original_price: editing.original_price != null && editing.original_price > 0 ? editing.original_price : null,
      category: editing.category,
      badge: editing.badge?.trim() || null,
      image_url: editing.image_url,
      nutritional_images: editing.nutritional_images?.length ? editing.nutritional_images : [],
      video_url: editing.video_url?.trim() || null,
      in_stock: editing.in_stock,
      active: editing.active,
      sort_order: editing.sort_order,
    }

    if ((editing as any).isNew) {
      await (supabase.from("products" as any) as any).insert(payload)
    } else {
      await (supabase.from("products" as any) as any).update(payload).eq("id", editing.id)
    }

    await fetchProducts()
    setEditing(null)
    setImagePreview(null)
    setSaving(false)
  }

  async function toggleActive(id: string, active: boolean) {
    await (supabase.from("products" as any) as any).update({ active: !active }).eq("id", id)
    await fetchProducts()
  }

  async function deleteProduct(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return
    await (supabase.from("products" as any) as any).delete().eq("id", id)
    await fetchProducts()
  }

  const filteredProducts = products.filter((p) => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = filterCategory === "todos" || p.category === filterCategory
    return matchSearch && matchCategory
  })

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
              <h1 className="text-lg font-bold text-foreground">Produtos</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={startNew}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou marca..."
              className="w-full rounded-lg border border-border bg-secondary/30 py-2.5 pl-10 pr-3 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="todos">Todas categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                {(editing as any).isNew ? "Novo Produto" : "Editar Produto"}
              </h2>
              <button type="button" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Nome *
                </label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Whey Protein Concentrado 900g"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Marca *
                </label>
                <input
                  type="text"
                  value={editing.brand}
                  onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Growth"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Descricao
                </label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Proteina de alta qualidade para ganho de massa muscular"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Preco PIX / A vista (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editing.price || ""}
                  onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="119.90"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Preco Cartao (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editing.card_price ?? ""}
                  onChange={(e) => { const v = e.target.value; setEditing({ ...editing, card_price: v === '' ? null : parseFloat(v) }) }}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="134.90"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Preco original (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editing.original_price ?? ""}
                  onChange={(e) => { const v = e.target.value; setEditing({ ...editing, original_price: v === '' ? null : parseFloat(v) }) }}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="149.90"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Categoria
                </label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
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
                  placeholder="Mais Vendido, -18%, Oferta..."
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ordem
                </label>
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
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
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={editing.in_stock}
                    onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Em estoque
                </label>
              </div>

              {/* Video URL */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  URL do Video (YouTube)
                </label>
                <input
                  type="text"
                  value={editing.video_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, video_url: e.target.value || null })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* Image upload */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Imagem do produto
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
                  <p className="text-[10px] text-muted-foreground">
                    PNG ou JPG. Aparece na listagem e na pagina do produto.
                  </p>
                </div>
              </div>

              {/* Nutritional images */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Imagens da Tabela Nutricional (ate 4)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {(editing.nutritional_images ?? []).map((url, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={url}
                        alt={`Nutricional ${idx + 1}`}
                        className="h-20 w-20 rounded-lg border border-border object-contain bg-secondary/30"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const imgs = [...(editing.nutritional_images ?? [])]
                          // Remove from storage
                          const path = url.split("/products/").pop()
                          if (path) supabase.storage.from("products").remove([`products/${path}`])
                          imgs.splice(idx, 1)
                          setEditing({ ...editing, nutritional_images: imgs.length ? imgs : null })
                        }}
                        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {(editing.nutritional_images ?? []).length < 4 && (
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-3 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                      <Upload className="h-4 w-4" />
                      Adicionar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const ext = file.name.split(".").pop()
                          const path = `products/nutri_${Date.now()}.${ext}`
                          const { error } = await supabase.storage.from("products").upload(path, file)
                          if (error) { alert("Erro: " + error.message); return }
                          const { data: urlData } = supabase.storage.from("products").getPublicUrl(path)
                          const imgs = [...(editing.nutritional_images ?? []), urlData.publicUrl]
                          setEditing({ ...editing, nutritional_images: imgs })
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Fotos da tabela nutricional do produto. Aparecem na pagina de vendas.
                </p>
              </div>
            </div>

            {/* Preview card */}
            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Preview
              </label>
              <div className="flex max-w-xs overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center bg-secondary/50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="h-full w-full object-contain p-2" />
                  ) : (
                    <span className="text-4xl font-extrabold text-primary/20">
                      {editing.name?.charAt(0) || "P"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {editing.brand || "Marca"}
                  </span>
                  <span className="mt-0.5 text-sm font-semibold text-foreground leading-snug">
                    {editing.name || "Nome do produto"}
                  </span>
                  <div className="mt-auto flex items-baseline gap-1.5 pt-2">
                    {editing.original_price && (
                      <span className="text-xs text-muted-foreground line-through">
                        R$ {formatPrice(editing.original_price)}
                      </span>
                    )}
                    <span className="text-base font-extrabold text-primary">
                      R$ {formatPrice(editing.price || 0)}
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
                onClick={saveProduct}
                disabled={saving || !editing.name.trim() || !editing.brand.trim() || !editing.price}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        )}

        {/* Product list */}
        {filteredProducts.length === 0 && !editing ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
            <Package className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground">
              {products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
            </p>
            {products.length === 0 && (
              <button
                type="button"
                onClick={startNew}
                className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Cadastrar primeiro produto
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="mb-3 text-xs text-muted-foreground">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""}
            </p>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`flex items-center gap-4 rounded-xl border bg-card p-4 transition-all ${
                  !product.active ? "border-border/50 opacity-60" : "border-border"
                }`}
              >
                {/* Image */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
                  {product.image_url ? (
                    <img src={product.image_url} alt="" className="h-full w-full rounded-lg object-contain p-1" />
                  ) : (
                    <span className="text-2xl font-extrabold text-primary/20">
                      {product.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{product.name}</span>
                    {product.badge && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {product.badge}
                      </span>
                    )}
                    {!product.active && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                        Inativo
                      </span>
                    )}
                    {!product.in_stock && (
                      <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-600">
                        Sem estoque
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {product.brand} · {categories.find((c) => c.id === product.category)?.label || product.category}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    {product.original_price && (
                      <span className="text-xs text-muted-foreground line-through">
                        R$ {formatPrice(product.original_price)}
                      </span>
                    )}
                    <span className="text-sm font-extrabold text-primary">
                      R$ {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleActive(product.id, product.active)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title={product.active ? "Desativar" : "Ativar"}
                  >
                    {product.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(product)}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(product.id)}
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

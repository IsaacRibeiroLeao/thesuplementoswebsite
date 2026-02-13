"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  Shield,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Upload,
} from "lucide-react"

interface BannerRow {
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
  active: boolean
  image_url: string | null
  created_at: string
}

const PRESET_COLORS = [
  { label: "Vermelho", value: "from-[#8B2500] via-[#A0380A] to-[#6E370D]" },
  { label: "Azul Escuro", value: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]" },
  { label: "Marrom", value: "from-[#2d1b00] via-[#4a2c00] to-[#6E370D]" },
  { label: "Roxo", value: "from-[#1a0a2e] via-[#2d1052] to-[#4a1a7a]" },
  { label: "Verde Escuro", value: "from-[#0a2e1a] via-[#105230] to-[#1a7a4a]" },
  { label: "Preto", value: "from-[#111] via-[#1a1a1a] to-[#222]" },
]

export default function AdminBannersPage() {
  const router = useRouter()
  const [banners, setBanners] = useState<BannerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<BannerRow | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tagsInput, setTagsInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const fetchBanners = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session) {
      router.push("/admin/login")
      return
    }

    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", session.session.user.id)
      .maybeSingle()

    if (!adminCheck) {
      router.push("/")
      return
    }

    const { data } = await (supabase.from("banners" as any) as any)
      .select("*")
      .order("sort_order", { ascending: true })

    if (data) {
      setBanners(data as BannerRow[])
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  function startNew() {
    const maxOrder = banners.reduce((max, b) => Math.max(max, b.sort_order), -1)
    setEditing({
      id: "",
      title: "",
      subtitle: "",
      cta: "APROVEITE",
      cta_link: "#produtos",
      bg_color: PRESET_COLORS[0].value,
      text_color: "text-white",
      highlight: "",
      tags: [],
      sort_order: maxOrder + 1,
      active: true,
      image_url: null,
      created_at: "",
    })
    setTagsInput("")
    setImagePreview(null)
    setIsNew(true)
  }

  function startEdit(banner: BannerRow) {
    setEditing({ ...banner })
    setTagsInput((banner.tags ?? []).join(", "))
    setImagePreview(banner.image_url)
    setIsNew(false)
  }

  function cancelEdit() {
    setEditing(null)
    setIsNew(false)
    setImagePreview(null)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    setUploading(true)
    const ext = file.name.split(".").pop()
    const fileName = `banner-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from("banners")
      .upload(fileName, file, { upsert: true })

    if (!error) {
      const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl
      setEditing({ ...editing, image_url: publicUrl })
      setImagePreview(publicUrl)
    }
    setUploading(false)
  }

  async function removeImage() {
    if (!editing) return
    if (editing.image_url) {
      const path = editing.image_url.split("/banners/").pop()
      if (path) {
        await supabase.storage.from("banners").remove([path])
      }
    }
    setEditing({ ...editing, image_url: null })
    setImagePreview(null)
  }

  async function saveBanner() {
    if (!editing) return
    setSaving(true)

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title: editing.title,
      subtitle: editing.subtitle,
      cta: editing.cta,
      cta_link: editing.cta_link,
      bg_color: editing.bg_color,
      text_color: editing.text_color,
      highlight: editing.highlight || null,
      tags,
      sort_order: editing.sort_order,
      active: editing.active,
      image_url: editing.image_url,
    }

    if (isNew) {
      await (supabase.from("banners" as any) as any).insert(payload)
    } else {
      await (supabase.from("banners" as any) as any)
        .update(payload)
        .eq("id", editing.id)
    }

    setSaving(false)
    setEditing(null)
    setIsNew(false)
    await fetchBanners()
  }

  async function deleteBanner(id: string) {
    if (!confirm("Excluir este banner?")) return
    await (supabase.from("banners" as any) as any).delete().eq("id", id)
    await fetchBanners()
  }

  async function toggleActive(banner: BannerRow) {
    await (supabase.from("banners" as any) as any)
      .update({ active: !banner.active })
      .eq("id", banner.id)
    await fetchBanners()
  }

  async function moveOrder(id: string, direction: "up" | "down") {
    const idx = banners.findIndex((b) => b.id === id)
    if (idx < 0) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= banners.length) return

    const a = banners[idx]
    const b = banners[swapIdx]

    await Promise.all([
      (supabase.from("banners" as any) as any).update({ sort_order: b.sort_order }).eq("id", a.id),
      (supabase.from("banners" as any) as any).update({ sort_order: a.sort_order }).eq("id", b.id),
    ])
    await fetchBanners()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Shield className="mx-auto h-10 w-10 animate-pulse text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-base font-bold text-foreground">Gerenciar Banners</h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {banners.length}
            </span>
          </div>
          <button
            type="button"
            onClick={startNew}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Novo Banner
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
        {/* Edit/Create form */}
        {editing && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">
                {isNew ? "Novo Banner" : "Editar Banner"}
              </h2>
              <button type="button" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Titulo
                </label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="WHEY PROTEIN"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Destaque (badge)
                </label>
                <input
                  type="text"
                  value={editing.highlight ?? ""}
                  onChange={(e) => setEditing({ ...editing, highlight: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="ATE 30% OFF"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Subtitulo
                </label>
                <input
                  type="text"
                  value={editing.subtitle}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Os melhores precos em Whey..."
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Texto do botao
                </label>
                <input
                  type="text"
                  value={editing.cta}
                  onChange={(e) => setEditing({ ...editing, cta: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="APROVEITE"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Link do botao
                </label>
                <input
                  type="text"
                  value={editing.cta_link}
                  onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="#produtos"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tags (separadas por virgula)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Pos-treino, Ganho de massa, Recuperacao"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Imagem do banner
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-24 w-auto rounded-lg border border-border object-contain"
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
                    PNG ou JPG. Aparece ao lado do texto no desktop.
                  </p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Cor de fundo
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setEditing({ ...editing, bg_color: c.value })}
                      className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all ${
                        editing.bg_color === c.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <div className={`mb-1 h-4 w-12 rounded bg-gradient-to-r ${c.value}`} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Preview
              </label>
              <div className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${editing.bg_color} p-6`}>
                {imagePreview && (
                  <div className="pointer-events-none absolute inset-0">
                    <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                  </div>
                )}
                <div className="relative">
                  {editing.highlight && (
                    <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold tracking-wider text-white">
                      {editing.highlight}
                    </span>
                  )}
                  <h3 className="text-2xl font-black text-white">{editing.title || "Titulo"}</h3>
                  <p className="mt-1 text-sm text-white/80">{editing.subtitle || "Subtitulo"}</p>
                  {tagsInput && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tagsInput.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                        <span key={tag} className="text-xs text-white/60">✓ {tag}</span>
                      ))}
                    </div>
                  )}
                  <span className="mt-3 inline-block rounded-lg bg-[hsl(var(--whatsapp))] px-5 py-2 text-xs font-black tracking-widest text-[#0a0a0a]">
                    {editing.cta || "BOTAO"}
                  </span>
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
                onClick={saveBanner}
                disabled={saving || !editing.title || !editing.subtitle}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        )}

        {/* Banner list */}
        {banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
            <Shield className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground">Nenhum banner cadastrado</p>
            <button
              type="button"
              onClick={startNew}
              className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Criar primeiro banner
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`overflow-hidden rounded-xl border bg-card transition-all ${
                  banner.active ? "border-border" : "border-border/50 opacity-60"
                }`}
              >
                {/* Color strip */}
                <div className={`h-1.5 bg-gradient-to-r ${banner.bg_color}`} />

                <div className="flex items-center gap-3 p-4">
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />

                  {/* Order buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveOrder(banner.id, "up")}
                      disabled={idx === 0}
                      className="rounded p-0.5 text-muted-foreground hover:bg-secondary disabled:opacity-20"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveOrder(banner.id, "down")}
                      disabled={idx === banners.length - 1}
                      className="rounded p-0.5 text-muted-foreground hover:bg-secondary disabled:opacity-20"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Image thumbnail */}
                  {banner.image_url && (
                    <img
                      src={banner.image_url}
                      alt=""
                      className="hidden h-12 w-auto shrink-0 rounded object-contain sm:block"
                    />
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{banner.title}</span>
                      {banner.highlight && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {banner.highlight}
                        </span>
                      )}
                      {!banner.active && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{banner.subtitle}</p>
                    {banner.tags && banner.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {banner.tags.map((tag) => (
                          <span key={tag} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleActive(banner)}
                      className={`rounded-lg p-2 transition-colors ${
                        banner.active
                          ? "text-[hsl(var(--whatsapp))] hover:bg-[hsl(var(--whatsapp))]/10"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                      title={banner.active ? "Desativar" : "Ativar"}
                    >
                      {banner.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(banner)}
                      className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBanner(banner.id)}
                      className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

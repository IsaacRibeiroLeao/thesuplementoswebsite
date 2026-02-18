"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  Trash2,
  Check,
  X,
  ArrowLeft,
  MessageSquare,
  Star,
  Clock,
} from "lucide-react"

interface TestimonialRow {
  id: string
  name: string
  city: string
  text: string
  rating: number
  approved: boolean
  user_id: string | null
  created_at: string
}

export default function AdminTestimonialsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all")

  const fetchTestimonials = useCallback(async () => {
    const { data } = await (supabase.from("testimonials" as any) as any)
      .select("*")
      .order("created_at", { ascending: false })

    if (data) setTestimonials(data as TestimonialRow[])
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
      await fetchTestimonials()
      setLoading(false)
    }
    init()
  }, [router, fetchTestimonials])

  async function approve(id: string) {
    await (supabase.from("testimonials" as any) as any).update({ approved: true }).eq("id", id)
    await fetchTestimonials()
  }

  async function reject(id: string) {
    await (supabase.from("testimonials" as any) as any).update({ approved: false }).eq("id", id)
    await fetchTestimonials()
  }

  async function deleteTestimonial(id: string) {
    if (!confirm("Tem certeza que deseja excluir este depoimento?")) return
    await (supabase.from("testimonials" as any) as any).delete().eq("id", id)
    await fetchTestimonials()
  }

  const filtered = testimonials.filter((t) => {
    if (filter === "pending") return !t.approved
    if (filter === "approved") return t.approved
    return true
  })

  const pendingCount = testimonials.filter((t) => !t.approved).length

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
              <MessageSquare className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Depoimentos</h1>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-bold text-yellow-600">
              <Clock className="h-3.5 w-3.5" />
              {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Todos" : f === "pending" ? "Pendentes" : "Aprovados"}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground">Nenhum depoimento encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => (
              <div
                key={t.id}
                className={`rounded-xl border bg-card p-5 transition-all ${
                  t.approved ? "border-border" : "border-yellow-500/30 bg-yellow-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.city || "Sem cidade"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!t.approved ? (
                      <button
                        type="button"
                        onClick={() => approve(t.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--whatsapp))]/10 px-3 py-1.5 text-xs font-medium text-[hsl(var(--whatsapp))] transition-colors hover:bg-[hsl(var(--whatsapp))]/20"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Aprovar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reject(t.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reprovar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteTestimonial(t.id)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={`star-${t.id}-${i}`}
                      className={`h-4 w-4 ${i < t.rating ? "fill-primary text-primary" : "text-border"}`}
                    />
                  ))}
                </div>

                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground/60">
                  <span>{new Date(t.created_at).toLocaleDateString("pt-BR")}</span>
                  <span className={`rounded-full px-2 py-0.5 font-bold ${
                    t.approved ? "bg-[hsl(var(--whatsapp))]/10 text-[hsl(var(--whatsapp))]" : "bg-yellow-500/10 text-yellow-600"
                  }`}>
                    {t.approved ? "Aprovado" : "Pendente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

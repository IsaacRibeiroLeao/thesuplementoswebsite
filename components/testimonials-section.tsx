"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { testimonials as staticTestimonials, type Testimonial } from "@/lib/site-config"
import { supabase } from "@/lib/supabase"

interface DBTestimonial {
  id: string
  name: string
  city: string
  text: string
  rating: number
}

function dbToTestimonial(row: DBTestimonial): Testimonial {
  return {
    name: row.name,
    city: row.city || "",
    rating: row.rating,
    quote: row.text,
  }
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(staticTestimonials)

  useEffect(() => {
    async function fetchTestimonials() {
      const { data } = await (supabase.from("testimonials" as any) as any)
        .select("id, name, city, text, rating")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(8)

      if (data && data.length > 0) {
        setTestimonials((data as DBTestimonial[]).map(dbToTestimonial))
      }
    }
    fetchTestimonials()
  }, [])

  return (
    <section id="depoimentos" className="bg-secondary/30 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            O que nossos clientes <span className="text-primary">dizem</span>
          </h2>
          <p className="mt-3 text-muted-foreground">Avaliacoes reais de quem ja comprou conosco</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-xl border border-border/50 bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
              </div>

              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="mt-3 flex-1 text-sm text-muted-foreground leading-relaxed">
                {`"${t.quote}"`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

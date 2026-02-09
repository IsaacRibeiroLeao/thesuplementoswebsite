"use client"

import { Dumbbell, Flame, Zap, Heart } from "lucide-react"
import type { Category } from "@/lib/site-config"

const iconMap = {
  dumbbell: Dumbbell,
  flame: Flame,
  zap: Zap,
  heart: Heart,
}

const categoryData: { id: Category; label: string; icon: keyof typeof iconMap; description: string }[] = [
  { id: "massa", label: "Ganhar Massa", icon: "dumbbell", description: "Whey, Creatina, Hipercaloricos" },
  { id: "emagrecer", label: "Emagrecer", icon: "flame", description: "Termogenicos, Whey Isolado, L-Carnitina" },
  { id: "energia", label: "Energia & Foco", icon: "zap", description: "Pre-treinos, Cafeina, BCAA" },
  { id: "saude", label: "Saude & Bem-estar", icon: "heart", description: "Vitaminas, Omega 3, Colageno" },
]

interface CategoriesSectionProps {
  onSelectCategory: (category: Category | "todos") => void
}

export function CategoriesSection({ onSelectCategory }: CategoriesSectionProps) {
  return (
    <section id="categorias" className="py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Qual e o seu <span className="text-primary">objetivo</span>?
          </h2>
          <p className="mt-3 text-muted-foreground">Selecione e veja os produtos ideais para voce</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryData.map((cat) => {
            const Icon = iconMap[cat.icon]
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="group flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-card p-6 text-center transition-all hover:border-primary/50 hover:bg-card/80"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{cat.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

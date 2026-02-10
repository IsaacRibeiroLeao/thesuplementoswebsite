import { MapPin, Truck, Package } from "lucide-react"
import { getWhatsAppLink } from "@/lib/site-config"

const highlights = [
  { icon: MapPin, title: "Teresina & Timon", description: "Entrega rapida na regiao" },
  { icon: Truck, title: "Piaui & Maranhao", description: "Cobertura regional" },
  { icon: Package, title: "Todo o Brasil", description: "Envio via Correios" },
]

export function DeliverySection() {
  return (
    <section id="entrega" className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-primary/5" />
      <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
        <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
          Enviamos para <span className="text-primary">todo o Brasil</span>
        </h2>
        <p className="mt-3 text-muted-foreground">Receba seus suplementos onde voce estiver</p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.title} className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <h.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{h.title}</h3>
              <p className="text-sm text-muted-foreground">{h.description}</p>
            </div>
          ))}
        </div>

        <a
          href={getWhatsAppLink("Ola! Gostaria de consultar o frete para minha cidade.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--whatsapp))] px-8 py-3.5 text-base font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Consulte o frete pelo WhatsApp
        </a>
      </div>
    </section>
  )
}

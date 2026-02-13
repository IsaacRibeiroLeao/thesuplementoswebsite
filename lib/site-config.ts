export const siteConfig = {
  name: "THE's Suplementos",
  whatsappNumber: "5586999658244",
  instagramUrl: "https://www.instagram.com/thesuplementostore/",
  whatsappGreeting: "Ola! Vim pelo site e gostaria de mais informacoes!",
}

export interface Banner {
  id: string
  title: string
  subtitle: string
  cta: string
  ctaLink: string
  bgColor: string
  textColor: string
  highlight?: string
  tags?: string[]
  imageUrl?: string
}

export const banners: Banner[] = [
  {
    id: "1",
    title: "WHEY PROTEIN",
    subtitle: "Os melhores precos em Whey Concentrado, Isolado e Hidrolisado",
    cta: "APROVEITE",
    ctaLink: "#produtos",
    bgColor: "from-[#8B2500] via-[#A0380A] to-[#6E370D]",
    textColor: "text-white",
    highlight: "ATE 30% OFF",
    tags: ["Pos-treino", "Ganho de massa", "Recuperacao"],
  },
  {
    id: "2",
    title: "CREATINA PURA",
    subtitle: "Monohidratada de alta pureza para maximo desempenho",
    cta: "VER OFERTAS",
    ctaLink: "#produtos",
    bgColor: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    textColor: "text-white",
    highlight: "MAIS VENDIDO",
    tags: ["Forca", "Performance", "Resistencia"],
  },
  {
    id: "3",
    title: "COMBOS ESPECIAIS",
    subtitle: "Monte seu kit com desconto exclusivo e economize",
    cta: "VER COMBOS",
    ctaLink: "#combos",
    bgColor: "from-[#2d1b00] via-[#4a2c00] to-[#6E370D]",
    textColor: "text-white",
    highlight: "ECONOMIZE",
    tags: ["Kits prontos", "Desconto", "Frete gratis"],
  },
  {
    id: "4",
    title: "PRE-TREINOS",
    subtitle: "Energia e foco extremo para treinos intensos",
    cta: "CONFIRA",
    ctaLink: "#produtos",
    bgColor: "from-[#1a0a2e] via-[#2d1052] to-[#4a1a7a]",
    textColor: "text-white",
    highlight: "NOVIDADE",
    tags: ["Energia", "Foco", "Pump"],
  },
]

export type Category = "massa" | "emagrecer" | "energia" | "saude"

export interface Product {
  id: string
  name: string
  brand: string
  description: string
  price: number
  originalPrice?: number
  category: Category
  badge?: string
  image?: string
}

export interface Combo {
  id: string
  name: string
  products: string[]
  originalPrice: number
  comboPrice: number
  badge: string
}

export interface Testimonial {
  name: string
  city: string
  rating: number
  quote: string
}

export const categories: { id: Category; label: string; icon: string; description: string }[] = [
  { id: "massa", label: "Ganhar Massa", icon: "dumbbell", description: "Whey, Creatina, Hipercaloricos" },
  { id: "emagrecer", label: "Emagrecer", icon: "flame", description: "Termogenicos, Whey Isolado, L-Carnitina" },
  { id: "energia", label: "Energia & Foco", icon: "zap", description: "Pre-treinos, Cafeina, BCAA" },
  { id: "saude", label: "Saude & Bem-estar", icon: "heart", description: "Vitaminas, Omega 3, Colageno" },
]

export const products: Product[] = [
  {
    id: "1",
    name: "Whey Protein Concentrado 900g",
    brand: "Growth",
    description: "Proteina de alta qualidade para ganho de massa muscular",
    price: 119.9,
    originalPrice: 149.9,
    category: "massa",
    badge: "Mais Vendido",
  },
  {
    id: "2",
    name: "Creatina Monohidratada 300g",
    brand: "Growth",
    description: "Aumento de forca e performance nos treinos",
    price: 89.9,
    originalPrice: 109.9,
    category: "massa",
    badge: "-18%",
  },
  {
    id: "3",
    name: "Hipercalorico Mass 3kg",
    brand: "Max Titanium",
    description: "Ganho de peso com carboidratos e proteinas",
    price: 99.9,
    originalPrice: 129.9,
    category: "massa",
  },
  {
    id: "4",
    name: "Whey Protein Isolado 900g",
    brand: "Growth",
    description: "Proteina isolada com baixo teor de gordura",
    price: 179.9,
    originalPrice: 219.9,
    category: "emagrecer",
    badge: "-22%",
  },
  {
    id: "5",
    name: "Termogenico Flame 60caps",
    brand: "Black Skull",
    description: "Acelerador metabolico para queima de gordura",
    price: 69.9,
    originalPrice: 89.9,
    category: "emagrecer",
  },
  {
    id: "6",
    name: "L-Carnitina 2000 480ml",
    brand: "Atlhetica",
    description: "Auxilia na queima de gordura durante o exercicio",
    price: 49.9,
    originalPrice: 64.9,
    category: "emagrecer",
    badge: "Oferta",
  },
  {
    id: "7",
    name: "Pre-Treino Insane 300g",
    brand: "Darkness",
    description: "Energia e foco extremo para seus treinos",
    price: 129.9,
    originalPrice: 159.9,
    category: "energia",
    badge: "Mais Vendido",
  },
  {
    id: "8",
    name: "Cafeina 200mg 60caps",
    brand: "Growth",
    description: "Energia e disposicao para o dia a dia",
    price: 29.9,
    originalPrice: 39.9,
    category: "energia",
  },
  {
    id: "9",
    name: "BCAA 2:1:1 120caps",
    brand: "Max Titanium",
    description: "Recuperacao muscular pos-treino",
    price: 49.9,
    originalPrice: 59.9,
    category: "energia",
  },
  {
    id: "10",
    name: "Multivitaminico A-Z 90caps",
    brand: "Growth",
    description: "Vitaminas e minerais essenciais para o corpo",
    price: 39.9,
    originalPrice: 49.9,
    category: "saude",
  },
  {
    id: "11",
    name: "Omega 3 120caps",
    brand: "Growth",
    description: "Acidos graxos para saude cardiovascular",
    price: 44.9,
    originalPrice: 54.9,
    category: "saude",
    badge: "Oferta",
  },
  {
    id: "12",
    name: "Colageno Hidrolisado 300g",
    brand: "Atlhetica",
    description: "Saude da pele, cabelos, unhas e articulacoes",
    price: 59.9,
    originalPrice: 74.9,
    category: "saude",
  },
]

export const combos: Combo[] = [
  {
    id: "c1",
    name: "Kit Massa Muscular",
    products: ["Whey Protein Concentrado 900g", "Creatina 300g", "BCAA 120caps"],
    originalPrice: 259.7,
    comboPrice: 229.9,
    badge: "Economize R$ 29,80",
  },
  {
    id: "c2",
    name: "Kit Definicao Total",
    products: ["Whey Isolado 900g", "Termogenico 60caps", "L-Carnitina 480ml"],
    originalPrice: 299.7,
    comboPrice: 264.9,
    badge: "Economize R$ 34,80",
  },
  {
    id: "c3",
    name: "Kit Saude Completa",
    products: ["Multivitaminico 90caps", "Omega 3 120caps", "Glutamina 300g"],
    originalPrice: 144.7,
    comboPrice: 124.9,
    badge: "Economize R$ 19,80",
  },
]

export const testimonials: Testimonial[] = [
  {
    name: "Carlos Silva",
    city: "Teresina, PI",
    rating: 5,
    quote: "Entrega super rapida aqui em Teresina! Produtos originais e atendimento nota 10. Recomendo demais!",
  },
  {
    name: "Ana Beatriz",
    city: "Timon, MA",
    rating: 5,
    quote: "Melhor loja de suplementos da regiao! Precos imbativeis e o WhatsApp deles responde muito rapido.",
  },
  {
    name: "Rafael Costa",
    city: "Parnaiba, PI",
    rating: 5,
    quote: "Mesmo morando no interior, recebi tudo certinho e rapido. Whey Growth com o melhor preco!",
  },
  {
    name: "Juliana Mendes",
    city: "Teresina, PI",
    rating: 5,
    quote: "Compro todo mes com eles. Combo de Massa Muscular vale cada centavo! Servico excelente.",
  },
]

export function getWhatsAppLink(message: string) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`
}

export function getProductWhatsAppMessage(product: Product) {
  return `Ola! Vi o produto ${product.name} (${product.brand}) no site por R$ ${product.price.toFixed(2).replace(".", ",")} e gostaria de fechar o pedido!`
}

export function getComboWhatsAppMessage(combo: Combo) {
  return `Ola! Vi o ${combo.name} no site por R$ ${combo.comboPrice.toFixed(2).replace(".", ",")} e gostaria de fechar o pedido!`
}

export function formatPrice(price: number) {
  return price.toFixed(2).replace(".", ",")
}

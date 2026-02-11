import React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist" })

export const metadata: Metadata = {
  title: "THE's Suplementos | Suplementos em Teresina, Timon e Todo o Brasil",
  description:
    "Os melhores suplementos com os melhores precos. Whey Protein, Creatina, Pre-treinos e muito mais. Entrega rapida em Teresina, Timon e todo o Brasil.",
  keywords:
    "suplementos Teresina, whey protein Piaui, creatina Timon, suplementos esportivos, THE's suplementos",
  icons: {
    icon: "/521855140_18513816808021683_2074754106363160959_n.jpg",
    apple: "/521855140_18513816808021683_2074754106363160959_n.jpg",
  },
  openGraph: {
    title: "THE's Suplementos | Sua evolucao comeca aqui",
    description:
      "Os melhores suplementos com os melhores precos. Entrega rapida em Teresina, Timon e todo o Brasil.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

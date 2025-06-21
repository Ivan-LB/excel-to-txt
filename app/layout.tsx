import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner" // Importa Toaster de sonner

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Generador TXT Bancario",
  description: "Genera archivos TXT para el banco desde Excel.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" /> {/* Añade el Toaster de sonner aquí */}
      </body>
    </html>
  )
}

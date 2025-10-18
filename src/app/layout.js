// src/app/layout.js
import "./globals.css"
import Navbar from "@/components/Navbar"
import RootNavbarGate from "@/components/RootNavbarGate"
import Footer from "@/components/layout/Footer"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = "nodejs"
export const metadata = {
  title: "E-commerce Coffee",
  themeColor: "#0a0a0a",
}

export default async function RootLayout({ children }) {
  const user = await getCurrentUser()

  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        {/* pastikan UI native ikut dark */}
        <meta name="color-scheme" content="dark" />
      </head>
      {/* flex-col + flex-1 => footer nempel di bawah */}
      <body className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
        <RootNavbarGate>
          <Navbar initialUser={user} />
        </RootNavbarGate>

        <main className="flex-1">
          {children}
        </main>

        <Footer/>
      </body>
    </html>
  )
}
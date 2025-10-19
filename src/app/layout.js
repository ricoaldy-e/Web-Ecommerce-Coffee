import "./globals.css"
import Navbar from "@/components/Navbar"
import RootNavbarGate from "@/components/RootNavbarGate"
import Footer from "@/components/layout/Footer"
import { getCurrentUser } from "@/lib/currentUser"

export const runtime = "nodejs"
export const metadata = {
  title: "E-commerce Coffee",
  themeColor: "#92400e", // warna amber tua
}

export default async function RootLayout({ children }) {
  const user = await getCurrentUser()

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Warna UI bawaan disesuaikan agar sesuai tema amber */}
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#fff7ed" />
      </head>

      <body className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 text-amber-900">
        {/* Navbar (atas) */}
        <RootNavbarGate>
          <div className="sticky top-0 z-50 shadow-md bg-gradient-to-r from-amber-900 to-amber-800 text-white">
            <Navbar initialUser={user} />
          </div>
        </RootNavbarGate>

        {/* Konten utama */}
        <main className="flex-1">
        <main className="flex-1 relative z-0"></main>
          {children}
        </main>
        {/* Footer */}
        <Footer className="bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 border-t border-amber-700" />

      </body>
    </html>
  )
}

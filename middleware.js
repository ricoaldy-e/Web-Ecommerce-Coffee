// middleware.js
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

// ==================== CONFIGURATION ====================

// Halaman yang bisa diakses tanpa login (guest-friendly)
const PUBLIC_ROUTES = ["/", "/products", "/auth/login", "/auth/register"]

// Halaman yang WAJIB login sebagai USER (bukan admin)
const USER_PROTECTED_ROUTES = ["/cart", "/checkout", "/orders", "/profile"]

// Halaman khusus ADMIN (wajib role ADMIN)
const ADMIN_ROUTES = ["/admin"]

// Admin tidak boleh akses public tertentu (sesuai kebutuhanmu)
const ADMIN_BLOCKED_PUBLIC = ["/", "/products"]

// ==================== HELPERS ====================

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  )
}

function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some((route) => {
    if (route === pathname) return true
    if (pathname.startsWith(route + "/")) return true // contoh: /products/123
    return false
  })
}

function isUserProtectedRoute(pathname) {
  return USER_PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}

function isAdminRoute(pathname) {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route))
}

async function verifyJWT(token) {
  if (!token) return null
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error("❌ JWT_SECRET tidak ditemukan di .env")
    return null
  }
  try {
    // jose kompatibel dengan Edge Runtime
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    return payload // { userId, email, role, iat, exp }
  } catch (e) {
    console.error("❌ JWT verification failed:", e.message)
    return null
  }
}

function redirectTo(req, pathname, includeNext = false) {
  const url = req.nextUrl.clone()
  url.pathname = pathname
  if (includeNext) {
    const currentPath = req.nextUrl.pathname + req.nextUrl.search
    url.search = `?next=${encodeURIComponent(currentPath)}`
  } else {
    url.search = ""
  }
  return NextResponse.redirect(url)
}

// ==================== MIDDLEWARE ====================

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // DEBUG (opsional): rapikan log
  console.log("=".repeat(60))
  console.log("🔍 MIDDLEWARE HIT:", pathname)

  // 1) Skip asset statis
  if (isStaticAsset(pathname)) {
    console.log("✅ Static asset, skip")
    console.log("=".repeat(60))
    return NextResponse.next()
  }

  // 2) Ambil & verifikasi token (Edge-safe)
  const token = req.cookies.get("token")?.value
  const user = await verifyJWT(token)
  console.log("👤 User:", user ? `${user.email} (${user.role})` : "Guest")

  // 3) ADMIN routes
  if (isAdminRoute(pathname)) {
    console.log("🔐 Admin route")
    if (!user) {
      console.log("❌ No token → login")
      console.log("=".repeat(60))
      return redirectTo(req, "/auth/login", true)
    }
    if (user.role !== "ADMIN") {
      console.log("❌ Not admin → home")
      console.log("=".repeat(60))
      return redirectTo(req, "/")
    }
    console.log("✅ Admin OK")
    console.log("=".repeat(60))
    return NextResponse.next()
  }

  // 4) USER protected routes
  if (isUserProtectedRoute(pathname)) {
    console.log("🔒 User protected")
    if (!user) {
      console.log("❌ No token → login")
      console.log("=".repeat(60))
      return redirectTo(req, "/auth/login", true)
    }
    if (user.role === "ADMIN") {
      console.log("❌ Admin ke user page → /admin")
      console.log("=".repeat(60))
      return redirectTo(req, "/admin")
    }
    console.log("✅ User OK")
    console.log("=".repeat(60))
    return NextResponse.next()
  }

  // 5) Public routes
  if (isPublicRoute(pathname)) {
    console.log("🌍 Public route")
    // Admin tidak boleh akses home & products
    if (user?.role === "ADMIN" && ADMIN_BLOCKED_PUBLIC.some(p => pathname === p || pathname.startsWith(p + "/"))) {
      console.log("🚫 Admin diblok dari public → /admin")
      console.log("=".repeat(60))
      return redirectTo(req, "/admin")
    }
    // Jika sudah login dan buka /auth/* → redirect sesuai role
    if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
      const dest = user.role === "ADMIN" ? "/admin" : "/products"
      console.log(`✅ Logged in → ${dest}`)
      console.log("=".repeat(60))
      return redirectTo(req, dest)
    }
    console.log("✅ Public OK")
    console.log("=".repeat(60))
    return NextResponse.next()
  }

  // 6) Default: route lain
  console.log("⚠️  Unknown route")
  if (!user) {
    console.log("❌ No token → login")
    console.log("=".repeat(60))
    return redirectTo(req, "/auth/login", true)
  }
  console.log("✅ Logged in → allow")
  console.log("=".repeat(60))
  return NextResponse.next()
}

// ==================== MATCHER ====================

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
}
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/app")) {
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*"],
}

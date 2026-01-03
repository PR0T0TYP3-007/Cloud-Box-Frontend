import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // Only check for cookie-based auth (for server-side)
  // Client-side auth (localStorage) is handled in the layout component
  const token = req.cookies.get("token")?.value
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/app")) {
    // Allow the request to proceed - client-side will handle redirect if needed
    // The cookie is optional since we're using localStorage + Authorization header
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*"],
}

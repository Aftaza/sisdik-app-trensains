import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session_token");
  const { pathname } = req.nextUrl;

  // Allow requests to /api/auth/login and the login page itself
  if (pathname === "/" || pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL(`/?message=${encodeURIComponent("Please login to continue")}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/login (login route)
     * - (root) (the login page)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth/login|$).*)",
  ],
};
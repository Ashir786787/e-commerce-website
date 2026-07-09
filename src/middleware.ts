import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("novacart_token")?.value;

  const protectedRoutes = [
    "/profile",
    "/cart",
    "/checkout",
    "/admin",
  ];

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/cart/:path*", "/checkout/:path*", "/admin/:path*"],
};
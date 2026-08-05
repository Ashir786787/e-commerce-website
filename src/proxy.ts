import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("novacart_token")?.value;

  const protectedRoutes = [
    "/checkout",
    "/admin",
  ];

  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin/login" || pathname === "/admin" || pathname === "/admin/") {
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/admin/:path*"],
};
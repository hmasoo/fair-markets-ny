import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/opengraph-image"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/geo/") ||
    pathname.match(/\.(ico|svg|png|jpg|jpeg|webp|json)$/)
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("fm-auth");
  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || "/";

  if (password !== (process.env.SITE_PASSWORD || "paradox")) {
    const loginUrl = new URL(
      `/login?error=1&next=${encodeURIComponent(next)}`,
      request.url
    );
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set("fm-auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return response;
}

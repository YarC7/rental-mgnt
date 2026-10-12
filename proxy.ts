import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/sign-in"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Khóa đăng ký tài khoản mới (chỉ tạo qua DB/seed)
  if (pathname === "/sign-up" || pathname.startsWith("/sign-up/")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (pathname.startsWith("/api/auth/sign-up")) {
    return NextResponse.json({ error: "Registration is disabled" }, { status: 403 });
  }

  // Luôn cho qua auth endpoints còn lại của Better Auth
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  let session: unknown = null;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch {
    session = null;
  }

  // API khác: trả 401 JSON thay vì redirect
  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isPublicPage = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!session && !isPublicPage) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (session && isPublicPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Chạy cho pages + API, bỏ qua static assets
    "/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.webmanifest|sw\\.js).*)",
  ],
};

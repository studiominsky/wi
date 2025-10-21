import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/auth/callback")) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => request.cookies.get(n)?.value } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && pathname.startsWith("/dashboard")) {
    const next = encodeURIComponent(pathname + search);
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

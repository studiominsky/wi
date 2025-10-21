import { NextResponse, type NextRequest } from "next/server";
import { createServerClientRoute } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=No code provided", url.origin)
    );
  }

  const res = NextResponse.redirect(new URL(next, url.origin));

  const supabase = createServerClientRoute(req, res);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin)
    );
  }

  return res;
}

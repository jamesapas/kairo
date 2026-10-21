import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth");
  const isPublicStatic = request.nextUrl.pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json|woff|woff2|ttf|eot)$/);

  // Allow static assets, images, and auth callback through without redirecting
  if (isAuthCallback || isPublicStatic) {
    return supabaseResponse;
  }

  const isHomePage = request.nextUrl.pathname === "/";

  // Check if user is logged in
  if (!user && !isLoginPage && !isHomePage) {
    // Redirect unauthenticated user accessing protected routes to / with auth modal
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "login");
    return NextResponse.redirect(url);
  }

  // If user is already logged in and tries to access /login, redirect to dashboard /
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

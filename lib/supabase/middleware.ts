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
  const isSignupPage = request.nextUrl.pathname.startsWith("/signup");
  const isRegisterPage = request.nextUrl.pathname.startsWith("/register");
  const isAuthPage = isLoginPage || isSignupPage || isRegisterPage;
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth");
  const isPublicStatic = request.nextUrl.pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json|woff|woff2|ttf|eot)$/);

  // Allow static assets, images, and auth callback through without redirecting
  if (isAuthCallback || isPublicStatic) {
    return supabaseResponse;
  }

  const isHomePage = request.nextUrl.pathname === "/";
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  // If user is already logged in and tries to access / or /login or /signup, redirect directly to /dashboard
  if (user && (isHomePage || isAuthPage)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Check if unauthenticated user is trying to access protected routes (e.g. /settings, /jobs)
  if (!user && !isAuthPage && !isHomePage && !isDashboardPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

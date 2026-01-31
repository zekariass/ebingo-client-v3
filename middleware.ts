
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { createServerClient } from "@supabase/ssr";
// import { nextI18NextConfig as cnf } from "./next-i18next.config";

// // Define paths that require authentication
// const PROTECTED_PATHS = ["/admin", "/rooms", "/transactions", "/wallets", "/game-payments"];

// export async function middleware(req: NextRequest) {
//   const url = req.nextUrl.clone();
//   const { pathname } = url;

//   // --- 1) Locale handling ---
//   const segments = pathname.split("/");
//   const maybeLocale = segments[1];

//   if (!cnf.locales.includes(maybeLocale)) {
//     // redirect: preserve path and prefix with defaultLocale
//     return NextResponse.redirect(
//       new URL(`/${cnf.defaultLocale}${pathname}`, req.url)
//     );
//   }

//   const locale = maybeLocale;
//   const pathWithoutLocale = "/" + segments.slice(2).join("/");

//   // --- 2) Authentication check for protected routes ---
//   if (PROTECTED_PATHS.some((path) => pathWithoutLocale.startsWith(path))) {
//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
//       {
//         cookies: {
//           getAll() {
//             return req.cookies.getAll();
//           },
//         },
//       }
//     );

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       // Redirect to login page in the correct locale
//       return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
//     }
//   }

//   // --- 3) Continue request ---
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico)).*)"],
// };




import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { createServerClient } from "@supabase/ssr";
import { nextI18NextConfig as cnf } from "./next-i18next.config";
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const res = NextResponse.next();

  // --- 1) Locale handling ---
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (!cnf.locales.includes(maybeLocale)) {
    const newUrl = new URL(req.url);
    newUrl.pathname = `/${cnf.defaultLocale}${pathname}`;
    return NextResponse.redirect(newUrl);
  }

  // const locale = maybeLocale;
  // const pathWithoutLocale = "/" + segments.slice(2).join("/");

  return res;
}

// export const config = {
//   matcher: [
//   "/((?!_next|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico)|ws/.*).*)"
// ],
// };


export const config = {
  matcher: [
    // Exclude Next.js internals, static assets, and public folders
    "/((?!_next|favicon.ico|audio|images|fonts|.*\\.(?:png|jpg|jpeg|svg|gif|ico|mp3|mp4|wav)|ws/.*).*)",
  ],
};

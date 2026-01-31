// // import { NextResponse } from "next/server";
// // import type { NextRequest } from "next/server";
// // import { createServerClient } from "@supabase/ssr";

// // // Define protected routes
// // const PROTECTED_PATHS = ["/admin", "/rooms"];

// // export async function middleware(req: NextRequest) {
// //     const supabase = createServerClient(
// //         process.env.NEXT_PUBLIC_SUPABASE_URL!,
// //         process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
// //         {
// //             cookies: {
// //                 getAll() {
// //                     return req.cookies.getAll();
// //                 },
// //             },
// //         }
// //     );

// //     // Secure check: validates token with Supabase Auth server
// //     const {
// //         data: { user },
// //     } = await supabase.auth.getUser();

// //     if (PROTECTED_PATHS.some((path) => req.nextUrl.pathname.startsWith(path))) {
// //         if (!user) {
// //             // Redirect to login if not authenticated
// //             const loginUrl = new URL("/login", req.url);
// //             return NextResponse.redirect(loginUrl);
// //         }
// //     }

// //     return NextResponse.next();
// // }


// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { createServerClient } from "@supabase/ssr";
// import cnf from "./next-i18next.config";

// const PROTECTED_PATHS = ["/admin", "/rooms"];

// export async function middleware(req: NextRequest) {
//   const url = req.nextUrl.clone();
//   const { pathname } = url;

//   // --- 1) Locale handling ---
//   const segments = pathname.split("/");
//   const maybeLocale = segments[1];

//   if (!cnf.i18n.locales.includes(maybeLocale)) {
//     // redirect: always preserve path and prefix with defaultLocale
//     return NextResponse.redirect(
//       new URL(`/${cnf.i18n.defaultLocale}${pathname}`, req.url)
//     );
//   }

//   const locale = maybeLocale;
//   const pathWithoutLocale = "/" + segments.slice(2).join("/");

//   // --- 2) Authentication check ---
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return req.cookies.getAll();
//         },
//       },
//     }
//   );

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   // Instead of splitting again, just check `pathWithoutLocale` directly
//   if (PROTECTED_PATHS.some((protectedPath) => pathWithoutLocale.startsWith(protectedPath))) {
//     if (!user) {
//       return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
//     }
//   }

//   // --- 3) Continue (locale preserved) ---
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico)).*)"],
// };


import { NextResponse } from 'next/server';

const defaultLocale = 'en';
const locales = ['en', 'am', 'or', 'ti', 'so'];

export function middleware(req: Request) {
  const url = new URL(req.url);
  const pathLocale = url.pathname.split('/')[1];

  if (!locales.includes(pathLocale)) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${url.pathname}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};


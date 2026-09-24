// import { ReactNode, Suspense } from 'react'
// import { GeistSans } from 'geist/font/sans'
// import { GeistMono } from 'geist/font/mono'
// import { ThemeProvider } from '@/components/theme-provider'
// import '@/app/globals.css'
// import QueryProvider from '@/providers/QueryProvider'
// import { LanguageSwitcher } from '@/components/ui/language-switcher'
// import { Analytics } from '@vercel/analytics/next'
// import { I18nProvider } from '@/providers/I18nProvider'
// import { ProcessingProvider } from '@/lib/contexts/processing-context'
// import { LayoutContent } from './layout-content'

// interface LayoutProps {
//   children: ReactNode
// }

// export default function RootLayout({ children }: LayoutProps) {
//   return (
//     <html lang="en" dir="ltr" suppressHydrationWarning>
//       <head>
//         <script src="https://telegram.org/js/telegram-web-app.js?59"></script>
//       </head>
//       <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
//         <Suspense fallback={<h1>Loading...</h1>}>
//           <I18nProvider fallbackLocale="en">
//             <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false} storageKey="bingo-theme">
//               <QueryProvider>
//                 <ProcessingProvider>
//                   {/* <MusicPlayerProvider src="/music/background.mp3" defaultVolume={0.1}> */}
//                     <div className="flex justify-end">
//                       <LanguageSwitcher />
//                     </div>

//                     <LayoutContent>
//                       {children}
//                     </LayoutContent>
//                     {/* Floating music toggle button */}
//                     {/* <MusicToggleButton /> */}
//                   {/* </MusicPlayerProvider>                   */}
//                 </ProcessingProvider>
//               </QueryProvider>
//             </ThemeProvider>
//           </I18nProvider>
//         </Suspense>
//         <Analytics />
//       </body>
//     </html>
//   )
// }


import { ReactNode, Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import "@/app/globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Analytics } from "@vercel/analytics/next";
import { I18nProvider } from "@/providers/I18nProvider";
import { ProcessingProvider } from "@/lib/contexts/processing-context";
import { LayoutContent } from "./layout-content";
import { AgentThemeSync } from "../agent-theme-sync";
import { THEME_CLASSES } from "@/lib/themes";

interface LayoutProps {
  children: ReactNode;
}

// Applies the agent palette class to <html> before first paint:
// ?theme=<key> wins, else the per-agent value cached by AgentThemeSync.
const themeBootScript = `(function(){try{var p=new URLSearchParams(location.search);var classes=${JSON.stringify(
  THEME_CLASSES
)};var t=p.get('theme');var id=p.get('agentId');var cls=null;if(t&&classes.indexOf('theme-'+t)>-1){cls='theme-'+t}else if(id){var c=localStorage.getItem('agentTheme:'+id);if(c&&classes.indexOf(c)>-1){cls=c}}if(cls){document.documentElement.classList.add(cls)}}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- intentional pre-paint theme script */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <script src="https://telegram.org/js/telegram-web-app.js?59"></script>
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<h1>Loading...</h1>}>
          <I18nProvider fallbackLocale="en">
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="bingo-theme"
            >
              <AgentThemeSync /> {/* <-- add this line */}
              <QueryProvider>
                <ProcessingProvider>
                  <div className="flex justify-end">
                    <LanguageSwitcher />
                  </div>

                  <LayoutContent>{children}</LayoutContent>
                </ProcessingProvider>
              </QueryProvider>
            </ThemeProvider>
          </I18nProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}

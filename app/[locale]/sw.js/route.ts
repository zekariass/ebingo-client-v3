import { readFile } from "fs/promises"
import path from "path"

// Serve the same cleanup service worker at /:locale/sw.js so any SW registered
// under a locale-prefixed script URL also updates to the self-uninstalling one.
export async function GET() {
  const source = await readFile(path.join(process.cwd(), "public", "sw.js"), "utf8")
  return new Response(source, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}

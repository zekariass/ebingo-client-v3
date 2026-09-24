const apiUrl =
  process.env.VERITAS_API_URL ?? "https://verifyapi.leulzenebe.pro";

// VERITAS_API_KEY is the documented name; NEXT_PUBLIC_VERIFY_API_KEY is the legacy name.
const apiKey = process.env.VERITAS_API_KEY ?? process.env.NEXT_PUBLIC_VERIFY_API_KEY;

if (!apiKey) throw new Error("VERITAS_API_KEY is required");

type VeritasResponse = { success?: boolean; error?: string };

export async function veritas<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("x-api-key", apiKey as string);

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
  });
  const result = (await response.json()) as T & VeritasResponse;

  if (!response.ok || result.success === false) {
    throw new Error(result.error ?? `Veritas request failed (${response.status})`);
  }

  return result;
}

export const jsonHeaders = { "Content-Type": "application/json" };
const REQUEST_TIMEOUT_MS = 12000;

export async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    let message = `HTTP ${res.status}`;

    try {
      if (contentType.includes("application/json")) {
        const payload = await res.json();
        message = payload.message || payload.error || JSON.stringify(payload);
      } else {
        message = await res.text();
      }
    } catch {}

    throw new Error(message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Tiempo de espera agotado al conectar con el servidor.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

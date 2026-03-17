export const jsonHeaders = { "Content-Type": "application/json" };
const REQUEST_TIMEOUT_MS = 12000;

export async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    let message = `Error ${res.status}`;

    try {
      if (contentType.includes("application/json")) {
        const payload = await res.json();
        message = payload.message || payload.error || JSON.stringify(payload);
      } else {
        const text = await res.text();
        message = text || `Error ${res.status}`;
      }
    } catch {
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    // Respuesta "204 No Content" (Común en DELETE)
    return {} as T;
  }

  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    // Respuesta en formano no json
    const text = await res.text();
    return text as unknown as T;
  }

  try {
    // Cuerpo json vacio
    const text = await res.text();
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error("La respuesta del servidor no es un JSON válido");
  }
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

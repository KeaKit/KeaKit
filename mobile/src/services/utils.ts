import { ApiError } from "../types/ApiError";

export const jsonHeaders = { "Content-Type": "application/json" };
const REQUEST_TIMEOUT_MS = 12000;

export async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    let message = `Error ${res.status}`;
    let data: any = null;

    try {
      if (contentType.includes("application/json")) {
        data = await res.json();
        message = data.message || data.error || JSON.stringify(data);
      } else {
        const text = await res.text();
        message = text || message;
      }
    } catch {
    }

    throw new ApiError(res.status, message, data);
  }

  if (res.status === 204) {
    // Respuesta "204 No Content" (Común en DELETE)
    return {} as T;
  }

  if (!contentType.includes("application/json")) {
    // Respuesta en formano no json
    const text = await res.text();
    return text as unknown as T;
  }

  
  const text = await res.text();
  if (!text) return {} as T;
    
  return JSON.parse(text) as T;
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

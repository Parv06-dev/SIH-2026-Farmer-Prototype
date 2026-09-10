const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiRequest(path, options = {}) {
  const { timeoutMs = 5000, ...fetchOptions } = options;
  const headers = {
    ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
    ...fetchOptions.headers
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError("The procurement server took too long to respond.", 0);
    }
    throw new ApiError(
      "Cannot reach the procurement server. Check that the backend is running.",
      0
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error || `Request failed (${response.status})`,
      response.status,
      data
    );
  }

  return data;
}

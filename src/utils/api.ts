import { getCsrfToken } from "./csrf";

export async function secureFetch(url: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    "X-XSRF-TOKEN": getCsrfToken() || "",
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // URLs are now always relative (same-origin), proxying to the backend
  let requestUrl = url;

  // Make sure we resolve absolute path correctly if a relative path was somehow provided
  if (typeof window !== "undefined" && !requestUrl.startsWith('http')) {
      requestUrl = new URL(requestUrl, window.location.origin).toString();
  }

  const defaultOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers,
  };

  console.log("[secureFetch] Requesting:", requestUrl, defaultOptions);
  let response;
  try {
    response = await fetch(requestUrl, defaultOptions);
  } catch (err: any) {
    console.warn("[secureFetch] Network error for URL:", requestUrl, "-", err.message);
    throw err;
  }

  // If unauthorized, attempt to refresh the token
  if (response.status === 403 || response.status === 401) {
    const refreshRes = await fetch(
      `/api/proxy/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": getCsrfToken() || "",
        },
      },
    );

    if (refreshRes.ok) {
      // Retry the original request
      response = await fetch(requestUrl, defaultOptions);
    }
  }

  return response;
}

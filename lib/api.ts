export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { body?: unknown } = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  }

  const { body, ...fetchOptions } = options
  const requestBody: BodyInit | null | undefined = isFormData
    ? (body as FormData)
    : body
      ? JSON.stringify(body as unknown as Record<string, unknown>)
      : undefined

  const response = await fetch(`/api${endpoint}`, {
    ...fetchOptions,
    headers: headers as HeadersInit,
    body: requestBody,
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || error.message || "Request failed")
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: data as BodyInit | null | undefined,
      ...options,
    }),
  put: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: data as BodyInit | null | undefined,
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE", body: undefined }),
}

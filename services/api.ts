export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
    },
  })

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    throw new ApiError(401, "Unauthorized")
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new ApiError(response.status, data.message || "Request failed")
  }

  return response
}

async function parseResponse(response: Response) {
  const text = await response.text().catch(() => "")
  if (!text) return null
  try {
    const json = JSON.parse(text)
    if (json && typeof json === "object" && "data" in json) return json.data
    return json
  } catch {
    return text
  }
}

export const api = {
  get: async (url: string) => {
    const response = await fetchWithAuth(url)
    return parseResponse(response)
  },

  post: async (url: string, body?: any) => {
    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
    return parseResponse(response)
  },

  patch: async (url: string, body?: any) => {
    const response = await fetchWithAuth(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
    return parseResponse(response)
  },

  delete: async (url: string, body?: any) => {
    const response = await fetchWithAuth(url, {
      method: "DELETE",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
    return parseResponse(response)
  },

  upload: async (url: string, formData: FormData) => {
    const response = await fetchWithAuth(url, {
      method: "POST",
      body: formData,
    })
    return parseResponse(response)
  },

  download: async (url: string) => {
    const response = await fetchWithAuth(url)
    return response
  },
}

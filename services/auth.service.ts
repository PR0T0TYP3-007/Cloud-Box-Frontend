import { api } from "./api"

export interface AuthUser {
  id: string
  email: string
  createdAt: string
  storage?: { used: number; quota: number }
}

export const authService = {
  async getMe(): Promise<AuthUser | null> {
    try {
      return await api.get("/auth/me")
    } catch (err) {
      return null
    }
  },

  async signIn(email: string, password: string) {
    const data = await api.post("/auth/signin", { email, password })
    if (data?.token) {
      localStorage.setItem("token", data.token)
    }
    return data
  },

  async signUp(email: string, password: string) {
    const data = await api.post("/auth/signup", { email, password })
    if (data?.token) {
      localStorage.setItem("token", data.token)
    }
    return data
  },

  async signOut() {
    try {
      await api.post("/auth/signout")
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return await api.post("/auth/change-password", { currentPassword, newPassword })
  },

  async deleteAccount(password: string) {
    return await api.delete("/auth/account", { password })
  },
}

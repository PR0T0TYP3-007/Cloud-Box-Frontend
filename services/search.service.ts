import { api } from './api'

export const searchService = {
  async search(q: string) {
    const query = `?q=${encodeURIComponent(q)}`
    return api.get(`/search${query}`)
  },
}

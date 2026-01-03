import { api } from "./api"

export interface Folder {
  id: string
  name: string
  parentId?: string | null
  userId?: string
  createdAt?: string
  updatedAt?: string
  size?: number
}

export interface File {
  id: string
  name: string
  folderId?: string | null
  userId?: string
  storagePath?: string
  size: number
  currentVersion: number
  createdAt?: string
  updatedAt?: string
}

export interface FolderContents {
  parentName: string | null
  folder: Folder | null
  folders: Folder[]
  files: File[]
  storage?: { used: number; quota: number }
}

export const foldersService = {
  async getContents(folderId?: string): Promise<FolderContents> {
    const query = folderId ? `?folderId=${folderId}` : ""
    return api.get(`/folders${query}`)
  },

  async createFolder(name: string, parentId?: string) {
    const body: any = { name }
    if (parentId) body.parentId = parentId
    return api.post("/folders", body)
  },

  async renameFolder(id: string, name: string) {
    return api.patch(`/folders/${id}/rename`, { name })
  },

  async moveFolder(id: string, targetFolderId?: string) {
    return api.post(`/folders/${id}/move`, { targetFolderId })
  },

  async getAncestors(id: string) {
    return api.get(`/folders/${id}/ancestors`)
  },

  async deleteFolder(id: string, recursive = false) {
    return api.delete(`/folders/${id}?recursive=${recursive}`)
  },

  async restoreFolder(id: string) {
    return api.post(`/folders/${id}/restore`)
  },
}

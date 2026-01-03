"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { api } from "@/services/api"
import { filesService } from "@/services/files.service"
import { foldersService } from "@/services/folders.service"

export default function TrashPage() {
  const [loading, setLoading] = useState(true)
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([])
  const [files, setFiles] = useState<Array<{ id: string; name: string; size: number }>>([])

  useEffect(() => {
    loadTrash()
  }, [])

  const loadTrash = async () => {
    try {
      setLoading(true)
      const data = await api.get('/trash')
      if (data && data.folders) setFolders(data.folders)
      if (data && data.files) setFiles(data.files)
    } catch (err) {
      console.error('Failed to load trash:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Trash</h1>
        <p className="text-muted-foreground mt-1">Items in trash will be permanently deleted after 30 days</p>
      </div>

      <div className="border rounded-lg bg-card p-6">
        {folders.length === 0 && files.length === 0 ? (
          <div className="max-w-md mx-auto space-y-4 text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-2">Trash is empty</h3>
              <p className="text-sm text-muted-foreground">Deleted items will appear here and can be restored within 30 days</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {folders.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Folders</h3>
                <ul className="space-y-2">
                  {folders.map((f) => (
                    <li key={f.id} className="p-2 border rounded flex items-center justify-between">
                      <span>{f.name}</span>
                      <div className="flex gap-2">
                        <button
                          className="text-sm text-primary hover:underline"
                          onClick={async () => {
                            try {
                              await foldersService.restoreFolder(f.id)
                              await loadTrash()
                            } catch (err) {
                              console.error('Failed to restore folder', err)
                            }
                          }}
                        >
                          Restore
                        </button>
                        <button
                          className="text-sm text-destructive hover:underline"
                          onClick={async () => {
                            if (confirm(`Permanently delete "${f.name}"? This cannot be undone.`)) {
                              try {
                                await foldersService.permanentlyDeleteFolder(f.id)
                                await loadTrash()
                              } catch (err) {
                                console.error('Failed to permanently delete folder', err)
                              }
                            }
                          }}
                        >
                          Delete Forever
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {files.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Files</h3>
                <ul className="space-y-2">
                  {files.map((fi) => (
                    <li key={fi.id} className="p-2 border rounded flex items-center justify-between">
                      <span>{fi.name}</span>
                      <div className="flex gap-2">
                        <button
                          className="text-sm text-primary hover:underline"
                          onClick={async () => {
                            try {
                              await filesService.restoreFile(fi.id)
                              await loadTrash()
                            } catch (err) {
                              console.error('Failed to restore file', err)
                            }
                          }}
                        >
                          Restore
                        </button>
                        <button
                          className="text-sm text-destructive hover:underline"
                          onClick={async () => {
                            if (confirm(`Permanently delete "${fi.name}"? This cannot be undone.`)) {
                              try {
                                await filesService.permanentlyDeleteFile(fi.id)
                                await loadTrash()
                              } catch (err) {
                                console.error('Failed to permanently delete file', err)
                              }
                            }
                          }}
                        >
                          Delete Forever
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

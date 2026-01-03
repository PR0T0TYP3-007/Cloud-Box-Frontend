"use client"

import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs"
import { useToast } from "@/hooks/use-toast"
import { foldersService, type Folder } from "@/services/folders.service"
import { filesService } from "@/services/files.service"
import { batchService } from "@/services/batch.service"
import { Loader2, ChevronLeft, Folder as FolderIcon } from "lucide-react"

interface MoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string | null
  itemType: "folder" | "file" | null
  currentFolderId?: string | null
  onSuccess?: () => void
  batchItems?: Array<{ id: string; type: 'file' | 'folder' }>
}

export function MoveDialog({ open, onOpenChange, itemId, itemType, currentFolderId = null, onSuccess, batchItems }: MoveDialogProps) {
  const [folderId, setFolderId] = useState<string | null>(currentFolderId || null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false)
  const [stack, setStack] = useState<Folder[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [moving, setMoving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) load(folderId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, folderId])
  const buildBreadcrumbs = async (startId: string | null) => {
    if (!startId) {
      setBreadcrumbs([])
      return
    }

    try {
      // Prefer backend-provided ancestors endpoint to fetch full chain in one call
      const res = await foldersService.getAncestors(startId)
      if (Array.isArray(res)) {
        const crumbs = res.map((r: any) => ({ id: r.id, name: r.name, href: `/app/folder/${r.id}` }))
        setBreadcrumbs(crumbs)
        return
      }
    } catch (err) {
      console.warn('Ancestors endpoint failed, falling back to iterative fetch', err)
    }

    // Fallback: iterative lookup
    const crumbs: BreadcrumbItem[] = []
    let cur: string | null = startId
    try {
      while (cur) {
        const res2 = await foldersService.getContents(cur)
        if (!res2 || !res2.folder) break
        crumbs.unshift({ id: res2.folder.id, name: res2.folder.name, href: `/app/folder/${res2.folder.id}` })
        cur = res2.folder.parentId || null
      }
      setBreadcrumbs(crumbs)
    } catch (err) {
      console.error('Failed to build breadcrumbs:', err)
    }
  }

  const load = async (id: string | null) => {
    try {
      setLoading(true)
      const data = await foldersService.getContents(id || undefined)
      setFolders(data.folders || [])
      if (id) {
        await buildBreadcrumbs(id)
      } else {
        setBreadcrumbs([])
      }
    } catch (err) {
      console.error("Failed to load folders:", err)
    } finally {
      setLoading(false)
    }
  }

  const enterFolder = (folder: Folder) => {
    setStack((s) => [...s, folder])
    setFolderId(folder.id)
    setBreadcrumbs((b) => [...b, { id: folder.id, name: folder.name, href: `/app/folder/${folder.id}` }])
  }

  const goBack = () => {
    const next = [...stack]
    const last = next.pop()
    setStack(next)
    setFolderId(last?.id || null)
    setBreadcrumbs((b) => b.slice(0, Math.max(0, b.length - 1)))
  }

  const handleConfirm = async () => {
    if (batchItems && batchItems.length > 0) {
      // Batch move
      try {
        setMoving(true)
        const result = await batchService.batchMove(batchItems, folderId || null)
        onOpenChange(false)
        onSuccess && onSuccess()
        toast({ 
          title: "Batch move completed", 
          description: `${result.successes.length} moved, ${result.errors.length} failed` 
        })
      } catch (err) {
        console.error("Batch move failed:", err)
        toast({ title: "Move failed", variant: "destructive" })
      } finally {
        setMoving(false)
      }
    } else if (itemId && itemType) {
      // Single item move
      try {
        setMoving(true)
        if (itemType === "folder") {
          await foldersService.moveFolder(itemId, folderId || undefined)
        } else {
          await filesService.moveFile(itemId, folderId || undefined)
        }
        onOpenChange(false)
        onSuccess && onSuccess()
        toast({ title: "Moved", description: "Item moved successfully" })
      } catch (err) {
        console.error("Move failed:", err)
        toast({ title: "Move failed", variant: "destructive" })
      } finally {
        setMoving(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={goBack} disabled={stack.length === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <DialogTitle>Choose destination folder</DialogTitle>
              </div>
              <div className="mt-2">
                <Breadcrumbs items={breadcrumbs} />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setFolderId(null); setStack([]) }}>
              Root
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {folders.length === 0 ? (
                <div className="text-sm text-muted-foreground">No folders here</div>
              ) : (
                <div className="grid gap-2">
                  {folders.map((f) => (
                    <div key={f.id} className="flex items-center justify-between border rounded p-2">
                      <div className="flex items-center gap-2">
                        <FolderIcon className="h-4 w-4 text-primary" />
                        <div>{f.name}</div>
                      </div>
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => enterFolder(f)}>
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={moving}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={moving}>
            {moving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

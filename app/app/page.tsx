"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { searchService } from "@/services/search.service"
import { FileTable } from "@/components/file-table"
import { ShareDialog } from "@/components/share-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderPlus, Upload, Loader2 } from "lucide-react"
import { foldersService, type FolderContents, type Folder, type File } from "@/services/folders.service"
import { filesService } from "@/services/files.service"
import { useToast } from "@/hooks/use-toast"

export default function DriveHomePage() {
  const searchParams = useSearchParams()
  const q = searchParams?.get('search') ?? null
  const [contents, setContents] = useState<FolderContents | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Create folder dialog
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [creatingFolder, setCreatingFolder] = useState(false)

  // Rename dialog
  const [showRename, setShowRename] = useState(false)
  const [renameItem, setRenameItem] = useState<{ item: Folder | File; type: "folder" | "file" } | null>(null)
  const [newName, setNewName] = useState("")

  // Share dialog
  const [showShare, setShowShare] = useState(false)
  const [shareItem, setShareItem] = useState<{ item: Folder | File; type: "folder" | "file" } | null>(null)
  const { toast } = useToast()

  const loadContents = async () => {
    try {
      setLoading(true)
      if (q) {
        const data = await searchService.search(q)
        // adapt to FolderContents shape
        setContents({ parentName: null, folder: null, folders: data.folders || [], files: data.files || [] })
      } else {
        const data = await foldersService.getContents()
        setContents(data)
      }
    } catch (error) {
      console.error("Failed to load contents:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContents()
    // reload when search query changes
  }, [q])

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return

    try {
      setCreatingFolder(true)
      // For root folder (no parent), pass null. For subfolders, pass folder ID as parentId
      const currentFolder = contents?.folder
      const parentId = currentFolder && currentFolder.parentId !== null ? currentFolder.id : null
      await foldersService.createFolder(folderName, parentId)
      setShowCreateFolder(false)
      setFolderName("")
      loadContents()
    } catch (error) {
      console.error("Failed to create folder:", error)
      toast({ title: 'Error', description: 'Failed to create folder' })
    } finally {
      setCreatingFolder(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      // For root folder (no parent), pass null. For subfolders, pass folder ID
      const currentFolder = contents?.folder
      const currentFolderId = currentFolder && currentFolder.parentId !== null ? currentFolder.id : null
      await Promise.all(Array.from(files).map((file) => filesService.uploadFile(file, currentFolderId)))
      loadContents()
      toast({ title: 'Uploaded', description: 'Files uploaded successfully' })
    } catch (error) {
      console.error("Failed to upload files:", error)
      toast({ title: 'Upload failed', description: String((error as any)?.message || 'Failed to upload files') })
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleDirectoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      const fileList = Array.from(files)
      const paths = fileList.map((f: any) => f.webkitRelativePath || f.name)
      // For root folder (no parent), pass null. For subfolders, pass folder ID
      const currentFolder = contents?.folder
      const currentFolderId = currentFolder && currentFolder.parentId !== null ? currentFolder.id : null
      await filesService.uploadMultiple(fileList, paths, currentFolderId)
      loadContents()
      toast({ title: 'Uploaded', description: 'Folder uploaded successfully' })
    } catch (error) {
      console.error("Failed to upload directory:", error)
      toast({ title: 'Upload failed', description: String((error as any)?.message || 'Failed to upload folder') })
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleRename = async () => {
    if (!renameItem || !newName.trim()) return

    try {
      if (renameItem.type === "folder") {
        await foldersService.renameFolder(renameItem.item.id, newName)
      } else {
        await filesService.renameFile(renameItem.item.id, newName)
      }
      setShowRename(false)
      setRenameItem(null)
      setNewName("")
      loadContents()
      toast({ title: 'Renamed', description: 'Item renamed successfully' })
    } catch (error) {
      console.error("Failed to rename:", error)
      toast({ title: 'Rename failed', description: String((error as any)?.message || 'Failed to rename item') })
    }
  }

  const openRenameDialog = (item: Folder | File, type: "folder" | "file") => {
    setRenameItem({ item, type })
    setNewName(item.name)
    setShowRename(true)
  }

  const openShareDialog = (item: Folder | File, type: "folder" | "file") => {
    setShareItem({ item, type })
    setShowShare(true)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Drive</h1>
          <p className="text-muted-foreground mt-1">Access all your files and folders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateFolder(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button disabled={uploading} onClick={() => document.getElementById("file-upload")?.click()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload Files
          </Button>
          <Button disabled={uploading} onClick={() => document.getElementById("dir-upload")?.click()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload Folder
          </Button>
          <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} />
          <input id="dir-upload" type="file" multiple className="hidden" onChange={handleDirectoryUpload} //@ts-ignore webkitdirectory is non-standard
            {...{ webkitdirectory: 'true' }} />
        </div>
      </div>

      {contents && (
        <FileTable
          folders={contents.folders}
          files={contents.files}
          onRefresh={loadContents}
          onRename={openRenameDialog}
          onShare={openShareDialog}
        />
      )}

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for your new folder</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="My Documents"
              className="mt-2"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)} disabled={creatingFolder}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={creatingFolder || !folderName.trim()}>
              {creatingFolder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRename} onOpenChange={setShowRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameItem?.type === "folder" ? "Folder" : "File"}</DialogTitle>
            <DialogDescription>Enter a new name</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-name">New Name</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-2"
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRename(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <ShareDialog open={showShare} onOpenChange={setShowShare} item={shareItem} onSuccess={loadContents} />
    </div>
  )
}


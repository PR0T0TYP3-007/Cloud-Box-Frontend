"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Folder,
  File,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Share2,
  FileText,
  ImageIcon,
  FileArchive,
  FileCode,
  Music,
  Video,
  Eye,
  FolderArchive,
  Loader2,
} from "lucide-react"
import type { Folder as FolderType, File as FileType } from "@/services/folders.service"
import { filesService } from "@/services/files.service"
import { foldersService } from "@/services/folders.service"
import { batchService } from "@/services/batch.service"
import { previewService } from "@/services/preview.service"
import { useToast } from "@/hooks/use-toast"
import { MoveDialog } from "@/components/move-dialog"
import { formatBytes, formatDate } from "@/utils/format"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/services/api"
import Image from "next/image"

interface FileTableProps {
  folders: FolderType[]
  files: FileType[]
  onRefresh: () => void
  onRename: (item: FolderType | FileType, type: "folder" | "file") => void
  onShare: (item: FolderType | FileType, type: "folder" | "file") => void
}

export function FileTable({ folders = [], files = [], onRefresh, onRename, onShare }: FileTableProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { toast } = useToast()
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveItem, setMoveItem] = useState<{ id: string; type: "folder" | "file" } | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [previewFile, setPreviewFile] = useState<FileType | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext || "")) return ImageIcon
    if (["mp4", "mov", "avi", "mkv"].includes(ext || "")) return Video
    if (["mp3", "wav", "ogg"].includes(ext || "")) return Music
    if (["zip", "tar", "gz", "rar"].includes(ext || "")) return FileArchive
    if (["js", "jsx", "ts", "tsx", "py", "java", "cpp"].includes(ext || "")) return FileCode
    if (["txt", "md", "doc", "docx", "pdf"].includes(ext || "")) return FileText
    return File
  }

  const handleDownload = async (file: FileType) => {
    try {
      setLoadingId(file.id)
      const blob = await filesService.downloadFile(file.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (item: FolderType | FileType, type: "folder" | "file") => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return

    try {
      setLoadingId(item.id)
      if (type === "folder") {
        await foldersService.deleteFolder(item.id, true)
      } else {
        await filesService.deleteFile(item.id)
      }
      onRefresh()
      toast({ title: "Deleted", description: `${item.name} deleted` })
    } catch (error) {
      console.error("Delete failed:", error)
      toast({ title: "Delete failed", description: String((error as any)?.message || 'Could not delete item') })
    } finally {
      setLoadingId(null)
    }
  }

  const handleFolderClick = (folder: FolderType) => {
    router.push(`/app/folder/${folder.id}`)
  }

  const handleDownloadFolder = async (folder: FolderType) => {
    try {
      setLoadingId(folder.id)
      const response = await fetch(`${API_BASE_URL}/folders/${folder.id}/download`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${folder.name}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({ title: "Downloaded", description: `${folder.name}.zip downloaded` })
    } catch (error) {
      console.error("Folder download failed:", error)
      toast({ title: "Download failed", variant: "destructive" })
    } finally {
      setLoadingId(null)
    }
  }

  const toggleSelection = (id: string, type: 'file' | 'folder') => {
    const key = `${type}:${id}`
    const newSelection = new Set(selectedItems)
    if (newSelection.has(key)) {
      newSelection.delete(key)
    } else {
      newSelection.add(key)
    }
    setSelectedItems(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedItems.size > 0) {
      setSelectedItems(new Set())
    } else {
      const all = new Set<string>()
      folders.forEach(f => all.add(`folder:${f.id}`))
      files.forEach(f => all.add(`file:${f.id}`))
      setSelectedItems(all)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedItems.size === 0) return
    if (!confirm(`Delete ${selectedItems.size} items?`)) return

    setBatchLoading(true)
    try {
      const items = Array.from(selectedItems).map(key => {
        const [type, id] = key.split(':')
        return { id, type: type as 'file' | 'folder' }
      })
      
      const result = await batchService.batchDelete(items)
      
      setSelectedItems(new Set())
      onRefresh()
      toast({ 
        title: "Batch delete completed", 
        description: `${result.successes.length} deleted, ${result.errors.length} failed` 
      })
    } catch (error) {
      toast({ title: "Batch delete failed", variant: "destructive" })
    } finally {
      setBatchLoading(false)
    }
  }

  const handleBatchMove = () => {
    if (selectedItems.size === 0) return
    setMoveItem({ id: 'batch', type: 'file' })
    setMoveOpen(true)
  }

  const handlePreview = (file: FileType) => {
    if (!previewService.canPreview(file.name)) {
      toast({ title: "Preview not available", description: "This file type cannot be previewed" })
      return
    }
    setPreviewFile(file)
    setPreviewOpen(true)
  }

  const isImage = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop() || ''
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
  }

  const getBatchItems = () => {
    return Array.from(selectedItems).map(key => {
      const [type, id] = key.split(':')
      return { id, type: type as 'file' | 'folder' }
    })
  }

  return (
    <div className="space-y-2">
      {/* Batch Actions Toolbar */}
      {selectedItems.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedItems.size} selected</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleBatchMove}
            disabled={batchLoading}
          >
            <Folder className="h-4 w-4 mr-2" />
            Move
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleBatchDelete}
            disabled={batchLoading}
          >
            {batchLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setSelectedItems(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedItems.size > 0 && selectedItems.size === folders.length + files.length}
                  onCheckedChange={toggleAllSelection}
                />
              </TableHead>
              <TableHead className="w-[50%]">Name</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {folders.length === 0 && files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No files or folders yet. Upload something to get started!
                </TableCell>
              </TableRow>
            ) : (
              <>
                {folders.map((folder) => (
                  <TableRow
                    key={folder.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.has(`folder:${folder.id}`)}
                        onCheckedChange={() => toggleSelection(folder.id, 'folder')}
                      />
                    </TableCell>
                    <TableCell className="font-medium" onDoubleClick={() => handleFolderClick(folder)}>
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5 text-primary" />
                        {folder.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{folder.updatedAt || folder.createdAt ? formatDate((folder.updatedAt || folder.createdAt) as string) : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{typeof folder.size === "number" ? formatBytes(folder.size) : "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loadingId === folder.id}>
                            {loadingId === folder.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleFolderClick(folder)}>
                            <Folder className="mr-2 h-4 w-4" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadFolder(folder)}>
                            <FolderArchive className="mr-2 h-4 w-4" />
                            Download as ZIP
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setMoveItem({ id: folder.id, type: 'folder' }); setMoveOpen(true) }}>
                            <Folder className="mr-2 h-4 w-4" />
                            Move
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRename(folder, "folder")}>
                            <Edit className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onShare(folder, "folder")}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(folder, "folder")} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {files.map((file) => {
                  const FileIcon = getFileIcon(file.name)
                  const canPreview = previewService.canPreview(file.name)
                  const showThumbnail = isImage(file.name)
                  
                  return (
                    <TableRow key={file.id} className="hover:bg-muted/50">
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedItems.has(`file:${file.id}`)}
                          onCheckedChange={() => toggleSelection(file.id, 'file')}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {showThumbnail ? (
                            <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                              <Image
                                src={previewService.getThumbnailUrl(file.id)}
                                alt={file.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                          {file.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{file.updatedAt ? formatDate(file.updatedAt) : "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatBytes(file.size)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loadingId === file.id}>
                              {loadingId === file.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canPreview && (
                              <DropdownMenuItem onClick={() => handlePreview(file)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownload(file)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setMoveItem({ id: file.id, type: 'file' }); setMoveOpen(true) }}>
                              <Folder className="mr-2 h-4 w-4" />
                              Move
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onRename(file, "file")}>
                              <Edit className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onShare(file, "file")}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(file, "file")} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Move Dialog */}
      <MoveDialog
        open={moveOpen}
        onOpenChange={(open) => {
          setMoveOpen(open)
          if (!open) setMoveItem(null)
        }}
        itemId={moveItem?.id || null}
        itemType={moveItem?.type || null}
        batchItems={moveItem?.id === 'batch' ? getBatchItems() : undefined}
        onSuccess={() => {
          setMoveOpen(false)
          setMoveItem(null)
          setSelectedItems(new Set())
          onRefresh()
          toast({ title: 'Moved', description: 'Item moved successfully' })
        }}
      />

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            {previewFile && isImage(previewFile.name) && (
              <img
                src={previewService.getPreviewUrl(previewFile.id)}
                alt={previewFile.name}
                className="w-full h-auto"
              />
            )}
            {previewFile && !isImage(previewFile.name) && (
              <iframe
                src={previewService.getPreviewUrl(previewFile.id)}
                className="w-full h-[600px] border-0"
                title={previewFile.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

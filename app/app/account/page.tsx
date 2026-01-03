"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HardDrive, User, LogOut, Loader2, AlertTriangle } from "lucide-react"
import { authService, type AuthUser } from "@/services/auth.service"
import { formatBytes, formatDate } from "@/utils/format"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function AccountPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Change Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Delete Account form
  const [deletePassword, setDeletePassword] = useState("")
  const [confirmDelete, setConfirmDelete] = useState("")

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      setLoading(true)
      const userData = await authService.getMe()
      setUser(userData)
    } catch (error) {
      console.error("Failed to load user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" })
      return
    }

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }

    setChangingPassword(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      toast({ title: "Success", description: "Password changed successfully" })
      setChangePasswordOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({ title: "Error", description: "Password is required", variant: "destructive" })
      return
    }

    if (confirmDelete !== "DELETE") {
      toast({ title: "Error", description: 'Please type "DELETE" to confirm', variant: "destructive" })
      return
    }

    setDeletingAccount(true)
    try {
      await authService.deleteAccount(deletePassword)
      toast({ title: "Success", description: "Account deleted successfully" })
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login")
      }, 1000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete account",
        variant: "destructive",
      })
      setDeletingAccount(false)
    }
  }

  const usedBytes = user?.storage?.used ?? 0
  const quotaBytes = user?.storage?.quota ?? 5 * 1024 * 1024 * 1024
  const percentUsed = quotaBytes ? Math.min(100, (usedBytes / quotaBytes) * 100) : 0
  const remainingBytes = Math.max(0, quotaBytes - usedBytes)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and storage</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your CloudBox account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1 font-medium">{user?.email}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Member since</label>
              <p className="mt-1 font-medium">{user?.createdAt ? formatDate(user.createdAt) : "Unknown"}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account ID</label>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{user?.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>Your current storage allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="font-medium">{formatBytes(usedBytes)}</span>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{percentUsed.toFixed(1)}% used</span>
                <span>{formatBytes(quotaBytes)} total</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">{formatBytes(remainingBytes)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Each account includes up to 5 GB of storage. Delete files or versions to free space.
              </p>
            </div>

            <Button variant="outline" className="w-full mt-4 bg-transparent" disabled>
              Request More Storage
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account and sign out</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={() => setChangePasswordOpen(true)}
          >
            Change Password
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
            onClick={() => setDeleteAccountOpen(true)}
          >
            Delete Account
          </Button>
          <Separator />
          <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => authService.signOut()}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)} disabled={changingPassword}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Permanently
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="font-semibold">This action cannot be undone. This will permanently delete:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your account and all personal information</li>
                  <li>All files and folders you've uploaded</li>
                  <li>All shared links and permissions</li>
                  <li>Your activity history</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password">Enter your password to confirm</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="confirm-delete"
                type="text"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder="Type DELETE"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAccount}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount}>
              {deletingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About CloudBox</CardTitle>
          <CardDescription>Version and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>CloudBox Version 1.0.0</p>
          <p>Built with Next.js and NestJS</p>
          <p className="pt-2 text-xs">© 2025 CloudBox. All rights reserved.</p>
        </CardContent>
      </Card>
    </div>
  )
}

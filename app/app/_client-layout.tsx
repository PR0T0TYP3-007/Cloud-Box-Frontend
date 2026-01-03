"use client"

import type React from "react"
import { Suspense } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HardDrive, Users, Trash2, Settings, Search, Upload, LogOut, User, Activity } from "lucide-react"
import { authService, type AuthUser } from "@/services/auth.service"
import { formatBytes } from "@/utils/format"
import { cn } from "@/lib/utils"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getMe()
        if (!userData) {
          router.push("/login")
          return
        }
        setUser(userData)
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await authService.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const navItems = [
    { href: "/app", icon: HardDrive, label: "My Drive", exact: true },
    { href: "/app/shared", icon: Users, label: "Shared" },
    { href: "/app/activity", icon: Activity, label: "Activity" },
    { href: "/app/trash", icon: Trash2, label: "Trash" },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="flex h-16 items-center gap-4 px-4">
          <Link href="/app" className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg">CloudBox</span>
          </Link>

          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files and folders..."
                className="pl-9 bg-muted/50"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (e.target as HTMLInputElement).value.trim()
                    if (q.length === 0) return
                    router.push(`/app?search=${encodeURIComponent(q)}`)
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Account settings</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/app/account" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-card/50 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href, item.exact)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Storage Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Storage</span>
                <span className="font-medium">
                  {user?.storage ? `${formatBytes(user.storage.used)} of ${formatBytes(user.storage.quota)}` : '—'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${user?.storage ? Math.min(100, (user.storage.used / user.storage.quota) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}

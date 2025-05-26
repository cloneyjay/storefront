"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart3, User, LogOut, Settings, Menu } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ProfileModal } from "@/components/profile-modal"
import { useIsMobile } from "@/hooks/use-mobile"

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push("/")
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <BarChart3 className="h-6 w-6 text-primary shrink-0" />
            <span className="font-semibold truncate text-lg md:text-xl">
              {isMobile ? "Storefront" : "Storefront Builder"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full" 
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.user_metadata?.full_name ? (
                        getInitials(user.user_metadata.full_name)
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-[calc(100vw-2rem)] sm:w-56"
                align="end" 
                sideOffset={8}
              >
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none truncate">
                    {user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuItem onClick={() => setProfileOpen(true)} className="h-10">
                  <Settings className="mr-2 h-4 w-4 shrink-0" />
                  <span>Profile & Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} disabled={loading} className="h-10">
                  <LogOut className="mr-2 h-4 w-4 shrink-0" />
                  <span>{loading ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}

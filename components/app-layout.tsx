"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, Home, LogOut, Menu, Settings, User, Mic } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [voiceSearchOpen, setVoiceSearchOpen] = useState(false)
  const [transcript, setTranscript] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const {
    isListening,
    startListening,
    stopListening,
    transcript: speechTranscript,
    resetTranscript,
  } = useSpeechRecognition()

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/login")
  }

  const startVoiceSearch = () => {
    setVoiceSearchOpen(true)
    setIsVoiceRecording(true)
    resetTranscript()
    startListening()
  }

  const stopVoiceSearch = () => {
    setIsVoiceRecording(false)
    stopListening()
    setTranscript(speechTranscript)
  }

  const handleVoiceSearch = () => {
    setVoiceSearchOpen(false)

    if (transcript) {
      // Process voice command
      const command = transcript.toLowerCase()

      if (command.includes("dashboard") || command.includes("home")) {
        router.push("/dashboard")
      } else if (command.includes("settings")) {
        router.push("/settings")
      } else if (command.includes("list") && command.includes("create")) {
        router.push("/lists/create")
      } else if (command.includes("search")) {
        // Extract search term
        const searchTerm = command.replace("search", "").trim()
        if (searchTerm) {
          router.push(`/dashboard?search=${encodeURIComponent(searchTerm)}`)
        }
      } else {
        toast({
          title: "Voice command",
          description: `I heard: "${transcript}"`,
        })
      }
    }
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/lists/create", label: "Create List", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 ${
                          pathname === item.href ? "bg-muted font-medium" : "hover:bg-muted/50"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start gap-2 rounded-md px-3 py-2 hover:bg-muted/50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold">WordMaster</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 ${
                    pathname === item.href ? "bg-muted font-medium" : "hover:bg-muted/50"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={startVoiceSearch} className="relative">
              <Mic className="h-5 w-5" />
              <span className="sr-only">Voice Search</span>
            </Button>
            <Dialog open={voiceSearchOpen} onOpenChange={setVoiceSearchOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Voice Command</DialogTitle>
                  <DialogDescription>Speak a command like "go to dashboard" or "create list"</DialogDescription>
                </DialogHeader>
                <div className="py-6 flex flex-col items-center justify-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isVoiceRecording ? "bg-red-100 animate-pulse" : "bg-muted"
                    }`}
                  >
                    <Mic className={`h-8 w-8 ${isVoiceRecording ? "text-red-500" : ""}`} />
                  </div>
                  <p className="text-center">
                    {isVoiceRecording
                      ? "Listening..."
                      : transcript
                        ? `"${transcript}"`
                        : "Press Start to speak a command"}
                  </p>
                </div>
                <DialogFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setVoiceSearchOpen(false)}>
                    Cancel
                  </Button>
                  {isVoiceRecording ? (
                    <Button onClick={stopVoiceSearch}>Stop</Button>
                  ) : (
                    <>
                      <Button onClick={startVoiceSearch} disabled={transcript !== ""}>
                        Start
                      </Button>
                      {transcript && <Button onClick={handleVoiceSearch}>Process Command</Button>}
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="border-l pl-2 hidden md:block">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6 px-4">{children}</main>
    </div>
  )
}

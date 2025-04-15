"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, BookOpen, BarChart3 } from "lucide-react"
import AppLayout from "@/components/app-layout"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { initializeDefaultLists } from "@/lib/data-utils"

interface VocabList {
  id: string
  title: string
  description: string
  wordCount: number
  progress: number
  lastStudied?: string
  language: string
}

export default function Dashboard() {
  const [lists, setLists] = useState<VocabList[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Initialize default lists if none exist
    const storedLists = localStorage.getItem("vocabLists")
    if (!storedLists) {
      const defaultLists = initializeDefaultLists()
      localStorage.setItem("vocabLists", JSON.stringify(defaultLists))
      setLists(defaultLists)
    } else {
      setLists(JSON.parse(storedLists))
    }

    setIsLoading(false)
  }, [router])

  const filteredLists = lists.filter(
    (list) =>
      list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.language.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Vocabulary Lists</h1>
            <p className="text-muted-foreground">Manage and study your custom word collections</p>
          </div>
          <Button asChild>
            <Link href="/lists/create">
              <Plus className="mr-2 h-4 w-4" /> Create New List
            </Link>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lists by title, description or language..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredLists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No vocabulary lists found</p>
            <Button asChild>
              <Link href="/lists/create">Create your first list</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLists.map((list) => (
              <Link href={`/lists/${list.id}`} key={list.id} className="block">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{list.title}</CardTitle>
                      <Badge>{list.language}</Badge>
                    </div>
                    <CardDescription>{list.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">{list.wordCount} words</span>
                      <span className="text-sm text-muted-foreground">{list.progress}% mastered</span>
                    </div>
                    <Progress value={list.progress} className="h-2" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/learn/${list.id}`}>
                        <BookOpen className="mr-2 h-4 w-4" /> Study
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/quiz/${list.id}`}>
                        <BarChart3 className="mr-2 h-4 w-4" /> Quiz
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Edit, Plus, BarChart3 } from "lucide-react"
import AppLayout from "@/components/app-layout"
import { useToast } from "@/hooks/use-toast"
import WordList from "@/components/word-list"
import { v4 as uuidv4 } from "uuid"

interface Word {
  id: string
  term: string
  definition: string
  notes?: string
  mastered: boolean
  lastPracticed?: string
}

interface VocabList {
  id: string
  title: string
  description: string
  language: string
  wordCount: number
  progress: number
  words: Word[]
  createdAt: string
}

export default function ListDetail({ params }: { params: { id: string } }) {
  const [list, setList] = useState<VocabList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newTerm, setNewTerm] = useState("")
  const [newDefinition, setNewDefinition] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [isAddingWord, setIsAddingWord] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Load list data
    const lists = JSON.parse(localStorage.getItem("vocabLists") || "[]")
    const currentList = lists.find((l: VocabList) => l.id === params.id)

    if (!currentList) {
      toast({
        title: "List not found",
        description: "The vocabulary list you're looking for doesn't exist.",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    setList(currentList)
    setIsLoading(false)
  }, [params.id, router, toast])

  const handleAddWord = () => {
    if (!newTerm || !newDefinition) {
      toast({
        title: "Missing information",
        description: "Please provide both a term and definition.",
        variant: "destructive",
      })
      return
    }

    const newWord: Word = {
      id: uuidv4(),
      term: newTerm,
      definition: newDefinition,
      notes: newNotes,
      mastered: false,
    }

    if (list) {
      const updatedList = {
        ...list,
        words: [...list.words, newWord],
        wordCount: list.wordCount + 1,
      }

      // Update in state
      setList(updatedList)

      // Update in localStorage
      const lists = JSON.parse(localStorage.getItem("vocabLists") || "[]")
      const updatedLists = lists.map((l: VocabList) => (l.id === list.id ? updatedList : l))
      localStorage.setItem("vocabLists", JSON.stringify(updatedLists))

      // Reset form
      setNewTerm("")
      setNewDefinition("")
      setNewNotes("")
      setIsAddingWord(false)

      toast({
        title: "Word added",
        description: `"${newTerm}" has been added to your list.`,
      })
    }
  }

  const handleDeleteWord = (wordId: string) => {
    if (!list) return

    const updatedWords = list.words.filter((word) => word.id !== wordId)
    const updatedList = {
      ...list,
      words: updatedWords,
      wordCount: updatedWords.length,
      progress:
        updatedWords.length > 0
          ? Math.round((updatedWords.filter((w) => w.mastered).length / updatedWords.length) * 100)
          : 0,
    }

    // Update in state
    setList(updatedList)

    // Update in localStorage
    const lists = JSON.parse(localStorage.getItem("vocabLists") || "[]")
    const updatedLists = lists.map((l: VocabList) => (l.id === list.id ? updatedList : l))
    localStorage.setItem("vocabLists", JSON.stringify(updatedLists))

    toast({
      title: "Word removed",
      description: "The word has been removed from your list.",
    })
  }

  const handleToggleMastered = (wordId: string) => {
    if (!list) return

    const updatedWords = list.words.map((word) => (word.id === wordId ? { ...word, mastered: !word.mastered } : word))

    const masteredCount = updatedWords.filter((w) => w.mastered).length
    const progress = updatedWords.length > 0 ? Math.round((masteredCount / updatedWords.length) * 100) : 0

    const updatedList = {
      ...list,
      words: updatedWords,
      progress,
    }

    // Update in state
    setList(updatedList)

    // Update in localStorage
    const lists = JSON.parse(localStorage.getItem("vocabLists") || "[]")
    const updatedLists = lists.map((l: VocabList) => (l.id === list.id ? updatedList : l))
    localStorage.setItem("vocabLists", JSON.stringify(updatedLists))
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!list) {
    return <div className="text-center py-12">List not found</div>
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{list.title}</h1>
              <Badge>{list.language}</Badge>
            </div>
            {list.description && <p className="text-muted-foreground mt-1">{list.description}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/learn/${list.id}`}>
                <BookOpen className="mr-2 h-4 w-4" /> Study
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/quiz/${list.id}`}>
                <BarChart3 className="mr-2 h-4 w-4" /> Quiz
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/lists/${list.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit List
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>
              {list.wordCount} words, {list.progress}% mastered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={list.progress} className="h-2" />
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Words</h2>
          <Dialog open={isAddingWord} onOpenChange={setIsAddingWord}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Word
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Word</DialogTitle>
                <DialogDescription>Add a new word or phrase to your vocabulary list.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="term">Term</Label>
                  <Input
                    id="term"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder="Enter word or phrase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="definition">Definition</Label>
                  <Input
                    id="definition"
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    placeholder="Enter meaning or translation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Example usage, context, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingWord(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWord}>Add Word</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {list.words.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground mb-4">No words in this list yet</p>
            <Button onClick={() => setIsAddingWord(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add your first word
            </Button>
          </div>
        ) : (
          <WordList words={list.words} onDelete={handleDeleteWord} onToggleMastered={handleToggleMastered} />
        )}
      </div>
    </AppLayout>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Search, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SavedWords() {
  const [savedWords, setSavedWords] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Load saved words from localStorage
    const words = JSON.parse(localStorage.getItem("savedWords") || "[]")
    setSavedWords(words)
  }, [])

  const deleteWord = (word: string) => {
    const updatedWords = savedWords.filter((w) => w !== word)
    setSavedWords(updatedWords)
    localStorage.setItem("savedWords", JSON.stringify(updatedWords))

    toast({
      title: "Word removed",
      description: `"${word}" has been removed from your vocabulary list.`,
    })
  }

  const clearAllWords = () => {
    setSavedWords([])
    localStorage.setItem("savedWords", JSON.stringify([]))

    toast({
      title: "All words cleared",
      description: "Your vocabulary list has been cleared.",
    })
  }

  const filteredWords = savedWords.filter((word) => word.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Your saved vocabulary</h2>
        <p className="text-sm text-muted-foreground">Review and manage your saved words.</p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          onClick={clearAllWords}
          disabled={savedWords.length === 0}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      {filteredWords.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {savedWords.length === 0 ? "You haven't saved any words yet." : "No words match your search."}
        </div>
      ) : (
        <div className="grid gap-2">
          {filteredWords.map((word, index) => (
            <Card key={index}>
              <CardContent className="p-3 flex justify-between items-center">
                <span className="font-medium">{word}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteWord(word)} className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

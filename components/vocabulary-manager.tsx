"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VocabularyManager() {
  const [text, setText] = useState("")
  const [selectedWord, setSelectedWord] = useState("")
  const [savedWords, setSavedWords] = useState<string[]>([])
  const { toast } = useToast()

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleWordSelect = () => {
    const selection = window.getSelection()?.toString().trim()
    if (selection && selection.length > 0) {
      setSelectedWord(selection)
    }
  }

  const saveWord = () => {
    if (selectedWord && !savedWords.includes(selectedWord)) {
      setSavedWords([...savedWords, selectedWord])

      // Save to localStorage
      const existingWords = JSON.parse(localStorage.getItem("savedWords") || "[]")
      localStorage.setItem("savedWords", JSON.stringify([...existingWords, selectedWord]))

      toast({
        title: "Word saved",
        description: `"${selectedWord}" has been added to your vocabulary list.`,
      })
    }
  }

  const clearSelection = () => {
    setSelectedWord("")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Paste your text</h2>
        <p className="text-sm text-muted-foreground">
          Paste any text and select words you want to save for later review.
        </p>
      </div>

      <Textarea
        value={text}
        onChange={handleTextChange}
        onMouseUp={handleWordSelect}
        placeholder="Paste your text here..."
        className="min-h-[200px]"
      />

      {selectedWord && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Selected word:</h3>
                <p className="text-lg font-bold mt-1">{selectedWord}</p>
              </div>
              <div className="space-x-2">
                <Button onClick={saveWord} size="sm" className="flex items-center gap-1">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button onClick={clearSelection} variant="outline" size="sm" className="flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {savedWords.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Recently saved:</h3>
          <div className="flex flex-wrap gap-2">
            {savedWords.slice(-5).map((word, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1">
                {word}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

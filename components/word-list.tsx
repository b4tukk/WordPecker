"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Search, VolumeIcon as VolumeUp } from "lucide-react"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"

interface Word {
  id: string
  term: string
  definition: string
  notes?: string
  mastered: boolean
  lastPracticed?: string
}

interface WordListProps {
  words: Word[]
  onDelete: (id: string) => void
  onToggleMastered: (id: string) => void
}

export default function WordList({ words, onDelete, onToggleMastered }: WordListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingWordId, setEditingWordId] = useState<string | null>(null)
  const { speak, voices } = useSpeechSynthesis()

  const filteredWords = words.filter(
    (word) =>
      word.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (word.notes && word.notes.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const speakWord = (text: string) => {
    speak(text)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search words..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredWords.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No words match your search.</div>
      ) : (
        <div className="space-y-2">
          {filteredWords.map((word) => (
            <Card
              key={word.id}
              className={`hover:shadow-sm transition-shadow ${word.mastered ? "border-l-4 border-l-green-500" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      id={`word-${word.id}`}
                      checked={word.mastered}
                      onCheckedChange={() => onToggleMastered(word.id)}
                      className="mt-1"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`word-${word.id}`}
                          className={`font-medium text-lg ${word.mastered ? "line-through text-muted-foreground" : ""}`}
                        >
                          {word.term}
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => speakWord(word.term)}
                        >
                          <VolumeUp className="h-3 w-3" />
                          <span className="sr-only">Speak</span>
                        </Button>
                      </div>
                      <p className="text-muted-foreground">{word.definition}</p>
                      {word.notes && <p className="text-sm italic">{word.notes}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(word.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

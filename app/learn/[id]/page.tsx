"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, VolumeIcon as VolumeUp, Check, Repeat, Home } from "lucide-react"
import AppLayout from "@/components/app-layout"
import { useToast } from "@/hooks/use-toast"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"

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

export default function LearnMode({ params }: { params: { id: string } }) {
  const [list, setList] = useState<VocabList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDefinition, setShowDefinition] = useState(false)
  const [studyWords, setStudyWords] = useState<Word[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const { speak, voices } = useSpeechSynthesis()

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

    if (!currentList || currentList.words.length === 0) {
      toast({
        title: "Cannot start learning session",
        description: "This list doesn't exist or has no words to study.",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    // Prepare study session with words that need practice
    // Prioritize non-mastered words but include some mastered ones for review
    const nonMastered = currentList.words.filter((w) => !w.mastered)
    const mastered = currentList.words.filter((w) => w.mastered)

    // Include all non-mastered words and up to 30% of mastered words for review
    const masteredToReview = mastered.slice(0, Math.ceil(mastered.length * 0.3))
    const wordsToStudy = [...nonMastered, ...masteredToReview].sort(() => Math.random() - 0.5)

    setList(currentList)
    setStudyWords(wordsToStudy.length > 0 ? wordsToStudy : currentList.words)
    setIsLoading(false)
  }, [params.id, router, toast])

  const handleNext = () => {
    if (currentIndex < studyWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowDefinition(false)
    } else {
      // End of study session
      toast({
        title: "Study session complete",
        description: "You've reviewed all words in this session.",
      })
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowDefinition(false)
    }
  }

  const handleMarkMastered = () => {
    if (!list || studyWords.length === 0) return

    const wordId = studyWords[currentIndex].id
    const updatedWords = list.words.map((word) =>
      word.id === wordId ? { ...word, mastered: true, lastPracticed: new Date().toISOString() } : word,
    )

    const masteredCount = updatedWords.filter((w) => w.mastered).length
    const progress = Math.round((masteredCount / updatedWords.length) * 100)

    const updatedList = {
      ...list,
      words: updatedWords,
      progress,
    }

    // Update in localStorage
    const lists = JSON.parse(localStorage.getItem("vocabLists") || "[]")
    const updatedLists = lists.map((l: VocabList) => (l.id === list.id ? updatedList : l))
    localStorage.setItem("vocabLists", JSON.stringify(updatedLists))

    // Update in state
    setList(updatedList)

    // Update the study words array
    const updatedStudyWords = [...studyWords]
    updatedStudyWords[currentIndex] = { ...updatedStudyWords[currentIndex], mastered: true }
    setStudyWords(updatedStudyWords)

    toast({
      title: "Word mastered",
      description: `You've marked "${studyWords[currentIndex].term}" as mastered.`,
    })

    // Move to next word
    handleNext()
  }

  const handleNeedsPractice = () => {
    if (!list || studyWords.length === 0) return

    const wordId = studyWords[currentIndex].id
    const updatedWords = list.words.map((word) =>
      word.id === wordId ? { ...word, mastered: false, lastPracticed: new Date().toISOString() } : word,
    )

    const masteredCount = updatedWords.filter((w) => w.mastered).length
    const progress = Math.round((masteredCount / updatedWords.length) * 100)

    const updatedList = {
      ...list,
      words: updatedWords,
      progress,
    }

    // Update in localStorage
    const lists = JSON.parse(localStorage.getItem("vocabLists") || "[]")
    const updatedLists = lists.map((l: VocabList) => (l.id === list.id ? updatedList : l))
    localStorage.setItem("vocabLists", JSON.stringify(updatedLists))

    // Update in state
    setList(updatedList)

    // Update the study words array
    const updatedStudyWords = [...studyWords]
    updatedStudyWords[currentIndex] = { ...updatedStudyWords[currentIndex], mastered: false }
    setStudyWords(updatedStudyWords)

    // Move to next word
    handleNext()
  }

  const speakWord = () => {
    if (studyWords.length === 0) return

    const word = studyWords[currentIndex].term
    const language = list?.language || "english"

    // Find appropriate voice for the language
    let voice = voices.find((v) => v.lang.toLowerCase().includes(language.substring(0, 2)))

    // Fallback to any available voice if no match
    if (!voice && voices.length > 0) {
      voice = voices[0]
    }

    speak(word, voice)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!list || studyWords.length === 0) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No words available to study</p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </AppLayout>
    )
  }

  const currentWord = studyWords[currentIndex]
  const progress = ((currentIndex + 1) / studyWords.length) * 100

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Home className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{list.title}</h2>
            <Badge>{list.language}</Badge>
          </div>
          <Link href={`/lists/${list.id}`}>
            <Button variant="ghost" size="sm">
              View List
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Learning Session</span>
          <span>
            {currentIndex + 1} of {studyWords.length} words
          </span>
        </div>

        <Progress value={progress} className="h-2" />

        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex justify-center items-center gap-2">
              {currentWord.term}
              <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={speakWord}>
                <VolumeUp className="h-4 w-4" />
                <span className="sr-only">Speak</span>
              </Button>
            </CardTitle>
            {currentWord.notes && <CardDescription>{currentWord.notes}</CardDescription>}
          </CardHeader>
          <CardContent className="text-center">
            {showDefinition ? (
              <div className="py-8">
                <p className="text-xl">{currentWord.definition}</p>
              </div>
            ) : (
              <Button variant="outline" className="my-8" onClick={() => setShowDefinition(true)}>
                Show Definition
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
            <div className="flex gap-2">
              {showDefinition && (
                <>
                  <Button variant="outline" className="flex items-center gap-1" onClick={handleNeedsPractice}>
                    <Repeat className="h-4 w-4" /> Practice Again
                  </Button>
                  <Button className="flex items-center gap-1" onClick={handleMarkMastered}>
                    <Check className="h-4 w-4" /> I Know This
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === studyWords.length - 1}
              className="flex items-center gap-1"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  )
}

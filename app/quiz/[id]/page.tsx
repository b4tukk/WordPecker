"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Home, ArrowRight, Check, X } from "lucide-react"
import AppLayout from "@/components/app-layout"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"

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

interface QuizQuestion {
  questionWord: Word
  options: string[]
  correctAnswer: string
  type: "term" | "definition"
}

export default function QuizMode({ params }: { params: { id: string } }) {
  const [list, setList] = useState<VocabList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
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

    if (!currentList || currentList.words.length < 4) {
      toast({
        title: "Cannot start quiz",
        description: "This list doesn't exist or doesn't have enough words for a quiz (minimum 4 words).",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    setList(currentList)

    // Generate quiz questions
    const quizQuestions = generateQuizQuestions(currentList)
    setQuestions(quizQuestions)

    setIsLoading(false)
  }, [params.id, router, toast])

  const generateQuizQuestions = (list: VocabList): QuizQuestion[] => {
    const words = [...list.words]
    if (words.length < 4) return []

    // Shuffle words
    const shuffledWords = words.sort(() => Math.random() - 0.5)

    // Create questions (up to 10)
    const questionCount = Math.min(10, words.length)
    const questions: QuizQuestion[] = []

    for (let i = 0; i < questionCount; i++) {
      const questionWord = shuffledWords[i]

      // Randomly decide if we're testing term->definition or definition->term
      const questionType = Math.random() > 0.5 ? "term" : "definition"

      // Get 3 random incorrect options
      const incorrectOptions = shuffledWords
        .filter((w) => w.id !== questionWord.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => (questionType === "term" ? w.definition : w.term))

      // Correct answer
      const correctAnswer = questionType === "term" ? questionWord.definition : questionWord.term

      // All options (including correct one)
      const options = [...incorrectOptions, correctAnswer].sort(() => Math.random() - 0.5)

      questions.push({
        questionWord,
        options,
        correctAnswer,
        type: questionType,
      })
    }

    return questions
  }

  const handleAnswer = () => {
    if (!selectedAnswer) return

    const currentQuestion = questions[currentQuestionIndex]
    const correct = selectedAnswer === currentQuestion.correctAnswer

    setIsAnswered(true)
    setIsCorrect(correct)

    if (correct) {
      setScore(score + 1)
    }

    // Update word mastery if correct
    if (correct && list) {
      const wordId = currentQuestion.questionWord.id
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
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer("")
      setIsAnswered(false)
    } else {
      // Quiz complete
      setQuizComplete(true)

      // Show confetti for good scores
      if (score / questions.length >= 0.7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }
  }

  const restartQuiz = () => {
    if (!list) return

    const newQuestions = generateQuizQuestions(list)
    setQuestions(newQuestions)
    setCurrentQuestionIndex(0)
    setSelectedAnswer("")
    setIsAnswered(false)
    setIsCorrect(false)
    setScore(0)
    setQuizComplete(false)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!list || questions.length === 0) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Unable to generate quiz</p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </AppLayout>
    )
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100)
    let message = ""

    if (percentage >= 90) message = "Excellent! You've mastered these words!"
    else if (percentage >= 70) message = "Great job! You're making good progress!"
    else if (percentage >= 50) message = "Good effort! Keep practicing to improve."
    else message = "Keep studying! You'll get better with practice."

    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
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

          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
              <CardDescription>
                You scored {score} out of {questions.length} ({percentage}%)
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="mb-6">
                <Progress value={percentage} className="h-4" />
              </div>
              <p className="text-xl mb-4">{message}</p>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button onClick={restartQuiz}>Try Again</Button>
              <Button variant="outline" asChild>
                <Link href={`/learn/${list.id}`}>Study Mode</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
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
          <span>Quiz Mode</span>
          <span>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        <Progress value={progress} className="h-2" />

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion.type === "term" ? "What is the meaning of:" : "What is the word for:"}
            </CardTitle>
            <CardDescription className="text-2xl font-bold mt-2">
              {currentQuestion.type === "term"
                ? currentQuestion.questionWord.term
                : currentQuestion.questionWord.definition}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              className="space-y-3"
              disabled={isAnswered}
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 border p-3 rounded-md ${
                    isAnswered && option === currentQuestion.correctAnswer
                      ? "border-green-500 bg-green-50"
                      : isAnswered && option === selectedAnswer && !isCorrect
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                    {option}
                  </Label>
                  {isAnswered && option === currentQuestion.correctAnswer && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  {isAnswered && option === selectedAnswer && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm">
              Score: {score}/{currentQuestionIndex + (isAnswered ? 1 : 0)}
            </div>
            {isAnswered ? (
              <Button onClick={handleNextQuestion} className="flex items-center gap-1">
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleAnswer} disabled={!selectedAnswer}>
                Check Answer
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  )
}

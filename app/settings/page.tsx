"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import AppLayout from "@/components/app-layout"
import { useToast } from "@/hooks/use-toast"

interface Settings {
  theme: "light" | "dark" | "system"
  notifications: boolean
  soundEffects: boolean
  voiceRecognition: boolean
  dailyGoal: number
  spaceRepetition: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    theme: "system",
    notifications: true,
    soundEffects: true,
    voiceRecognition: true,
    dailyGoal: 10,
    spaceRepetition: true,
  })
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

    // Load settings
    const savedSettings = localStorage.getItem("userSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    setIsLoading(false)
  }, [router])

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const updatedSettings = { ...settings, [key]: value }
    setSettings(updatedSettings)
    localStorage.setItem("userSettings", JSON.stringify(updatedSettings))

    toast({
      title: "Settings updated",
      description: "Your preferences have been saved.",
    })
  }

  const handleResetProgress = () => {
    // This would normally have a confirmation dialog
    const lists = JSON.parse(localStorage.getItem("vocabLists") || "[]")

    const resetLists = lists.map((list: any) => ({
      ...list,
      progress: 0,
      words: list.words.map((word: any) => ({
        ...word,
        mastered: false,
        lastPracticed: null,
      })),
    }))

    localStorage.setItem("vocabLists", JSON.stringify(resetLists))

    toast({
      title: "Progress reset",
      description: "Your learning progress has been reset for all lists.",
    })
  }

  const handleClearAllData = () => {
    // This would normally have a confirmation dialog
    localStorage.removeItem("vocabLists")
    localStorage.removeItem("userSettings")

    toast({
      title: "Data cleared",
      description: "All your data has been cleared. Redirecting to dashboard...",
    })

    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Enable notifications</Label>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sound & Voice</CardTitle>
                <CardDescription>Configure audio settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-effects">Sound effects</Label>
                  <Switch
                    id="sound-effects"
                    checked={settings.soundEffects}
                    onCheckedChange={(checked) => handleSettingChange("soundEffects", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="voice-recognition">Voice recognition</Label>
                  <Switch
                    id="voice-recognition"
                    checked={settings.voiceRecognition}
                    onCheckedChange={(checked) => handleSettingChange("voiceRecognition", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
                <CardDescription>Customize your learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="daily-goal">Daily goal (words)</Label>
                    <span className="text-sm text-muted-foreground">{settings.dailyGoal} words</span>
                  </div>
                  <Slider
                    id="daily-goal"
                    min={5}
                    max={50}
                    step={5}
                    value={[settings.dailyGoal]}
                    onValueChange={(value) => handleSettingChange("dailyGoal", value[0])}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="spaced-repetition">Spaced repetition</Label>
                    <p className="text-sm text-muted-foreground">Optimize review intervals based on your performance</p>
                  </div>
                  <Switch
                    id="spaced-repetition"
                    checked={settings.spaceRepetition}
                    onCheckedChange={(checked) => handleSettingChange("spaceRepetition", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Manage your learning data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Reset Learning Progress</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    This will reset your mastery progress for all words, but keep your lists and words.
                  </p>
                  <Button variant="outline" onClick={handleResetProgress}>
                    Reset Progress
                  </Button>
                </div>
                <div className="pt-2 border-t">
                  <h3 className="font-medium mb-1 text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    This will permanently delete all your lists, words, and settings.
                  </p>
                  <Button variant="destructive" onClick={handleClearAllData}>
                    Clear All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

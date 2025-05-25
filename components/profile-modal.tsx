"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { getSupabaseClient } from "@/lib/supabase"
import { useVoiceInput } from "@/hooks/use-voice-input"
import {
  User,
  Camera,
  Upload,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Palette,
  Moon,
  Sun,
  Monitor,
  Mic,
  MicOff,
  TestTube,
} from "lucide-react"
import type { Category, Profile } from "@/types"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user } = useAuth()
  const { theme, colorScheme, setTheme, setColorScheme, actualTheme } = useTheme()
  const { toast } = useToast()
  const supabase = getSupabaseClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [fullName, setFullName] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [language, setLanguage] = useState("en")

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("income")
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6")
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  // Voice testing state
  const { transcript, isListening, startListening, stopListening, clearTranscript } = useVoiceInput()
  const [voiceTestResults, setVoiceTestResults] = useState<string[]>([])
  const [imageTestFile, setImageTestFile] = useState<File | null>(null)
  const [imageTestPreview, setImageTestPreview] = useState<string | null>(null)

  useEffect(() => {
    if (open && user) {
      fetchProfile()
      fetchCategories()
    }
  }, [open, user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) throw error

      if (data) {
        setProfile(data)
        setFullName(data.full_name || "")
        setCurrency(data.currency || "USD")
        setLanguage(data.language || "en")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    }
  }

  const fetchCategories = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("categories").select("*").eq("user_id", user.id).order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)

    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB")
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image")
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      // Update profile
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)

      if (updateError) throw updateError

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null))

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleProfileUpdate = async () => {
    if (!user) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          currency,
          language,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      fetchProfile()
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

  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return

    try {
      const { error } = await supabase.from("categories").insert({
        user_id: user.id,
        name: newCategoryName.trim(),
        type: newCategoryType,
        color: newCategoryColor,
      })

      if (error) throw error

      setNewCategoryName("")
      setNewCategoryColor("#3B82F6")
      fetchCategories()

      toast({
        title: "Success",
        description: "Category added successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId)

      if (error) throw error

      fetchCategories()

      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const testVoiceInput = () => {
    if (isListening) {
      stopListening()
    } else {
      clearTranscript()
      startListening()
    }
  }

  const saveVoiceTest = () => {
    if (transcript) {
      setVoiceTestResults((prev) => [...prev, transcript])
      clearTranscript()
      toast({
        title: "Voice Test Saved",
        description: "Voice input recorded successfully",
      })
    }
  }

  const handleImageTest = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImageTestFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageTestPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    toast({
      title: "Image Test",
      description: `Image loaded: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const colorSchemes = [
    { name: "Blue", value: "blue", color: "bg-blue-500" },
    { name: "Green", value: "green", color: "bg-green-500" },
    { name: "Purple", value: "purple", color: "bg-purple-500" },
    { name: "Orange", value: "orange", color: "bg-orange-500" },
    { name: "Red", value: "red", color: "bg-red-500" },
  ]

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile & Settings</DialogTitle>
          <DialogDescription>Customize your profile, categories, and application preferences</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {fullName ? getInitials(fullName) : <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Upload className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Change Picture
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-500">JPG, PNG up to 5MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <Separator />

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ""} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.symbol} {curr.name} ({curr.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Categories</CardTitle>
                <CardDescription>Create and manage your transaction categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Category */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Category Name</Label>
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newCategoryType}
                      onValueChange={(value: "income" | "expense") => setNewCategoryType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                        className="w-10 h-10 rounded border"
                      />
                      <Input value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Categories List */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Income Categories */}
                    <div>
                      <h4 className="font-medium text-green-600 mb-3">Income Categories</h4>
                      <div className="space-y-2">
                        {categories
                          .filter((cat) => cat.type === "income")
                          .map((category) => (
                            <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                                <span>{category.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Expense Categories */}
                    <div>
                      <h4 className="font-medium text-red-600 mb-3">Expense Categories</h4>
                      <div className="space-y-2">
                        {categories
                          .filter((cat) => cat.type === "expense")
                          .map((category) => (
                            <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                                <span>{category.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Customization
                </CardTitle>
                <CardDescription>Customize the appearance of your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Mode */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Theme Mode</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex items-center gap-2 h-16"
                    >
                      <Sun className="h-5 w-5" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex items-center gap-2 h-16"
                    >
                      <Moon className="h-5 w-5" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="flex items-center gap-2 h-16"
                    >
                      <Monitor className="h-5 w-5" />
                      System
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Color Scheme */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Color Scheme</Label>
                  <div className="grid grid-cols-5 gap-4">
                    {colorSchemes.map((scheme) => (
                      <Button
                        key={scheme.value}
                        variant={colorScheme === scheme.value ? "default" : "outline"}
                        onClick={() => setColorScheme(scheme.value as any)}
                        className="flex flex-col items-center gap-2 h-20"
                      >
                        <div className={`w-6 h-6 rounded-full ${scheme.color}`} />
                        {scheme.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Preview */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Preview</Label>
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Sample Dashboard</h4>
                      <Badge>Current Theme: {actualTheme}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm font-medium text-primary">Total Income</p>
                        <p className="text-2xl font-bold">$1,234.56</p>
                      </div>
                      <div className="p-3 bg-destructive/10 rounded-lg">
                        <p className="text-sm font-medium text-destructive">Total Expenses</p>
                        <p className="text-2xl font-bold">$567.89</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            {/* Voice Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Input Testing
                </CardTitle>
                <CardDescription>Test voice recognition functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    onClick={testVoiceInput}
                    className="flex items-center gap-2"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isListening ? "Stop Recording" : "Start Recording"}
                  </Button>
                  {transcript && (
                    <Button onClick={saveVoiceTest} variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      Save Test
                    </Button>
                  )}
                  <Button onClick={clearTranscript} variant="ghost">
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>

                {transcript && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="text-sm font-medium">Current Transcript:</Label>
                    <p className="mt-1">{transcript}</p>
                  </div>
                )}

                {voiceTestResults.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Test Results:</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {voiceTestResults.map((result, index) => (
                        <div key={index} className="p-2 bg-gray-50 border rounded text-sm">
                          {result}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Image Upload Testing
                </CardTitle>
                <CardDescription>Test image upload and processing functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("image-test-input")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Select Test Image
                  </Button>
                  <input
                    id="image-test-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageTest}
                    className="hidden"
                  />
                </div>

                {imageTestFile && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <Label className="text-sm font-medium">File Information:</Label>
                      <div className="mt-2 text-sm space-y-1">
                        <p>Name: {imageTestFile.name}</p>
                        <p>Size: {(imageTestFile.size / 1024).toFixed(1)} KB</p>
                        <p>Type: {imageTestFile.type}</p>
                      </div>
                    </div>

                    {imageTestPreview && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Preview:</Label>
                        <img
                          src={imageTestPreview || "/placeholder.svg"}
                          alt="Test upload"
                          className="max-w-xs max-h-48 object-contain border rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  System Tests
                </CardTitle>
                <CardDescription>Run comprehensive system tests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-16">
                    Test Database Connection
                  </Button>
                  <Button variant="outline" className="h-16">
                    Test File Upload
                  </Button>
                  <Button variant="outline" className="h-16">
                    Test Voice Recognition
                  </Button>
                  <Button variant="outline" className="h-16">
                    Test Theme Persistence
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

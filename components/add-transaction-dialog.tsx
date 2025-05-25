"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Mic, MicOff, Upload } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { useToast } from "@/hooks/use-toast"
import type { Category } from "@/types"

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  method: "manual" | "voice" | "photo"
  onSuccess: () => void
}

export function AddTransactionDialog({ open, onOpenChange, method, onSuccess }: AddTransactionDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const { transcript, isListening, startListening, stopListening, clearTranscript } = useVoiceInput()

  useEffect(() => {
    if (open) {
      fetchCategories()
      if (method === "voice") {
        clearTranscript()
      }
    }
  }, [open, method])

  useEffect(() => {
    if (transcript && method === "voice") {
      parseVoiceInput(transcript)
    }
  }, [transcript, method])

  const fetchCategories = async () => {
    if (!user) return

    const { data, error } = await supabase.from("categories").select("*").eq("user_id", user.id).order("name")

    if (!error && data) {
      setCategories(data)
    }
  }

  const parseVoiceInput = (text: string) => {
    // Simple parsing logic - can be enhanced with NLP
    const lowerText = text.toLowerCase()

    // Extract amount
    const amountMatch = text.match(/(\d+(?:\.\d{2})?)/g)
    if (amountMatch) {
      setAmount(amountMatch[0])
    }

    // Determine type based on keywords
    if (lowerText.includes("sold") || lowerText.includes("earned") || lowerText.includes("received")) {
      setType("income")
    } else if (lowerText.includes("bought") || lowerText.includes("paid") || lowerText.includes("spent")) {
      setType("expense")
    }

    setDescription(text)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Here you would typically process the image with OCR
      // For now, we'll just set a placeholder description
      setDescription(`Receipt uploaded: ${file.name}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !amount) return

    setLoading(true)

    try {
      let receiptUrl = null

      // Upload image if present
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("receipts").getPublicUrl(fileName)

        receiptUrl = publicUrl
      }

      // Insert transaction
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount: Number.parseFloat(amount),
        description,
        type,
        category_id: categoryId || null,
        input_method: method,
        receipt_image_url: receiptUrl,
        transaction_date: new Date().toISOString().split("T")[0],
      })

      if (error) throw error

      toast({
        title: "Transaction added!",
        description: `${type === "income" ? "Income" : "Expense"} of $${amount} has been recorded.`,
      })

      // Reset form
      setAmount("")
      setDescription("")
      setCategoryId("")
      setImageFile(null)
      clearTranscript()

      onSuccess()
      onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Add Transaction -{" "}
            {method === "manual" ? "Manual Entry" : method === "voice" ? "Voice Input" : "Photo Upload"}
          </DialogTitle>
          <DialogDescription>
            {method === "manual" && "Enter transaction details manually"}
            {method === "voice" && "Speak your transaction details"}
            {method === "photo" && "Upload a receipt photo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === "voice" && (
            <div className="space-y-2">
              <Label>Voice Input</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  onClick={isListening ? stopListening : startListening}
                  className="flex items-center gap-2"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isListening ? "Stop" : "Start"} Recording
                </Button>
              </div>
              {transcript && (
                <div className="p-2 bg-gray-100 rounded text-sm">
                  <strong>Transcript:</strong> {transcript}
                </div>
              )}
            </div>
          )}

          {method === "photo" && (
            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt Photo</Label>
              <div className="flex items-center gap-2">
                <Input id="receipt" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("receipt")?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Receipt
                </Button>
                {imageFile && <span className="text-sm text-gray-600">{imageFile.name}</span>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
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
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((cat) => cat.type === type)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount}>
              {loading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

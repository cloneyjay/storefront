"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token) {
          setStatus("error")
          setMessage("No verification token found in the URL.")
          return
        }

        // Verify the email using the token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: (type as any) || "email",
        })

        if (error) {
          console.error("Verification error:", error)
          setStatus("error")
          setMessage(error.message || "Failed to verify email. The link may be expired or invalid.")
          return
        }

        if (data.user) {
          setStatus("success")
          setMessage("Your email has been successfully verified! You can now sign in to your account.")
        } else {
          setStatus("error")
          setMessage("Verification failed. Please try again or contact support.")
        }
      } catch (error: any) {
        console.error("Confirmation error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred during verification.")
      }
    }

    confirmEmail()
  }, [searchParams])

  const handleContinue = () => {
    if (status === "success") {
      router.push("/?verified=true")
    } else {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />}
            {status === "success" && <CheckCircle className="h-12 w-12 text-green-600" />}
            {status === "error" && <XCircle className="h-12 w-12 text-red-600" />}
          </div>
          <CardTitle>
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status !== "loading" && (
            <Button onClick={handleContinue} className="w-full">
              {status === "success" ? "Continue to Sign In" : "Back to Home"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

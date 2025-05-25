"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { getBaseUrl } from "@/lib/url-utils"

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already_confirmed">("loading")
  const [message, setMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get parameters from URL
        const token = searchParams.get("token")
        const tokenHash = searchParams.get("token_hash")
        const type = searchParams.get("type") || "email"

        // Debug information
        const debug = {
          token: token ? "present" : "missing",
          tokenHash: tokenHash ? "present" : "missing",
          type,
          currentUrl: window.location.href,
          baseUrl: getBaseUrl(),
          searchParams: Object.fromEntries(searchParams.entries()),
        }
        setDebugInfo(debug)

        // Use token_hash if available, fallback to token
        const verificationToken = tokenHash || token

        if (!verificationToken) {
          setStatus("error")
          setMessage("No verification token found in the URL. Please check your email link.")
          return
        }

        console.log("Attempting verification with:", { verificationToken, type })

        // Try to verify the email
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: verificationToken,
          type: type as any,
        })

        if (error) {
          console.error("Verification error:", error)

          // Handle specific error cases
          if (error.message.includes("already been confirmed")) {
            setStatus("already_confirmed")
            setMessage("Your email has already been verified! You can sign in to your account.")
          } else if (error.message.includes("expired")) {
            setStatus("error")
            setMessage("The verification link has expired. Please request a new verification email.")
          } else {
            setStatus("error")
            setMessage(error.message || "Failed to verify email. The link may be invalid or expired.")
          }
          return
        }

        if (data.user) {
          console.log("Verification successful:", data.user)
          setStatus("success")
          setMessage("Your email has been successfully verified! You can now sign in to your account.")

          // Auto-redirect after 3 seconds
          setTimeout(() => {
            router.push("/?verified=true")
          }, 3000)
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
  }, [searchParams, router])

  const handleContinue = () => {
    if (status === "success" || status === "already_confirmed") {
      router.push("/?verified=true")
    } else {
      router.push("/")
    }
  }

  const handleResendVerification = () => {
    router.push("/?resend=true")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />}
            {status === "success" && <CheckCircle className="h-12 w-12 text-green-600" />}
            {status === "already_confirmed" && <CheckCircle className="h-12 w-12 text-blue-600" />}
            {status === "error" && <XCircle className="h-12 w-12 text-red-600" />}
          </div>
          <CardTitle>
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "already_confirmed" && "Already Verified"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status !== "loading" && (
            <div className="space-y-2">
              <Button onClick={handleContinue} className="w-full">
                {status === "success" || status === "already_confirmed" ? "Continue to Sign In" : "Back to Home"}
              </Button>

              {status === "error" && (
                <Button onClick={handleResendVerification} variant="outline" className="w-full">
                  Request New Verification Email
                </Button>
              )}
            </div>
          )}

          {/* Debug information in development */}
          {process.env.NODE_ENV === "development" && debugInfo && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

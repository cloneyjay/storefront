"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertTriangle, Copy, RefreshCw } from "lucide-react"

export default function AuthDebugPage() {
  const [config, setConfig] = useState<any>(null)
  const [testEmail, setTestEmail] = useState("test@storefrontbuilder.com")
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [currentSession, setCurrentSession] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadConfiguration()
    checkCurrentSession()
  }, [])

  const loadConfiguration = () => {
    const supabaseConfig = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
      currentUrl: window.location.origin,
      expectedConfirmUrl: `${window.location.origin}/auth/confirm`,
      userAgent: navigator.userAgent.substring(0, 50) + "...",
      timestamp: new Date().toISOString(),
    }
    setConfig(supabaseConfig)
  }

  const checkCurrentSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      setCurrentSession({
        hasSession: !!session,
        user: session?.user || null,
        error: error?.message || null,
      })
    } catch (error: any) {
      setCurrentSession({
        hasSession: false,
        user: null,
        error: error.message,
      })
    }
  }

  const addTestResult = (test: string, status: "success" | "error" | "warning", message: string, details?: any) => {
    const result = {
      id: Date.now(),
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    }
    setTestResults((prev) => [result, ...prev])
    return result
  }

  const testEmailVerification = async () => {
    setLoading(true)
    addTestResult("Email Verification", "warning", "Starting email verification test...")

    try {
      // First, check if user already exists
      const { data: existingUser } = await supabase.auth.getUser()
      if (existingUser.user?.email === testEmail) {
        addTestResult("Pre-check", "warning", "User already signed in with test email, signing out first...")
        await supabase.auth.signOut()
      }

      // Test signup with verification
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: "testpassword123",
        options: {
          data: {
            full_name: "Test User",
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (error) {
        addTestResult("Email Verification", "error", `Test failed: ${error.message}`, error)
        toast({
          title: "Test Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        addTestResult(
          "Email Verification",
          "success",
          `Verification email sent to ${testEmail}. Check your email for the verification link.`,
          {
            userId: data.user?.id,
            emailConfirmed: data.user?.email_confirmed_at,
            confirmationSentAt: data.user?.confirmation_sent_at,
          },
        )

        toast({
          title: "Test Email Sent",
          description: `Verification email sent to ${testEmail}. Check the email for the verification link.`,
        })
      }
    } catch (error: any) {
      addTestResult("Email Verification", "error", `Unexpected error: ${error.message}`, error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testDirectVerification = async () => {
    setLoading(true)
    addTestResult("Direct Verification", "warning", "Testing direct token verification...")

    try {
      // This would normally be called from the confirmation URL
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get("token")

      if (!token) {
        addTestResult(
          "Direct Verification",
          "warning",
          "No token found in URL. This test requires a verification token.",
        )
        return
      }

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      })

      if (error) {
        addTestResult("Direct Verification", "error", `Verification failed: ${error.message}`, error)
      } else {
        addTestResult("Direct Verification", "success", "Token verification successful!", data)
      }
    } catch (error: any) {
      addTestResult("Direct Verification", "error", `Unexpected error: ${error.message}`, error)
    } finally {
      setLoading(false)
    }
  }

  const testAuthFlow = async () => {
    setLoading(true)
    addTestResult("Auth Flow", "warning", "Testing complete authentication flow...")

    try {
      // Test sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: "testpassword123",
      })

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          addTestResult("Auth Flow", "warning", "Email not confirmed - this is expected for unverified accounts", error)
        } else {
          addTestResult("Auth Flow", "error", `Sign in failed: ${error.message}`, error)
        }
      } else {
        addTestResult("Auth Flow", "success", "Sign in successful!", {
          userId: data.user?.id,
          email: data.user?.email,
          emailConfirmed: data.user?.email_confirmed_at,
        })

        // Update current session
        await checkCurrentSession()
      }
    } catch (error: any) {
      addTestResult("Auth Flow", "error", `Unexpected error: ${error.message}`, error)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Configuration copied to clipboard",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Authentication Debug & Testing</h1>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Supabase Configuration
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(config, null, 2))}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Supabase URL</Label>
                <p className="text-sm text-gray-600 break-all">{config?.url || "Not configured"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Anonymous Key</Label>
                <p className="text-sm text-gray-600">{config?.anonKey || "Not configured"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Current Origin</Label>
                <p className="text-sm text-gray-600">{config?.currentUrl}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Expected Confirm URL</Label>
                <p className="text-sm text-gray-600 break-all">{config?.expectedConfirmUrl}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Session */}
        <Card>
          <CardHeader>
            <CardTitle>Current Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={currentSession?.hasSession ? "default" : "secondary"}>
                  {currentSession?.hasSession ? "Authenticated" : "Not Authenticated"}
                </Badge>
                <Button variant="outline" size="sm" onClick={checkCurrentSession}>
                  Refresh
                </Button>
              </div>
              {currentSession?.user && (
                <div className="text-sm text-gray-600">
                  <p>Email: {currentSession.user.email}</p>
                  <p>ID: {currentSession.user.id}</p>
                  <p>Email Confirmed: {currentSession.user.email_confirmed_at ? "Yes" : "No"}</p>
                </div>
              )}
              {currentSession?.error && (
                <Alert>
                  <AlertDescription>{currentSession.error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Email Verification Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={testEmailVerification} disabled={loading}>
                {loading ? "Testing..." : "1. Send Verification Email"}
              </Button>

              <Button onClick={testDirectVerification} disabled={loading} variant="outline">
                2. Test Token Verification
              </Button>

              <Button onClick={testAuthFlow} disabled={loading} variant="outline">
                3. Test Sign In Flow
              </Button>

              <Button onClick={clearResults} variant="ghost">
                Clear Results
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Testing Steps:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Click "Send Verification Email" to test email delivery</li>
                  <li>Check your email inbox for the verification link</li>
                  <li>Click the verification link (should redirect to /auth/confirm)</li>
                  <li>Return here and click "Test Sign In Flow" to verify the account works</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result) => (
                  <div key={result.id} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{result.test}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer">Show Details</summary>
                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-red-600">❌ Common Issues:</h4>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Email not received → Check spam folder, verify Supabase email settings</li>
                  <li>Verification link broken → Check Site URL in Supabase dashboard</li>
                  <li>"Email not confirmed" error → User needs to click verification link first</li>
                  <li>404 on /auth/confirm → Route not properly configured</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-green-600">✅ Expected Flow:</h4>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
                  <li>User signs up → Verification email sent</li>
                  <li>User clicks email link → Redirected to /auth/confirm</li>
                  <li>Token validated → Success message shown</li>
                  <li>User can now sign in successfully</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-blue-600">🔧 Configuration Checklist:</h4>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Supabase Site URL set to your domain</li>
                  <li>Redirect URLs include /auth/confirm</li>
                  <li>Email templates use correct confirmation URL</li>
                  <li>Environment variables properly configured</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

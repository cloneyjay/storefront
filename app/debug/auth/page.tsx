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
import { CheckCircle, XCircle, AlertTriangle, Copy, RefreshCw, ExternalLink } from "lucide-react"
import { getBaseUrl, getConfirmationUrl, isValidDomain, getEnvironmentInfo } from "@/lib/url-utils"

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
    const envInfo = getEnvironmentInfo()
    const baseUrl = getBaseUrl()
    const confirmUrl = getConfirmationUrl()

    const supabaseConfig = {
      ...envInfo,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
      isValidDomain: isValidDomain(confirmUrl),
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

  const testEnvironmentConfiguration = () => {
    addTestResult("Environment Check", "warning", "Checking environment configuration...")

    const envInfo = getEnvironmentInfo()

    // Check NEXT_PUBLIC_SITE_URL
    if (envInfo.hasNextPublicSiteUrl) {
      addTestResult(
        "NEXT_PUBLIC_SITE_URL",
        "success",
        `Environment variable set: ${envInfo.nextPublicSiteUrl}`,
        envInfo,
      )
    } else {
      addTestResult(
        "NEXT_PUBLIC_SITE_URL",
        "warning",
        "Environment variable not set, falling back to other methods",
        envInfo,
      )
    }

    // Check base URL
    if (envInfo.baseUrl.includes("localhost")) {
      addTestResult("Base URL", "warning", `Using localhost: ${envInfo.baseUrl}. Email verification won't work.`)
    } else if (envInfo.baseUrl.includes("vercel.app") || envInfo.baseUrl.includes("https://")) {
      addTestResult("Base URL", "success", `Production URL detected: ${envInfo.baseUrl}`)
    } else {
      addTestResult("Base URL", "error", `Invalid base URL: ${envInfo.baseUrl}`)
    }

    // Check confirmation URL
    if (isValidDomain(envInfo.confirmationUrl)) {
      addTestResult("Confirmation URL", "success", `Valid confirmation URL: ${envInfo.confirmationUrl}`)
    } else {
      addTestResult("Confirmation URL", "error", `Invalid confirmation URL: ${envInfo.confirmationUrl}`)
    }

    // Check environment
    if (envInfo.nodeEnv === "production") {
      addTestResult("Environment", "success", "Running in production mode")
    } else {
      addTestResult("Environment", "warning", "Running in development mode")
    }
  }

  const testEmailVerification = async () => {
    setLoading(true)
    const confirmUrl = getConfirmationUrl()

    addTestResult("Email Verification", "warning", `Starting test with confirmation URL: ${confirmUrl}`)

    try {
      // Sign out first if needed
      const { data: existingUser } = await supabase.auth.getUser()
      if (existingUser.user?.email === testEmail) {
        addTestResult("Pre-check", "warning", "Signing out existing user...")
        await supabase.auth.signOut()
      }

      // Test signup with correct URL
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: "testpassword123",
        options: {
          data: {
            full_name: "Test User",
          },
          emailRedirectTo: confirmUrl,
        },
      })

      if (error) {
        addTestResult("Email Verification", "error", `Test failed: ${error.message}`, {
          error,
          confirmUrl,
        })
      } else {
        addTestResult("Email Verification", "success", `✅ Verification email sent to ${testEmail}`, {
          userId: data.user?.id,
          emailConfirmed: data.user?.email_confirmed_at,
          confirmationSentAt: data.user?.confirmation_sent_at,
          redirectUrl: confirmUrl,
          expectedLinkFormat: `${confirmUrl}?token=TOKEN&type=email`,
        })

        toast({
          title: "✅ Test Email Sent Successfully",
          description: `Check ${testEmail} for verification link pointing to ${confirmUrl}`,
        })
      }
    } catch (error: any) {
      addTestResult("Email Verification", "error", `Unexpected error: ${error.message}`, error)
    } finally {
      setLoading(false)
    }
  }

  const testSupabaseConfiguration = async () => {
    addTestResult("Supabase Config", "warning", "Testing Supabase configuration...")

    try {
      // Test basic connection
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        addTestResult("Supabase Connection", "error", `Connection failed: ${error.message}`)
      } else {
        addTestResult("Supabase Connection", "success", "Successfully connected to Supabase")
      }

      // Check if we can access the auth settings (this will fail but gives us info)
      const baseUrl = getBaseUrl()
      addTestResult("Supabase Settings Check", "warning", `Ensure your Supabase Site URL is set to: ${baseUrl}`, {
        expectedSiteUrl: baseUrl,
        expectedRedirectUrl: getConfirmationUrl(),
        instructions: [
          "1. Go to Supabase Dashboard → Authentication → URL Configuration",
          `2. Set Site URL to: ${baseUrl}`,
          `3. Add Redirect URL: ${getConfirmationUrl()}`,
          "4. Save the configuration",
        ],
      })
    } catch (error: any) {
      addTestResult("Supabase Config", "error", `Configuration test failed: ${error.message}`)
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
          <h1 className="text-2xl font-bold">Email Verification Debug & Testing</h1>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Environment Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Environment Configuration
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(config, null, 2))}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">NEXT_PUBLIC_SITE_URL</Label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 break-all">{config?.nextPublicSiteUrl || "Not set"}</p>
                  <Badge variant={config?.hasNextPublicSiteUrl ? "default" : "destructive"}>
                    {config?.hasNextPublicSiteUrl ? "Set" : "Missing"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">VERCEL_URL</Label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 break-all">{config?.vercelUrl || "Not available"}</p>
                  <Badge variant={config?.hasVercelUrl ? "default" : "secondary"}>
                    {config?.hasVercelUrl ? "Available" : "N/A"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Resolved Base URL</Label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 break-all">{config?.baseUrl}</p>
                  {config?.baseUrl?.includes("localhost") ? (
                    <Badge variant="destructive">Local</Badge>
                  ) : (
                    <Badge variant="default">Production</Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Confirmation URL</Label>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 break-all">{config?.confirmationUrl}</p>
                  <Button variant="ghost" size="sm" onClick={() => window.open(config?.confirmationUrl, "_blank")}>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Environment</Label>
                <p className="text-sm text-gray-600">{config?.nodeEnv}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Domain Valid</Label>
                <Badge variant={config?.isValidDomain ? "default" : "destructive"}>
                  {config?.isValidDomain ? "Valid" : "Invalid"}
                </Badge>
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
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive Email Verification Tests</CardTitle>
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
              <Button onClick={testEnvironmentConfiguration} variant="outline">
                1. Test Environment
              </Button>

              <Button onClick={testSupabaseConfiguration} variant="outline">
                2. Test Supabase Config
              </Button>

              <Button onClick={testEmailVerification} disabled={loading}>
                {loading ? "Testing..." : "3. Send Verification Email"}
              </Button>

              <Button onClick={clearResults} variant="ghost">
                Clear Results
              </Button>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Complete Testing Checklist:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>✅ Environment variables configured correctly</li>
                  <li>🔧 Supabase dashboard URLs updated to match your domain</li>
                  <li>📧 Send test verification email</li>
                  <li>📱 Check email - link should point to your deployed domain</li>
                  <li>🔗 Click verification link to test complete flow</li>
                  <li>✅ Verify you can sign in after email confirmation</li>
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

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Next Steps for Email Verification Fix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical:</strong> You must update your Supabase dashboard configuration for email
                  verification to work with your deployed domain.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-medium text-blue-600">🔧 Required Supabase Configuration:</h4>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
                  <li>Go to your Supabase project dashboard</li>
                  <li>
                    Navigate to <strong>Authentication → URL Configuration</strong>
                  </li>
                  <li>
                    Set <strong>Site URL</strong> to:{" "}
                    <code className="bg-gray-100 px-1 rounded">{config?.baseUrl}</code>
                  </li>
                  <li>
                    Add <strong>Redirect URLs</strong>:{" "}
                    <code className="bg-gray-100 px-1 rounded">{config?.confirmationUrl}</code>
                  </li>
                  <li>Save the configuration and wait a few minutes for it to take effect</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-green-600">✅ After Configuration:</h4>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Run the tests above to verify everything is working</li>
                  <li>Send a test verification email</li>
                  <li>Check that the email link points to your deployed domain</li>
                  <li>Complete the verification flow end-to-end</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-red-600">❌ Common Issues:</h4>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Email links still point to localhost → Supabase Site URL not updated</li>
                  <li>404 error on verification → Redirect URL not configured</li>
                  <li>Configuration not taking effect → Wait 5-10 minutes after saving</li>
                  <li>Still getting localhost → Clear browser cache and test in incognito</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

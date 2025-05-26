"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Camera, TrendingUp, Shield, Smartphone, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AuthModals } from "@/components/auth-modals"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Check if user was redirected after email verification
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("verified") === "true") {
      setShowVerificationSuccess(true)
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const handleAuthSuccess = () => {
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="font-bold text-lg sm:text-xl text-gray-900">Storefront</span>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <Button variant="ghost" className="h-9 sm:h-10" onClick={() => setLoginOpen(true)}>
              Sign In
            </Button>
            <Button className="h-9 sm:h-10" onClick={() => setSignupOpen(true)}>
              Start Free
            </Button>
          </div>
        </nav>
      </header>

      {showVerificationSuccess && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
            <p className="text-green-800">
              <strong>Email verified successfully!</strong> You can now sign in.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowVerificationSuccess(false)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 tracking-tight">
          Track Your Business
          <span className="text-blue-600"> Finances</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
          A lightweight PWA to track income and expenses in real-time using voice and photo inputs.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6" onClick={() => setSignupOpen(true)}>
            Start Free Trial
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto text-base sm:text-lg px-6" 
            onClick={() => setLoginOpen(true)}
          >
            Sign In
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
          Powerful Features for Small Traders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <Card>
            <CardHeader>
              <Mic className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Voice Input</CardTitle>
              <CardDescription>Simply speak your transactions: "Sold 3 loaves for 150 shillings"</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our smart voice recognition automatically categorizes and records your transactions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Camera className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Photo Receipts</CardTitle>
              <CardDescription>Snap photos of receipts and let OCR extract the details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Upload receipt images and our system will automatically extract amounts and descriptions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Real-time Insights</CardTitle>
              <CardDescription>See your profit and loss instantly with visual charts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track your financial performance with beautiful charts and real-time calculations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Smartphone className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Mobile First</CardTitle>
              <CardDescription>Works perfectly on your smartphone, even offline</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Progressive Web App technology ensures smooth performance on any device.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>Your financial data is encrypted and secure</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Bank-level security ensures your business data remains private and protected.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Generate CSV and PDF reports for your records</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Export your financial data in multiple formats for accounting and tax purposes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of small traders who are already tracking their profits with ease.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-3" onClick={() => setSignupOpen(true)}>
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>&copy; 2024 Storefront Builder. All rights reserved.</p>
      </footer>

      {/* Auth Modals */}
      <AuthModals
        loginOpen={loginOpen}
        signupOpen={signupOpen}
        onLoginOpenChange={setLoginOpen}
        onSignupOpenChange={setSignupOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}

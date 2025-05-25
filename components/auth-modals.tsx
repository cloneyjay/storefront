"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client"

interface AuthModalsProps {
  loginOpen: boolean
  signupOpen: boolean
  onLoginOpenChange: (open: boolean) => void
  onSignupOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AuthModals({
  loginOpen,
  signupOpen,
  onLoginOpenChange,
  onSignupOpenChange,
  onSuccess,
}: AuthModalsProps) {
  const { toast } = useToast()

  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)

  // Signup state
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupFullName, setSignupFullName] = useState("")
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setShowVerificationMessage(false)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setShowVerificationMessage(true)
          toast({
            title: "Email not verified",
            description: "Please check your email and click the verification link before signing in.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          })
        }
        return
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })

        // Reset form
        setLoginEmail("")
        setLoginPassword("")
        setShowVerificationMessage(false)

        // Close modal and call success callback
        onLoginOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupFullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (error) throw error

      if (data.user) {
        setSignupSuccess(true)
        toast({
          title: "Account created successfully!",
          description: "Please check your email and click the verification link to activate your account.",
        })

        // Reset form
        setSignupEmail("")
        setSignupPassword("")
        setSignupFullName("")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSignupLoading(false)
    }
  }

  const switchToSignup = () => {
    onLoginOpenChange(false)
    onSignupOpenChange(true)
    setShowVerificationMessage(false)
  }

  const switchToLogin = () => {
    onSignupOpenChange(false)
    onLoginOpenChange(true)
    setSignupSuccess(false)
  }

  const handleLoginClose = (open: boolean) => {
    if (!open) {
      setLoginEmail("")
      setLoginPassword("")
      setShowVerificationMessage(false)
    }
    onLoginOpenChange(open)
  }

  const handleSignupClose = (open: boolean) => {
    if (!open) {
      setSignupEmail("")
      setSignupPassword("")
      setSignupFullName("")
      setSignupSuccess(false)
    }
    onSignupOpenChange(open)
  }

  return (
    <>
      {/* Login Modal */}
      <Dialog open={loginOpen} onOpenChange={handleLoginClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Welcome Back</DialogTitle>
            <DialogDescription>Sign in to your Storefront Builder account</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {showVerificationMessage && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Email verification required:</strong> Please check your email inbox and click the verification
                link to activate your account.
              </p>
            </div>
          )}

          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <button type="button" onClick={switchToSignup} className="text-blue-600 hover:underline">
              Sign up
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signup Modal */}
      <Dialog open={signupOpen} onOpenChange={handleSignupClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>
              {signupSuccess
                ? "Check your email to verify your account"
                : "Start tracking your business finances today"}
            </DialogDescription>
          </DialogHeader>

          {signupSuccess ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Account created successfully!</strong> We've sent a verification email to{" "}
                  <strong>{signupEmail}</strong>. Please click the link in the email to activate your account.
                </p>
              </div>
              <div className="text-center">
                <Button onClick={switchToLogin} variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Full Name</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={signupLoading}>
                  {signupLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <button type="button" onClick={switchToLogin} className="text-blue-600 hover:underline">
                  Sign in
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

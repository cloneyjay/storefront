"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export default function DebugPage() {
  const { user, loading } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    checkSession()
    if (user) {
      fetchProfile()
    }
  }, [user])

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setSession(session)
  }

  const fetchProfile = async () => {
    if (!user) return

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) {
      console.error("Profile fetch error:", error)
    } else {
      setProfile(data)
    }
  }

  const createProfile = async () => {
    if (!user) return

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata.full_name || "",
      currency: "USD",
      language: "en",
    })

    if (error) {
      console.error("Error creating profile:", error)
    } else {
      fetchProfile()
    }
  }

  const resendVerification = async () => {
    if (!user?.email) return

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    })

    if (error) {
      console.error("Error resending verification:", error)
    } else {
      alert("Verification email sent!")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Authentication Debug</h1>

        <Card>
          <CardHeader>
            <CardTitle>Loading State</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading: {loading ? "Yes" : "No"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Object</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Object</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(session, null, 2)}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
            {user && !profile && (
              <Button onClick={createProfile} className="mt-4">
                Create Profile
              </Button>
            )}
          </CardContent>
        </Card>

        {user && !user.email_confirmed_at && (
          <Card>
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">Email not verified</p>
              <Button onClick={resendVerification}>Resend Verification Email</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

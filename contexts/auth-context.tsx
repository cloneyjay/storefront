"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  // Add helper function to create user profile
  const createUserProfile = async (userId: string, email: string, fullName: string) => {
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      email,
      full_name: fullName,
      currency: "USD",
      language: "en",
    })
    if (error) {
      console.error("Error creating profile:", error)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Update the auth state change listener to handle profile creation
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      // Create profile on sign up confirmation
      if (event === "SIGNED_UP" && session?.user) {
        await createUserProfile(session.user.id, session.user.email!, session.user.user_metadata.full_name || "")
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Update the signUp function to handle profile creation
  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error

    // Create profile if user is confirmed immediately (for development)
    if (data.user && data.user.email_confirmed_at) {
      await createUserProfile(data.user.id, email, fullName)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

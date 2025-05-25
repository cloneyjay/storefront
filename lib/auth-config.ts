export const getAuthConfig = () => {
  const config = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    currentOrigin: typeof window !== "undefined" ? window.location.origin : "unknown",
    expectedConfirmUrl: typeof window !== "undefined" ? `${window.location.origin}/auth/confirm` : "unknown",
  }

  return config
}

export const validateAuthConfig = () => {
  const issues: string[] = []

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}

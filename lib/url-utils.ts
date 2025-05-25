/**
 * Get the base URL for the application
 * This ensures we use the correct domain in both development and production
 */
export function getBaseUrl(): string {
  // Priority order for determining the base URL:
  // 1. NEXT_PUBLIC_SITE_URL (manually configured)
  // 2. VERCEL_URL (automatic Vercel deployment URL)
  // 3. Window location (browser context)
  // 4. Localhost fallback (development)

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // In browser, use current origin
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // In server-side rendering, try Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback to localhost for development
  return "http://localhost:3000"
}

/**
 * Get the confirmation URL for email verification
 */
export function getConfirmationUrl(): string {
  return `${getBaseUrl()}/auth/confirm`
}

/**
 * Validate if a URL is using the correct domain
 */
export function isValidDomain(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const baseUrl = new URL(getBaseUrl())
    return urlObj.hostname === baseUrl.hostname
  } catch {
    return false
  }
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    hasNextPublicSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
    hasVercelUrl: !!process.env.VERCEL_URL,
    nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelUrl: process.env.VERCEL_URL,
    baseUrl: getBaseUrl(),
    confirmationUrl: getConfirmationUrl(),
  }
}

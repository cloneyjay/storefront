export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  currency: string
  language: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: "income" | "expense"
  color: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id?: string
  amount: number
  description?: string
  type: "income" | "expense"
  input_method: "manual" | "voice" | "photo"
  receipt_image_url?: string
  transaction_date: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  transactionCount: number
}

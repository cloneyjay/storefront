"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign, Mic, Camera } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import type { DashboardStats, Transaction } from "@/types"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { TransactionList } from "@/components/transaction-list"
import { DashboardChart } from "@/components/dashboard-chart"
import { Header } from "@/components/header"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addMethod, setAddMethod] = useState<"manual" | "voice" | "photo">("manual")

  const supabase = getSupabaseClient()

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch transactions
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Calculate stats
      const income = transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0) || 0

      const expenses =
        transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0) || 0

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        netProfit: income - expenses,
        transactionCount: transactions?.length || 0,
      })

      setRecentTransactions(transactions?.slice(0, 5) || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const handleAddTransaction = (method: "manual" | "voice" | "photo") => {
    setAddMethod(method)
    setShowAddDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Track your business finances</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleAddTransaction("manual")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Manual
            </Button>
            <Button onClick={() => handleAddTransaction("voice")} variant="outline" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice
            </Button>
            <Button onClick={() => handleAddTransaction("photo")} variant="outline" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${stats.totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${stats.netProfit.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Plus className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.transactionCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardChart />
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={recentTransactions} />
            </CardContent>
          </Card>
        </div>
      </div>

      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        method={addMethod}
        onSuccess={fetchDashboardData}
      />
    </div>
  )
}

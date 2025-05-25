"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { format, subDays } from "date-fns"

interface ChartData {
  date: string
  income: number
  expenses: number
  profit: number
}

export function DashboardChart() {
  const { user } = useAuth()
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchChartData()
  }, [user])

  const fetchChartData = async () => {
    if (!user) return

    try {
      // Get last 7 days of data
      const endDate = new Date()
      const startDate = subDays(endDate, 6)

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("transaction_date", format(startDate, "yyyy-MM-dd"))
        .lte("transaction_date", format(endDate, "yyyy-MM-dd"))

      if (error) throw error

      // Process data for chart
      const chartData: ChartData[] = []

      for (let i = 0; i < 7; i++) {
        const date = subDays(endDate, 6 - i)
        const dateStr = format(date, "yyyy-MM-dd")
        const dayTransactions = transactions?.filter((t) => t.transaction_date === dateStr) || []

        const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)

        const expenses = dayTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0)

        chartData.push({
          date: format(date, "MMM dd"),
          income,
          expenses,
          profit: income - expenses,
        })
      }

      setChartData(chartData)
    } catch (error) {
      console.error("Error fetching chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Trends</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Trends</CardTitle>
        <CardDescription>Income, expenses, and profit over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            income: {
              label: "Income",
              color: "hsl(var(--chart-1))",
            },
            expenses: {
              label: "Expenses",
              color: "hsl(var(--chart-2))",
            },
            profit: {
              label: "Profit",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

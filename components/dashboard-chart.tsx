"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { format, subDays } from "date-fns"
import { useIsMobile } from "@/hooks/use-mobile"

interface ChartData {
  date: string
  income: number
  expenses: number
  profit: number
}

const chartConfig = {
  income: {
    label: "Income",
    theme: {
      light: "hsl(var(--chart-1))",
      dark: "hsl(var(--chart-1))",
    },
  },
  expenses: {
    label: "Expenses",
    theme: {
      light: "hsl(var(--chart-2))",
      dark: "hsl(var(--chart-2))",
    },
  },
  profit: {
    label: "Profit",
    theme: {
      light: "hsl(var(--chart-3))",
      dark: "hsl(var(--chart-3))",
    },
  },
}

export function DashboardChart() {
  const { user } = useAuth()
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()
  const supabase = getSupabaseClient()
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visibleSeries, setVisibleSeries] = useState({
    income: true,
    expenses: true,
    profit: true,
  });

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

  const handleMouseMove = (state: any) => {
    if (state.isTooltipActive) {
      setActiveIndex(state.activeTooltipIndex);
    } else {
      setActiveIndex(null);
    }
  };

  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries(prev => ({
      ...prev,
      [series]: !prev[series]
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Financial Trends</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Financial Trends</CardTitle>
        <CardDescription>Income, expenses, and profit over the last 7 days</CardDescription>
        <div className="flex flex-wrap gap-3 mt-2">
          {Object.entries(visibleSeries).map(([key, isVisible]) => (
            <button
              key={key}
              onClick={() => toggleSeries(key as keyof typeof visibleSeries)}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${isVisible 
                  ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
            >
              <div className={`w-2 h-2 rounded-full bg-${key === 'income' ? 'chart-1' : key === 'expenses' ? 'chart-2' : 'chart-3'}`} />
              {chartConfig[key as keyof typeof chartConfig].label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px] w-full">
          <ChartContainer config={chartConfig}>
            <LineChart
              data={chartData}
              margin={isMobile 
                ? { top: 10, right: 10, bottom: 20, left: 0 } 
                : { top: 10, right: 10, bottom: 20, left: 10 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickMargin={isMobile ? 5 : 10}
                dy={isMobile ? 10 : 0}
              />
              <YAxis 
                fontSize={12}
                tickFormatter={formatCurrency}
                width={isMobile ? 50 : 60}
                tickMargin={isMobile ? 2 : 5}
                allowDecimals={false}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <ChartTooltipContent
                      className="bg-popover shadow-lg rounded-lg border border-border/50"
                      payload={payload.filter(p => visibleSeries[p.dataKey as keyof typeof visibleSeries])}
                      formatter={(value) => formatCurrency(Number(value))}
                      labelClassName="text-sm font-medium"
                    />
                  )
                }}
              />
              {visibleSeries.income && (
                <Line
                  type="monotone"
                  dataKey="income"
                  name="income"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  animationDuration={300}
                />
              )}
              {visibleSeries.expenses && (
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="expenses"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  animationDuration={300}
                />
              )}
              {visibleSeries.profit && (
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="profit"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  animationDuration={300}
                />
              )}
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

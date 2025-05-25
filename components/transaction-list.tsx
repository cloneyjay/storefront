"use client"

import type { Transaction } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No transactions yet</p>
        <p className="text-sm">Start by adding your first transaction</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={transaction.type === "income" ? "default" : "destructive"}>{transaction.type}</Badge>
              {transaction.input_method !== "manual" && (
                <Badge variant="outline" className="text-xs">
                  {transaction.input_method}
                </Badge>
              )}
            </div>
            <p className="font-medium">{transaction.description || "No description"}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
              {transaction.type === "income" ? "+" : "-"}${Number(transaction.amount).toFixed(2)}
            </p>
            {transaction.category && <p className="text-sm text-gray-500">{transaction.category.name}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

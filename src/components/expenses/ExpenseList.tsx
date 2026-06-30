"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { Pencil, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExpenseForm } from "./ExpenseForm"
import { CATEGORIES, CATEGORY_EMOJI, formatCurrency, formatDate, getCurrentMonth } from "@/lib/utils"
import type { ExpenseInput } from "@/lib/validations"

type Expense = {
  id: string
  amount: number
  category: string
  date: string
  description: string
}

export function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getCurrentMonth())
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/expenses?month=${month}`)
      if (!res.ok) throw new Error("Failed to load")
      setExpenses(await res.json())
    } catch {
      toast.error("Could not load expenses")
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const filtered =
    categoryFilter === "all" ? expenses : expenses.filter((e) => e.category === categoryFilter)

  async function handleAdd(data: ExpenseInput) {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      toast.error("Failed to add expense")
      return
    }
    toast.success("Expense added")
    setAddOpen(false)
    fetchExpenses()
  }

  async function handleEdit(data: ExpenseInput) {
    if (!editTarget) return
    const res = await fetch(`/api/expenses/${editTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      toast.error("Failed to update expense")
      return
    }
    toast.success("Expense updated")
    setEditTarget(null)
    fetchExpenses()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/expenses/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Expense deleted")
      setDeleteTarget(null)
      fetchExpenses()
    } catch {
      toast.error("Failed to delete expense")
    } finally {
      setDeleting(false)
    }
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return { val: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") }
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2">
          <Select value={month} onValueChange={(val) => val && setMonth(val)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(({ val, label }) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(val) => val && setCategoryFilter(val)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_EMOJI[cat]} {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setAddOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Expense
        </Button>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="space-y-2">
                    <p className="text-3xl">📭</p>
                    <p className="text-stone-500 font-medium">No expenses found</p>
                    <p className="text-stone-400 text-sm">
                      {categoryFilter !== "all"
                        ? "Try changing the category filter"
                        : "Add your first expense to get started"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-stone-600 text-sm">{formatDate(expense.date)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1 font-normal">
                      {CATEGORY_EMOJI[expense.category as keyof typeof CATEGORY_EMOJI]}{" "}
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-stone-600 text-sm max-w-xs truncate">
                    {expense.description || (
                      <span className="text-stone-400 italic">No description</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-stone-800">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-stone-400 hover:text-violet-600"
                        onClick={() => setEditTarget(expense)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-stone-400 hover:text-rose-600"
                        onClick={() => setDeleteTarget(expense)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Expense */}
      <Dialog open={addOpen} onOpenChange={(open) => setAddOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Record a new expense to your account.</DialogDescription>
          </DialogHeader>
          <ExpenseForm onSubmit={handleAdd} submitLabel="Add Expense" />
        </DialogContent>
      </Dialog>

      {/* Edit Expense */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update the details for this expense.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <ExpenseForm
              defaultValues={{
                amount: editTarget.amount,
                category: editTarget.category as ExpenseInput["category"],
                date: format(new Date(editTarget.date), "yyyy-MM-dd"),
                description: editTarget.description,
              }}
              onSubmit={handleEdit}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              This cannot be undone. Are you sure you want to delete this expense?
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="py-1 text-sm text-stone-600 space-y-1">
              <p>
                <span className="font-medium">Amount:</span>{" "}
                {formatCurrency(deleteTarget.amount)}
              </p>
              <p>
                <span className="font-medium">Category:</span> {deleteTarget.category}
              </p>
              <p>
                <span className="font-medium">Date:</span> {formatDate(deleteTarget.date)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

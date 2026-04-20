import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { todayIsoDate } from '#/shared/lib/format'
import { Button } from '#/shared/ui/button'
import { Input } from '#/shared/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '#/shared/ui/sheet'
import ExpenseCategoryGrid from './expense-category-grid'
import type { ExpenseCategory } from '../lib/expense-categories'

type Props = {
  currency: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type EntryType = 'expense' | 'income'

export default function AddExpenseSheet({ currency, onOpenChange, open }: Props) {
  const createExpense = useMutation(api.mutations.createExpense)

  const [type, setType] = useState<EntryType>('expense')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('other')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayIsoDate())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amount = parseFloat(amountStr) || 0
  const canSave = amount > 0 && !saving

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setType('expense')
      setAmountStr('')
      setCategory('other')
      setNote('')
      setDate(todayIsoDate())
      setError(null)
    }
    onOpenChange(nextOpen)
  }

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await createExpense({
        amount,
        ...(type === 'expense' ? { category } : {}),
        currency,
        date,
        ...(note.trim() ? { note: note.trim() } : {}),
        type,
      })
      handleOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[90svh] overflow-y-auto rounded-t-2xl px-4 pb-8 pt-6">
        <SheetHeader className="mb-5">
          <SheetTitle>Add entry</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(['expense', 'income'] as EntryType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
                  type === t
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label htmlFor="expense-amount" className="text-sm font-medium">Amount ({currency})</label>
            <Input
              id="expense-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="text-center text-2xl font-heading h-14"
            />
          </div>

          {/* Category grid (expense only) */}
          {type === 'expense' && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Category</p>
              <ExpenseCategoryGrid selected={category} onSelect={setCategory} />
            </div>
          )}

          {/* Note */}
          <div className="space-y-1.5">
            <label htmlFor="expense-note" className="text-sm font-medium">Note (optional)</label>
            <Input
              id="expense-note"
              type="text"
              placeholder="e.g. lunch with team"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label htmlFor="expense-date" className="text-sm font-medium">Date</label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            className="w-full"
            disabled={!canSave}
            onClick={() => void handleSave()}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

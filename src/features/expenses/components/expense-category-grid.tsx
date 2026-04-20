import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../lib/expense-categories'

type Props = {
  selected: ExpenseCategory
  onSelect: (category: ExpenseCategory) => void
}

export default function ExpenseCategoryGrid({ onSelect, selected }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {EXPENSE_CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onSelect(cat.value)}
          className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-colors ${
            selected === cat.value
              ? 'border-foreground bg-foreground text-background'
              : 'border-border bg-card hover:border-foreground/30'
          }`}
        >
          <span className="text-xl leading-none">{cat.emoji}</span>
          <span className="text-[0.65rem] font-medium leading-tight">
            {cat.label}
          </span>
        </button>
      ))}
    </div>
  )
}

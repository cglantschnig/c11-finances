type Props = {
  onAdd: () => void
}

export default function ExpensesEmptyState({ onAdd }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed py-16 text-center">
      <p className="text-4xl">💸</p>
      <div>
        <p className="font-medium text-foreground">No entries yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Log your first income or expense to see your monthly summary.
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
      >
        Add first entry
      </button>
    </div>
  )
}

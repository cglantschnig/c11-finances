import type { Id } from '../../../../convex/_generated/dataModel'
import { IconTrash } from '@tabler/icons-react'
import { formatQuantity } from '#/shared/lib/format'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '#/shared/ui/alert-dialog'
import type { TransactionListItem } from '#/features/transactions/transactions-page'

type DeleteTransactionAlertProps = {
  confirmingId: string | null
  confirmingTransaction: TransactionListItem | null
  deleteError: string | null
  onDelete: (transactionId: Id<'transactions'>) => void
  onOpenChange: (open: boolean) => void
  pendingDeleteId: string | null
}

export default function DeleteTransactionAlert({
  confirmingId,
  confirmingTransaction,
  deleteError,
  onDelete,
  onOpenChange,
  pendingDeleteId,
}: DeleteTransactionAlertProps) {
  return (
    <AlertDialog open={confirmingId !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <IconTrash className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            {confirmingTransaction
              ? `${confirmingTransaction.date} • ${confirmingTransaction.ticker} • ${formatQuantity(
                  confirmingTransaction.quantity,
                )} units`
              : 'This action removes the selected ledger entry.'}
          </AlertDialogDescription>
          {deleteError ? (
            <p className="text-sm text-destructive">{deleteError}</p>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pendingDeleteId === confirmingId || !confirmingId}
            onClick={() => {
              if (confirmingId) {
                onDelete(confirmingId as Id<'transactions'>)
              }
            }}
          >
            {pendingDeleteId === confirmingId ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

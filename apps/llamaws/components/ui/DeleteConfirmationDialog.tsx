import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'components/ui/alert-dialog'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  title?: string | JSX.Element
  description?: string | JSX.Element
  confirmationButtonText?: string
  cancelButtonText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export const DeleteConfirmationDialog = ({
  isOpen,
  title,
  description,
  confirmationButtonText = 'Delete',
  cancelButtonText = 'Cancel',
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          {onCancel && (
            <AlertDialogCancel onClick={onCancel}>
              {cancelButtonText}
            </AlertDialogCancel>
          )}
          {onConfirm && (
            <AlertDialogAction variant="destructive" onClick={onConfirm}>
              {confirmationButtonText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

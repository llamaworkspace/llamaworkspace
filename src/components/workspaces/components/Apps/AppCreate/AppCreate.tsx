import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AppCreateBody } from './AppCreateBody'

export const AppCreate = () => {
  return (
    <div className="flex w-full justify-end ">
      <Dialog open={true}>
        <DialogTrigger asChild>
          <Button>Create new appxxx</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create new app</DialogTitle>
            <DialogDescription>
              Select the app type that best fits your needs.
            </DialogDescription>
          </DialogHeader>
          <AppCreateBody />
        </DialogContent>
      </Dialog>
    </div>
  )
}

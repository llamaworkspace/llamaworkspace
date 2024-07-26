import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { OnboardingScreen } from './OnboardingScreen'

export const OnboardingModal = () => {
  const [modalIsOpen, setModalIsOpen] = useState(true)

  const handleSuccess = () => {
    setModalIsOpen(false)
  }

  return (
    <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
      <DialogTrigger asChild>Pepe</DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-scroll sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Let&apos;s get this party started</DialogTitle>
        </DialogHeader>
        <OnboardingScreen onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}

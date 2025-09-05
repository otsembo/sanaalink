import { useState } from 'react'
import { Button } from './button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import BookingDialog from '../BookingDialog'
import type { Service, Provider } from '@/types/provider'

interface BookingButtonProps {
  service: Service
  provider: Provider
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

export function BookingButton({ service, provider, variant = 'default', size = 'default' }: BookingButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleBookingClick = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to book this service',
        variant: 'destructive',
      })
      return
    }
    setIsDialogOpen(true)
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleBookingClick}
      >
        Book Now
      </Button>

      <BookingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        service={service}
        provider={provider}
      />
    </>
  )
}

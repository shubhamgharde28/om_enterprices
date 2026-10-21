import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { fetchMyBookings, subscribeToBookingChanges } from '../services/supabase'
import { dismissNotification, getDismissedNotificationIds } from '../services/notificationStorage'

function useBookingNotifications() {
  const toast = useToast()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const userId = user?.id
  const [notificationState, setNotificationState] = useState({ userId: null, bookings: [], dismissedIds: [] })
  const isCustomer = isAuthenticated && userId && !['admin', 'staff'].includes(user?.role)
  const bookingNotifications = notificationState.userId === userId
    ? notificationState.bookings
      .map((booking) => ({
        id: `rescheduled:${booking.id}:${booking.scheduled_date}:${booking.scheduled_time}`,
        title: `${booking.service_name} appointment rescheduled`,
        description: `New appointment: ${booking.scheduled_date} at ${booking.scheduled_time}.`,
        to: `/booking/${booking.id}`,
      }))
      .filter((notification) => !notificationState.dismissedIds.includes(notification.id))
    : []

  const refreshNotifications = useCallback(() => {
    if (!userId) return

    fetchMyBookings()
      .then((bookings) => {
        const dismissedIds = getDismissedNotificationIds(`customer:${userId}`)
        setNotificationState({
          userId,
          dismissedIds,
          bookings: bookings.filter((booking) => (
            booking.scheduled_date
            && (booking.scheduled_date !== booking.preferred_date
              || booking.scheduled_time !== booking.preferred_time)
          )),
        })
      })
      .catch((error) => {
        toast({
          title: 'Unable to load booking notifications',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }, [toast, userId])

  useEffect(() => {
    if (!isCustomer) return undefined

    refreshNotifications()
    return subscribeToBookingChanges(`user_id=eq.${userId}`, refreshNotifications)
  }, [isCustomer, refreshNotifications, userId])

  const handleDismissNotification = (notificationId) => {
    if (!userId) return
    try {
      dismissNotification(`customer:${userId}`, notificationId)
      setNotificationState((current) => ({
        ...current,
        dismissedIds: current.dismissedIds.includes(notificationId)
          ? current.dismissedIds
          : [...current.dismissedIds, notificationId],
      }))
    } catch (error) {
      toast({
        title: 'Unable to dismiss notification',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return {
    isCustomer,
    bookingNotifications,
    refreshNotifications,
    handleDismissNotification,
  }
}

export default useBookingNotifications

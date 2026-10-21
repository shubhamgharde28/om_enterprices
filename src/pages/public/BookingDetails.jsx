import { Alert, AlertIcon, Box, Container, Heading, List, ListItem, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { setBookings } from '../../redux/slices/bookingSlice'
import { fetchMyBookings } from '../../services/supabase'

function BookingDetails() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const bookings = useSelector((state) => state.bookings.items)
  const booking = bookings.find((item) => item.id === id)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    fetchMyBookings()
      .then((rows) => {
        if (active) dispatch(setBookings(rows))
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load booking details.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [dispatch])

  if (isLoading) return <Container maxW="800px" py={12}><Text>Loading booking...</Text></Container>
  if (errorMessage) return <Container maxW="800px" py={12}><Alert status="error"><AlertIcon />{errorMessage}</Alert></Container>
  if (!booking) return <Container maxW="800px" py={12}><Heading>Booking not found</Heading></Container>

  return (
    <Container maxW="800px" py={12}>
      <Box bg="white" p={8} borderRadius="2xl" boxShadow="soft">
        <Heading as="h1" size="lg" mb={4}>Booking: {booking.booking_number}</Heading>
        <List spacing={3} color="gray.700">
          <ListItem><strong>Service:</strong> {booking.service_name}</ListItem>
          <ListItem><strong>Customer:</strong> {booking.customer_name}</ListItem>
          <ListItem><strong>Requested Appointment:</strong> {booking.preferred_date} at {booking.preferred_time}</ListItem>
          <ListItem>
            <strong>Scheduled Appointment:</strong>{' '}
            {booking.scheduled_date || booking.preferred_date} at {booking.scheduled_time || booking.preferred_time}
          </ListItem>
          <ListItem><strong>Status:</strong> {booking.status}</ListItem>
          <ListItem>
            <strong>Assigned Technician:</strong>{' '}
            {booking.technician?.full_name
              || (booking.assigned_to ? 'Assigned; details unavailable' : 'Pending assignment')}
          </ListItem>
          {booking.technician?.phone && <ListItem><strong>Technician Phone:</strong> {booking.technician.phone}</ListItem>}
          {booking.technician?.email && <ListItem><strong>Technician Email:</strong> {booking.technician.email}</ListItem>}
          <ListItem><strong>Problem:</strong> {booking.problem_description}</ListItem>
        </List>
      </Box>
    </Container>
  )
}

export default BookingDetails

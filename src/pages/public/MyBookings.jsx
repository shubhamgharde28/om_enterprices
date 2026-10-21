import { Alert, AlertIcon, Box, Button, Container, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setBookings } from '../../redux/slices/bookingSlice'
import { fetchMyBookings } from '../../services/supabase'

function MyBookings() {
  const bookings = useSelector((state) => state.bookings.items)
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    fetchMyBookings()
      .then((rows) => {
        if (active) dispatch(setBookings(rows))
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load your bookings.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [dispatch])

  return (
    <Container maxW="1200px" py={12}>
      <Heading mb={8}>My Bookings</Heading>
      {errorMessage && <Alert status="error" mb={6}><AlertIcon />{errorMessage}</Alert>}
      {isLoading ? (
        <Text>Loading your bookings...</Text>
      ) : bookings.length ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {bookings.map((booking) => (
            <Box key={booking.id} bg="white" borderRadius="xl" p={6} boxShadow="soft">
              <Text fontSize="sm" color="gray.500">Booking {booking.booking_number}</Text>
              <Heading as="h3" size="md" my={2}>{booking.service_name}</Heading>
              <Text><strong>Requested:</strong> {booking.preferred_date} at {booking.preferred_time}</Text>
              <Text>
                <strong>Appointment:</strong>{' '}
                {booking.scheduled_date || booking.preferred_date} at {booking.scheduled_time || booking.preferred_time}
              </Text>
              <Text><strong>Status:</strong> {booking.status}</Text>
              <Text>
                <strong>Technician:</strong>{' '}
                {booking.technician?.full_name
                  || (booking.assigned_to ? 'Assigned; details unavailable' : 'Pending assignment')}
              </Text>
              {booking.technician?.phone && <Text><strong>Technician phone:</strong> {booking.technician.phone}</Text>}
              {booking.technician?.email && <Text><strong>Technician email:</strong> {booking.technician.email}</Text>}
              <Button as={Link} to={`/booking/${booking.id}`} mt={4} colorScheme="primary" size="sm">View details</Button>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Text>No bookings yet.</Text>
      )}
    </Container>
  )
}

export default MyBookings

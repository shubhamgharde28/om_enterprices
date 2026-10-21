import { Alert, AlertIcon, Box, Button, Container, FormControl, FormLabel, Grid, Heading, Input, Stack, useToast } from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { updateProfile } from '../../redux/slices/authSlice'
import { updateCustomerProfile } from '../../services/authService'

function Profile() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const toast = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user?.id) {
      setErrorMessage('Your session has expired. Please sign in again.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    try {
      const savedProfile = await updateCustomerProfile(user.id, form)
      dispatch(updateProfile(savedProfile))
      toast({ title: 'Profile saved to your account', status: 'success', duration: 2500, isClosable: true })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container maxW="900px" py={12}>
      <Box bg="white" p={8} borderRadius="2xl" boxShadow="soft">
        <Heading as="h1" size="lg" mb={6}>My Profile</Heading>
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
          {errorMessage && <Alert status="error" borderRadius="md"><AlertIcon />{errorMessage}</Alert>}
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            <FormControl>
              <FormLabel>Full Name</FormLabel>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input value={form.email} isReadOnly />
            </FormControl>
            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>City</FormLabel>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </FormControl>
            <FormControl gridColumn={{ base: 'auto', md: 'span 2' }}>
              <FormLabel>Address</FormLabel>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Pincode</FormLabel>
              <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </FormControl>
          </Grid>

          <Button type="submit" colorScheme="primary" isLoading={isSaving} width={{ base: 'full', md: '200px' }}>Save Profile</Button>
        </Stack>
      </Box>
    </Container>
  )
}

export default Profile

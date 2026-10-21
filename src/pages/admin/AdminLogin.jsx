import { Alert, AlertIcon, Box, Button, Container, FormControl, FormLabel, Heading, Input, Stack, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginAdmin } from '../../redux/slices/authSlice'
import { signInAdmin } from '../../services/authService'

function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const user = await signInAdmin(form.email, form.password)
      dispatch(loginAdmin(user))
      toast({ title: 'Admin login successful', status: 'success', duration: 2500, isClosable: true })
      navigate('/admin')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxW="500px" py={20}>
      <Box bg="white" borderRadius="2xl" p={8} boxShadow="soft">
        <Heading as="h1" size="lg" mb={6}>Admin Login</Heading>
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
          {errorMessage && <Alert status="error" borderRadius="md"><AlertIcon />{errorMessage}</Alert>}
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </FormControl>
          <Button type="submit" colorScheme="primary" isLoading={isSubmitting}>Login</Button>
        </Stack>
      </Box>
    </Container>
  )
}

export default AdminLogin

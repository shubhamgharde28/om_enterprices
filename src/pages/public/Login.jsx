import { Alert, AlertIcon, Box, Button, Container, FormControl, FormLabel, Heading, Input, Link, Stack, Text, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { loginUser } from '../../redux/slices/authSlice'
import { resendSignupConfirmation, signInCustomer } from '../../services/authService'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setNeedsConfirmation(false)
    try {
      const user = await signInCustomer(form.email.trim(), form.password)
      dispatch(loginUser(user))
      toast({ title: 'Login successful', status: 'success', duration: 2500, isClosable: true })
      navigate('/')
    } catch (error) {
      if (error.code === 'email_not_confirmed') {
        setNeedsConfirmation(true)
        setErrorMessage('Please confirm your email address using the link we sent before logging in.')
      } else {
        setErrorMessage(error.message || 'Unable to sign in. Please check your credentials.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendConfirmation = async () => {
    setIsResending(true)
    setErrorMessage('')
    try {
      await resendSignupConfirmation(form.email.trim())
      setNeedsConfirmation(false)
      toast({
        title: 'Confirmation email sent',
        description: 'Check your inbox and spam folder for the confirmation link.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to resend the confirmation email.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Container maxW="500px" py={16}>
      <Box bg="white" p={8} borderRadius="2xl" boxShadow="soft">
        <Heading as="h1" size="lg" mb={6}>Login</Heading>
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
          {errorMessage && <Alert status="error" borderRadius="md"><AlertIcon />{errorMessage}</Alert>}
          {needsConfirmation && (
            <Button type="button" variant="outline" onClick={handleResendConfirmation} isLoading={isResending}>
              Resend confirmation email
            </Button>
          )}
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" autoComplete="current-password" required />
          </FormControl>
          <Button type="submit" colorScheme="primary" isLoading={isSubmitting}>Login</Button>
          <Text textAlign="center">
            <Link as={RouterLink} to="/forgot-password">Forgot password?</Link>
          </Text>
          <Text textAlign="center">
            Need an account? <Link as={RouterLink} to="/signup">Sign up</Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  )
}

export default Login

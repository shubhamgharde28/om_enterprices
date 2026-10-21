import { Alert, AlertIcon, Box, Button, Container, FormControl, FormLabel, Heading, Input, Stack, Text, Link, useToast } from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { loginUser } from '../../redux/slices/authSlice'
import { signUpCustomer } from '../../services/authService'

function Signup() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Passwords do not match', status: 'error', duration: 3000, isClosable: true })
      return
    }

    if (form.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    try {
      const result = await signUpCustomer(form)
      if (result.needsEmailConfirmation) {
        toast({
          title: 'Account created',
          description: 'Check your email to confirm your account, then sign in.',
          status: 'success',
          duration: 6000,
          isClosable: true,
        })
        navigate('/login')
        return
      }

      dispatch(loginUser(result.user))
      toast({ title: 'Account created successfully', status: 'success', duration: 2500, isClosable: true })
      navigate('/')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxW="600px" py={16}>
      <Box bg="white" p={8} borderRadius="2xl" boxShadow="soft">
        <Heading as="h1" size="lg" mb={6}>Create account</Heading>
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
          {errorMessage && <Alert status="error" borderRadius="md"><AlertIcon />{errorMessage}</Alert>}
          <FormControl>
            <FormLabel>Full Name</FormLabel>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </FormControl>
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </FormControl>
          <FormControl>
            <FormLabel>Confirm Password</FormLabel>
            <Input type="password" autoComplete="new-password" minLength={8} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          </FormControl>
          <Button type="submit" colorScheme="primary" isLoading={isSubmitting}>Sign Up</Button>
          <Text textAlign="center">Already have an account? <Link href="/login">Login</Link></Text>
        </Stack>
      </Box>
    </Container>
  )
}

export default Signup

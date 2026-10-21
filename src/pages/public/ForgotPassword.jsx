import { Alert, AlertIcon, Box, Button, Container, FormControl, FormLabel, Heading, Input, Link, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { requestPasswordReset } from '../../services/authService'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setIsSubmitted(false)

    try {
      await requestPasswordReset(email.trim())
      setIsSubmitted(true)
    } catch (error) {
      setErrorMessage(error.message || 'Unable to send password reset instructions.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxW="500px" py={16}>
      <Box bg="white" p={8} borderRadius="2xl" boxShadow="soft">
        <Heading as="h1" size="lg" mb={4}>Reset password</Heading>
        <Text mb={4} color="gray.600">Enter the email linked to your account and we will send reset instructions.</Text>
        <Stack as="form" spacing={4} onSubmit={handleSubmit}>
          {errorMessage && <Alert status="error" borderRadius="md"><AlertIcon />{errorMessage}</Alert>}
          {isSubmitted && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />If an account exists for that email, password reset instructions have been sent.
            </Alert>
          )}
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormControl>
          <Button type="submit" colorScheme="primary" isLoading={isSubmitting}>Send reset link</Button>
          <Text textAlign="center"><Link as={RouterLink} to="/login">Back to login</Link></Text>
        </Stack>
      </Box>
    </Container>
  )
}

export default ForgotPassword

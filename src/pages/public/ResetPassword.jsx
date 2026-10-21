import { Alert, AlertIcon, Box, Button, Container, FormControl, FormLabel, Heading, Input, Link, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { updateCustomerPassword } from '../../services/authService'

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isUpdated, setIsUpdated] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await updateCustomerPassword(password)
      setIsUpdated(true)
    } catch (error) {
      setErrorMessage(error.message || 'Unable to update your password. Request a new reset link and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxW="500px" py={16}>
      <Box bg="white" p={8} borderRadius="2xl" boxShadow="soft">
        <Heading as="h1" size="lg" mb={4}>Choose a new password</Heading>
        {isUpdated ? (
          <Stack spacing={4}>
            <Alert status="success" borderRadius="md"><AlertIcon />Your password has been updated.</Alert>
            <Text textAlign="center"><Link as={RouterLink} to="/login">Continue to login</Link></Text>
          </Stack>
        ) : (
          <>
            <Text mb={4} color="gray.600">Enter and confirm your new password.</Text>
            <Stack as="form" spacing={4} onSubmit={handleSubmit}>
              {errorMessage && <Alert status="error" borderRadius="md"><AlertIcon />{errorMessage}</Alert>}
              <FormControl isRequired>
                <FormLabel>New password</FormLabel>
                <Input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm new password</FormLabel>
                <Input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
              </FormControl>
              <Button type="submit" colorScheme="primary" isLoading={isSubmitting}>Update password</Button>
            </Stack>
          </>
        )}
      </Box>
    </Container>
  )
}

export default ResetPassword

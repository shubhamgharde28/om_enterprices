import { Box, Button, Container, FormControl, FormLabel, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

function ForgotPassword() {
  const [email, setEmail] = useState('')

  return (
    <Container maxW="500px" py={16}>
      <Box bg="white" p={8} borderRadius="2xl" boxShadow="soft">
        <Heading as="h1" size="lg" mb={4}>Reset password</Heading>
        <Text mb={4} color="gray.600">Enter the email linked to your account and we will send reset instructions.</Text>
        <Stack as="form" spacing={4}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormControl>
          <Button colorScheme="primary">Send reset link</Button>
        </Stack>
      </Box>
    </Container>
  )
}

export default ForgotPassword

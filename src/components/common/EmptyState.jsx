import { Box, Button, Heading, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

function EmptyState({ title, description, actionLabel, actionPath = '/' }) {
  return (
    <Box bg="white" borderRadius="xl" p={8} textAlign="center" boxShadow="soft">
      <Heading as="h3" size="md" mb={2}>{title}</Heading>
      <Text color="gray.600" mb={4}>{description}</Text>
      {actionLabel && (
        <Button as={Link} to={actionPath} colorScheme="primary">{actionLabel}</Button>
      )}
    </Box>
  )
}

export default EmptyState

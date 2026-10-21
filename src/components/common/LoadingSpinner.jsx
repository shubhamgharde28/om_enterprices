import { Center, Spinner } from '@chakra-ui/react'

function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <Center py={10}>
      <Spinner size="lg" color="primary.500" label={label} />
    </Center>
  )
}

export default LoadingSpinner

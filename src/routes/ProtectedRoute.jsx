import { Alert, AlertIcon, Center, Spinner, Text } from '@chakra-ui/react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute() {
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth)
  if (isLoading) return <Center minH="60vh"><Spinner color="primary.500" /></Center>
  if (error) return <Alert status="error"><AlertIcon /><Text>{error}</Text></Alert>
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute

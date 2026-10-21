import { Alert, AlertIcon, Center, Spinner, Text } from '@chakra-ui/react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function AdminRoute() {
  const { isAdminAuthenticated, isLoading, error } = useSelector((state) => state.auth)
  if (isLoading) {
    return <Center minH="100vh"><Spinner color="primary.500" /></Center>
  }
  if (error) return <Center minH="100vh" p={6}><Alert status="error"><AlertIcon /><Text>{error}</Text></Alert></Center>
  return isAdminAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />
}

export default AdminRoute

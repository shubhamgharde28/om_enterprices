import { Box, Flex } from '@chakra-ui/react'
import { Outlet, useLocation } from 'react-router-dom'
import { WaterPublicFooter, WaterPublicHeader } from '../components/common/WaterPublicChrome'
import '../styles/home.css'

function PublicLayout() {
  const { pathname } = useLocation()

  if (pathname === '/') return <Outlet />

  return (
    <Flex className="water-home public-water-shell" direction="column" minH="100vh">
      <WaterPublicHeader />
      <Box as="main" flex="1" minH="0">
        <Outlet />
      </Box>
      <WaterPublicFooter />
    </Flex>
  )
}

export default PublicLayout

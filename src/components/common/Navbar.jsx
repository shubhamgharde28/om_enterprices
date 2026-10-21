import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Image,
  IconButton,
  useToast,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaBars, FaChevronDown, FaSignOutAlt } from 'react-icons/fa'
import { logout } from '../../redux/slices/authSlice'
import { signOut } from '../../services/authService'
import NotificationPopover from './NotificationPopover'
import useBookingNotifications from '../../hooks/useBookingNotifications'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Services', to: '/services' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const {
    isCustomer,
    bookingNotifications,
    refreshNotifications,
    handleDismissNotification,
  } = useBookingNotifications()

  const handleLogout = async () => {
    try {
      await signOut()
      dispatch(logout())
      navigate('/')
    } catch (error) {
      toast({ title: 'Unable to log out', description: error.message, status: 'error', duration: 3500, isClosable: true })
    }
  }

  const navLinkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: isActive ? 'primary.700' : 'gray.700',
    fontWeight: 600,
  })

  return (
    <Box bg="white" borderBottom="1px solid" borderColor="gray.200" position="sticky" top={0} zIndex={20}>
      <Flex p={4} maxW="1400px" mx="auto" align="center" justify="space-between">
        <NavLink to="/" style={{ textDecoration: 'none' }}>
          <Image src="/logo.png" alt="OM Enterprises" h="40px" w="auto" />
        </NavLink>

        <Show above="md">
          <HStack spacing={6}>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} style={navLinkStyle}>
                {item.label}
              </NavLink>
            ))}
            <Button as={RouterLink} to="/choose" variant="outline" size="sm" colorScheme="primary">
              Switch Services
            </Button>
          </HStack>
        </Show>

        <HStack spacing={3}>
          <Show below="md">
            <Button as={RouterLink} to="/choose" variant="ghost" size="sm">
              Switch Services
            </Button>
          </Show>
          {isAuthenticated && user ? (
            <>
              {isCustomer && (
                <NotificationPopover
                  title="Appointment updates"
                  emptyMessage="No appointment updates."
                  notifications={bookingNotifications}
                  onDismiss={handleDismissNotification}
                  onOpen={refreshNotifications}
                />
              )}
              <Menu>
                <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="ghost">
                  {user.fullName || user.email}
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile">My Profile</MenuItem>
                  <MenuItem as={RouterLink} to="/my-bookings">My Bookings</MenuItem>
                  {['admin', 'staff'].includes(user.role) && <MenuItem as={RouterLink} to="/admin">Admin Dashboard</MenuItem>}
                  <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button as={RouterLink} to="/login" variant="ghost">Login</Button>
              <Button as={RouterLink} to="/signup" colorScheme="primary">Sign Up</Button>
            </>
          )}

          <Show below="md">
            <IconButton aria-label="Open menu" variant="ghost" onClick={onOpen} icon={<FaBars />} />
          </Show>
        </HStack>
      </Flex>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={3}>
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={onClose} style={navLinkStyle}>
                  {item.label}
                </NavLink>
              ))}
              <Button as={RouterLink} to="/choose" onClick={onClose} variant="outline" colorScheme="primary">
                Switch Services
              </Button>
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" onClick={onClose} style={navLinkStyle}>My Profile</NavLink>
                  <NavLink to="/my-bookings" onClick={onClose} style={navLinkStyle}>My Bookings</NavLink>
                  <Button onClick={handleLogout} variant="outline" mt={2}>Logout</Button>
                </>
              ) : (
                <>
                  <Button as={RouterLink} to="/login" variant="outline">Login</Button>
                  <Button as={RouterLink} to="/signup">Sign Up</Button>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default Navbar

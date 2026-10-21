import { Box, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, IconButton, List, ListItem, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaBars, FaBoxOpen, FaCalendarAlt, FaCog, FaEnvelope, FaHome, FaSignOutAlt, FaSun, FaTools, FaUserFriends, FaUsers, FaWater } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { logout } from '../redux/slices/authSlice'
import { signOut } from '../services/authService'
import {
  fetchBookings,
  fetchContactMessages,
  fetchProductEnquiries,
  fetchSolarRequests,
  subscribeToBookingChanges,
  subscribeToContactMessageChanges,
  subscribeToProductEnquiryChanges,
  subscribeToSolarRequestChanges,
} from '../services/supabase'
import NotificationPopover from '../components/common/NotificationPopover'
import { dismissNotification, getDismissedNotificationIds } from '../services/notificationStorage'
import '../styles/admin.css'

const navSections = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/admin', icon: FaHome },
    ],
  },
  {
    label: 'RO / Water Purifier',
    items: [
      { label: 'Products', path: '/admin/products', icon: FaBoxOpen },
      { label: 'Categories', path: '/admin/categories', icon: FaCalendarAlt },
      { label: 'Services', path: '/admin/services', icon: FaCog },
      { label: 'Technicians', path: '/admin/technicians', icon: FaTools },
      { label: 'Bookings', path: '/admin/bookings', icon: FaCalendarAlt },
      { label: 'Product Enquiries', path: '/admin/product-enquiries', icon: FaEnvelope },
      { label: 'RO Contact Messages', path: '/admin/contact-messages', icon: FaEnvelope },
    ],
  },
  {
    label: 'Solar Services',
    items: [
      { label: 'Solar Requests', path: '/admin/solar-requests', icon: FaSun },
      { label: 'Solar Contact Messages', path: '/admin/solar-contact-messages', icon: FaEnvelope },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Customers', path: '/admin/customers', icon: FaUsers },
      { label: 'Testimonials', path: '/admin/testimonials', icon: FaUserFriends },
      { label: 'Settings', path: '/admin/settings', icon: FaCog },
    ],
  },
]

function AdminLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const [allBookingNotifications, setAllBookingNotifications] = useState([])
  const [allContactNotifications, setAllContactNotifications] = useState([])
  const [allProductEnquiryNotifications, setAllProductEnquiryNotifications] = useState([])
  const [allSolarRequestNotifications, setAllSolarRequestNotifications] = useState([])
  const [dismissedNotifications, setDismissedNotifications] = useState([])
  const notifications = [
    ...allBookingNotifications
    .filter((booking) => booking.status === 'Pending')
    .map((booking) => ({
      id: `booking:${booking.id}`,
      title: `New booking ${booking.booking_number}`,
      description: `${booking.customer_name} booked ${booking.service_name}.`,
      to: '/admin/bookings',
      actionLabel: 'View bookings',
    })),
    ...allContactNotifications
      .filter((message) => message.status === 'New')
      .map((message) => ({
        id: `contact:${message.id}`,
        title: 'New contact message',
        description: `${message.name} sent a message: ${message.message}`,
        to: '/admin/contact-messages',
        actionLabel: 'View message',
      })),
    ...allProductEnquiryNotifications
      .filter((enquiry) => enquiry.status === 'New')
      .map((enquiry) => ({
        id: `product-enquiry:${enquiry.id}`,
        title: 'New product enquiry',
        description: `${enquiry.customer_name} enquired about ${enquiry.product_name}.`,
        to: '/admin/product-enquiries',
        actionLabel: 'View enquiry',
      })),
    ...allSolarRequestNotifications
      .filter((request) => request.request_type === 'contact' && request.status === 'Pending')
      .map((request) => ({
        id: `solar-contact:${request.id}`,
        title: 'New Solar contact message',
        description: `${request.full_name} sent a message: ${request.requirements}`,
        to: '/admin/solar-contact-messages',
        actionLabel: 'View message',
      })),
    ...allSolarRequestNotifications
      .filter((request) => request.request_type === 'consultation' && request.status === 'Pending')
      .map((request) => ({
        id: `solar-consultation:${request.id}`,
        title: 'New Solar consultation request',
        description: `${request.full_name} requested a solar consultation${request.preferred_date ? ` for ${request.preferred_date}` : ''}${request.preferred_time ? ` at ${request.preferred_time}` : ''}.`,
        to: '/admin/solar-requests',
        actionLabel: 'View message',
      })),
  ]
    .filter((notification) => !dismissedNotifications.includes(notification.id))

  const refreshNotifications = useCallback(() => {
    Promise.allSettled([fetchBookings(), fetchContactMessages(), fetchProductEnquiries(), fetchSolarRequests()])
      .then(([bookingsResult, messagesResult, productEnquiriesResult, solarRequestsResult]) => {
        const loadErrors = []
        if (bookingsResult.status === 'fulfilled') {
          setAllBookingNotifications(bookingsResult.value)
        } else {
          loadErrors.push(`Bookings: ${bookingsResult.reason.message}`)
        }
        if (messagesResult.status === 'fulfilled') {
          setAllContactNotifications(messagesResult.value)
        } else {
          loadErrors.push(`Contact messages: ${messagesResult.reason.message}`)
        }
        if (productEnquiriesResult.status === 'fulfilled') {
          setAllProductEnquiryNotifications(productEnquiriesResult.value)
        } else {
          loadErrors.push(`Product enquiries: ${productEnquiriesResult.reason.message}`)
        }
        if (solarRequestsResult.status === 'fulfilled') {
          setAllSolarRequestNotifications(solarRequestsResult.value)
        } else {
          loadErrors.push(`Solar requests: ${solarRequestsResult.reason.message}`)
        }
        setDismissedNotifications(getDismissedNotificationIds('admin'))
        if (loadErrors.length) {
          toast({
            title: 'Some admin notifications could not be loaded',
            description: loadErrors.join('\n'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          })
        }
      })
      .catch((error) => {
        toast({
          title: 'Unable to load admin notifications',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }, [toast])

  useEffect(() => {
    refreshNotifications()
    const unsubscribeBookings = subscribeToBookingChanges(null, refreshNotifications)
    const unsubscribeContactMessages = subscribeToContactMessageChanges(refreshNotifications)
    const unsubscribeProductEnquiries = subscribeToProductEnquiryChanges(refreshNotifications)
    const unsubscribeSolarRequests = subscribeToSolarRequestChanges(refreshNotifications)
    return () => {
      unsubscribeBookings()
      unsubscribeContactMessages()
      unsubscribeProductEnquiries()
      unsubscribeSolarRequests()
    }
  }, [refreshNotifications])

  const handleDismissNotification = (notificationId) => {
    try {
      dismissNotification('admin', notificationId)
      setDismissedNotifications((current) => (
        current.includes(notificationId) ? current : [...current, notificationId]
      ))
    } catch (error) {
      toast({
        title: 'Unable to dismiss notification',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      dispatch(logout())
      navigate('/admin/login')
    } catch (error) {
      toast({ title: 'Unable to log out', description: error.message, status: 'error', duration: 3500, isClosable: true })
    }
  }

  const renderSidebarContent = () => (
    <Box className="admin-sidebar" w="100%" bg="white" minH="100vh">
      <NavLink to="/admin" className="admin-brand" onClick={onClose}>
        <span className="admin-brand-mark"><FaWater /></span>
        <span>OM Admin</span>
      </NavLink>
      {navSections.map((section) => (
        <Box key={section.label} className="admin-nav-section">
          <Text className="admin-nav-heading">{section.label}</Text>
          <List className="admin-nav-list">
            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <ListItem key={item.path} className="admin-nav-item">
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    end={item.path === '/admin'}
                    className={({ isActive }) => `admin-nav-link${isActive ? ' is-active' : ''}`}
                  >
                    <Icon className="admin-nav-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                </ListItem>
              )
            })}
          </List>
        </Box>
      ))}
      <Box className="admin-sidebar-footer">
        <NavLink to="/" className="admin-footer-link" onClick={onClose}>
          <FaArrowLeft />
          <span>Back to website</span>
        </NavLink>
        <button className="admin-footer-link admin-logout" type="button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </Box>
    </Box>
  )

  return (
    <Flex className="admin-shell" minH="100vh">
      <Box className="admin-sidebar-desktop" display={{ base: 'none', md: 'block' }}>
        {renderSidebarContent()}
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerOverlay />
        <DrawerContent className="admin-mobile-drawer">
          <DrawerCloseButton />
          <DrawerHeader className="admin-mobile-drawer-header">OM Admin</DrawerHeader>
          <DrawerBody className="admin-mobile-drawer-body" p={0}>
            {renderSidebarContent()}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box className="admin-main" flex="1">
        <Flex as="header" className="admin-topbar" align="center" justify="space-between">
          <Flex align="center" gap={3}>
            <IconButton className="admin-menu-button" display={{ md: 'none' }} aria-label="Open menu" icon={<FaBars />} onClick={onOpen} variant="ghost" />
            <Text className="admin-topbar-title">Operations Center</Text>
          </Flex>
          <Flex className="admin-topbar-actions" align="center" gap={4}>
            <NotificationPopover
              title="Notifications"
              emptyMessage="No new bookings or contact messages."
              notifications={notifications}
              onDismiss={handleDismissNotification}
              onOpen={refreshNotifications}
              actionLabel="View details"
              variant="admin"
            />
            <span className="admin-profile-badge" aria-label="Admin profile"><FaUsers /></span>
          </Flex>
        </Flex>
        <Box className="admin-page-content">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  )
}

export default AdminLayout

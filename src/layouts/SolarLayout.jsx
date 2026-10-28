import { Box, Button, Container, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, Heading, HStack, IconButton, Image, Show, SimpleGrid, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom'
import { FaArrowRight, FaBars, FaChevronRight, FaCommentDots, FaEnvelope, FaFacebook, FaHeadset, FaHome, FaInfoCircle, FaLeaf, FaLightbulb, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhoneAlt, FaYoutube } from 'react-icons/fa'
import { useEffect } from 'react'
import '../styles/solar.css'
import { saveWebsiteSelection } from '../services/websiteSelection'

const links = [
  { label: 'Home', to: '/solar', icon: FaHome },
  { label: 'Solutions', to: '/solar/services', icon: FaLightbulb },
  { label: 'About', to: '/solar/about', icon: FaInfoCircle },
  { label: 'FAQs', to: '/solar/faqs', icon: FaCommentDots },
  { label: 'Contact', to: '/solar/contact', icon: FaHeadset },
]
const currentYear = new Date().getFullYear()

function SolarLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    saveWebsiteSelection('solar')
  }, [])

  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#166534' : '#475569',
    fontWeight: 700,
    textDecoration: 'none',
  })

  return (
    <Box className="solar-site">
      <Box as="header" className="solar-header">
        <Flex className="solar-header-inner" align="center" justify="space-between" w="100%" maxW="1400px" mx="auto" px={{ base: 4, md: 8 }} py={4}>
          <NavLink to="/solar" className="solar-brand" aria-label="Tata Solar by OM Enterprises home">
            <Image src="/logo.png" alt="OM Enterprises" h="32px" w="auto" />
          </NavLink>
          <Show above="lg">
            <HStack spacing={6}>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/solar'}
                  className={({ isActive }) => `solar-header-nav-link${isActive ? ' is-active' : ''}`}
                  style={linkStyle}
                >
                  {link.label}
                </NavLink>
              ))}
            </HStack>
          </Show>
          <HStack className="solar-header-actions" spacing={2} align="center" flexShrink={0}>
            <Show above="lg">
              <Button className="solar-header-switch" as={RouterLink} to="/choose" size="sm">Switch to RO</Button>
            </Show>
            <Show above="md">
              <Button className="solar-primary-cta solar-header-cta" as={RouterLink} to="/solar/request/consultation" colorScheme="green" size="sm">Get a consultation</Button>
            </Show>
            <Show below="lg">
              <Button className="solar-header-switch solar-header-switch-mobile" as={RouterLink} to="/choose" size="sm">
                Switch to RO
              </Button>
              <IconButton aria-label="Open solar menu" icon={<FaBars />} onClick={onOpen} variant="ghost" />
            </Show>
          </HStack>
        </Flex>
      </Box>
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent className="solar-drawer">
          <DrawerCloseButton />
          <DrawerHeader className="solar-drawer-header">
            <Image src="/logo.png" alt="OM Enterprises" className="solar-drawer-logo" />
          </DrawerHeader>
          <DrawerBody>
            <VStack className="solar-drawer-navigation" align="stretch" spacing={2}>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/solar'}
                  onClick={onClose}
                  className={({ isActive }) => `solar-drawer-link${isActive ? ' is-active' : ''}`}
                >
                  <link.icon className="solar-drawer-link-icon" />
                  <span>{link.label}</span>
                  <FaChevronRight className="solar-drawer-link-chevron" />
                </NavLink>
              ))}
              <Button className="solar-primary-cta solar-drawer-consultation" as={RouterLink} to="/solar/request/consultation" onClick={onClose} leftIcon={<FaCommentDots />} rightIcon={<FaChevronRight />}>
                Get a consultation
              </Button>
            </VStack>
            <Box className="solar-drawer-promo">
              <Box className="solar-drawer-promo-content">
                <Text className="solar-drawer-promo-eyebrow">Go green</Text>
                <Heading as="h2">Clean Energy<br />for a Better<br /><span>Tomorrow</span></Heading>
                <Text>Explore Tata Power Solar solutions with OM Enterprises and find the right next step for your property.</Text>
                <Button as={RouterLink} to="/solar/services" onClick={onClose} rightIcon={<FaChevronRight />}>
                  Learn More
                </Button>
              </Box>
              <FaLeaf className="solar-drawer-promo-leaf" />
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Box as="main"><Outlet /></Box>
      <Box as="footer" className="solar-footer" py={{ base: 7, md: 8 }}>
        <Container maxW="1400px">
          <SimpleGrid className="solar-footer-columns" columns={{ base: 2, lg: 5 }} spacing={{ base: 5, md: 7 }}>
            <Box className="solar-footer-brand-column">
              <NavLink to="/solar" aria-label="OM Enterprises home">
                <Image className="solar-footer-logo" src="/logo.png" alt="OM Enterprises" h="42px" w="auto" mb={2} />
              </NavLink>
              <Text className="solar-footer-tagline">Tata Solar solutions by OM Enterprises</Text>
            </Box>
            <Box>
              <Text className="solar-footer-heading">Quick Links</Text>
              <Flex direction="column" gap={2}>
                <NavLink to="/solar">Home</NavLink>
                <NavLink to="/solar/services">Solutions</NavLink>
                <NavLink to="/solar/about">About</NavLink>
                <NavLink to="/solar/faqs">FAQs</NavLink>
                <NavLink to="/solar/contact">Contact</NavLink>
              </Flex>
            </Box>
            <Box>
              <Text className="solar-footer-heading">Our Solutions</Text>
              <Flex direction="column" gap={2}>
                <NavLink to="/solar/services/residential">Residential Solar</NavLink>
                <NavLink to="/solar/services/commercial">Commercial Solar</NavLink>
                <NavLink to="/solar/services/installation">Solar Panel Installation</NavLink>
                <NavLink to="/solar/services/maintenance">System Maintenance</NavLink>
                <NavLink to="/solar/services/cleaning">Cleaning &amp; Repair</NavLink>
              </Flex>
            </Box>
            <Box className="solar-footer-contact-column">
              <Text className="solar-footer-heading">Contact Us</Text>
              <Flex className="solar-footer-contact" direction="column" gap={2}>
                <Text><FaPhoneAlt /><a href="tel:09724916029">09724916029</a></Text>
                <Text><FaEnvelope /><a href="mailto:hello@omenterprises.com">hello@omenterprises.com</a></Text>
                <Text><FaMapMarkerAlt /><span>Near Khamtalav Chowk, Shitla Mata Mandir Road,<br />Bhandara H O, Bhandara-441904, Maharashtra</span></Text>
                <Button className="solar-footer-consultation" as={RouterLink} to="/solar/request/consultation" size="sm">
                  Get a Consultation <FaArrowRight />
                </Button>
              </Flex>
            </Box>
            <Box className="solar-footer-social-column">
              <Text className="solar-footer-heading">Follow Us</Text>
              <HStack className="solar-footer-socials" spacing={3}>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebook /></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
              </HStack>
            </Box>
          </SimpleGrid>
          <Flex className="solar-footer-legal" justify="space-between" align="center" gap={3} wrap="wrap">
            <Text opacity={0.65}>© {currentYear} OM Enterprises. All rights reserved.</Text>
            <HStack spacing={5}>
              <NavLink to="/solar/contact">Privacy Policy</NavLink>
              <span>|</span>
              <NavLink to="/solar/contact">Terms &amp; Conditions</NavLink>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}

export default SolarLayout

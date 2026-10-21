import { Box, Container, Flex, Grid, Link, SimpleGrid, Text } from '@chakra-ui/react'
import { FaFacebook, FaInstagram, FaLinkedin, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa'

function Footer() {
  return (
    <Box bg="neutral.900" color="white" pt={12} pb={6}>
      <Container maxW="1400px">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>OM Enterprises</Text>
            <Text color="gray.300">Pure Water. Better Living.</Text>
          </Box>
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={3}>Quick Links</Text>
            <Flex direction="column" gap={2} color="gray.300">
              <Link href="/">Home</Link>
              <Link href="/products">Products</Link>
              <Link href="/services">Services</Link>
              <Link href="/contact">Contact</Link>
            </Flex>
          </Box>
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={3}>Contact</Text>
            <Flex direction="column" gap={2} color="gray.300">
              <Text display="flex" alignItems="center" gap={2}><FaPhoneAlt /> 09724916029</Text>
              <Text display="flex" alignItems="center" gap={2}><FaEnvelope /> hello@omenterprises.com</Text>
              <Text display="flex" alignItems="center" gap={2}><FaMapMarkerAlt /> Bhandara H O, Bhandara-441904, Maharashtra</Text>
            </Flex>
          </Box>
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={3}>Follow Us</Text>
            <Flex gap={4} color="gray.300" fontSize="xl">
              <Link href="https://facebook.com" isExternal aria-label="Facebook"><FaFacebook /></Link>
              <Link href="https://instagram.com" isExternal aria-label="Instagram"><FaInstagram /></Link>
              <Link href="https://linkedin.com" isExternal aria-label="LinkedIn"><FaLinkedin /></Link>
            </Flex>
          </Box>
        </SimpleGrid>

        <Box borderTop="1px solid" borderColor="gray.700" mt={8} pt={6} textAlign="center" color="gray.400">
          © {new Date().getFullYear()} OM Enterprises. All rights reserved.
        </Box>
      </Container>
    </Box>
  )
}

export default Footer

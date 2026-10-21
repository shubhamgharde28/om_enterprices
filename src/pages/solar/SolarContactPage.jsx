import { Box, Button, Container, Grid, Heading, Link, SimpleGrid, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import {
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaLeaf,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from 'react-icons/fa'
import SolarRequestPage from './SolarRequestPage'

const contactDetails = [
  {
    icon: FaPhoneAlt,
    title: 'Phone',
    value: '09724916029',
    description: 'Mon–Sun, 9:00 AM – 6:00 PM',
  },
  {
    icon: FaEnvelope,
    title: 'Email',
    value: 'solar@omenterprises.com (placeholder)',
    description: 'We’ll reply within 24 hours',
  },
  {
    icon: FaMapMarkerAlt,
    title: 'Service area',
    value: 'Bhandara and surrounding communities',
    description: 'Confirm project availability with our team',
  },
  {
    icon: FaClock,
    title: 'Consultations',
    value: 'By appointment',
    description: 'Choose a convenient time in your enquiry',
  },
]

const quickLinks = [
  { label: 'Frequently Asked Questions', to: '/solar/faqs', icon: FaCheckCircle },
  { label: 'Our Solar Solutions', to: '/solar/services', icon: FaBolt },
  { label: 'Installation Process', to: '/solar/about', icon: FaLeaf },
  { label: 'Request a Consultation', to: '/solar/request/consultation', icon: FaArrowRight },
]

function SolarContactPage() {
  return (
    <Box className="solar-contact-page">
      <Box className="solar-contact-hero">
        <Container maxW="1400px" className="solar-contact-hero-inner">
          <Box className="solar-contact-hero-copy">
            <Text className="solar-eyebrow">Get in touch</Text>
            <Heading>Contact the Solar Team</Heading>
            <Text>
              Have a question, need a quote or want to discuss your solar project? We’re here to help. Reach out to our team and we’ll get back to you as soon as possible.
            </Text>
            <SimpleGrid className="solar-contact-hero-highlights" columns={3} spacing={3}>
              <Box><FaLeaf /><Text>Expert Guidance</Text><Text>Get professional advice</Text></Box>
              <Box><FaBolt /><Text>100% Clean Energy</Text><Text>A greener tomorrow</Text></Box>
              <Box><FaCheckCircle /><Text>Cost Saving</Text><Text>Reduce your bills</Text></Box>
            </SimpleGrid>
          </Box>
          <Box className="solar-contact-hero-image" role="img" aria-label="Home powered by rooftop solar panels" />
          <Box className="solar-contact-service-card">
            <Box className="solar-contact-service-icon"><FaMapMarkerAlt /></Box>
            <Box>
              <Text className="solar-contact-service-label">Service area</Text>
              <Text className="solar-contact-service-value">Bhandara and surrounding communities; confirm project availability with our team.</Text>
            </Box>
            <Box className="solar-contact-service-divider" />
            <Box className="solar-contact-service-icon"><FaEnvelope /></Box>
            <Box>
              <Text className="solar-contact-service-label">Email</Text>
              <Text className="solar-contact-service-value">solar@omenterprises.com (placeholder)</Text>
            </Box>
            <Box className="solar-contact-service-divider" />
            <Box className="solar-contact-service-icon"><FaPhoneAlt /></Box>
            <Box>
              <Text className="solar-contact-service-label">Phone</Text>
              <Text className="solar-contact-service-value">09724916029</Text>
            </Box>
          </Box>
          <Text className="solar-contact-hero-script">Powering<br />a cleaner,<br />greener future</Text>
        </Container>
      </Box>

      <Container maxW="1400px" className="solar-contact-main">
        <Grid className="solar-contact-content-grid" templateColumns={{ base: '1fr', lg: '1.45fr 1fr' }} gap={3}>
          <SolarRequestPage initialType="contact" className="solar-contact-form-shell" />
          <Box className="solar-contact-sidebar">
            <Box className="solar-contact-panel solar-contact-details">
              <Text className="solar-eyebrow">Our contact details</Text>
              <Heading size="md">Get in Touch</Heading>
              <Text className="solar-contact-panel-intro">We’d love to hear from you. Reach out to us through any of the below channels.</Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                {contactDetails.map(({ icon: Icon, title, value, description }) => (
                  <Box key={title} className="solar-contact-detail">
                    <Box className="solar-contact-detail-icon"><Icon /></Box>
                    <Box>
                      <Text>{title}</Text>
                      <Text>{value}</Text>
                      <Text>{description}</Text>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            <Box className="solar-contact-panel solar-contact-links-panel">
              <Box className="solar-contact-map">
                <iframe
                  title="Map of Bhandara, Maharashtra"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=79.61%2C21.13%2C79.69%2C21.20&layer=mapnik&marker=21.1667%2C79.65"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </Box>
              <Box className="solar-contact-quick-links">
                <Heading size="sm">Quick Links</Heading>
                {quickLinks.map(({ label, to, icon: Icon }) => (
                  <Link as={RouterLink} key={label} to={to} className="solar-contact-quick-link">
                    <Icon />
                    <Text>{label}</Text>
                    <FaArrowRight />
                  </Link>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Container>

      <Box className="solar-contact-cta">
        <Container maxW="1400px" className="solar-contact-cta-inner">
          <Box className="solar-contact-cta-icon"><FaLeaf /></Box>
          <Box>
            <Heading size="sm">Let’s build a cleaner, brighter tomorrow.</Heading>
            <Text>Get in touch today and take the first step towards a sustainable future.</Text>
          </Box>
          <Button className="solar-primary-cta" as={RouterLink} to="/solar/request/consultation" rightIcon={<FaArrowRight />}>
            Book a consultation
          </Button>
        </Container>
      </Box>
    </Box>
  )
}

export default SolarContactPage

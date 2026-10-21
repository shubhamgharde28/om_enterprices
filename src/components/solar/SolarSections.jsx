import { useState } from 'react'
import { Box, Button, Container, Heading, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaArrowRight, FaBolt, FaCheckCircle, FaCog, FaHome, FaLeaf, FaSearch, FaShieldAlt, FaTint, FaUsers } from 'react-icons/fa'
import { MdBusiness, MdSolarPower } from 'react-icons/md'
import { solarFaqs, solarServices } from '../../solar/solarContent'

export function SolarSectionHeading({ eyebrow, title, description }) {
  return (
    <VStack align={{ base: 'center', md: 'flex-start' }} textAlign={{ base: 'center', md: 'left' }} spacing={3} mb={8}>
      {eyebrow && <Text className="solar-eyebrow">{eyebrow}</Text>}
      <Heading size={{ base: 'xl', md: '2xl' }}>{title}</Heading>
      {description && <Text color="var(--solar-muted)" maxW="700px" fontSize="lg">{description}</Text>}
    </VStack>
  )
}

export function SolarServiceCards({ services = solarServices.slice(0, 6) }) {
  const serviceIcons = {
    residential: FaHome,
    commercial: MdBusiness,
    installation: MdSolarPower,
    maintenance: FaCog,
    cleaning: FaTint,
    'repair-inspection': FaSearch,
  }

  return (
    <SimpleGrid className="solar-service-grid" columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
      {services.map((service) => (
        <Box key={service.slug} className={`solar-card solar-service-card${service.highlights ? ' solar-service-card-featured' : ''}`}>
          <Image src={service.image} alt={`${service.title} solution`} w="100%" loading="lazy" />
          <Box className="solar-service-card-content">
            <Box className="solar-service-icon">{(() => {
              const Icon = serviceIcons[service.slug] || FaLeaf
              return <Icon />
            })()}</Box>
            <Heading size="sm" mb={1}>{service.title}</Heading>
            <Text className="solar-service-description" color="var(--solar-muted)" mb={3} fontSize="sm">{service.description || service.short}</Text>
            {service.highlights && (
              <Box as="ul" className="solar-service-highlights">
                {service.highlights.map((highlight) => (
                  <Text as="li" key={highlight}><FaCheckCircle />{highlight}</Text>
                ))}
              </Box>
            )}
            <Button className="solar-service-link" as={RouterLink} to={`/solar/services/${service.slug}`} variant="link" colorScheme="green" rightIcon={<FaArrowRight />} size="sm">
              Explore solution
            </Button>
            {service.cardNote && (
              <Box className="solar-service-note">
                <FaLeaf />
                <Text>{service.cardNote}</Text>
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </SimpleGrid>
  )
}

export function SolarFaqList({ faqs = solarFaqs }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <VStack className="solar-faq-list" align="stretch" spacing={2}>
      {faqs.map((faq, index) => (
        <Box
          as="details"
          key={faq.question}
          className="solar-card solar-faq-item"
          p={3}
          open={openIndex === index}
          onToggle={(event) => {
            if (event.currentTarget.open) {
              setOpenIndex(index)
            } else {
              setOpenIndex((currentIndex) => currentIndex === index ? null : currentIndex)
            }
          }}
        >
          <Box as="summary" fontWeight="bold" cursor="pointer">
            <FaCheckCircle />
            <Text as="span">{faq.question}</Text>
            <span className="solar-faq-toggle">+</span>
          </Box>
          <Text className="solar-faq-answer" color="var(--solar-muted)" mt={3} pl={7}>{faq.answer}</Text>
        </Box>
      ))}
    </VStack>
  )
}

export function SolarBenefits() {
  const benefits = [
    [FaBolt, 'Designed for your usage', 'Recommendations start with your real energy needs and site conditions.'],
    [FaUsers, 'One team, clear steps', 'Get support from the first conversation through system handover.'],
    [FaShieldAlt, 'Care beyond installation', 'Cleaning, inspections and servicing help you look after your investment.'],
  ]

  return (
    <SimpleGrid className="solar-benefits" columns={{ base: 1, md: 3 }} spacing={5}>
      {benefits.map(([Icon, title, description]) => (
        <Box key={title} className="solar-card solar-benefit-card" p={5}>
          <Box className="solar-benefit-icon"><Icon /></Box>
          <Heading size="sm" mt={3} mb={1}>{title}</Heading>
          <Text color="var(--solar-muted)" fontSize="sm">{description}</Text>
        </Box>
      ))}
    </SimpleGrid>
  )
}

export function SolarCallToAction() {
  return (
    <Box bg="#e9f2d6" py={{ base: 10, md: 14 }} mt={12}>
      <Container maxW="1400px">
        <SimpleGrid columns={{ base: 1, md: 2 }} alignItems="center" spacing={6}>
          <Box>
            <Text className="solar-eyebrow">Your next step</Text>
            <Heading size="xl" mt={2}>Let’s find the right solar solution for you.</Heading>
          </Box>
          <Box textAlign={{ base: 'left', md: 'right' }}>
            <Button as={RouterLink} to="/solar/consultation" colorScheme="green" size="lg">Book a consultation</Button>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  )
}

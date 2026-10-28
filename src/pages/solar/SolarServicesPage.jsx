import { Box, Button, Container, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaArrowRight, FaBolt, FaCheckCircle, FaLeaf, FaShieldAlt, FaUsers } from 'react-icons/fa'
import { SolarServiceCards } from '../../components/solar/SolarSections'
import { solarServices } from '../../solar/solarContent'

const solutionHighlights = [
  [FaBolt, 'Designed for your usage', 'Systems planned around your energy needs'],
  [FaLeaf, 'Cleaner energy choices', 'A practical step towards lower emissions'],
  [FaShieldAlt, 'Support beyond installation', 'Care and advice as your needs evolve'],
]

const solutionSteps = [
  [FaUsers, 'Understand your needs', 'We discuss how you use energy, your property and what you want your solar system to achieve.'],
  [FaCheckCircle, 'Plan the right solution', 'A site review helps shape a suitable system, clear scope and practical next steps.'],
  [FaShieldAlt, 'Install and support', 'Our team coordinates installation and can advise on maintenance and ongoing system care.'],
]

function SolarServicesPage() {
  return (
    <Box className="solar-home solar-services-page">
      <Box className="solar-services-hero">
        <Container maxW="1400px" className="solar-services-hero-inner">
          <Box className="solar-services-hero-copy">
            <Text className="solar-eyebrow">Solar solutions</Text>
            <Heading className="solar-services-hero-title">
              Solutions for every <span>stage of solar</span>
            </Heading>
            <Text>
              Explore Tata Power Solar solutions from OM Enterprises, with services shaped around your property, energy use and plans—from your first questions to installation and long-term care.
            </Text>
            <SimpleGrid className="solar-services-hero-highlights" columns={3} spacing={3}>
              {solutionHighlights.map(([Icon, title, description]) => (
                <Box key={title}>
                  <Icon />
                  <Box>
                    <Text>{title}</Text>
                    <Text>{description}</Text>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
            <Button className="solar-primary-cta" as={RouterLink} to="/solar/request/consultation" rightIcon={<FaArrowRight />}>
              Book a consultation
            </Button>
          </Box>
          <Box className="solar-services-hero-visual" role="img" aria-label="Solar panels providing clean energy for a home">
            <Box
              as="img"
              src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=85"
              alt=""
            />
            <Box className="solar-services-hero-badge">
              <FaLeaf />
              <Text>Power your property<br />with confidence</Text>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxW="1400px" className="solar-services-main">
        <Box className="solar-services-section-heading">
          <Text className="solar-eyebrow">Explore our services</Text>
          <Heading className="solar-home-services-title">Solar support, from first plans to aftercare</Heading>
          <Text className="solar-home-section-description">
            Choose a service to learn more. We’ll help you understand the options and next steps for your home or business.
          </Text>
        </Box>
        <SolarServiceCards services={solarServices.slice(0, 6)} />
      </Container>

      <Box className="solar-services-approach">
        <Container maxW="1400px" className="solar-services-approach-inner">
          <Box className="solar-services-approach-heading">
            <Text className="solar-eyebrow">A clear path forward</Text>
            <Heading>Good solar decisions start with understanding your needs.</Heading>
            <Text>
              Every site is different. We take time to understand your goals, explain the options and help you make an informed choice without guesswork.
            </Text>
          </Box>
          <SimpleGrid className="solar-services-steps" columns={{ base: 1, md: 3 }} spacing={4}>
            {solutionSteps.map(([Icon, title, description], index) => (
              <Box className="solar-card solar-services-step" key={title}>
                <Box className="solar-services-step-icon"><Icon /></Box>
                <Text className="solar-services-step-number">0{index + 1}</Text>
                <Heading size="sm">{title}</Heading>
                <Text>{description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box className="solar-services-bottom-cta">
        <Container maxW="1400px" className="solar-services-bottom-cta-inner">
          <Box>
            <Text className="solar-eyebrow">Take the next step</Text>
            <Heading>Let’s find the right solar solution for you.</Heading>
            <Text>Talk to our team about your property, energy needs and plans.</Text>
          </Box>
          <Button className="solar-primary-cta" as={RouterLink} to="/solar/request/consultation" rightIcon={<FaArrowRight />}>
            Get a consultation
          </Button>
        </Container>
      </Box>
    </Box>
  )
}

export default SolarServicesPage

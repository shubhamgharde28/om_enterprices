import { Box, Button, Container, Flex, Heading, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaArrowRight, FaBolt, FaCheckCircle, FaLeaf, FaHome, FaUsers, FaShieldAlt } from 'react-icons/fa'
import { SolarBenefits, SolarFaqList, SolarServiceCards } from '../../components/solar/SolarSections'
import { solarFaqs, solarServices } from '../../solar/solarContent'

const projectSteps = [
  [FaLeaf, '01', 'Understand your needs', 'We listen to your energy use, property and goals.'],
  [FaUsers, '02', 'Assess your site', 'We review your space, access, shading and system requirements.'],
  [FaLeaf, '03', 'Plan & install', 'We design the right solution and handle the installation.'],
  [FaShieldAlt, '04', 'Support your system', 'We help with commissioning, maintenance and future expansion.'],
]

const faqHighlights = [
  [FaCheckCircle, 'Expert Guidance', 'Get professional advice'],
  [FaLeaf, '100% Clean Energy', 'A greener, healthier tomorrow'],
  [FaBolt, 'Cost Saving', 'Reduce your electricity bills'],
]

function SolarHome() {
  return (
    <Box className="solar-home">
      <Box
        className="solar-home-hero"
        style={{ '--solar-hero-image': 'url(https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2000&q=90)' }}
      >
        <Container maxW="1400px" className="solar-home-hero-content">
          <Box maxW="590px">
            <Text className="solar-home-badge"><FaLeaf /> Clean energy, a brighter tomorrow</Text>
            <Heading className="solar-home-title">
              Make more of the energy above your <span>roof.</span>
            </Heading>
            <Text className="solar-home-intro">
              Solar solutions designed around your property, your power needs and what comes next.
            </Text>
            <Flex mt={5} gap={3} wrap="wrap">
              <Button className="solar-primary-cta" as={RouterLink} to="/solar/consultation" colorScheme="green" rightIcon={<FaArrowRight />}>
                Book a consultation
              </Button>
              <Button as={RouterLink} to="/solar/installation-quote" variant="outline" className="solar-home-secondary-button">
                Request an installation quote
              </Button>
            </Flex>
            <HStack className="solar-home-highlights" spacing={{ base: 4, md: 7 }} align="stretch">
              <Box><FaLeaf /><Text fontWeight="bold">Clean Energy</Text><Text>Lower your carbon footprint</Text></Box>
              <Box><FaBolt /><Text fontWeight="bold">Lower Bills</Text><Text>Save more, every month</Text></Box>
              <Box><FaHome /><Text fontWeight="bold">Energy Independence</Text><Text>Power your future</Text></Box>
            </HStack>
          </Box>
        </Container>
      </Box>

      <Box className="solar-home-practical">
        <Container maxW="1400px" py={{ base: 9, md: 12 }}>
          <Text className="solar-eyebrow">Solar, made practical</Text>
          <Heading className="solar-home-section-title">A better energy plan starts with the right team.</Heading>
          <Text className="solar-home-section-description">
            From your first questions to long-term system care, we make every step clear, considered and tailored to your site.
          </Text>
          <SolarBenefits />
        </Container>
      </Box>

      <Container maxW="1400px" py={{ base: 9, md: 12 }} className="solar-home-services">
        <Text className="solar-eyebrow">What we do</Text>
        <Heading className="solar-home-section-title solar-home-services-title">Solutions for every stage of solar</Heading>
        <Text className="solar-home-section-description">
          From residential rooftops to large-scale solar farms, we provide customized solutions that make clean energy simple, efficient and sustainable.
        </Text>
        <SolarServiceCards services={solarServices.slice(0, 6)} />
      </Container>

      <Box className="solar-home-cta">
        <Container maxW="1400px" className="solar-home-cta-inner">
          <Box className="solar-home-cta-copy" maxW="520px">
            <Text className="solar-eyebrow">Ready to go solar?</Text>
            <Heading>Let’s build a cleaner, brighter tomorrow.</Heading>
            <Text mt={2}>Get a free consultation and a personalised solar plan for your home or business.</Text>
            <Flex className="solar-home-cta-actions" mt={4} gap={3} wrap="wrap">
              <Button className="solar-primary-cta" as={RouterLink} to="/solar/consultation" colorScheme="green" rightIcon={<FaArrowRight />}>
                Book a consultation
              </Button>
              <Button as={RouterLink} to="/solar/services" variant="outline" className="solar-home-cta-secondary">
                Learn more
              </Button>
            </Flex>
          </Box>
        </Container>
      </Box>

      <Box className="solar-home-process">
        <Container maxW="1400px" py={{ base: 8, md: 10 }}>
          <Text className="solar-eyebrow">Our process</Text>
          <Heading className="solar-home-section-title">Every project begins with your property</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
            {projectSteps.map(([Icon, number, title, description]) => (
              <Box key={number} className="solar-process-step">
                <Box className="solar-process-icon"><Icon /></Box>
                <Box>
                  <Text className="solar-process-number">{number}</Text>
                  <Heading size="sm">{title}</Heading>
                  <Text>{description}</Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box className="solar-home-faq">
        <Container maxW="1400px" py={{ base: 7, md: 9 }} className="solar-home-faq-container">
          <Box className="solar-home-faq-grid">
            <Box className="solar-faq-intro">
              <Text className="solar-eyebrow">Common questions</Text>
              <Heading className="solar-home-section-title" mb={0}>Solar FAQs</Heading>
              <Text className="solar-home-section-description">
                Find answers to the most common questions about solar energy, installation, maintenance and more. If you don’t find what you’re looking for, feel free to reach out to our team.
              </Text>
            </Box>
            <Box className="solar-faq-visual" role="img" aria-label="Solar panels surrounded by greenery">
              <Box className="solar-faq-image-badge">
                <FaLeaf />
                <Text>Go Solar<br />Save Energy<br />Save Earth</Text>
              </Box>
            </Box>
            <SimpleGrid className="solar-faq-highlights" columns={3} spacing={2}>
              {faqHighlights.map(([Icon, title, description]) => (
                <Box key={title} className="solar-faq-highlight">
                  <Icon />
                  <Box>
                    <Text>{title}</Text>
                    <Text>{description}</Text>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
            <Box className="solar-faq-contact">
              <Button className="solar-primary-cta" as={RouterLink} to="/solar/contact" rightIcon={<FaArrowRight />}>
                Get in touch
              </Button>
            </Box>
            <Box className="solar-faq-questions">
              <SolarFaqList faqs={solarFaqs.slice(0, 5)} />
              <Button as={RouterLink} to="/solar/faqs" variant="link" colorScheme="green" rightIcon={<FaArrowRight />} mt={3}>
                View all FAQs
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box className="solar-home-bottom-cta" position="relative">
        <FaLeaf className="solar-bottom-cta-leaf solar-bottom-cta-leaf-one" />
        <FaLeaf className="solar-bottom-cta-leaf solar-bottom-cta-leaf-two" />
        <Container maxW="1400px" py={4} position="relative">
          <Flex align="center" justify="space-between" gap={4} wrap="wrap">
            <Text className="solar-bottom-cta-copy" fontWeight="bold">Let’s find the right solar solution<br className="solar-bottom-cta-break" /> for you.</Text>
            <Button className="solar-primary-cta" as={RouterLink} to="/solar/consultation" colorScheme="green" size="sm" rightIcon={<FaArrowRight />}>
              Book a consultation
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}

export default SolarHome

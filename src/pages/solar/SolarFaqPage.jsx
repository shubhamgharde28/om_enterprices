import { Box, Button, Container, Heading, Link, SimpleGrid, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import {
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaEnvelope,
  FaHeadphones,
  FaLeaf,
  FaPhoneAlt,
  FaShieldAlt,
  FaFileAlt,
} from 'react-icons/fa'
import { SolarFaqList } from '../../components/solar/SolarSections'
import { solarFaqs } from '../../solar/solarContent'

const faqHeroHighlights = [
  [FaLeaf, 'Expert Guidance', 'Get professional advice'],
  [FaBolt, '100% Clean Energy', 'A greener tomorrow'],
  [FaShieldAlt, 'Cost Saving', 'Reduce your bills'],
]

const faqSupportItems = [
  {
    icon: FaEnvelope,
    title: 'Email Us',
    detail: 'solar@omenterprises.com (placeholder)',
    note: 'We reply within 24 hours',
  },
  {
    icon: FaPhoneAlt,
    title: 'Call Us',
    detail: '09724916029',
    note: 'Mon - Sun, 9:00 AM - 6:00 PM',
  },
  {
    icon: FaHeadphones,
    title: 'Live Chat',
    detail: 'Chat with our team',
    note: 'Available 9 AM - 6 PM',
  },
]

const faqBenefits = [
  [FaShieldAlt, 'Reliable Information', 'Accurate and up-to-date details'],
  [FaHeadphones, 'Expert Support', 'From our experienced team'],
  [FaFileAlt, 'Easy Process', 'Simple and transparent'],
]

function SolarFaqPage() {
  return (
    <Box className="solar-faq-page">
      <Box className="solar-faq-page-hero">
        <Container maxW="1400px" className="solar-faq-page-hero-inner">
          <Box className="solar-faq-page-hero-copy">
            <Text className="solar-eyebrow">Helpful answers</Text>
            <Heading as="h1">Frequently Asked <span>Questions</span></Heading>
            <Text>
              Find quick answers to the most common questions about solar energy, installation, maintenance and more. If you don’t find what you’re looking for, feel free to reach out to us.
            </Text>
            <SimpleGrid className="solar-faq-page-highlights" columns={3} spacing={3}>
              {faqHeroHighlights.map(([Icon, title, detail]) => (
                <Box key={title}>
                  <Icon />
                  <Box>
                    <Text>{title}</Text>
                    <Text>{detail}</Text>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Box className="solar-faq-page-visual" role="img" aria-label="Solar panels on a home surrounded by greenery" />
        </Container>
      </Box>

      <Container maxW="1400px" className="solar-faq-page-main">
        <Box className="solar-faq-page-intro-card">
          <Text className="solar-eyebrow">Solar FAQs</Text>
          <Heading size="lg">Find Answers to Your Solar Queries</Heading>
          <Text className="solar-faq-intro-description">
            Explore answers to the most common questions about solar panels, system design, installation, maintenance, costs and more. Browse through our FAQs or get in touch with our experts for personalized support.
          </Text>
          <Box className="solar-faq-benefits">
            {faqBenefits.map(([Icon, title, detail]) => (
              <Box key={title}>
                <Box className="solar-faq-benefit-icon"><Icon /></Box>
                <Box>
                  <Text>{title}</Text>
                  <Text>{detail}</Text>
                </Box>
              </Box>
            ))}
          </Box>
          <Button className="solar-primary-cta" as={RouterLink} to="/solar/request/consultation" rightIcon={<FaArrowRight />}>
            Book a consultation
          </Button>
        </Box>

        <Box className="solar-faq-support-card">
          <Heading size="sm">Need Help?</Heading>
          <Text className="solar-faq-support-intro">Our team is here to assist you with any solar related queries.</Text>
          {faqSupportItems.map(({ icon: Icon, title, detail, note }) => (
            <Box className="solar-faq-support-item" key={title}>
              <Box className="solar-faq-support-icon"><Icon /></Box>
              <Box>
                <Text>{title}</Text>
                <Text>{detail}</Text>
                <Text>{note}</Text>
              </Box>
            </Box>
          ))}
        </Box>

        <Box className="solar-faq-page-questions">
          <SolarFaqList faqs={solarFaqs} />
        </Box>

        <Box className="solar-faq-bottom-cta">
          <Box className="solar-faq-bottom-icon"><FaLeaf /></Box>
          <Box>
            <Heading size="sm">Still have a question?</Heading>
            <Text>Our team is always here to help you with any solar related queries.</Text>
          </Box>
          <Link as={RouterLink} to="/solar/contact" className="solar-faq-bottom-link">
            Get in touch <FaArrowRight />
          </Link>
        </Box>
      </Container>
    </Box>
  )
}

export default SolarFaqPage

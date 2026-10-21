import { Box, Button, Container, Heading, Image, Link, SimpleGrid, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import {
  FaArrowRight,
  FaAward,
  FaBolt,
  FaCheckCircle,
  FaHandsHelping,
  FaHeart,
  FaLeaf,
  FaShieldAlt,
  FaTools,
  FaUserTie,
} from 'react-icons/fa'
import { solarServices } from '../../solar/solarContent'
import '../../styles/solar-about.css'

const stats = [
  ['5+', 'Years of Experience'],
  ['500+', 'Happy Customers'],
  ['300+', 'Installations Completed'],
  ['100%', 'Customer Satisfaction'],
]

const bottomStats = [
  [FaLeaf, '5+', 'Years of Experience'],
  [FaAward, '500+', 'Happy Customers'],
  [FaTools, '300+', 'Installations Completed'],
  [FaShieldAlt, '100%', 'Customer Satisfaction'],
]

const processSteps = [
  [FaLeaf, '01', 'Understand Your Needs', 'We listen, assess your energy goals and guide you towards a suitable solution.'],
  [FaBolt, '02', 'Custom Design', 'A system planned for your property, energy usage and future needs.'],
  [FaUserTie, '03', 'Professional Installation', 'Our team coordinates a careful installation, checks and handover.'],
  [FaHeart, '04', 'Ongoing Support', 'We provide maintenance, service and help long after installation.'],
]

const principles = [
  {
    icon: FaShieldAlt,
    title: 'Transparency',
    detail: 'Honest guidance, clear pricing and no hidden costs.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=700&q=85',
  },
  {
    icon: FaAward,
    title: 'Quality',
    detail: 'We use only premium products and proven installation practices.',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=700&q=85',
  },
  {
    icon: FaHandsHelping,
    title: 'Long-term Commitment',
    detail: 'Here for your system’s performance, service and future needs.',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=700&q=85',
  },
]

const solutions = [
  {
    title: 'Residential Solar',
    detail: 'Clean energy designed around your home.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=85',
    slug: 'residential',
  },
  {
    title: 'Commercial Solar',
    detail: 'Smarter energy for growing businesses.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=85',
    slug: 'commercial',
  },
  {
    title: 'Solar Panel Installation',
    detail: 'From system design to expert installation.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=700&q=85',
    slug: 'installation',
  },
  {
    title: 'Maintenance & Inspection',
    detail: 'Keep your solar system performing at its best.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=700&q=85',
    slug: 'maintenance',
  },
]

function SolarAboutPage() {
  const installation = solarServices.find((service) => service.slug === 'installation')

  return (
    <Box className="solar-about-page-v2">
      <Box className="solar-about-hero">
        <Container maxW="1400px" className="solar-about-hero-inner">
          <Box className="solar-about-hero-copy">
            <Text className="solar-eyebrow">About us</Text>
            <Heading as="h1">Powering a cleaner, brighter tomorrow</Heading>
            <Text>
              OM Enterprises, through Sunward Solar, brings reliable and sustainable solar energy solutions to homes, businesses and industries. We are committed to making clean energy simple, accessible and affordable.
            </Text>
            <Box className="solar-about-hero-actions">
              <Button className="solar-about-primary" as={RouterLink} to="/solar/request/consultation" rightIcon={<FaArrowRight />}>
                Talk to our team
              </Button>
              <Button as={RouterLink} to="/solar/services" className="solar-about-secondary">
                Explore our services
              </Button>
            </Box>
          </Box>
          <Box className="solar-about-hero-photo" role="img" aria-label="Modern home powered by rooftop solar panels" />
          <Box className="solar-about-partner-badge solar-about-hero-badge">
            <Text>Our Trusted Partner</Text>
            <Heading>TATA POWER SOLAR</Heading>
            <Text>Authorized Channel Partner</Text>
          </Box>
          <SimpleGrid className="solar-about-stats" columns={4} spacing={0}>
            {stats.map(([value, label]) => (
              <Box key={label}>
                <Text>{value}</Text>
                <Text>{label}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="1400px" className="solar-about-intro">
        <Box className="solar-about-intro-image-wrap">
          <Image
            src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=85"
            alt="Solar panels catching the evening sunlight"
            className="solar-about-intro-image"
          />
          <Text className="solar-about-image-caption">Clean Energy<br />for a Sustainable<br />Future</Text>
        </Box>
        <Box className="solar-about-intro-copy">
          <Text className="solar-eyebrow">About Sunward Solar</Text>
          <Heading>A trusted name in solar energy solutions</Heading>
          <Text>
            Sunward Solar is a dedicated solar services brand by OM Enterprises, focused on providing end-to-end solar solutions for residential, commercial and industrial sectors. We believe in clean energy, long-term value and a greener planet.
          </Text>
          <Text>
            With the backing of Tata Power Solar, we bring world-class technology, expertise and service to your doorstep.
          </Text>
          <Box className="solar-about-partner-strip">
            <Box className="solar-about-partner-logo"><FaBolt /><Text>TATA POWER SOLAR</Text></Box>
            <Box>
              <Heading>Authorized Channel Partner</Heading>
              <Text>Get genuine products, expert installation and reliable after-sales support.</Text>
            </Box>
          </Box>
        </Box>
      </Container>

      <Box className="solar-about-process">
        <Container maxW="1400px" className="solar-about-process-inner">
          <Box className="solar-about-process-copy">
            <Text className="solar-eyebrow">Our approach</Text>
            <Heading>From consultation to care, we’re with you every step.</Heading>
            <Text>
              We take a customer-first approach, ensuring you get the right solution for your unique needs — today and for years to come.
            </Text>
            <Button className="solar-about-primary" as={RouterLink} to="/solar/request/consultation" rightIcon={<FaArrowRight />}>
              Our process
            </Button>
          </Box>
          <SimpleGrid className="solar-about-steps" columns={4} spacing={3}>
            {processSteps.map(([Icon, number, title, detail]) => (
              <Box className="solar-about-step" key={number}>
                <Box className="solar-about-step-icon"><Icon /></Box>
                <Text className="solar-about-step-number">{number}</Text>
                <Heading>{title}</Heading>
                <Text>{detail}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box className="solar-about-tata">
        <Container maxW="1400px" className="solar-about-tata-inner">
          <Box className="solar-about-tata-copy">
            <Text className="solar-eyebrow">Our partnership</Text>
            <Heading>Tata Power Solar Services</Heading>
            <Text>
              As an authorized channel partner of Tata Power Solar, we offer a complete range of high-performance solar solutions backed by world-class technology and proven reliability.
            </Text>
            <Box className="solar-about-check-list">
              {[
                'Solar solutions for homes, businesses and industries',
                'High-efficiency solar panels and inverters',
                'Expert installation and commissioning',
                'After-sales service and performance monitoring',
              ].map((item) => <Text key={item}><FaCheckCircle />{item}</Text>)}
            </Box>
            <Link as={RouterLink} to="/solar/services" className="solar-about-primary solar-about-link">
              Explore Tata Solar Products <FaArrowRight />
            </Link>
          </Box>
          <Box className="solar-about-tata-image-wrap">
            <Image src={installation?.image} alt="Solar technician installing rooftop solar panels" />
            <Box className="solar-about-image-label">
              <Text>Trusted Technology.<br />Lasting Impact.</Text>
              <strong>TATA POWER SOLAR</strong>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxW="1400px" className="solar-about-values">
        <Box className="solar-about-values-main">
          <Box className="solar-about-section-heading">
            <Text className="solar-eyebrow">Our principles</Text>
            <Heading>Built on trust. Driven by sustainability.</Heading>
          </Box>
          <SimpleGrid className="solar-about-value-cards" columns={3} spacing={3}>
            {principles.map(({ icon: Icon, title, detail, image }) => (
              <Box className="solar-about-value-card" key={title}>
                <Image src={image} alt="" loading="lazy" />
                <Box className="solar-about-value-copy">
                  <Icon />
                  <Heading>{title}</Heading>
                  <Text>{detail}</Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
        <Box className="solar-about-long-term">
          <Image src="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=700&q=85" alt="" loading="lazy" />
          <Heading>More than just solar, we’re your long-term energy partner.</Heading>
          <Text>Together, we build a cleaner, more sustainable future.</Text>
          <Button className="solar-about-primary" as={RouterLink} to="/solar/request/consultation" rightIcon={<FaArrowRight />}>
            Book a consultation
          </Button>
        </Box>
      </Container>

      <Container maxW="1400px" className="solar-about-solutions">
        <Box className="solar-about-section-heading">
          <Text className="solar-eyebrow">Our solutions</Text>
          <Heading>Solar solutions for every need</Heading>
        </Box>
        <SimpleGrid className="solar-about-solution-grid" columns={4} spacing={3}>
          {solutions.map((solution) => (
            <Link
              as={RouterLink}
              to={`/solar/services/${solution.slug}`}
              className="solar-about-solution-card"
              key={solution.slug}
            >
              <Image src={solution.image} alt="" loading="lazy" />
              <Box>
                <Heading>{solution.title}</Heading>
                <Text>{solution.detail}</Text>
                <FaArrowRight />
              </Box>
            </Link>
          ))}
        </SimpleGrid>
      </Container>

      <Box className="solar-about-bottom-cta">
        <Container maxW="1400px" className="solar-about-bottom-inner">
          <Box>
            <Heading>Thousands of homes and businesses already trust us. Be the next.</Heading>
            <Button className="solar-about-primary" as={RouterLink} to="/solar/request/consultation">
              Get a consultation
            </Button>
          </Box>
          <SimpleGrid columns={4} className="solar-about-bottom-stats" spacing={3}>
            {bottomStats.map(([Icon, value, label]) => (
              <Box key={label}>
                <Icon />
                <Text>{value}</Text>
                <Text>{label}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  )
}

export default SolarAboutPage

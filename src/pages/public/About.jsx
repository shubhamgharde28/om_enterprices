import { useState } from 'react'
import {
  Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel,
  Avatar, Box, Button, Container, Flex, Grid, Heading, Icon, Image, SimpleGrid, Text,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FaQuoteLeft, FaStar, FaStarHalfAlt, FaTint } from 'react-icons/fa'
import { mockTestimonials } from '../../data/mockData'
import {
  FiArrowRight, FiAward, FiCheckCircle, FiChevronLeft, FiChevronRight, FiClock, FiDroplet, FiEye, FiHeart,
  FiMapPin, FiMessageCircle, FiRefreshCw, FiSearch, FiSettings, FiShield, FiStar, FiTarget,
  FiThumbsUp, FiTool, FiTruck, FiUsers, FiCalendar, FiPackage,
} from 'react-icons/fi'

const IMG = {
  hero: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=85',
  story: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1200&q=85',
  why: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85',
}

/* ---------- Design tokens (match the home page) ---------- */
const NAVY = '#102D4F'
const BLUE = '#248BDD'
const SOFT = 'blue.50'
const cardShadow = '0 6px 24px rgba(16, 60, 110, 0.07)'
const gradientBtn = { bgGradient: 'linear(to-r, #2196F3, #1565C0)', color: 'white' }

/* ---------- Static content ---------- */
const trust = [
  { icon: FiDroplet, title: '100% Pure Water', sub: 'Healthy for family' },
  { icon: FiTool, title: 'Expert Installation', sub: 'Hassle-free setup' },
  { icon: FiShield, title: 'Reliable Support', sub: 'Always with you' },
  { icon: FiPackage, title: 'Genuine Parts', sub: '100% original' },
]

const stats = [
  { icon: FiAward, value: '10+', label: 'Years of Experience' },
  { icon: FiUsers, value: '5,000+', label: 'Happy Customers' },
  { icon: FiShield, value: '100%', label: 'Genuine Products' },
  { icon: FiClock, value: '24/7', label: 'Customer Support' },
]

const storyPoints = [
  'Authorised sales of trusted purifier brands',
  'Certified technicians for every service visit',
  'Transparent pricing with no hidden charges',
  'Genuine spare parts with warranty support',
]

const missionVision = [
  {
    icon: FiTarget, title: 'Our Mission',
    text: 'To make safe, clean and mineral-balanced drinking water accessible to every home and business through quality products and dependable service.',
  },
  {
    icon: FiEye, title: 'Our Vision',
    text: 'To become the most trusted name in water purification across Karnataka, known for honesty, care and long-term relationships with our customers.',
  },
]

const values = [
  { icon: FiDroplet, title: 'Purity First', text: 'Every product and service we offer is chosen to deliver water you can trust.' },
  { icon: FiShield, title: 'Trust & Honesty', text: 'Clear advice, fair prices and genuine parts — always.' },
  { icon: FiHeart, title: 'Customer First', text: 'Your family’s health and convenience guide every decision we make.' },
  { icon: FiClock, title: 'On-time Service', text: 'We respect your time and arrive when we say we will.' },
  { icon: FiSettings, title: 'Technical Excellence', text: 'Trained technicians who diagnose accurately and fix it right the first time.' },
  { icon: FiRefreshCw, title: 'Long-term Care', text: 'From installation to AMC, we stay with you for the life of your purifier.' },
]

const offerings = [
  {
    icon: FiPackage, title: 'Purifier Sales',
    text: 'RO, UV and UF purifiers from leading brands for homes, offices and shops.',
    image: 'https://roservicenearme-waterpurifierservice.in/img/ro.png',
  },
  {
    icon: FiTool, title: 'Installation',
    text: 'Professional, neat and safe setup with a quick demo on how to use it.',
    image: 'https://roservicejabalpur.in/images/banner.png',
  },
  {
    icon: FiSettings, title: 'Servicing & AMC',
    text: 'Regular filter changes and cleaning plans that keep performance at its best.',
    image: 'https://octaprosolution.com/wp-content/uploads/2023/09/ro.png',
  },
  {
    icon: FiRefreshCw, title: 'Repair & Replacement',
    text: 'Fast diagnosis, dependable repairs and upgrades when it’s time for a new system.',
    image: 'https://www.houseofpurifier.com/HtmlResource/img/banner1.png',
  },
]

const milestones = [
  { year: '2015', title: 'Where it began', text: 'OM Enterprises started as a small purifier sales and service shop in Bengaluru.' },
  { year: '2018', title: 'Growing trust', text: 'Crossed 1,000 happy families and expanded our certified technician team.' },
  { year: '2021', title: 'Service plans', text: 'Introduced AMC plans for homes and businesses with extended warranty care.' },
  { year: '2024', title: 'Wider reach', text: 'Added commercial installations and faster doorstep support across the city.' },
  { year: '2026', title: 'Today', text: 'Serving 5,000+ customers with a complete range of products and services.' },
]

const whyList = [
  { icon: FiUsers, title: 'Certified technicians', text: 'Background-verified and trained on every major brand.' },
  { icon: FiCheckCircle, title: '100% genuine parts', text: 'Original filters and spares with warranty.' },
  { icon: FiTruck, title: 'Doorstep convenience', text: 'Book online and we come to you, on time.' },
  { icon: FiThumbsUp, title: 'Honest recommendations', text: 'We suggest only what your water actually needs.' },
]

const steps = [
  { icon: FiCalendar, title: 'Book Service', text: 'Schedule your service in just a few clicks.' },
  { icon: FiUsers, title: 'Technician Assigned', text: 'We assign a certified technician.' },
  { icon: FiSearch, title: 'Visit & Diagnose', text: 'We inspect, explain and quote clearly.' },
  { icon: FiCheckCircle, title: 'Service Completed', text: 'Your purifier is serviced and ready.' },
]

const customerCommitments = [
  {
    icon: FiSearch,
    title: 'Advice that fits your needs',
    text: 'We help you compare options and choose a purifier suited to your water, space and daily use.',
  },
  {
    icon: FiTool,
    title: 'Care from trained professionals',
    text: 'From installation to repair, we work carefully and explain what your system needs.',
  },
  {
    icon: FiShield,
    title: 'Support beyond installation',
    text: 'Genuine parts, maintenance and helpful follow-up keep your purifier working reliably.',
  },
]

const faqs = [
  { q: 'Which areas do you serve?', a: 'We are based in Bhandara, Maharashtra. Contact us to confirm availability for your location.' },
  { q: 'Do you service purifiers bought elsewhere?', a: 'Yes. Our technicians service and repair most major RO, UV and UF purifier brands.' },
  { q: 'Are the spare parts genuine?', a: 'Always. We use 100% original parts, and they come with warranty support.' },
  { q: 'What does an AMC plan include?', a: 'Scheduled servicing visits, filter checks and priority support. Parts coverage depends on the plan you choose.' },
  { q: 'How quickly can I get a technician?', a: 'Most bookings are scheduled within 24–48 hours, and urgent requests are prioritised where possible.' },
]

/* ---------- Small building blocks ---------- */
const Pill = ({ children }) => (
  <Box
    className="about-eyebrow"
    display="inline-block" bg="blue.50" color="blue.600" fontSize="10px" fontWeight="700"
    letterSpacing="0.12em" textTransform="uppercase" borderRadius="full" px={3} py={1} mb={4}
  >
    {children}
  </Box>
)

const SectionHeader = ({ eyebrow, title, highlight, text, align = 'center', maxW = '620px', titleClassName = '' }) => (
  <Box className="about-section-heading" textAlign={{ base: 'center', md: align }} mb={{ base: 8, md: 12 }}
       mx={align === 'center' ? 'auto' : 0} maxW={align === 'center' ? maxW : '100%'}>
    <Pill>{eyebrow}</Pill>
    <Heading className={`about-section-title ${titleClassName}`} as="h2" color={NAVY} fontWeight="800" lineHeight="1.15" letterSpacing="-0.02em"
             fontSize={{ base: '2xl', md: '4xl' }}>
      {title}
      {highlight && <Text as="span" display="block" color={BLUE}>{highlight}</Text>}
    </Heading>
    {text && <Text mt={4} color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>{text}</Text>}
  </Box>
)

const IconCircle = ({ icon, size = 12, className }) => (
  <Flex className={className} w={size} h={size} borderRadius="full" bg="blue.50" color="blue.500" align="center" justify="center" flexShrink={0}>
    <Icon as={icon} boxSize={`${size * 1.8}px`} />
  </Flex>
)

const Card = ({ children, ...rest }) => (
  <Box bg="white" borderRadius="2xl" p={{ base: 5, md: 6 }} boxShadow={cardShadow}
       borderWidth="1px" borderColor="blue.50" h="100%" {...rest}>
    {children}
  </Box>
)

const Section = ({ children, bg, ...rest }) => (
  <Box as="section" className="about-page-section" bg={bg} {...rest}>
    <Container maxW="1400px" px={0}>{children}</Container>
  </Box>
)

const PhotoFrame = ({ src, alt, h }) => (
  <Image src={src} alt={alt} w="100%" h={h} objectFit="cover" borderRadius="3xl" boxShadow="0 20px 50px rgba(16, 60, 110, 0.15)"
         fallback={<Box w="100%" h={h} borderRadius="3xl" bgGradient="linear(to-br, blue.100, blue.50)" />} />
)

/* ---------- Page ---------- */
function About() {
  const [testimonialStart, setTestimonialStart] = useState(0)
  const visibleTestimonials = 3
  const testimonialPageCount = Math.max(1, mockTestimonials.length - visibleTestimonials + 1)
  const averageRating = mockTestimonials.length
    ? (mockTestimonials.reduce((total, testimonial) => total + Number(testimonial.rating || 0), 0) / mockTestimonials.length).toFixed(1)
    : '0.0'

  return (
    <Box className="about-page" bg="white" overflow="hidden">
      {/* 1. HERO */}
      <Section>
        <Grid templateColumns={{ base: '1fr', lg: '1.05fr 1fr' }} gap={{ base: 10, lg: 16 }} alignItems="center">
          <Box textAlign={{ base: 'center', lg: 'left' }}>
            <Pill>About Us</Pill>
            <Heading className="about-page-title" as="h1" color={NAVY} fontWeight="800" lineHeight="1.1" letterSpacing="-0.02em"
                     fontSize="44px">
              Pure Water,
              <Text as="span" display="block" color={BLUE}>Trusted Care</Text>
            </Heading>
            <Text mt={5} color="gray.600" fontSize={{ base: 'md', md: 'lg' }} maxW="520px" mx={{ base: 'auto', lg: 0 }}>
              OM Enterprises helps families and businesses access safe, clean and mineral-balanced drinking
              water with premium products and responsive service support.
            </Text>
            <Flex mt={7} gap={3} justify={{ base: 'center', lg: 'flex-start' }} wrap="wrap">
              <Button className="about-page-button" as={RouterLink} to="/services" size="md" borderRadius="full" px={7} rightIcon={<FiArrowRight />}
                      {...gradientBtn} _hover={{ opacity: 0.92 }}>
                Book a Service
              </Button>
              <Button className="about-page-button" as={RouterLink} to="/contact" size="md" borderRadius="full" px={7} variant="outline"
                      borderColor="blue.200" color="blue.600" _hover={{ bg: 'blue.50' }}>
                Contact Us
              </Button>
            </Flex>
            <SimpleGrid className="about-trust-list" columns={{ base: 2, lg: 4 }} spacing={4} mt={10} textAlign="left">
              {trust.map((t) => (
                <Flex className="about-trust-item" key={t.title} gap={3} align="center" justify={{ base: 'center', sm: 'flex-start' }}>
                  <IconCircle icon={t.icon} size={10} />
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color={NAVY}>{t.title}</Text>
                    <Text fontSize="xs" color="gray.500">{t.sub}</Text>
                  </Box>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>

          <Box position="relative">
            <PhotoFrame src={IMG.hero} alt="OM Enterprises team" h={{ base: '280px', md: '460px' }} />
            <Box position="absolute" bottom={{ base: -5, md: -6 }} left={{ base: 4, md: -6 }} bg="white" borderRadius="2xl"
                 boxShadow={cardShadow} px={5} py={4}>
              <Text className="about-stat-value" fontSize="3xl" fontWeight="800" color={BLUE} lineHeight="1">10+</Text>
              <Text fontSize="xs" color="gray.500">Years of trusted service</Text>
            </Box>
            <Flex position="absolute" top={{ base: 4, md: 8 }} right={{ base: 4, md: -4 }} bg="white" borderRadius="2xl"
                  boxShadow={cardShadow} px={4} py={3} align="center" gap={3}>
              <IconCircle icon={FiStar} size={9} />
              <Box>
                <Text fontSize="sm" fontWeight="700" color={NAVY}>4.5 / 5</Text>
                <Text fontSize="10px" color="gray.500">Customer rating</Text>
              </Box>
            </Flex>
          </Box>
        </Grid>
      </Section>

      {/* 2. STATS */}
      <Section>
        <Card p={{ base: 4, md: 8 }}>
          <SimpleGrid className="about-stats-grid" columns={{ base: 2, md: 4 }} spacing={0}>
            {stats.map((s, i) => (
              <Flex key={s.label} direction="column" align="center" textAlign="center" py={{ base: 4, md: 2 }} px={2}
                    borderLeftWidth={{ base: i % 2 ? '1px' : 0, md: i ? '1px' : 0 }}
                    borderTopWidth={{ base: i > 1 ? '1px' : 0, md: 0 }} borderColor="blue.50">
                <IconCircle icon={s.icon} size={10} />
                <Text className="about-stat-value" mt={3} fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={NAVY}>{s.value}</Text>
                <Text fontSize="xs" color="gray.500">{s.label}</Text>
              </Flex>
            ))}
          </SimpleGrid>
        </Card>
      </Section>

      {/* 3. OUR STORY */}
      <Section>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1.1fr' }} gap={{ base: 10, lg: 16 }} alignItems="center">
          <Box order={{ base: 2, lg: 1 }}>
            <PhotoFrame src={IMG.story} alt="Our story" h={{ base: '280px', md: '420px' }} />
          </Box>
          <Box order={{ base: 1, lg: 2 }}>
            <SectionHeader align="left" eyebrow="Our Story" title="Built on a simple belief:" highlight="clean water is a right" titleClassName="about-story-title" />
            <Text className="about-story-copy" color="gray.600" mb={4}>
              OM Enterprises began with one goal — to help families stop worrying about what’s in their glass.
              What started as a small purifier shop has grown into a complete water-care partner for homes,
              offices and businesses.
            </Text>
            <Text className="about-story-copy" color="gray.600" mb={6}>
              Over the years we’ve learned that a good purifier is only half the story. The other half is the
              people who install it, maintain it and answer your call when you need help.
            </Text>
            <SimpleGrid className="about-story-points" columns={{ base: 1, sm: 2 }} spacing={3}>
              {storyPoints.map((p) => (
                <Flex className="about-story-point" key={p} gap={2} align="flex-start">
                  <Icon as={FiCheckCircle} color="blue.500" mt="3px" flexShrink={0} />
                  <Text className="about-story-point-text" fontSize="sm" color={NAVY}>{p}</Text>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>
        </Grid>
      </Section>

      {/* 4. MISSION & VISION */}
      <Section bg="#F3F9FE">
        <SectionHeader eyebrow="Purpose" title="What drives" highlight="everything we do" titleClassName="about-mission-vision-title" />
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {missionVision.map((m) => (
            <Card className="about-mission-vision-card" key={m.title} p={{ base: 6, md: 9 }}>
              <IconCircle className="about-mission-vision-icon" icon={m.icon} size={14} />
              <Heading className="about-mission-vision-card-title" as="h3" fontSize={{ base: '14px', md: 'xl' }} color={NAVY} mt={5} mb={3}>{m.title}</Heading>
              <Text color="gray.600">{m.text}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Section>

      {/* 5. CORE VALUES */}
      <Section>
        <SectionHeader eyebrow="Our Values" title="The principles behind" highlight="every purifier we serve"
                       titleClassName="about-values-title"
                       text="These values shape how we sell, install, repair and care for your water purifier." />
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5}>
          {values.map((v) => (
            <Card className="about-value-card" key={v.title}>
              <IconCircle className="about-value-icon" icon={v.icon} />
              <Heading className="about-value-card-title" as="h3" fontSize="md" color={NAVY} mt={4} mb={2}>{v.title}</Heading>
              <Text className="about-value-card-description" fontSize="sm" color="gray.500">{v.text}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Section>

      {/* 6. WHAT WE DO */}
      <Section bg="#F3F9FE">
        <SectionHeader eyebrow="What We Do" title="Complete care for" highlight="your water purifier"
                       titleClassName="about-mobile-heading-23"
                       text="From choosing the right system to keeping it running for years." />
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5}>
          {offerings.map((o) => (
            <Card className="about-offering-card" key={o.title} textAlign="center">
              <Image className="about-offering-image" src={o.image} alt={o.title} loading="lazy" />
              <Flex justify="center"><IconCircle icon={o.icon} size={14} /></Flex>
              <Heading className="about-offering-card-title" as="h3" fontSize="md" color={NAVY} mt={4} mb={2}>{o.title}</Heading>
              <Text className="about-offering-card-description" fontSize="sm" color="gray.500">{o.text}</Text>
            </Card>
          ))}
        </SimpleGrid>
        <Flex justify="center" mt={10}>
          <Button className="about-page-button" as={RouterLink} to="/services" borderRadius="full" px={8} size="sm" rightIcon={<FiArrowRight />}
                  {...gradientBtn} _hover={{ opacity: 0.92 }}>
            Explore Services
          </Button>
        </Flex>
      </Section>

      {/* 7. JOURNEY TIMELINE */}
      <Section>
        <SectionHeader eyebrow="Our Journey" title="A decade of" highlight="growing together"
                       titleClassName="about-mobile-heading-23" />
        <Box position="relative" maxW="760px" mx="auto">
          <Box position="absolute" left={{ base: '19px', md: '50%' }} top={0} bottom={0} w="2px" bg="blue.100"
               transform={{ md: 'translateX(-1px)' }} />
          {milestones.map((m, i) => {
            const left = i % 2 === 0
            return (
              <Flex key={m.year} mb={8} position="relative" direction={{ base: 'row', md: left ? 'row' : 'row-reverse' }}
                    align="flex-start">
                <Flex w={{ base: '40px', md: '50%' }} justify={{ base: 'flex-start', md: left ? 'flex-end' : 'flex-start' }}
                      pr={{ md: left ? 10 : 0 }} pl={{ md: left ? 0 : 10 }} display={{ base: 'none', md: 'flex' }}>
                  <Text fontSize="2xl" fontWeight="800" color={BLUE}>{m.year}</Text>
                </Flex>
                <Box position="absolute" left={{ base: '12px', md: '50%' }} top="6px" w="16px" h="16px" borderRadius="full"
                     bg="white" borderWidth="4px" borderColor={BLUE} transform={{ md: 'translateX(-50%)' }} />
                <Box ml={{ base: 12, md: 0 }} w={{ base: 'auto', md: '50%' }} pl={{ md: left ? 10 : 0 }} pr={{ md: left ? 0 : 10 }}>
                  <Text className="about-milestone-year" display={{ md: 'none' }} fontSize="lg" fontWeight="800" color={BLUE}>{m.year}</Text>
                  <Card className="about-milestone-card" p={4}>
                    <Text className="about-milestone-title" fontWeight="700" color={NAVY} mb={1}>{m.title}</Text>
                    <Text className="about-milestone-description" fontSize="sm" color="gray.500">{m.text}</Text>
                  </Card>
                </Box>
              </Flex>
            )
          })}
        </Box>
      </Section>

      {/* 8. WHY CHOOSE US */}
      <Section bg="#F3F9FE">
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 10, lg: 16 }} alignItems="center">
          <Box>
            <SectionHeader align="left" eyebrow="Why Choose OM Enterprises" title="More than just"
                           highlight="a water purifier"
                           titleClassName="about-mobile-heading-23"
                           text="We’re committed to delivering clean water, reliable service and complete customer satisfaction." />
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              {whyList.map((w) => (
                <Card className="about-why-card" key={w.title} p={4}>
                  <Flex gap={3}>
                    <IconCircle icon={w.icon} size={10} />
                    <Box>
                      <Text className="about-why-card-title" fontSize="sm" fontWeight="700" color={NAVY}>{w.title}</Text>
                      <Text className="about-why-card-description" fontSize="xs" color="gray.500" mt={1}>{w.text}</Text>
                    </Box>
                  </Flex>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
          <PhotoFrame src={IMG.why} alt="Happy family drinking clean water" h={{ base: '280px', md: '460px' }} />
        </Grid>
      </Section>

      {/* 9. HOW WE WORK */}
      <Section>
        <SectionHeader eyebrow="How It Works" title="Getting pure water is" highlight="simple and hassle-free"
                       titleClassName="about-mobile-heading-23" />
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5}>
          {steps.map((s, i) => (
            <Card key={s.title} position="relative">
              <Flex align="center" justify="space-between" mb={4}>
                <IconCircle icon={s.icon} size={11} />
                <Flex w={7} h={7} borderRadius="full" bg={NAVY} color="white" fontSize="xs" fontWeight="700"
                      align="center" justify="center">{i + 1}</Flex>
              </Flex>
              <Text className="about-step-title" fontWeight="700" color={NAVY} mb={1}>{s.title}</Text>
              <Text className="about-step-description" fontSize="sm" color="gray.500">{s.text}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Section>

      {/* 10. CUSTOMER COMMITMENTS */}
      <Section bg="#F3F9FE">
        <SectionHeader eyebrow="Our Commitment" title="Water care you can" highlight="count on"
                       titleClassName="about-mobile-heading-23"
                       text="From choosing a purifier to keeping it in good condition, we make support clear and dependable." />
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          {customerCommitments.map((commitment) => (
            <Card className="about-commitment-card" key={commitment.title}>
              <IconCircle className="about-commitment-icon" icon={commitment.icon} size={12} />
              <Text className="about-commitment-title" mt={4} fontWeight="700" color={NAVY}>{commitment.title}</Text>
              <Text className="about-commitment-description" fontSize="sm" color="gray.500" mt={2}>{commitment.text}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Section>

      {/* 11. TESTIMONIALS */}
      <Section className="about-testimonials-section">
        <SectionHeader eyebrow="Testimonials" title="What our" highlight="customers say"
                       titleClassName="about-mobile-heading-23"
                       text="Real people. Real experiences. Trusted by thousands." />
        <Box className="about-testimonial-showcase">
          <Flex className="about-testimonial-summary" direction="column" align="center">
            <Flex className="about-testimonial-summary-rating" align="center" gap={2}>
              <Flex className="about-testimonial-summary-stars" aria-label={`${averageRating} out of 5 stars`}>
                {[...Array(5)].map((_, index) => <FaStar key={index} />)}
              </Flex>
              <span className="about-testimonial-summary-divider" />
              <strong>{averageRating}/5</strong>
            </Flex>
            <Text>from 257+ happy customers</Text>
          </Flex>

          <div className="about-testimonial-list">
            {mockTestimonials.slice(testimonialStart, testimonialStart + visibleTestimonials).map((testimonial) => (
              <article className="about-testimonial-card" key={testimonial.id}>
                <div className="about-testimonial-review-row">
                  <span className="about-testimonial-quote"><FaQuoteLeft /></span>
                  <div className="about-testimonial-review-content">
                    <p className="about-testimonial-review">“{testimonial.review}”</p>
                    <div className="about-testimonial-stars">
                      {[...Array(Math.floor(Number(testimonial.rating) || 0))].map((_, index) => <FaStar key={index} />)}
                      {Number(testimonial.rating) % 1 >= 0.5 && <FaStarHalfAlt />}
                      <span className="about-testimonial-rating">{testimonial.rating}/5</span>
                    </div>
                  </div>
                </div>
                <div className="about-testimonial-author">
                  <Avatar name={testimonial.customer_name} size="sm" bg="blue.50" color="blue.600" />
                  <div>
                    <p className="about-testimonial-name">{testimonial.customer_name}</p>
                    <p className="about-testimonial-date">{testimonial.date}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {testimonialPageCount > 1 && (
            <nav className="about-testimonial-pagination" aria-label="Testimonial pages">
              <button
                type="button"
                aria-label="Previous testimonials"
                onClick={() => setTestimonialStart((start) => (start - 1 + testimonialPageCount) % testimonialPageCount)}
              >
                <FiChevronLeft />
              </button>
              <div className="about-testimonial-dots">
                {[...Array(testimonialPageCount)].map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    className={index === testimonialStart ? 'is-active' : ''}
                    aria-label={`Show testimonial page ${index + 1}`}
                    aria-current={index === testimonialStart ? 'page' : undefined}
                    onClick={() => setTestimonialStart(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next testimonials"
                onClick={() => setTestimonialStart((start) => (start + 1) % testimonialPageCount)}
              >
                <FiChevronRight />
              </button>
            </nav>
          )}
        </Box>
      </Section>

      {/* 12. FAQ */}
      <Section bg="#F3F9FE">
        <SectionHeader eyebrow="FAQ" title="Questions we hear" highlight="most often"
                       titleClassName="about-mobile-heading-23" />
        <Grid className="about-faq-layout" templateColumns={{ base: '1fr', lg: 'minmax(0, 1.5fr) minmax(260px, 0.8fr)' }}
              gap={{ base: 6, lg: 8 }} alignItems="start">
          <Accordion allowToggle>
            {faqs.map((f) => (
              <AccordionItem key={f.q} border="none" mb={3} bg="white" borderRadius="xl" boxShadow={cardShadow}>
                <AccordionButton py={4} px={5} borderRadius="xl" _hover={{ bg: 'transparent' }}>
                  <Box className="about-faq-question" flex="1" textAlign="left" fontWeight="600" color={NAVY} fontSize="sm">{f.q}</Box>
                  <AccordionIcon color="blue.500" />
                </AccordionButton>
                <AccordionPanel className="about-faq-answer" px={5} pb={5} color="gray.500" fontSize="sm">{f.a}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="about-faq-help" p={{ base: 6, md: 7 }}>
            <IconCircle icon={FiMessageCircle} size={12} />
            <Heading as="h3" mt={4} mb={2}>Planning a service visit?</Heading>
            <Text color="gray.500" mb={5}>
              We service most major RO, UV and UF purifier brands in Bhandara and nearby areas.
            </Text>
            <Flex direction="column" gap={3} mb={6}>
              <Flex align="flex-start" gap={3}>
                <Icon as={FiMapPin} color="blue.500" mt="2px" flexShrink={0} />
                <Text color={NAVY}><strong>Service area</strong><br />Bhandara and nearby areas</Text>
              </Flex>
              <Flex align="flex-start" gap={3}>
                <Icon as={FiClock} color="blue.500" mt="2px" flexShrink={0} />
                <Text color={NAVY}><strong>Typical scheduling</strong><br />Within 24–48 hours</Text>
              </Flex>
            </Flex>
            <Button className="about-page-button" as={RouterLink} to="/contact" borderRadius="full" px={6} size="sm"
                    rightIcon={<FiArrowRight />} {...gradientBtn} _hover={{ opacity: 0.92 }}>
              Talk to Our Team
            </Button>
          </Card>
        </Grid>
      </Section>

      {/* 13. CTA */}
      <Section>
        <section className="home-cta-section about-page-cta">
          <div className="home-cta-icon"><FaTint /></div>
          <div>
            <h2>Need Water Purifier Service?</h2>
            <p>Book a service today and keep your water pure, safe and fresh.</p>
          </div>
          <RouterLink className="home-button home-button-light about-page-button" to="/book-service">
            Book a Service <FiArrowRight />
          </RouterLink>
        </section>
      </Section>
    </Box>
  )
}

export default About

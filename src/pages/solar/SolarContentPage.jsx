import { Box, Button, Container, Heading, Image, Text } from '@chakra-ui/react'
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import { SolarBenefits, SolarCallToAction, SolarSectionHeading } from '../../components/solar/SolarSections'
import { solarServices } from '../../solar/solarContent'

function SolarContentPage() {
  const { serviceSlug } = useParams()
  const service = solarServices.find((item) => item.slug === serviceSlug)
  if (!service) return <Navigate to="/solar/services" replace />

  return (
    <>
      <Box bg="white" py={12}>
        <Container maxW="1400px">
          <SolarSectionHeading eyebrow="Solar solutions" title={service.title} description={service.short} />
          <Image src={service.image} alt="" h={{ base: '240px', md: '440px' }} w="100%" objectFit="cover" borderRadius="2xl" />
          <Text maxW="850px" fontSize="lg" lineHeight="1.9" color="var(--solar-muted)" mt={8}>{service.description}</Text>
          <Button as={RouterLink} to={`/solar/${service.requestType}`} colorScheme="green" size="lg" mt={6}>
            Request {service.requestType === 'installation' ? 'an installation quote' : `a ${service.requestType}`}
          </Button>
        </Container>
      </Box>
      <Container maxW="1400px" py={14}>
        <Heading size="xl" mb={7}>How we support your solar project</Heading>
        <SolarBenefits />
      </Container>
      <SolarCallToAction />
    </>
  )
}

export default SolarContentPage

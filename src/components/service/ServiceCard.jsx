import { Badge, Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

function ServiceCard({ service }) {
  return (
    <Box className="services-page-card" bg="white" borderRadius="xl" overflow="hidden" boxShadow="soft" p={0}>
      <Image
        src={service.image_url}
        alt={service.name}
        h="220px"
        w="100%"
        objectFit="contain"
        objectPosition="center"
        bg="gray.50"
      />
      <Box p={5}>
        <Badge colorScheme="brand" mb={3}>{service.service_type}</Badge>
        <Heading className="services-page-card-title" as="h3" size="md" mb={2}>{service.name}</Heading>
        <Text className="services-page-card-description" color="gray.600" mb={4}>{service.short_description}</Text>
        <Flex justify="space-between" align="center" mb={4}>
          <Text className="services-page-card-price" fontWeight="bold" color="primary.700">₹{service.price.toLocaleString('en-IN')}</Text>
          <Text className="services-page-card-timing" color="gray.500">{service.estimated_duration}</Text>
        </Flex>
        <Button
          as={Link}
          to="/book-service"
          state={{ serviceId: service.id }}
          colorScheme="primary"
          width="full"
        >
          Book Service
        </Button>
      </Box>
    </Box>
  )
}

export default ServiceCard

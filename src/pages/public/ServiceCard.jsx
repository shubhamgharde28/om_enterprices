import { Badge, Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react'
import { TimeIcon } from '@chakra-ui/icons'

// `wide` = true for the two larger cards in the second row (desktop)
function ServiceCard({ service, wide = false, onBook }) {
  const { category, name, description, price, duration, image } = service

  return (
    <Flex
      direction="column"
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.100"
      boxShadow="0 2px 10px rgba(16, 24, 40, 0.06)"
      overflow="hidden"
      h="100%"
    >
      <Image
        src={image}
        alt={name}
        w="100%"
        h={{ base: '150px', md: wide ? '130px' : '165px' }}
        objectFit="cover"
        objectPosition={wide ? 'center' : 'top center'}
        fallbackSrc="https://via.placeholder.com/600x300?text=Service"
      />

      <Flex direction="column" flex="1" p={{ base: 3, md: 4 }}>
        <Badge
          alignSelf="flex-start"
          bg="cyan.50"
          color="cyan.800"
          fontSize="9px"
          fontWeight="700"
          letterSpacing="0.04em"
          textTransform="uppercase"
          borderRadius="sm"
          px={2}
          py="2px"
          mb={2}
        >
          {category}
        </Badge>

        <Heading as="h3" fontSize={{ base: 'md', md: 'lg' }} color="gray.800" mb={1}>
          {name}
        </Heading>

        <Text fontSize="sm" color="gray.500" mb={4}>
          {description}
        </Text>

        <Flex mt="auto" align="center" justify="space-between" mb={3}>
          <Text fontSize="lg" fontWeight="700" color="gray.800">
            ₹{Number(price).toLocaleString('en-IN')}
          </Text>
          <Flex align="center" gap={1} color="gray.500" fontSize="sm">
            <TimeIcon boxSize={3} />
            <Text>{duration || '45 mins'}</Text>
          </Flex>
        </Flex>

        <Button
          w="100%"
          h="34px"
          bg="blue.500"
          color="white"
          fontSize="sm"
          fontWeight="600"
          borderRadius="full"
          _hover={{ bg: 'blue.600' }}
          onClick={() => onBook?.(service)}
        >
          Book Service
        </Button>
      </Flex>
    </Flex>
  )
}

export default ServiceCard

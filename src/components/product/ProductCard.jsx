import { Badge, Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

function ProductCard({ product }) {
  return (
    <Box bg="white" borderRadius="xl" overflow="hidden" boxShadow="soft" transition="all 0.2s" _hover={{ transform: 'translateY(-4px)', boxShadow: 'card' }}>
      <Image src={product.image_url} alt={product.name} h="220px" w="100%" objectFit="cover" />
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={2}>
          <Badge colorScheme="primary">{product.product_type}</Badge>
          {product.featured && <Badge colorScheme="green">Featured</Badge>}
        </Flex>
        <Heading as="h3" size="md" mb={2}>{product.name}</Heading>
        <Text color="gray.600" noOfLines={2} mb={4}>{product.short_description}</Text>
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="primary.700">₹{product.price.toLocaleString('en-IN')}</Text>
            {product.original_price && (
              <Text as="span" textDecoration="line-through" color="gray.500" fontSize="sm">₹{product.original_price.toLocaleString('en-IN')}</Text>
            )}
          </Box>
          {product.discount_percentage && <Badge colorScheme="orange">{product.discount_percentage}% off</Badge>}
        </Flex>
        <Text fontSize="sm" color="gray.500" mb={4}>⭐ {product.rating || 4.8} (Rated)</Text>
        <Button as={Link} to={`/products/${product.slug}`} colorScheme="primary" width="full">View Details</Button>
      </Box>
    </Box>
  )
}

export default ProductCard

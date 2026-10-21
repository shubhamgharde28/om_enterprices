import { ArrowForwardIcon } from '@chakra-ui/icons'
import { Box, Container, Flex, Heading, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { saveWebsiteSelection } from '../../services/websiteSelection'
import '../../styles/solar.css'

const choices = [
  {
    id: 'water',
    title: 'Water Purifier',
    description: 'Experience clean, safe and great-tasting water with our advanced purification solutions for your home and office.',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1100&q=85',
    button: 'Explore Water Solutions',
  },
  {
    id: 'solar',
    title: 'Solar Services',
    description: 'Power your tomorrow with clean, renewable energy. Our solar solutions are designed for efficiency & savings.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1100&q=85',
    button: 'Explore Solar Energy',
  },
]

function WebsiteChooser({ overlay = false, onChoose }) {
  const handleChoose = (choice) => {
    saveWebsiteSelection(choice)
    if (onChoose) onChoose(choice)
  }

  return (
    <Box
      className={overlay ? 'website-chooser website-chooser-overlay' : 'website-chooser'}
      position={overlay ? 'fixed' : 'relative'}
      inset={overlay ? 0 : undefined}
      zIndex={overlay ? 1000 : 1}
      bg="landing.canvas"
      bgImage={{
        base: 'linear-gradient(180deg, rgba(247, 245, 241, 0.68) 0%, rgba(247, 245, 241, 0.48) 45%, rgba(230, 237, 242, 0.68) 100%), url("/images/chooser_bg.png")',
        tablet: 'linear-gradient(90deg, rgba(250, 249, 246, 0.2) 0%, rgba(250, 249, 246, 0.12) 55%, rgba(250, 249, 246, 0.04) 100%), url("/images/chooser_bg.png")',
      }}
      bgPosition={{ base: '28% center', tablet: 'center' }}
      bgSize="cover"
      color="landing.foreground"
      minH="100dvh"
    >
      <Container maxW="1200px" py={{ base: 4, sm: 6, tablet: 10 }} px={{ base: 4, sm: 6, tablet: 6 }}>
        <Box
          maxW={{ base: '480px', tablet: '660px' }}
          mx={{ base: 'auto', tablet: 0 }}
          ml={{ base: 'auto', tablet: '5vw', xl: 0 }}
          mr={{ base: 'auto', tablet: 0 }}
          p={0}
        >
          <Box
            mb={{ base: 4, md: 6 }}
            p={{ base: 5, sm: 6, tablet: 0 }}
            bg="transparent"
            border="none"
            borderRadius="none"
            boxShadow="none"
            backdropFilter="none"
          >
            <VStack spacing={0} align="stretch" textAlign="left">
              <Image
                src="/logo.png"
                alt="OM Enterprises"
                w={{ base: '148px', sm: '168px', tablet: '200px' }}
                h="auto"
                objectFit="contain"
                alignSelf={{ base: 'center', tablet: 'flex-start' }}
                mb={{ base: 8, md: 8 }}
              />
              <Text
                color="landing.gold"
                fontSize="xs"
                letterSpacing={{ base: '0.13em', sm: '0.16em' }}
                textTransform="uppercase"
                mb={2}
              >
                Quality solutions for a brighter tomorrow
              </Text>
              <Heading
                as="h1"
                fontSize={{ base: '2xl', sm: '3xl', tablet: '4xl', xl: '5xl' }}
                fontFamily="display"
                fontWeight="medium"
                lineHeight={{ base: '1.08', tablet: '0.98' }}
                maxW={{ base: '100%', tablet: '500px' }}
                mb={3}
              >
                What can we help you with?
              </Heading>
              <Text maxW="420px" fontSize="sm" color="landing.muted" lineHeight="tall">
                Choose a service experience. You can switch between them whenever you like.
              </Text>
            </VStack>
          </Box>
          <SimpleGrid columns={{ base: 1, tablet: 2 }} spacing={{ base: 4, tablet: 5 }}>
            {choices.map((choice) => (
              <Box
                as={RouterLink}
                key={choice.id}
                to={choice.id === 'solar' ? '/solar' : '/'}
                onClick={() => handleChoose(choice.id)}
                bg="landing.surface"
                borderWidth="1px"
                borderColor="landing.border"
                borderRadius={{ base: 'xl', tablet: 'lg' }}
                overflow="hidden"
                boxShadow="soft"
                transition="transform 180ms ease, box-shadow 180ms ease"
                _hover={{ transform: { tablet: 'translateY(-2px)' }, boxShadow: 'card' }}
                _focusVisible={{ outline: '2px solid', outlineColor: 'landing.gold', outlineOffset: '3px' }}
              >
                <Image
                  src={choice.image}
                  alt=""
                  h={{ base: '156px', sm: '176px', tablet: '140px', lg: '160px' }}
                  w="100%"
                  objectFit="cover"
                />
                <Box p={{ base: 5, md: 5 }}>
                  <Flex align="center" gap={3} mb={2}>
                    <Box w="5" h="1px" bg="landing.gold" flexShrink={0} />
                    <Heading as="h2" fontSize="xl" fontFamily="display" fontWeight="semibold">
                      {choice.title}
                    </Heading>
                  </Flex>
                  <Text color="landing.muted" fontSize="sm" lineHeight="tall" mb={4}>
                    {choice.description}
                  </Text>
                  <Flex align="center" gap={3} color="landing.foreground" fontSize="sm" fontWeight="medium">
                    <Flex
                      align="center"
                      justify="center"
                      border="1px solid"
                      borderColor="landing.gold"
                      borderRadius="full"
                      boxSize={7}
                      color="landing.gold"
                      flexShrink={0}
                    >
                      <ArrowForwardIcon />
                    </Flex>
                    <Text>{choice.button}</Text>
                  </Flex>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  )
}

export default WebsiteChooser

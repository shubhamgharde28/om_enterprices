import { Alert, AlertIcon, Box, Button, Container, FormControl, FormLabel, Grid, Heading, Input, Select, SimpleGrid, Text, Textarea, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FaArrowRight, FaBolt, FaCheckCircle, FaEnvelope, FaHeadphones, FaLeaf, FaPhoneAlt, FaShieldAlt, FaTools } from 'react-icons/fa'
import { MdSolarPower } from 'react-icons/md'
import { createSolarRequest } from '../../services/supabase'

const requestTypes = {
  consultation: { label: 'Solar Consultation', service: 'Solar consultation', intro: 'Talk through your energy use, property and possible next steps with a solar specialist.' },
  installation: { label: 'Solar Installation Quote', service: 'Solar installation quote', intro: 'Share a few details about your property so our team can prepare for an installation discussion.' },
  servicing: { label: 'Solar Servicing', service: 'Solar panel servicing', intro: 'Request cleaning, routine maintenance or help caring for your existing solar system.' },
  inspection: { label: 'Solar Inspection', service: 'Solar system inspection and repair', intro: 'Tell us what your system is doing and request an inspection from our service team.' },
  contact: { label: 'Contact Tata Solar by OM Enterprises', service: 'General solar enquiry', intro: 'Share your solar goals, questions or project details and our OM Enterprises team will guide you through Tata Power Solar options.' },
}

const emptyForm = {
  full_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  pincode: '',
  property_type: '',
  service_required: '',
  monthly_bill: '',
  preferred_date: '',
  preferred_time: '',
  has_existing_solar: '',
  requirements: '',
}

const consultationHighlights = [
  [FaLeaf, 'Expert Guidance', 'Get professional advice'],
  [FaBolt, '100% Clean Energy', 'A greener tomorrow'],
  [FaShieldAlt, 'Cost Saving', 'Reduce your bills'],
]

const consultationBenefits = [
  [FaCheckCircle, 'Customized Solutions', 'Get a system designed as per your energy needs and budget.'],
  [MdSolarPower, 'High Quality Equipment', 'We use only trusted and high-efficiency solar products.'],
  [FaTools, 'Professional Installation', 'Expert installation by certified technicians.'],
  [FaHeadphones, 'Ongoing Support', 'Assistance even after installation for your peace of mind.'],
]

function SolarRequestPage({ initialType, className = '' }) {
  const { requestType: routeType } = useParams()
  const type = requestTypes[initialType || routeType] ? initialType || routeType : 'consultation'
  const request = requestTypes[type]
  const toast = useToast()
  const [form, setForm] = useState({ ...emptyForm, service_required: request.service })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      pincode: form.pincode.trim(),
      property_type: form.property_type.trim(),
      service_required: form.service_required.trim(),
      monthly_bill: form.monthly_bill ? Number(form.monthly_bill) : null,
      requirements: form.requirements.trim(),
      request_type: type,
    }

    if (!payload.full_name || !payload.phone || !payload.email) {
      setErrorMessage('Enter your name, mobile number and email address.')
      return
    }
    if (type === 'contact' && !payload.requirements) {
      setErrorMessage('Please enter your message for the Solar team.')
      return
    }
    if (payload.monthly_bill !== null && (!Number.isFinite(payload.monthly_bill) || payload.monthly_bill < 0)) {
      setErrorMessage('Enter a valid monthly electricity bill.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    try {
      await createSolarRequest(payload)
      setForm({ ...emptyForm, service_required: request.service })
      toast({
        title: 'Solar request received',
        description: 'Your details have been sent to our team. We will contact you soon.',
        status: 'success',
        duration: 6000,
        isClosable: true,
      })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to submit your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formContent = (
    <Box as="form" className="solar-request-form" onSubmit={handleSubmit}>
      {errorMessage && <Alert status="error" mb={5}><AlertIcon />{errorMessage}</Alert>}
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
            <FormControl isRequired>
              <FormLabel>Full name</FormLabel>
              <Input placeholder="Enter your full name" value={form.full_name} maxLength={120} onChange={(event) => updateField('full_name', event.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Mobile number</FormLabel>
              <Input type="tel" placeholder="09724916029" value={form.phone} maxLength={30} pattern="[+0-9 ()-]{7,30}" onChange={(event) => updateField('phone', event.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" placeholder="yourname@example.com" value={form.email} maxLength={320} onChange={(event) => updateField('email', event.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Property type</FormLabel>
              <Select placeholder="Choose property type" value={form.property_type} isRequired={type !== 'contact'} onChange={(event) => updateField('property_type', event.target.value)}>
                <option>Independent house</option>
                <option>Apartment</option>
                <option>Office</option>
                <option>Retail / warehouse</option>
                <option>Industrial / institutional</option>
                <option>Other</option>
              </Select>
            </FormControl>
            {type !== 'contact' && (
              <FormControl>
                <FormLabel>Service required</FormLabel>
                <Select value={form.service_required} isRequired onChange={(event) => updateField('service_required', event.target.value)}>
                  <option>Solar consultation</option>
                  <option>Solar installation quote</option>
                  <option>Solar panel servicing</option>
                  <option>Solar panel cleaning</option>
                  <option>Solar system inspection and repair</option>
                  <option>Commercial solar solution</option>
                  <option>Residential solar solution</option>
                </Select>
              </FormControl>
            )}
            <FormControl>
              <FormLabel>Approx. monthly electricity bill (₹)</FormLabel>
              <Input type="number" min="0" step="1" placeholder="e.g. 2500" value={form.monthly_bill} isRequired={type !== 'contact'} onChange={(event) => updateField('monthly_bill', event.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Existing solar installation?</FormLabel>
              <Select placeholder="Select one" value={form.has_existing_solar} isRequired={type !== 'contact'} onChange={(event) => updateField('has_existing_solar', event.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="planned">Not yet, but planned</option>
                <option value="unknown">Not sure</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Preferred appointment date</FormLabel>
              <Input type="date" placeholder="dd-mm-yyyy" value={form.preferred_date} isRequired={type !== 'contact'} onChange={(event) => updateField('preferred_date', event.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Preferred time</FormLabel>
              <Input type="time" value={form.preferred_time} isRequired={type !== 'contact'} onChange={(event) => updateField('preferred_time', event.target.value)} />
            </FormControl>
            <FormControl gridColumn={type === 'consultation' ? undefined : { md: 'span 2' }}>
              <FormLabel>Property address</FormLabel>
              <Input placeholder="Enter your complete address" value={form.address} maxLength={500} isRequired={type !== 'contact'} onChange={(event) => updateField('address', event.target.value)} />
            </FormControl>
            {type !== 'consultation' && (
              <>
                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input placeholder="Enter city" value={form.city} maxLength={120} isRequired={type !== 'contact'} onChange={(event) => updateField('city', event.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>PIN code</FormLabel>
                  <Input placeholder="Enter PIN code" value={form.pincode} maxLength={20} isRequired={type !== 'contact'} onChange={(event) => updateField('pincode', event.target.value)} />
                </FormControl>
              </>
            )}
            <FormControl gridColumn={{ md: 'span 2' }}>
              <FormLabel>{type === 'contact' ? 'How can we help?' : 'Additional requirements or system details'}</FormLabel>
              <Textarea placeholder="Tell us about your requirements, project details or any other information..." value={form.requirements} rows={5} maxLength={5000} isRequired={type === 'contact'} onChange={(event) => updateField('requirements', event.target.value)} />
            </FormControl>
      </Grid>
      <Button className="solar-request-submit" type="submit" mt={6} colorScheme="green" size="lg" rightIcon={<FaArrowRight />} isLoading={isSubmitting}>
        {type === 'installation' ? 'Request installation quote' : type === 'contact' ? 'Send enquiry' : type === 'consultation' ? 'Send request' : 'Submit request'}
      </Button>
    </Box>
  )

  if (type === 'consultation') {
    return (
      <Box className="solar-consultation-page">
        <Box className="solar-consultation-hero">
          <Container maxW="1400px" className="solar-consultation-hero-inner">
            <Box className="solar-consultation-hero-copy">
              <Text className="solar-eyebrow">Solar consultation</Text>
              <Heading>
                Request a <span className="solar-consultation-highlight">Solar Consultation</span>
              </Heading>
              <Text>Get expert advice from our solar specialists. Fill in the form below and we’ll get back to you with the best solution for your needs.</Text>
              <SimpleGrid className="solar-consultation-highlights" columns={3} spacing={3}>
                {consultationHighlights.map(([Icon, title, detail]) => (
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
            <Box className="solar-consultation-hero-image" role="img" aria-label="Home with rooftop solar panels" />
          </Container>
        </Box>

        <Container maxW="1400px" className="solar-consultation-main">
          <Grid className="solar-consultation-layout" templateColumns={{ base: '1fr', lg: '1.65fr 0.8fr' }} gap={2}>
            <Box className="solar-card solar-consultation-form-card">
              <Text className="solar-eyebrow">Get a free consultation</Text>
              <Heading size="md">Solar Consultation Form</Heading>
              <Text className="solar-consultation-form-intro">Fill in the details below and our team will get back to you with the best solar solutions for your home or business.</Text>
              {formContent}
            </Box>
            <Box className="solar-consultation-why-card">
              <Text className="solar-eyebrow">Your solar journey</Text>
              <Heading size="md">Why Choose Us?</Heading>
              <Text className="solar-consultation-why-intro">We provide complete solar solutions with transparency and trusted support.</Text>
              <Box className="solar-consultation-benefits">
                {consultationBenefits.map(([Icon, title, detail]) => (
                  <Box key={title}>
                    <Box className="solar-consultation-benefit-icon"><Icon /></Box>
                    <Box><Text>{title}</Text><Text>{detail}</Text></Box>
                  </Box>
                ))}
              </Box>
              <Box className="solar-consultation-switch-card">
                <Box className="solar-consultation-switch-icon"><FaLeaf /></Box>
                <Box><Text>Let’s switch to clean, green energy!</Text><Text>Get started with a free consultation today and save more tomorrow.</Text></Box>
                <FaArrowRight />
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>
    )
  }

  return (
    <Container maxW="1000px" py={{ base: 8, md: 14 }} className={className}>
      <Box className={`solar-card solar-request-card${type === 'contact' ? ' solar-contact-request' : ''}`} p={{ base: 5, md: 9 }}>
        <Text className="solar-eyebrow">{type === 'contact' ? 'Get in touch' : 'Start your solar journey'}</Text>
        <Heading mt={2} fontSize={{ base: '20px', md: '23px' }}>{request.label}</Heading>
        <Text color="var(--solar-muted)" mt={3} mb={7}>{request.intro}</Text>
        {formContent}
      </Box>
    </Container>
  )
}

export default SolarRequestPage

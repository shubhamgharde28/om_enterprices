import { Box, Button, Container, FormControl, FormLabel, Grid, Input, Progress, Select, Stack, Table, Tbody, Td, Text, Th, Thead, Tr, useToast } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaChevronRight, FaImages, FaPlus, FaTools } from 'react-icons/fa'
import { addService, deleteService, setServices, updateService } from '../../redux/slices/serviceSlice'
import { createService, deleteServiceRecord, fetchServices, maxProductImageSize, updateServiceRecord, uploadProductImage, validateProductImageFile } from '../../services/supabase'
import '../../styles/admin-services.css'

function AdminServices() {
  const services = useSelector((state) => state.services.items)
  const dispatch = useDispatch()
  const [form, setForm] = useState({ id: '', name: '', service_type: 'Installation', price: 0, image_url: '', active: true })
  const [selectedImage, setSelectedImage] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [activeView, setActiveView] = useState('services')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSelectedImageUploaded, setIsSelectedImageUploaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef(null)
  const uploadedImageRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    let active = true
    fetchServices()
      .then((rows) => {
        if (active) dispatch(setServices(rows))
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load services.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [dispatch])

  useEffect(() => () => {
    if (selectedImage?.previewUrl) URL.revokeObjectURL(selectedImage.previewUrl)
  }, [selectedImage])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    setErrorMessage('')
    try {
      let serviceImageUrl = form.image_url
      if (selectedImage) {
        serviceImageUrl = uploadedImageRef.current
        if (!serviceImageUrl) {
          setIsUploadingImage(true)
          try {
            serviceImageUrl = await uploadProductImage(selectedImage.file)
            uploadedImageRef.current = serviceImageUrl
            setIsSelectedImageUploaded(true)
          } finally {
            setIsUploadingImage(false)
          }
        }
      }

      const serviceDetails = {
        name: form.name,
        price: Number(form.price),
        service_type: form.service_type,
        image_url: serviceImageUrl,
        active: form.active,
      }
      const newItem = {
        ...serviceDetails,
        description: 'Service overview',
        short_description: 'Service description',
        estimated_duration: '45 mins',
        image_url: serviceImageUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
      }
      if (editingId) {
        const savedService = await updateServiceRecord(editingId, serviceDetails)
        dispatch(updateService(savedService))
        toast({ title: 'Service updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        const savedService = await createService(newItem)
        dispatch(addService(savedService))
        toast({ title: 'Service saved to Supabase', status: 'success', duration: 2500, isClosable: true })
      }
      setForm({ id: '', name: '', service_type: 'Installation', price: 0, image_url: '', active: true })
      setSelectedImage(null)
      setIsSelectedImageUploaded(false)
      uploadedImageRef.current = null
      if (fileInputRef.current) fileInputRef.current.value = ''
      setEditingId(null)
      setActiveView('services')
    } catch (error) {
      setErrorMessage(error.message || `Unable to ${editingId ? 'update' : 'save'} service.`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageSelection = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      validateProductImageFile(file)
    } catch (error) {
      setErrorMessage(error.message)
      event.target.value = ''
      return
    }
    uploadedImageRef.current = null
    setIsSelectedImageUploaded(false)
    setSelectedImage({ file, previewUrl: URL.createObjectURL(file) })
    setErrorMessage('')
  }

  const handleDelete = async (service) => {
    if (!window.confirm(`Delete "${service.name}"?`)) return
    setErrorMessage('')
    try {
      await deleteServiceRecord(service.id)
      dispatch(deleteService(service.id))
      toast({ title: 'Service deleted', status: 'success', duration: 2500, isClosable: true })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete service.')
    }
  }

  const handleEdit = (service) => {
    setEditingId(service.id)
    setSelectedImage(null)
    setIsSelectedImageUploaded(false)
    uploadedImageRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
    setForm({
      id: service.id,
      name: service.name || '',
      service_type: service.service_type || 'Installation',
      price: service.price ?? 0,
      image_url: service.image_url || '',
      active: service.active ?? true,
    })
    setErrorMessage('')
    setActiveView('form')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ id: '', name: '', service_type: 'Installation', price: 0, image_url: '', active: true })
    setSelectedImage(null)
    setIsSelectedImageUploaded(false)
    uploadedImageRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
    setErrorMessage('')
    setActiveView('services')
  }

  const openAddServiceForm = () => {
    if (activeView !== 'form' || editingId) {
      setErrorMessage('')
      setEditingId(null)
      setForm({ id: '', name: '', service_type: 'Installation', price: 0, image_url: '', active: true })
      setSelectedImage(null)
      setIsSelectedImageUploaded(false)
      uploadedImageRef.current = null
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    setActiveView('form')
  }

  return (
    <Container className="admin-services" maxW="1500px" px={0}>
      <nav className="services-view-tabs" role="tablist" aria-label="Service management views">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'services'}
          className={`services-view-tab${activeView === 'services' ? ' is-active' : ''}`}
          onClick={() => setActiveView('services')}
        >
          <FaTools />
          <span>Services</span>
          <span className="services-view-count">{services.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'form'}
          className={`services-view-tab${activeView === 'form' ? ' is-active' : ''}`}
          onClick={openAddServiceForm}
        >
          <FaPlus />
          <span>Add Service</span>
        </button>
      </nav>

      {activeView === 'form' ? (
        <section className="services-form-view" role="tabpanel">
          <div className="services-breadcrumbs">
            <button type="button" onClick={() => setActiveView('services')}>Services</button>
            <FaChevronRight aria-hidden="true" />
            <strong>{editingId ? 'Edit Service' : 'Add Service'}</strong>
          </div>
          <header className="services-heading">
              <h1>{editingId ? 'Edit Service' : 'Add Service'}</h1>
              <p>{editingId ? 'Update the service details in your store.' : 'Fill in the details below to add a new service to your store.'}</p>
          </header>

          {errorMessage && <Box className="services-error" role="alert">{errorMessage}</Box>}

          <Box className="services-form-card">
            <div className="services-card-heading">
              <FaTools />
              <h2>Service Information</h2>
            </div>
            <Stack as="form" className="services-form" spacing={4} onSubmit={handleSubmit}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel>Service Name</FormLabel>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Water Purifier Installation" required />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Type</FormLabel>
                  <Select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}>
                    <option>Installation</option>
                    <option>Repair</option>
                    <option>Servicing</option>
                    <option>AMC</option>
                    <option>Replacement</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Price</FormLabel>
                  <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="₹ 0" required />
                </FormControl>
                <FormControl gridColumn={{ base: '1', md: '1 / -1' }}>
                  <FormLabel>Service Image</FormLabel>
                  <Input
                    ref={fileInputRef}
                    className="service-image-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Choose service image"
                    onChange={handleImageSelection}
                  />
                  <div className="service-image-upload">
                    {(selectedImage?.previewUrl || form.image_url) && (
                      <img
                        className="service-image-preview"
                        src={selectedImage?.previewUrl || form.image_url}
                        alt={`${form.name || 'Service'} preview`}
                      />
                    )}
                    <div className="service-image-upload-copy">
                      <Text fontSize="sm" fontWeight="600" color="gray.700">
                        {selectedImage ? selectedImage.file.name : (form.image_url ? 'Current service image' : 'No image selected')}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        JPEG, PNG, or WebP · Max {Math.round(maxProductImageSize / 1024 / 1024)} MB
                      </Text>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        mt={2}
                        isDisabled={isSaving}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {form.image_url || selectedImage ? 'Replace Image' : 'Upload Service Image'}
                      </Button>
                    </div>
                  </div>
                  {isUploadingImage && (
                    <Box mt={3} role="status" aria-live="polite">
                      <Text fontSize="xs" color="blue.600" mb={1}>Uploading service image…</Text>
                      <Progress size="xs" isIndeterminate colorScheme="blue" />
                    </Box>
                  )}
                  {selectedImage && isSelectedImageUploaded && (
                    <Text mt={2} fontSize="xs" color="green.600" role="status">
                      Image uploaded. Save the service to publish it.
                    </Text>
                  )}
                </FormControl>
              </Grid>
              <div className="services-form-actions">
                <Button className="services-submit-button" type="submit" isLoading={isSaving}>
                  {selectedImage ? <FaImages /> : <FaPlus />}
                  {editingId ? 'Save Changes' : 'Add Service'}
                </Button>
                {editingId && (
                  <Button className="services-cancel-button" type="button" variant="ghost" onClick={cancelEdit}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </Stack>
          </Box>
        </section>
      ) : (
        <>
          {errorMessage && <Box className="services-error" role="alert">{errorMessage}</Box>}
          <Box className="services-list-card">
            <div className="services-list-heading">
              <div>
                <h2>Service Details</h2>
                <p>Manage the services available in your store.</p>
              </div>
              <span>{services.length} services</span>
            </div>
            <div className="services-table-scroll">
              <Table className="services-table" size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Type</Th>
                    <Th>Price</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {!isLoading && services.map((service) => (
                    <Tr key={service.id}>
                      <Td>{service.name}</Td>
                      <Td>{service.service_type}</Td>
                      <Td>₹{service.price}</Td>
                      <Td><span className={`service-status${service.active ? ' is-active' : ''}`}>{service.active ? 'Active' : 'Inactive'}</span></Td>
                      <Td>
                        <div className="services-row-actions">
                          <Button size="xs" onClick={() => handleEdit(service)}>Edit</Button>
                          <Button size="xs" colorScheme="red" onClick={() => handleDelete(service)}>Delete</Button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                  {isLoading && <Tr><Td colSpan={5}>Loading services...</Td></Tr>}
                  {!isLoading && services.length === 0 && <Tr><Td className="services-empty" colSpan={5}>No services saved yet.</Td></Tr>}
                </Tbody>
              </Table>
            </div>
          </Box>
        </>
      )}
    </Container>
  )
}

export default AdminServices

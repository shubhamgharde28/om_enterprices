import { Box, Button, Container, FormControl, FormLabel, Grid, Input, Select, Stack, Table, Tbody, Td, Th, Thead, Tr, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaChevronRight, FaPlus, FaTools } from 'react-icons/fa'
import { addService, deleteService, setServices, updateService } from '../../redux/slices/serviceSlice'
import { createService, deleteServiceRecord, fetchServices, updateServiceRecord } from '../../services/supabase'
import '../../styles/admin-services.css'

function AdminServices() {
  const services = useSelector((state) => state.services.items)
  const dispatch = useDispatch()
  const [form, setForm] = useState({ id: '', name: '', service_type: 'Installation', price: 0, image_url: '', active: true })
  const [editingId, setEditingId] = useState(null)
  const [activeView, setActiveView] = useState('services')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    const serviceDetails = {
      name: form.name,
      price: Number(form.price),
      service_type: form.service_type,
      image_url: form.image_url,
      active: form.active,
    }
    const newItem = {
      ...serviceDetails,
      description: 'Service overview',
      short_description: 'Service description',
      estimated_duration: '45 mins',
      image_url: form.image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    }
    setIsSaving(true)
    setErrorMessage('')
    try {
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
      setEditingId(null)
      setActiveView('services')
    } catch (error) {
      setErrorMessage(error.message || `Unable to ${editingId ? 'update' : 'save'} service.`)
    } finally {
      setIsSaving(false)
    }
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
    setErrorMessage('')
    setActiveView('services')
  }

  const openAddServiceForm = () => {
    if (activeView !== 'form' || editingId) {
      setErrorMessage('')
      setEditingId(null)
      setForm({ id: '', name: '', service_type: 'Installation', price: 0, image_url: '', active: true })
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
                <FormControl>
                  <FormLabel>Image URL</FormLabel>
                  <Input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://example.com/service-image.jpg" />
                </FormControl>
              </Grid>
              <div className="services-form-actions">
                <Button className="services-submit-button" type="submit" isLoading={isSaving}>
                  <FaPlus />
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

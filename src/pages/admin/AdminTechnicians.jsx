import { Box, Button, Container, FormControl, FormLabel, Grid, Input, Stack, Table, Tbody, Td, Th, Thead, Tr, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { FaChevronRight, FaPlus, FaTools } from 'react-icons/fa'
import {
  createTechnician,
  deleteTechnicianRecord,
  fetchTechnicians,
  updateTechnicianRecord,
} from '../../services/supabase'
import '../../styles/admin-technicians.css'

const emptyForm = { full_name: '', email: '', phone: '' }

function AdminTechnicians() {
  const [technicians, setTechnicians] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [activeView, setActiveView] = useState('technicians')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const toast = useToast()

  useEffect(() => {
    let active = true
    fetchTechnicians()
      .then((rows) => {
        if (active) setTechnicians(rows)
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load technicians.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    try {
      if (editingId) {
        const savedTechnician = await updateTechnicianRecord(editingId, form)
        setTechnicians((current) => current.map((technician) => (
          technician.id === editingId ? savedTechnician : technician
        )))
        toast({ title: 'Technician updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        const savedTechnician = await createTechnician(form)
        setTechnicians((current) => [savedTechnician, ...current])
        toast({ title: 'Technician added', status: 'success', duration: 2500, isClosable: true })
      }
      setForm(emptyForm)
      setEditingId(null)
      setActiveView('technicians')
    } catch (error) {
      setErrorMessage(error.message || `Unable to ${editingId ? 'update' : 'add'} technician.`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (technician) => {
    setEditingId(technician.id)
    setForm({
      full_name: technician.full_name || '',
      email: technician.email || '',
      phone: technician.phone || '',
    })
    setErrorMessage('')
    setActiveView('form')
  }

  const cancelEdit = () => {
    setForm(emptyForm)
    setEditingId(null)
    setErrorMessage('')
    setActiveView('technicians')
  }

  const openAddTechnicianForm = () => {
    if (activeView !== 'form' || editingId) {
      setForm(emptyForm)
      setEditingId(null)
      setErrorMessage('')
    }
    setActiveView('form')
  }

  const handleDelete = async (technician) => {
    if (!window.confirm(`Delete "${technician.full_name}"?`)) return
    setErrorMessage('')
    try {
      await deleteTechnicianRecord(technician.id)
      setTechnicians((current) => current.filter((item) => item.id !== technician.id))
      toast({ title: 'Technician deleted', status: 'success', duration: 2500, isClosable: true })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete technician.')
    }
  }

  return (
    <Container className="admin-technicians" maxW="1500px" px={0}>
      <nav className="technicians-view-tabs" role="tablist" aria-label="Technician management views">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'technicians'}
          className={`technicians-view-tab${activeView === 'technicians' ? ' is-active' : ''}`}
          onClick={() => setActiveView('technicians')}
        >
          <FaTools />
          <span>Technicians</span>
          <span className="technicians-view-count">{technicians.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'form'}
          className={`technicians-view-tab${activeView === 'form' ? ' is-active' : ''}`}
          onClick={openAddTechnicianForm}
        >
          <FaPlus />
          <span>Add Technician</span>
        </button>
      </nav>

      {activeView === 'form' ? (
        <section className="technicians-form-view" role="tabpanel">
          <div className="technicians-breadcrumbs">
            <button type="button" onClick={() => setActiveView('technicians')}>Technicians</button>
            <FaChevronRight aria-hidden="true" />
            <strong>{editingId ? 'Edit Technician' : 'Add Technician'}</strong>
          </div>
          <header className="technicians-heading">
            <h1>{editingId ? 'Edit Technician' : 'Add Technician'}</h1>
            <p>{editingId ? 'Update the technician details for your team.' : 'Fill in the details below to add a technician to your team.'}</p>
          </header>

          {errorMessage && <Box className="technicians-error" role="alert">{errorMessage}</Box>}

          <Box className="technicians-form-card">
            <div className="technicians-card-heading">
              <FaTools />
              <h2>Technician Information</h2>
            </div>
            <Stack as="form" className="technicians-form" spacing={4} onSubmit={handleSubmit}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    autoComplete="name"
                    value={form.full_name}
                    onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="e.g. rahul@example.com"
                    required
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    required
                  />
                </FormControl>
              </Grid>
              <div className="technicians-form-actions">
                <Button className="technicians-submit-button" type="submit" isLoading={isSaving}>
                  <FaPlus />
                  {editingId ? 'Save Changes' : 'Add Technician'}
                </Button>
                {editingId && (
                  <Button className="technicians-cancel-button" type="button" variant="ghost" onClick={cancelEdit}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </Stack>
          </Box>
        </section>
      ) : (
        <>
          {errorMessage && <Box className="technicians-error" role="alert">{errorMessage}</Box>}
          <Box className="technicians-list-card">
            <div className="technicians-list-heading">
              <div>
                <h2>Technician Details</h2>
                <p>Manage your service technicians.</p>
              </div>
              <span>{technicians.length} technicians</span>
            </div>
            <div className="technicians-table-scroll">
              <Table className="technicians-table" size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {!isLoading && technicians.map((technician) => (
                    <Tr key={technician.id}>
                      <Td>{technician.full_name}</Td>
                      <Td>{technician.email}</Td>
                      <Td>{technician.phone}</Td>
                      <Td>
                        <span className={`technician-status${technician.active ? ' is-active' : ''}`}>
                          {technician.active ? 'Active' : 'Inactive'}
                        </span>
                      </Td>
                      <Td>
                        <div className="technicians-row-actions">
                          <Button size="xs" onClick={() => handleEdit(technician)}>Edit</Button>
                          <Button size="xs" colorScheme="red" onClick={() => handleDelete(technician)}>Delete</Button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                  {isLoading && <Tr><Td colSpan={5}>Loading technicians...</Td></Tr>}
                  {!isLoading && technicians.length === 0 && (
                    <Tr><Td className="technicians-empty" colSpan={5}>No technicians added yet.</Td></Tr>
                  )}
                </Tbody>
              </Table>
            </div>
          </Box>
        </>
      )}
    </Container>
  )
}

export default AdminTechnicians

import { Box, Button, Container, FormControl, FormLabel, Grid, Input, Stack, Table, Tbody, Td, Textarea, Th, Thead, Tr, useToast } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { FaEdit, FaPlus, FaQuoteLeft, FaStar, FaTrash, FaUserFriends } from 'react-icons/fa'
import {
  createTestimonial,
  deleteTestimonialRecord,
  fetchAdminTestimonials,
  updateTestimonialRecord,
} from '../../services/supabase'
import '../../styles/admin-testimonials.css'

const defaultTestimonial = { customer_name: '', rating: 5, review: '' }

function AdminTestimonials() {
  const [form, setForm] = useState({ ...defaultTestimonial })
  const [testimonials, setTestimonials] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [activeView, setActiveView] = useState('testimonials')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const toast = useToast()

  useEffect(() => {
    let active = true
    fetchAdminTestimonials()
      .then((rows) => {
        if (active) setTestimonials(rows)
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load testimonials.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredTestimonials = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return testimonials
    return testimonials.filter((testimonial) => (
      [testimonial.customer_name, testimonial.review, testimonial.rating]
        .some((value) => String(value || '').toLowerCase().includes(query))
    ))
  }, [testimonials, searchQuery])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    try {
      if (editingId) {
        const updatedTestimonial = await updateTestimonialRecord(editingId, form)
        setTestimonials((current) => current.map((testimonial) => (
          testimonial.id === updatedTestimonial.id ? updatedTestimonial : testimonial
        )))
        toast({ title: 'Testimonial updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        const savedTestimonial = await createTestimonial(form)
        setTestimonials((current) => [savedTestimonial, ...current])
        toast({ title: 'Testimonial saved to Supabase', status: 'success', duration: 2500, isClosable: true })
      }
      setForm({ ...defaultTestimonial })
      setEditingId(null)
      setActiveView('testimonials')
    } catch (error) {
      setErrorMessage(error.message || `Unable to ${editingId ? 'update' : 'save'} testimonial.`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (testimonial) => {
    setEditingId(testimonial.id)
    setForm({
      customer_name: testimonial.customer_name || '',
      rating: testimonial.rating ?? 5,
      review: testimonial.review || '',
    })
    setErrorMessage('')
    setActiveView('form')
  }

  const handleDelete = async (testimonial) => {
    if (!window.confirm(`Delete the testimonial from "${testimonial.customer_name}"?`)) return
    setErrorMessage('')
    try {
      await deleteTestimonialRecord(testimonial.id)
      setTestimonials((current) => current.filter((item) => item.id !== testimonial.id))
      toast({ title: 'Testimonial deleted', status: 'success', duration: 2500, isClosable: true })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete testimonial.')
    }
  }

  const cancelForm = () => {
    setForm({ ...defaultTestimonial })
    setEditingId(null)
    setErrorMessage('')
    setActiveView('testimonials')
  }

  const openAddForm = () => {
    setEditingId(null)
    setForm({ ...defaultTestimonial })
    setErrorMessage('')
    setActiveView('form')
  }

  return (
    <Container className="admin-testimonials" maxW="1500px" px={0}>
      <nav className="testimonials-view-tabs" role="tablist" aria-label="Testimonial management views">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'testimonials'}
          className={`testimonials-view-tab${activeView === 'testimonials' ? ' is-active' : ''}`}
          onClick={() => setActiveView('testimonials')}
        >
          <FaUserFriends />
          <span>Testimonials</span>
          <span className="testimonials-view-count">{testimonials.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'form'}
          className={`testimonials-view-tab${activeView === 'form' ? ' is-active' : ''}`}
          onClick={openAddForm}
        >
          <FaPlus />
          <span>Add Testimonial</span>
        </button>
      </nav>

      {activeView === 'form' ? (
        <section className="testimonials-form-view" role="tabpanel">
          <div className="testimonials-breadcrumbs">
            <button type="button" onClick={() => setActiveView('testimonials')}>Testimonials</button>
            <span aria-hidden="true">›</span>
            <strong>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</strong>
          </div>
          <header className="testimonials-heading">
            <h1>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h1>
            <p>{editingId ? 'Update this customer’s experience.' : 'Share a customer’s experience on your website.'}</p>
          </header>

          {errorMessage && <Box className="testimonials-error" role="alert">{errorMessage}</Box>}

          <Stack as="form" className="testimonials-form" spacing={0} onSubmit={handleSubmit}>
            <section className="testimonial-form-section">
              <header className="testimonial-section-heading">
                <span><FaQuoteLeft /> Testimonial Details</span>
                <p>{editingId ? 'Update the customer name, rating, and review.' : 'Enter the customer name, rating, and review.'}</p>
              </header>
              <Grid className="testimonial-fields" templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel>Customer Name</FormLabel>
                  <Input
                    value={form.customer_name}
                    onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
                    placeholder="Enter customer name"
                    required
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Rating</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={0.5}
                    value={form.rating}
                    onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
                    required
                  />
                </FormControl>
                <FormControl className="testimonial-field-wide" isRequired>
                  <FormLabel>Review</FormLabel>
                  <Textarea
                    className="testimonial-review-input"
                    value={form.review}
                    onChange={(event) => setForm({ ...form, review: event.target.value })}
                    placeholder="Write the customer review..."
                    rows={5}
                    required
                  />
                </FormControl>
              </Grid>
            </section>

            <div className="testimonials-form-actions">
              <Button className="testimonial-submit-button" type="submit" isLoading={isSaving}>
                {editingId ? <FaEdit /> : <FaPlus />}
                {editingId ? 'Save Changes' : 'Save Testimonial'}
              </Button>
              <Button
                className="testimonial-cancel-button"
                type="button"
                variant="ghost"
                onClick={cancelForm}
              >
                {editingId ? 'Cancel Edit' : 'Cancel'}
              </Button>
            </div>
          </Stack>
        </section>
      ) : (
        <>
          {errorMessage && <Box className="testimonials-error" role="alert">{errorMessage}</Box>}
          <section className="testimonials-preview">
            <header className="testimonials-preview-heading">
              <div>
                <h1>Customer Testimonials</h1>
                <p>Manage the customer reviews displayed on your website.</p>
              </div>
              <div className="testimonials-list-tools">
                <label className="testimonials-search">
                  <span className="sr-only">Search testimonials</span>
                  <Input
                    aria-label="Search testimonials"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search name or review..."
                  />
                </label>
                <span className="testimonials-total-count">{testimonials.length} total</span>
              </div>
            </header>
            <div className="testimonials-table-scroll">
              <Table className="testimonials-table">
                <Thead>
                  <Tr><Th>Customer</Th><Th>Rating</Th><Th>Review</Th><Th>Status</Th><Th>Actions</Th></Tr>
                </Thead>
                <Tbody>
                  {!isLoading && filteredTestimonials.map((testimonial) => (
                    <Tr key={testimonial.id}>
                      <Td className="testimonial-name">{testimonial.customer_name || '—'}</Td>
                      <Td>
                        <span className="testimonial-rating">
                          <FaStar aria-hidden="true" />
                          {testimonial.rating ?? '—'}
                        </span>
                      </Td>
                      <Td className="testimonial-review">{testimonial.review || '—'}</Td>
                      <Td>
                        <span className={`testimonial-status${testimonial.active ? ' is-active' : ''}`}>
                          {testimonial.active ? 'Active' : 'Inactive'}
                        </span>
                      </Td>
                      <Td>
                        <div className="testimonial-row-actions">
                          <Button
                            className="testimonial-edit-button"
                            size="sm"
                            onClick={() => handleEdit(testimonial)}
                          >
                            <FaEdit />
                            Edit
                          </Button>
                          <Button
                            className="testimonial-delete-button"
                            size="sm"
                            onClick={() => handleDelete(testimonial)}
                          >
                            <FaTrash />
                            Delete
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                  {isLoading && <Tr><Td colSpan={5} className="testimonials-empty">Loading testimonials...</Td></Tr>}
                  {!isLoading && filteredTestimonials.length === 0 && (
                    <Tr>
                      <Td colSpan={5} className="testimonials-empty">
                        {searchQuery ? 'No testimonials match your search.' : 'No testimonials saved yet.'}
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </div>
          </section>
        </>
      )}
    </Container>
  )
}

export default AdminTestimonials

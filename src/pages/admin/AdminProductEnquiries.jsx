import {
  Box,
  Button,
  Container,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FaChevronLeft, FaChevronRight, FaEye, FaSearch } from 'react-icons/fa'
import {
  fetchProductEnquiries,
  subscribeToProductEnquiryChanges,
  updateProductEnquiryStatus,
} from '../../services/supabase'
import '../../styles/admin-contact-messages.css'
import '../../styles/admin-product-enquiries.css'

const pageSize = 8
const statuses = ['New', 'Read', 'Contacted', 'Closed']
const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}
const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`
const getProductPath = (enquiry) => `/products/${encodeURIComponent(enquiry.product_slug)}`

function AdminProductEnquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [loadedAt, setLoadedAt] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    let active = true
    const loadEnquiries = () => {
      fetchProductEnquiries()
        .then((rows) => {
          if (!active) return
          setEnquiries(rows)
          setLoadedAt(Date.now())
          setErrorMessage('')
        })
        .catch((error) => {
          if (active) setErrorMessage(error.message || 'Unable to load product enquiries.')
        })
        .finally(() => {
          if (active) setIsLoading(false)
        })
    }
    loadEnquiries()
    const unsubscribe = subscribeToProductEnquiryChanges(loadEnquiries)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const filteredEnquiries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return enquiries
    return enquiries.filter((enquiry) => (
      [
        enquiry.product_name,
        enquiry.product_slug,
        enquiry.customer_name,
        enquiry.phone,
        enquiry.alternate_phone,
        enquiry.email,
        enquiry.message,
        enquiry.status,
      ].some((value) => String(value || '').toLowerCase().includes(query))
    ))
  }, [enquiries, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / pageSize))
  const visibleEnquiries = filteredEnquiries.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const newCount = enquiries.filter((enquiry) => enquiry.status === 'New').length
  const contactedCount = enquiries.filter((enquiry) => enquiry.status === 'Contacted').length
  const lastWeekCount = enquiries.filter((enquiry) => {
    const createdAt = new Date(enquiry.created_at).getTime()
    return loadedAt > 0
      && Number.isFinite(createdAt)
      && createdAt >= loadedAt - 7 * 24 * 60 * 60 * 1000
  }).length
  const startItem = filteredEnquiries.length ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = Math.min(currentPage * pageSize, filteredEnquiries.length)

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = async (enquiryId, status) => {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const updatedEnquiry = await updateProductEnquiryStatus(enquiryId, status)
      setEnquiries((current) => current.map((enquiry) => (
        enquiry.id === updatedEnquiry.id ? updatedEnquiry : enquiry
      )))
      setSelectedEnquiry((current) => (
        current?.id === updatedEnquiry.id ? updatedEnquiry : current
      ))
    } catch (error) {
      setErrorMessage(error.message || 'Unable to update product enquiry status.')
    } finally {
      setIsSaving(false)
    }
  }

  const showEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry)
    onOpen()
  }

  const renderStatus = (enquiry) => (
    <span className={`contact-message-status status-${String(enquiry.status || 'New').toLowerCase()}`}>
      {enquiry.status || 'New'}
    </span>
  )

  const renderViewAction = (enquiry) => (
    <Button className="contact-message-view" onClick={() => showEnquiry(enquiry)}>
      <FaEye aria-hidden="true" />
      View
    </Button>
  )

  return (
    <Container className="admin-contact-messages admin-product-enquiries" maxW="1500px" px={0}>
      <header className="contact-messages-heading">
        <div>
          <p>Operations Center</p>
          <h1>Product Enquiries</h1>
          <span>Review customer enquiries and follow up about specific products.</span>
        </div>
      </header>

      {errorMessage && <Box className="contact-messages-error" role="alert">{errorMessage}</Box>}

      <section className="contact-message-stats" aria-label="Product enquiry summary">
        <div className="contact-message-stat">
          <span>Total Enquiries</span>
          <strong>{enquiries.length}</strong>
        </div>
        <div className="contact-message-stat is-new">
          <span>New</span>
          <strong>{newCount}</strong>
        </div>
        <div className="contact-message-stat is-read">
          <span>Contacted</span>
          <strong>{contactedCount}</strong>
        </div>
        <div className="contact-message-stat">
          <span>Last 7 Days</span>
          <strong>{lastWeekCount}</strong>
        </div>
      </section>

      <section className="contact-messages-panel" aria-label="Product enquiries">
        <div className="contact-messages-panel-heading">
          <div>
            <h2>Customer Enquiries</h2>
            <p>Manage customer contact details, product information, and follow-up status.</p>
          </div>
          <label className="contact-messages-search">
            <FaSearch aria-hidden="true" />
            <Input
              aria-label="Search product enquiries"
              placeholder="Search by customer, contact or product..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </label>
        </div>

        <div className="contact-messages-table-wrap">
          <Table className="contact-messages-table product-enquiries-table">
            <Thead>
              <Tr>
                <Th>Received</Th>
                <Th>Product</Th>
                <Th>Customer</Th>
                <Th>Contact</Th>
                <Th>Alternate Number</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading && <Tr><Td colSpan={7} className="contact-messages-empty">Loading product enquiries...</Td></Tr>}
              {!isLoading && visibleEnquiries.map((enquiry) => (
                <Tr key={enquiry.id}>
                  <Td className="contact-message-date">{formatDate(enquiry.created_at)}</Td>
                  <Td className="product-enquiry-product">
                    <RouterLink to={getProductPath(enquiry)} target="_blank" rel="noreferrer">
                      {enquiry.product_name || 'Product unavailable'}
                    </RouterLink>
                    <span>{formatPrice(enquiry.product_price)}</span>
                  </Td>
                  <Td>{enquiry.customer_name || '—'}</Td>
                  <Td className="product-enquiry-contact">
                    {enquiry.phone && <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>}
                    {enquiry.email && <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>}
                  </Td>
                  <Td>{enquiry.alternate_phone || '—'}</Td>
                  <Td>{renderStatus(enquiry)}</Td>
                  <Td>{renderViewAction(enquiry)}</Td>
                </Tr>
              ))}
              {!isLoading && !visibleEnquiries.length && (
                <Tr>
                  <Td colSpan={7} className="contact-messages-empty">
                    {searchQuery ? 'No enquiries match your search.' : 'No product enquiries received yet.'}
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </div>

        <div className="contact-messages-footer">
          <span>Showing {startItem}–{endItem} of {filteredEnquiries.length} enquiries</span>
          <nav className="contact-message-pagination" aria-label="Product enquiry pages">
            <Button aria-label="Previous page" isDisabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
              <FaChevronLeft />
            </Button>
            <strong>{currentPage}</strong>
            <Button aria-label="Next page" isDisabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
              <FaChevronRight />
            </Button>
          </nav>
        </div>

        <div className="contact-messages-mobile-list">
          {isLoading && <div className="contact-messages-empty">Loading product enquiries...</div>}
          {!isLoading && visibleEnquiries.map((enquiry) => (
            <article className="contact-message-card" key={enquiry.id}>
              <div className="contact-message-card-heading">
                <div>
                  <h3>{enquiry.customer_name || 'Unknown customer'}</h3>
                  <time>{formatDate(enquiry.created_at)}</time>
                </div>
                {renderStatus(enquiry)}
              </div>
              <RouterLink className="product-enquiry-mobile-product" to={getProductPath(enquiry)} target="_blank" rel="noreferrer">
                {enquiry.product_name || 'Product unavailable'} · {formatPrice(enquiry.product_price)}
              </RouterLink>
              <a className="contact-message-card-phone" href={enquiry.phone ? `tel:${enquiry.phone}` : undefined}>
                {enquiry.phone || 'No mobile number provided'}
              </a>
              {enquiry.alternate_phone && <a className="contact-message-card-phone" href={`tel:${enquiry.alternate_phone}`}>Alternate: {enquiry.alternate_phone}</a>}
              <a className="contact-message-card-email" href={enquiry.email ? `mailto:${enquiry.email}` : undefined}>{enquiry.email || 'No email provided'}</a>
              <div className="contact-message-card-footer">{renderViewAction(enquiry)}</div>
            </article>
          ))}
          {!isLoading && !visibleEnquiries.length && (
            <div className="contact-messages-empty">
              {searchQuery ? 'No enquiries match your search.' : 'No product enquiries received yet.'}
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent className="contact-message-modal">
          <ModalHeader>Product Enquiry</ModalHeader>
          <ModalCloseButton />
          {selectedEnquiry && (
            <>
              <ModalBody>
                <dl className="contact-message-details product-enquiry-details">
                  <div><dt>Received</dt><dd>{formatDate(selectedEnquiry.created_at)}</dd></div>
                  <div>
                    <dt>Product</dt>
                    <dd className="product-enquiry-product-detail">
                      {selectedEnquiry.product_image_url && <img src={selectedEnquiry.product_image_url} alt="" />}
                      <RouterLink to={getProductPath(selectedEnquiry)} target="_blank" rel="noreferrer">{selectedEnquiry.product_name || 'Product unavailable'}</RouterLink>
                    </dd>
                  </div>
                  <div><dt>Product type</dt><dd>{selectedEnquiry.product_type || '—'}</dd></div>
                  <div><dt>Product price</dt><dd>{formatPrice(selectedEnquiry.product_price)}</dd></div>
                  <div><dt>Customer</dt><dd>{selectedEnquiry.customer_name || '—'}</dd></div>
                  <div><dt>Contact number</dt><dd>{selectedEnquiry.phone || '—'}</dd></div>
                  <div><dt>Alternate number</dt><dd>{selectedEnquiry.alternate_phone || '—'}</dd></div>
                  <div><dt>Email</dt><dd>{selectedEnquiry.email || '—'}</dd></div>
                  {selectedEnquiry.message && <div className="contact-message-full-text"><dt>Message</dt><dd>{selectedEnquiry.message}</dd></div>}
                </dl>
                <label className="contact-message-status-control">
                  <span>Status</span>
                  <Select
                    value={selectedEnquiry.status || 'New'}
                    isDisabled={isSaving}
                    onChange={(event) => handleStatusChange(selectedEnquiry.id, event.target.value)}
                  >
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </Select>
                </label>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default AdminProductEnquiries

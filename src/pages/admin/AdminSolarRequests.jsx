import {
  Box,
  Button,
  Container,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
import {
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
  FaEnvelope,
  FaEye,
  FaSearch,
} from 'react-icons/fa'
import {
  fetchSolarRequests,
  subscribeToSolarRequestChanges,
  updateSolarRequestStatus,
} from '../../services/supabase'
import '../../styles/admin-contact-messages.css'
import '../../styles/admin-solar-requests.css'

const pageSize = 8
const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled']
const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}
const formatCurrency = (value) => (
  value !== null && value !== undefined && value !== ''
    ? `₹${Number(value).toLocaleString('en-IN')}`
    : 'Not provided'
)
const getAddress = (request) => (
  [request.address, request.city, request.pincode].filter(Boolean).join(', ') || '—'
)
const getVisitTime = (request) => (
  [request.preferred_date, request.preferred_time].filter(Boolean).join(' at ') || 'Not specified'
)

function AdminSolarRequests() {
  const [requests, setRequests] = useState([])
  const [loadedAt, setLoadedAt] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    let active = true
    const loadRequests = () => {
      fetchSolarRequests()
        .then((rows) => {
          if (!active) return
          setRequests(rows)
          setLoadedAt(Date.now())
          setErrorMessage('')
        })
        .catch((error) => {
          if (active) setErrorMessage(error.message || 'Unable to load solar requests.')
        })
        .finally(() => {
          if (active) setIsLoading(false)
        })
    }
    loadRequests()
    const unsubscribe = subscribeToSolarRequestChanges(loadRequests)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return requests
    return requests.filter((request) => (
      [
        request.request_type,
        request.full_name,
        request.phone,
        request.email,
        request.property_type,
        request.address,
        request.city,
        request.pincode,
        request.service_required,
        request.monthly_electricity_bill,
        request.has_existing_solar,
        request.requirements,
        request.preferred_date,
        request.preferred_time,
        request.status,
      ].some((value) => String(value || '').toLowerCase().includes(query))
    ))
  }, [requests, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
  const visibleRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const pendingCount = requests.filter((request) => request.status === 'Pending').length
  const confirmedCount = requests.filter((request) => request.status === 'Confirmed').length
  const lastWeekCount = requests.filter((request) => {
    const createdAt = new Date(request.created_at).getTime()
    return loadedAt > 0
      && Number.isFinite(createdAt)
      && createdAt >= loadedAt - 7 * 24 * 60 * 60 * 1000
  }).length
  const startItem = filteredRequests.length ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = Math.min(currentPage * pageSize, filteredRequests.length)

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = async (requestId, status) => {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const updatedRequest = await updateSolarRequestStatus(requestId, status)
      setRequests((current) => current.map((request) => (
        request.id === updatedRequest.id ? updatedRequest : request
      )))
      setSelectedRequest((current) => (
        current?.id === updatedRequest.id ? updatedRequest : current
      ))
    } catch (error) {
      setErrorMessage(error.message || 'Unable to update solar request status.')
    } finally {
      setIsSaving(false)
    }
  }

  const showRequest = (request) => {
    setSelectedRequest(request)
    onOpen()
  }

  const renderStatus = (request) => (
    <span className={`contact-message-status status-${String(request.status || 'Pending').toLowerCase()}`}>
      {request.status || 'Pending'}
    </span>
  )

  const renderActions = (request) => (
    <div className="contact-message-actions">
      <Button className="contact-message-view" onClick={() => showRequest(request)}>
        <FaEye aria-hidden="true" />
        View
      </Button>
      <Menu>
        <MenuButton
          as={IconButton}
          className="contact-message-more"
          aria-label={`More actions for request from ${request.full_name}`}
          icon={<FaEllipsisV />}
          variant="ghost"
        />
        <MenuList>
          {statuses.map((status) => (
            <MenuItem
              key={status}
              isDisabled={isSaving || request.status === status}
              onClick={() => handleStatusChange(request.id, status)}
            >
              Mark as {status}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </div>
  )

  return (
    <Container className="admin-contact-messages admin-solar-requests" maxW="1500px" px={0}>
      <header className="contact-messages-heading">
        <div>
          <p>Operations Center</p>
          <h1>Solar Requests</h1>
          <span>Review customer requirements and manage solar service requests.</span>
        </div>
      </header>

      {errorMessage && <Box className="contact-messages-error" role="alert">{errorMessage}</Box>}

      <section className="contact-message-stats" aria-label="Solar request summary">
        <div className="contact-message-stat">
          <span>Total Requests</span>
          <strong>{requests.length}</strong>
        </div>
        <div className="contact-message-stat is-new">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="contact-message-stat is-read">
          <span>Confirmed</span>
          <strong>{confirmedCount}</strong>
        </div>
        <div className="contact-message-stat">
          <span>Last 7 Days</span>
          <strong>{lastWeekCount}</strong>
        </div>
      </section>

      <section className="contact-messages-panel" aria-label="Solar requests">
        <div className="contact-messages-panel-heading">
          <div>
            <h2>Solar Requests</h2>
            <p>Review customer, property, and service information.</p>
          </div>
          <label className="contact-messages-search">
            <FaSearch aria-hidden="true" />
            <Input
              aria-label="Search Solar requests"
              placeholder="Search by customer, email, service..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </label>
        </div>

        <div className="contact-messages-table-wrap">
          <Table className="contact-messages-table solar-requests-table">
            <Thead>
              <Tr>
                <Th>Received</Th>
                <Th>Request</Th>
                <Th>Customer</Th>
                <Th>Contact</Th>
                <Th>Property</Th>
                <Th>Service / Requirements</Th>
                <Th>Preferred Visit</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading && <Tr><Td colSpan={9} className="contact-messages-empty">Loading solar requests...</Td></Tr>}
              {!isLoading && visibleRequests.map((request) => (
                <Tr key={request.id}>
                  <Td className="contact-message-date">{formatDate(request.created_at)}</Td>
                  <Td className="solar-request-type">{request.request_type || '—'}</Td>
                  <Td>{request.full_name || '—'}</Td>
                  <Td className="solar-request-contact">
                    {request.phone && <a href={`tel:${request.phone}`}>{request.phone}</a>}
                    {request.email && <a href={`mailto:${request.email}`}>{request.email}</a>}
                    {!request.phone && !request.email && '—'}
                  </Td>
                  <Td className="solar-request-property">
                    <strong>{request.property_type || 'Property not specified'}</strong>
                    <span>{getAddress(request)}</span>
                  </Td>
                  <Td className="solar-request-service">
                    <strong>{request.service_required || 'Service not specified'}</strong>
                    <span>Monthly bill: {formatCurrency(request.monthly_electricity_bill)}</span>
                    <span>Existing solar: {request.has_existing_solar || 'Not specified'}</span>
                    {request.requirements && <span>{request.requirements}</span>}
                  </Td>
                  <Td className="solar-request-visit">{getVisitTime(request)}</Td>
                  <Td>{renderStatus(request)}</Td>
                  <Td>{renderActions(request)}</Td>
                </Tr>
              ))}
              {!isLoading && !visibleRequests.length && (
                <Tr>
                  <Td colSpan={9} className="contact-messages-empty">
                    {searchQuery ? 'No requests match your search.' : 'No solar requests received yet.'}
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </div>

        <div className="contact-messages-footer">
          <span>Showing {startItem}–{endItem} of {filteredRequests.length} requests</span>
          <nav className="contact-message-pagination" aria-label="Solar request pages">
            <Button
              aria-label="Previous page"
              isDisabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <FaChevronLeft />
            </Button>
            <strong>{currentPage}</strong>
            <Button
              aria-label="Next page"
              isDisabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              <FaChevronRight />
            </Button>
          </nav>
        </div>

        <div className="contact-messages-mobile-list">
          {isLoading && <div className="contact-messages-empty">Loading solar requests...</div>}
          {!isLoading && visibleRequests.map((request) => (
            <article className="contact-message-card solar-request-card" key={request.id}>
              <div className="contact-message-card-heading">
                <div>
                  <h3>{request.full_name || 'Unknown customer'}</h3>
                  <time>{formatDate(request.created_at)}</time>
                </div>
                {renderStatus(request)}
              </div>
              <div className="solar-request-card-type">{request.request_type || 'Request'}</div>
              <a className="contact-message-card-email" href={request.email ? `mailto:${request.email}` : undefined}>
                <FaEnvelope aria-hidden="true" />
                {request.email || 'No email provided'}
              </a>
              <a className="contact-message-card-phone" href={request.phone ? `tel:${request.phone}` : undefined}>
                {request.phone || 'No mobile number provided'}
              </a>
              <dl className="solar-request-card-details">
                <div><dt>Property</dt><dd>{request.property_type || 'Not specified'}</dd></div>
                <div><dt>Address</dt><dd>{getAddress(request)}</dd></div>
                <div><dt>Service</dt><dd>{request.service_required || 'Not specified'}</dd></div>
                <div><dt>Monthly bill</dt><dd>{formatCurrency(request.monthly_electricity_bill)}</dd></div>
                <div><dt>Existing solar</dt><dd>{request.has_existing_solar || 'Not specified'}</dd></div>
                <div><dt>Preferred visit</dt><dd>{getVisitTime(request)}</dd></div>
                {request.requirements && <div className="solar-request-card-requirements"><dt>Requirements</dt><dd>{request.requirements}</dd></div>}
              </dl>
              <div className="contact-message-card-footer">{renderActions(request)}</div>
            </article>
          ))}
          {!isLoading && !visibleRequests.length && (
            <div className="contact-messages-empty">
              {searchQuery ? 'No requests match your search.' : 'No solar requests received yet.'}
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent className="contact-message-modal solar-request-modal">
          <ModalHeader>Solar Request Details</ModalHeader>
          <ModalCloseButton />
          {selectedRequest && (
            <>
              <ModalBody>
                <dl className="contact-message-details solar-request-modal-details">
                  <div><dt>Received</dt><dd>{formatDate(selectedRequest.created_at)}</dd></div>
                  <div><dt>Request type</dt><dd>{selectedRequest.request_type || '—'}</dd></div>
                  <div><dt>Customer</dt><dd>{selectedRequest.full_name || '—'}</dd></div>
                  <div><dt>Mobile</dt><dd>{selectedRequest.phone || '—'}</dd></div>
                  <div><dt>Email</dt><dd>{selectedRequest.email || '—'}</dd></div>
                  <div><dt>Property</dt><dd>{selectedRequest.property_type || 'Not specified'}</dd></div>
                  <div><dt>Address</dt><dd>{getAddress(selectedRequest)}</dd></div>
                  <div><dt>Service required</dt><dd>{selectedRequest.service_required || 'Not specified'}</dd></div>
                  <div><dt>Monthly bill</dt><dd>{formatCurrency(selectedRequest.monthly_electricity_bill)}</dd></div>
                  <div><dt>Existing solar</dt><dd>{selectedRequest.has_existing_solar || 'Not specified'}</dd></div>
                  <div><dt>Preferred visit</dt><dd>{getVisitTime(selectedRequest)}</dd></div>
                  {selectedRequest.requirements && (
                    <div className="contact-message-full-text">
                      <dt>Requirements</dt>
                      <dd>{selectedRequest.requirements}</dd>
                    </div>
                  )}
                </dl>
                <label className="contact-message-status-control">
                  <span>Status</span>
                  <Select
                    value={selectedRequest.status || 'Pending'}
                    isDisabled={isSaving}
                    onChange={(event) => handleStatusChange(selectedRequest.id, event.target.value)}
                  >
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </Select>
                </label>
              </ModalBody>
              <ModalFooter>
                {selectedRequest.email && (
                  <Button
                    as="a"
                    href={`mailto:${selectedRequest.email}`}
                    className="contact-message-reply"
                    mr={3}
                  >
                    Reply by email
                  </Button>
                )}
                <Button variant="ghost" onClick={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default AdminSolarRequests

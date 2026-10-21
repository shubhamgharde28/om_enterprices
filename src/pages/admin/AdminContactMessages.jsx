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
  fetchContactMessages,
  subscribeToContactMessageChanges,
  updateContactMessageStatus,
} from '../../services/supabase'
import '../../styles/admin-contact-messages.css'

const pageSize = 8
const statuses = ['New', 'Read', 'Replied', 'Archived']
const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

function AdminContactMessages() {
  const [messages, setMessages] = useState([])
  const [loadedAt, setLoadedAt] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    let active = true
    const loadMessages = () => {
      fetchContactMessages()
        .then((rows) => {
          if (active) {
            setMessages(rows)
            setLoadedAt(Date.now())
            setErrorMessage('')
          }
        })
        .catch((error) => {
          if (active) setErrorMessage(error.message || 'Unable to load contact messages.')
        })
        .finally(() => {
          if (active) setIsLoading(false)
        })
    }
    loadMessages()
    const unsubscribe = subscribeToContactMessageChanges(loadMessages)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return messages
    return messages.filter((message) => (
      [message.name, message.email, message.phone, message.message]
        .some((value) => String(value || '').toLowerCase().includes(query))
    ))
  }, [messages, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / pageSize))
  const visibleMessages = filteredMessages.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const lastWeekCount = messages.filter((message) => {
    const createdAt = new Date(message.created_at).getTime()
    return loadedAt > 0
      && Number.isFinite(createdAt)
      && createdAt >= loadedAt - 7 * 24 * 60 * 60 * 1000
  }).length
  const unreadCount = messages.filter((message) => message.status === 'New').length
  const readCount = messages.filter((message) => message.status === 'Read').length
  const startItem = filteredMessages.length ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = Math.min(currentPage * pageSize, filteredMessages.length)

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = async (messageId, status) => {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const updatedMessage = await updateContactMessageStatus(messageId, status)
      setMessages((current) => current.map((message) => (
        message.id === updatedMessage.id ? updatedMessage : message
      )))
      setSelectedMessage((current) => (
        current?.id === updatedMessage.id ? updatedMessage : current
      ))
    } catch (error) {
      setErrorMessage(error.message || 'Unable to update contact message status.')
    } finally {
      setIsSaving(false)
    }
  }

  const showMessage = (message) => {
    setSelectedMessage(message)
    onOpen()
  }

  const renderStatus = (message) => (
    <span className={`contact-message-status status-${String(message.status || 'New').toLowerCase()}`}>
      {message.status || 'New'}
    </span>
  )

  const renderActions = (message) => (
    <div className="contact-message-actions">
      <Button className="contact-message-view" onClick={() => showMessage(message)}>
        <FaEye aria-hidden="true" />
        View
      </Button>
      <Menu>
        <MenuButton
          as={IconButton}
          className="contact-message-more"
          aria-label={`More actions for message from ${message.name}`}
          icon={<FaEllipsisV />}
          variant="ghost"
        />
        <MenuList>
          {statuses.map((status) => (
            <MenuItem
              key={status}
              isDisabled={isSaving || message.status === status}
              onClick={() => handleStatusChange(message.id, status)}
            >
              Mark as {status}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </div>
  )

  return (
    <Container className="admin-contact-messages" maxW="1500px" px={0}>
      <header className="contact-messages-heading">
        <div>
          <p>Operations Center</p>
          <h1>RO / Water Purifier Contact Messages</h1>
          <span>View and manage customer messages for RO and water purifier services.</span>
        </div>
      </header>

      {errorMessage && <Box className="contact-messages-error" role="alert">{errorMessage}</Box>}

      <section className="contact-message-stats" aria-label="Contact message summary">
        <div className="contact-message-stat">
          <span>Total Messages</span>
          <strong>{messages.length}</strong>
        </div>
        <div className="contact-message-stat is-new">
          <span>New</span>
          <strong>{unreadCount}</strong>
        </div>
        <div className="contact-message-stat is-read">
          <span>Read</span>
          <strong>{readCount}</strong>
        </div>
        <div className="contact-message-stat">
          <span>Last 7 Days</span>
          <strong>{lastWeekCount}</strong>
        </div>
      </section>

      <section className="contact-messages-panel" aria-label="Contact messages">
        <div className="contact-messages-panel-heading">
          <div>
            <h2>Contact Messages</h2>
            <p>Manage and respond to customer inquiries.</p>
          </div>
          <label className="contact-messages-search">
            <FaSearch aria-hidden="true" />
            <Input
              aria-label="Search contact messages"
              placeholder="Search by name, email or message..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </label>
        </div>

        <div className="contact-messages-table-wrap">
          <Table className="contact-messages-table">
            <Thead>
              <Tr>
                <Th>Received</Th>
                <Th>Name</Th>
                <Th>Mobile</Th>
                <Th>Email</Th>
                <Th>Message</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading && <Tr><Td colSpan={7} className="contact-messages-empty">Loading messages...</Td></Tr>}
              {!isLoading && visibleMessages.map((message) => (
                <Tr key={message.id}>
                  <Td className="contact-message-date">{formatDate(message.created_at)}</Td>
                  <Td>{message.name || '—'}</Td>
                  <Td>{message.phone || '—'}</Td>
                  <Td className="contact-message-email">{message.email || '—'}</Td>
                  <Td className="contact-message-preview">{message.message || '—'}</Td>
                  <Td>{renderStatus(message)}</Td>
                  <Td>{renderActions(message)}</Td>
                </Tr>
              ))}
              {!isLoading && !visibleMessages.length && (
                <Tr>
                  <Td colSpan={7} className="contact-messages-empty">
                    {searchQuery ? 'No messages match your search.' : 'No contact messages yet.'}
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </div>

        <div className="contact-messages-footer">
          <span>Showing {startItem}–{endItem} of {filteredMessages.length} messages</span>
          <nav className="contact-message-pagination" aria-label="Contact message pages">
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
          {isLoading && <div className="contact-messages-empty">Loading messages...</div>}
          {!isLoading && visibleMessages.map((message) => (
            <article className="contact-message-card" key={message.id}>
              <div className="contact-message-card-heading">
                <div>
                  <h3>{message.name || 'Unknown sender'}</h3>
                  <time>{formatDate(message.created_at)}</time>
                </div>
                {renderStatus(message)}
              </div>
              <a className="contact-message-card-email" href={message.email ? `mailto:${message.email}` : undefined}>
                <FaEnvelope aria-hidden="true" />
                {message.email || 'No email provided'}
              </a>
              <div className="contact-message-card-phone">{message.phone || 'No mobile number provided'}</div>
              <p className="contact-message-card-preview">{message.message || '—'}</p>
              <div className="contact-message-card-footer">{renderActions(message)}</div>
            </article>
          ))}
          {!isLoading && !visibleMessages.length && (
            <div className="contact-messages-empty">
              {searchQuery ? 'No messages match your search.' : 'No contact messages yet.'}
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent className="contact-message-modal">
          <ModalHeader>Contact Message</ModalHeader>
          <ModalCloseButton />
          {selectedMessage && (
            <>
              <ModalBody>
                <dl className="contact-message-details">
                  <div><dt>Received</dt><dd>{formatDate(selectedMessage.created_at)}</dd></div>
                  <div><dt>Name</dt><dd>{selectedMessage.name || '—'}</dd></div>
                  <div><dt>Mobile</dt><dd>{selectedMessage.phone || '—'}</dd></div>
                  <div><dt>Email</dt><dd>{selectedMessage.email || '—'}</dd></div>
                  <div className="contact-message-full-text"><dt>Message</dt><dd>{selectedMessage.message || '—'}</dd></div>
                </dl>
                <label className="contact-message-status-control">
                  <span>Status</span>
                  <Select
                    value={selectedMessage.status || 'New'}
                    isDisabled={isSaving}
                    onChange={(event) => handleStatusChange(selectedMessage.id, event.target.value)}
                  >
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </Select>
                </label>
              </ModalBody>
              <ModalFooter>
                {selectedMessage.email && (
                  <Button
                    as="a"
                    href={`mailto:${selectedMessage.email}`}
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

export default AdminContactMessages

import { Alert, AlertIcon, Button, Container, Input, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaEnvelope, FaPhone, FaSearch, FaUsers } from 'react-icons/fa'
import { fetchAdminCustomers } from '../../services/supabase'
import '../../styles/admin-contact-messages.css'
import '../../styles/admin-customers.css'

const pageSize = 10
const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loadedAt, setLoadedAt] = useState(0)

  useEffect(() => {
    let active = true
    fetchAdminCustomers()
      .then((rows) => {
        if (active) {
          setCustomers(rows)
          setLoadedAt(Date.now())
        }
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load customer records.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return customers
    return customers.filter((customer) => (
      [customer.full_name, customer.email, customer.phone]
        .some((value) => String(value || '').toLowerCase().includes(query))
    ))
  }, [customers, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const visibleCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const activeCount = customers.filter((customer) => customer.active).length
  const inactiveCount = customers.length - activeCount
  const lastWeekCount = customers.filter((customer) => {
    const createdAt = new Date(customer.created_at).getTime()
    return loadedAt > 0
      && Number.isFinite(createdAt)
      && createdAt >= loadedAt - 7 * 24 * 60 * 60 * 1000
  }).length
  const startItem = filteredCustomers.length ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = Math.min(currentPage * pageSize, filteredCustomers.length)

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const renderCustomerStatus = (customer) => (
    <span className={`customer-status${customer.active ? ' is-active' : ''}`}>
      {customer.active ? 'Active' : 'Inactive'}
    </span>
  )

  const renderContact = (customer) => (
    <div className="customer-contact-info">
      {customer.phone && (
        <a href={`tel:${customer.phone}`}>
          <FaPhone aria-hidden="true" />
          {customer.phone}
        </a>
      )}
      {customer.email && (
        <a href={`mailto:${customer.email}`}>
          <FaEnvelope aria-hidden="true" />
          {customer.email}
        </a>
      )}
      {!customer.phone && !customer.email && <span>—</span>}
    </div>
  )

  return (
    <Container className="admin-contact-messages admin-customers" maxW="1500px" px={0}>
      <header className="contact-messages-heading">
        <div>
          <p>Administration</p>
          <h1>Customers</h1>
          <span>View and manage registered customer accounts.</span>
        </div>
      </header>

      {errorMessage && (
        <Alert className="customers-error" status="error">
          <AlertIcon />
          {errorMessage}
        </Alert>
      )}

      <section className="contact-message-stats" aria-label="Customer account summary">
        <div className="contact-message-stat">
          <span>Total Customers</span>
          <strong>{customers.length}</strong>
        </div>
        <div className="contact-message-stat is-read">
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="contact-message-stat is-new">
          <span>Inactive</span>
          <strong>{inactiveCount}</strong>
        </div>
        <div className="contact-message-stat">
          <span>Joined Last 7 Days</span>
          <strong>{lastWeekCount}</strong>
        </div>
      </section>

      <section className="contact-messages-panel customers-panel" aria-label="Customer accounts">
        <div className="contact-messages-panel-heading">
          <div>
            <h2>Customer Accounts</h2>
            <p>Browse registered customers and their contact information.</p>
          </div>
          <label className="contact-messages-search">
            <FaSearch aria-hidden="true" />
            <Input
              aria-label="Search customers"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </label>
        </div>

        <div className="contact-messages-table-wrap">
          <Table className="contact-messages-table customers-table">
            <Thead>
              <Tr>
                <Th>Customer</Th>
                <Th>Contact</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading && <Tr><Td colSpan={4} className="contact-messages-empty">Loading customer accounts...</Td></Tr>}
              {!isLoading && visibleCustomers.map((customer) => (
                <Tr key={customer.id}>
                  <Td>
                    <div className="customer-name-cell">
                      <span className="customer-avatar"><FaUsers aria-hidden="true" /></span>
                      <strong>{customer.full_name || 'Unnamed customer'}</strong>
                    </div>
                  </Td>
                  <Td>{renderContact(customer)}</Td>
                  <Td className="customer-joined">{formatDate(customer.created_at)}</Td>
                  <Td>{renderCustomerStatus(customer)}</Td>
                </Tr>
              ))}
              {!isLoading && !visibleCustomers.length && (
                <Tr>
                  <Td colSpan={4} className="contact-messages-empty">
                    {searchQuery ? 'No customers match your search.' : 'No customer accounts found.'}
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </div>

        <div className="contact-messages-footer">
          <span>Showing {startItem}–{endItem} of {filteredCustomers.length} customers</span>
          <nav className="contact-message-pagination" aria-label="Customer pages">
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
          {isLoading && <div className="contact-messages-empty">Loading customer accounts...</div>}
          {!isLoading && visibleCustomers.map((customer) => (
            <article className="contact-message-card customer-card" key={customer.id}>
              <div className="contact-message-card-heading">
                <div className="customer-mobile-name">
                  <span className="customer-avatar"><FaUsers aria-hidden="true" /></span>
                  <h3>{customer.full_name || 'Unnamed customer'}</h3>
                </div>
                {renderCustomerStatus(customer)}
              </div>
              <div className="customer-card-contact">{renderContact(customer)}</div>
              <div className="customer-card-joined">
                <span>Joined</span>
                <time>{formatDate(customer.created_at)}</time>
              </div>
            </article>
          ))}
          {!isLoading && !visibleCustomers.length && (
            <div className="contact-messages-empty">
              {searchQuery ? 'No customers match your search.' : 'No customer accounts found.'}
            </div>
          )}
        </div>
      </section>
    </Container>
  )
}

export default AdminCustomers

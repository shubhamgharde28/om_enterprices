import { Box, Button, Container, Input, Select, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaCalendarAlt, FaCheckCircle, FaClock, FaPhone, FaSearch, FaTools, FaUser, FaWater } from 'react-icons/fa'
import { setBookings, updateBooking } from '../../redux/slices/bookingSlice'
import { fetchBookings, fetchTechnicians, updateBookingRecord } from '../../services/supabase'
import '../../styles/admin-bookings.css'

const bookingFilters = [
  { label: 'All Bookings', value: 'All', icon: FaCalendarAlt },
  { label: 'Pending', value: 'Pending', icon: FaClock },
  { label: 'Confirmed', value: 'Confirmed', icon: FaCheckCircle },
  { label: 'In Progress', value: 'In Progress', icon: FaTools },
  { label: 'Completed', value: 'Completed', icon: FaCheckCircle },
]

const bookingStatusClass = (status) => (status || 'other').toLowerCase().replace(/\s+/g, '-')

const toTimeInputValue = (time) => {
  if (!time) return ''
  if (/^\d{2}:\d{2}$/.test(time)) return time

  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return ''

  const [, rawHours, minutes, meridiem] = match
  let hours = Number(rawHours) % 12
  if (meridiem.toUpperCase() === 'PM') hours += 12
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

function AdminBookings() {
  const bookings = useSelector((state) => state.bookings.items)
  const dispatch = useDispatch()
  const [technicians, setTechnicians] = useState([])
  const [scheduleDrafts, setScheduleDrafts] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let active = true
    dispatch(setBookings([]))
    Promise.all([fetchBookings(), fetchTechnicians()])
      .then(([rows, technicianRows]) => {
        if (active) {
          dispatch(setBookings(rows))
          setTechnicians(technicianRows)
        }
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load bookings.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [dispatch])

  const handleStatusChange = async (bookingId, status) => {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const booking = await updateBookingRecord(bookingId, { status })
      dispatch(updateBooking(booking))
    } catch (error) {
      setErrorMessage(error.message || 'Unable to update booking status.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTechnicianChange = async (booking, technicianId) => {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const updates = {
        assigned_to: technicianId || null,
        ...(technicianId
          ? { status: 'Assigned' }
          : booking.status === 'Assigned'
            ? { status: 'Pending' }
            : {}),
      }
      const updatedBooking = await updateBookingRecord(booking.id, updates)
      dispatch(updateBooking(updatedBooking))
    } catch (error) {
      setErrorMessage(error.message || 'Unable to assign technician.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleScheduleChange = (booking, field, value) => {
    setScheduleDrafts((current) => ({
      ...current,
      [booking.id]: {
        scheduled_date: current[booking.id]?.scheduled_date
          ?? booking.scheduled_date
          ?? booking.preferred_date,
        scheduled_time: current[booking.id]?.scheduled_time
          ?? toTimeInputValue(booking.scheduled_time || booking.preferred_time),
        [field]: value,
      },
    }))
  }

  const handleScheduleSave = async (booking) => {
    const draft = scheduleDrafts[booking.id]
    const scheduledDate = draft?.scheduled_date ?? booking.scheduled_date ?? booking.preferred_date
    const scheduledTime = draft?.scheduled_time
      ?? toTimeInputValue(booking.scheduled_time || booking.preferred_time)

    if (!scheduledDate || !scheduledTime) {
      setErrorMessage('Choose both an appointment date and time before saving.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    try {
      const updatedBooking = await updateBookingRecord(booking.id, {
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
      })
      dispatch(updateBooking(updatedBooking))
      setScheduleDrafts((current) => {
        const remainingDrafts = { ...current }
        delete remainingDrafts[booking.id]
        return remainingDrafts
      })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to reschedule booking.')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    return bookings.filter((booking) => {
      const matchesStatus = activeFilter === 'All' || booking.status === activeFilter
      const searchableValues = [
        booking.booking_number,
        booking.customer_name,
        booking.email,
        booking.phone,
        booking.service_name,
        booking.status,
      ]
      const matchesSearch = !normalizedQuery
        || searchableValues.some((value) => String(value || '').toLowerCase().includes(normalizedQuery))
      return matchesStatus && matchesSearch
    })
  }, [activeFilter, bookings, searchQuery])

  const getScheduleValues = (booking) => ({
    date: scheduleDrafts[booking.id]?.scheduled_date
      ?? booking.scheduled_date
      ?? booking.preferred_date
      ?? '',
    time: scheduleDrafts[booking.id]?.scheduled_time
      ?? toTimeInputValue(booking.scheduled_time || booking.preferred_time)
      ?? '',
  })

  const renderAppointmentControls = (booking, compact = false) => {
    const schedule = getScheduleValues(booking)
    return (
      <div className={`booking-appointment-controls${compact ? ' is-compact' : ''}`}>
        <div className="booking-appointment-inputs">
          <label className="booking-input-with-icon">
            <FaCalendarAlt aria-hidden="true" />
            <Input
              aria-label={`Appointment date for booking ${booking.booking_number}`}
              type="date"
              value={schedule.date}
              isDisabled={isSaving}
              onChange={(event) => handleScheduleChange(booking, 'scheduled_date', event.target.value)}
            />
          </label>
          <label className="booking-input-with-icon">
            <FaClock aria-hidden="true" />
            <Input
              aria-label={`Appointment time for booking ${booking.booking_number}`}
              type="time"
              value={schedule.time}
              isDisabled={isSaving}
              onChange={(event) => handleScheduleChange(booking, 'scheduled_time', event.target.value)}
            />
          </label>
        </div>
        <Button
          className="booking-save-appointment"
          isDisabled={isSaving}
          isLoading={isSaving}
          onClick={() => handleScheduleSave(booking)}
        >
          <FaCalendarAlt />
          Save appointment
        </Button>
      </div>
    )
  }

  const renderTechnicianSelect = (booking, compact = false) => (
    <label className={`booking-technician-control${compact ? ' is-compact' : ''}`}>
      {!compact && <span>Technician</span>}
      <Select
        aria-label={`Assign technician for booking ${booking.booking_number}`}
        value={booking.assigned_to || ''}
        isDisabled={isSaving}
        onChange={(event) => handleTechnicianChange(booking, event.target.value)}
      >
        <option value="">Unassigned</option>
        {technicians.map((technician) => (
          <option key={technician.id} value={technician.id} disabled={!technician.active}>
            {technician.full_name}{technician.active ? '' : ' (Inactive)'}
          </option>
        ))}
      </Select>
    </label>
  )

  const renderStatusSelect = (booking, compact = false) => (
    <Select
      className={`booking-status-select status-${bookingStatusClass(booking.status)}${compact ? ' is-compact' : ''}`}
      aria-label={`Booking status for ${booking.booking_number}`}
      value={booking.status}
      isDisabled={isSaving}
      onChange={(event) => handleStatusChange(booking.id, event.target.value)}
    >
      <option>Pending</option>
      <option>Confirmed</option>
      <option>Assigned</option>
      <option>In Progress</option>
      <option>Completed</option>
      <option>Cancelled</option>
      <option>Rejected</option>
    </Select>
  )

  return (
    <Container className="admin-bookings" maxW="1500px" px={0}>
      <div className="bookings-heading">
        <div>
          <p>Operations Center</p>
          <h1>Bookings</h1>
          <span>Manage and view all service bookings from your customers.</span>
        </div>
      </div>

      {errorMessage && <Box className="bookings-error" role="alert">{errorMessage}</Box>}

      <section className="bookings-workspace" aria-label="Booking management">
        <div className="bookings-toolbar">
          <div className="bookings-filter-tabs" role="tablist" aria-label="Filter bookings by status">
            {bookingFilters.map((filter) => {
              const Icon = filter.icon
              const count = filter.value === 'All'
                ? bookings.length
                : bookings.filter((booking) => booking.status === filter.value).length
              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter.value}
                  className={`bookings-filter-tab${activeFilter === filter.value ? ' is-active' : ''}`}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  <Icon />
                  <span>{filter.label}</span>
                  <span className="bookings-filter-count">{count}</span>
                </button>
              )
            })}
          </div>
          <label className="bookings-search">
            <FaSearch aria-hidden="true" />
            <Input
              aria-label="Search bookings"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by booking ID, customer..."
            />
          </label>
        </div>

        <div className="bookings-desktop-table">
          <Table className="bookings-table" size="sm">
            <Thead>
              <Tr>
                <Th>Booking ID</Th>
                <Th>Customer</Th>
                <Th>Service</Th>
                <Th>Requested Slot</Th>
                <Th>Appointment Slot</Th>
                <Th>Technician</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading && <Tr><Td className="bookings-table-message" colSpan={7}>Loading bookings...</Td></Tr>}
              {!isLoading && filteredBookings.map((booking) => (
                <Tr key={booking.id}>
                  <Td className="booking-number-cell">{booking.booking_number}</Td>
                  <Td>
                    <div className="booking-customer-cell">
                      <span><FaUser />{booking.customer_name}</span>
                      {booking.phone && <span><FaPhone />{booking.phone}</span>}
                    </div>
                  </Td>
                  <Td>{booking.service_name}</Td>
                  <Td className="booking-requested-slot">
                    <span>{booking.preferred_date || '—'}</span>
                    <span>{booking.preferred_time || '—'}</span>
                  </Td>
                  <Td>{renderAppointmentControls(booking)}</Td>
                  <Td>{renderTechnicianSelect(booking, true)}</Td>
                  <Td>{renderStatusSelect(booking, true)}</Td>
                </Tr>
              ))}
              {!isLoading && !filteredBookings.length && (
                <Tr><Td className="bookings-table-message" colSpan={7}>No bookings match your filters.</Td></Tr>
              )}
            </Tbody>
          </Table>
        </div>

        <div className="bookings-mobile-list">
          {isLoading && <div className="booking-mobile-message">Loading bookings...</div>}
          {!isLoading && filteredBookings.map((booking) => (
            <article className="booking-mobile-card" key={booking.id}>
              <div className="booking-mobile-card-heading">
                <strong>{booking.booking_number}</strong>
                {renderStatusSelect(booking, true)}
              </div>
              <div className="booking-mobile-meta">
                <span><FaUser />{booking.customer_name}</span>
                {booking.phone && <span><FaPhone />{booking.phone}</span>}
                <span><FaWater />{booking.service_name}</span>
                <span><FaCalendarAlt />{booking.preferred_date || 'Date not set'}</span>
                <span><FaClock />{booking.preferred_time || 'Time not set'}</span>
              </div>
              <div className="booking-mobile-technician">
                <FaUser aria-hidden="true" />
                {renderTechnicianSelect(booking, true)}
              </div>
              {renderAppointmentControls(booking, true)}
            </article>
          ))}
          {!isLoading && !filteredBookings.length && (
            <div className="booking-mobile-message">No bookings match your filters.</div>
          )}
        </div>
      </section>
    </Container>
  )
}

export default AdminBookings

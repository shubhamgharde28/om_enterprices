import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaBoxOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaEllipsisH,
  FaStar,
  FaTools,
  FaUsers,
} from 'react-icons/fa'
import { fetchAdminCustomers } from '../../services/supabase'

const statusColors = {
  Pending: '#f3a712',
  Confirmed: '#20a36a',
  Assigned: '#5484e8',
  Completed: '#3785dc',
  Cancelled: '#e45f68',
}

const chartPalette = ['#1768d1', '#5b8def', '#13a87c', '#f1a832', '#e45f68', '#8a70d6']

function getLastSixMonths(bookings) {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
    return {
      label: date.toLocaleDateString('en', { month: 'short' }),
      month: date.getMonth(),
      year: date.getFullYear(),
      count: 0,
    }
  })

  bookings.forEach((booking) => {
    if (!booking.created_at) return
    const date = new Date(booking.created_at)
    if (Number.isNaN(date.getTime())) return
    const month = months.find((item) => item.month === date.getMonth() && item.year === date.getFullYear())
    if (month) month.count += 1
  })

  return months
}

function Dashboard() {
  const bookings = useSelector((state) => state.bookings.items)
  const products = useSelector((state) => state.products.items)
  const services = useSelector((state) => state.services.items)
  const [customers, setCustomers] = useState([])
  const [customerError, setCustomerError] = useState('')

  useEffect(() => {
    let active = true
    fetchAdminCustomers()
      .then((rows) => {
        if (active) {
          setCustomers(rows)
          setCustomerError('')
        }
      })
      .catch((error) => {
        if (active) setCustomerError(error.message || 'Unable to load dashboard customer records.')
      })

    return () => {
      active = false
    }
  }, [])

  const stats = [
    { label: 'Total Products', value: products.length, icon: FaBoxOpen, color: 'blue' },
    { label: 'Total Customers', value: customers.length, icon: FaUsers, color: 'violet' },
    { label: 'Pending Bookings', value: bookings.filter((booking) => booking.status === 'Pending').length, icon: FaCalendarAlt, color: 'amber' },
    { label: 'Completed Services', value: bookings.filter((booking) => booking.status === 'Completed').length, icon: FaCheckCircle, color: 'green' },
    { label: 'Active Services', value: services.filter((service) => service.active).length, icon: FaTools, color: 'cyan' },
    { label: 'Featured Products', value: products.filter((product) => product.featured).length, icon: FaStar, color: 'pink' },
  ]

  const monthlyBookings = useMemo(() => getLastSixMonths(bookings), [bookings])
  const bookingStatuses = useMemo(() => {
    const counts = bookings.reduce((result, booking) => {
      const status = booking.status || 'Other'
      result[status] = (result[status] || 0) + 1
      return result
    }, {})
    const orderedStatuses = ['Pending', 'Confirmed', 'Assigned', 'Completed', 'Cancelled']
    const knownStatuses = orderedStatuses.map((label) => ({ label, value: counts[label] || 0 }))
    const otherStatuses = Object.entries(counts)
      .filter(([label]) => !orderedStatuses.includes(label))
      .map(([label, value]) => ({ label, value }))
    return [...knownStatuses, ...otherStatuses]
  }, [bookings])

  const serviceDemand = useMemo(() => {
    const counts = bookings.reduce((result, booking) => {
      const name = booking.service_name || 'Other services'
      result[name] = (result[name] || 0) + 1
      return result
    }, {})
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((first, second) => second.value - first.value)
      .slice(0, 5)
  }, [bookings])

  const productStock = useMemo(() => {
    const buckets = [
      { label: 'Out of stock', value: 0, color: '#e45f68' },
      { label: 'Low stock', value: 0, color: '#f1a832' },
      { label: 'Healthy stock', value: 0, color: '#20a36a' },
      { label: 'Well stocked', value: 0, color: '#1768d1' },
    ]
    products.forEach((product) => {
      const stock = Number(product.stock) || 0
      const index = stock <= 0 ? 0 : stock <= 5 ? 1 : stock <= 20 ? 2 : 3
      buckets[index].value += 1
    })
    return buckets
  }, [products])

  const recentBookings = [...bookings]
    .sort((first, second) => new Date(second.created_at || 0) - new Date(first.created_at || 0))
    .slice(0, 4)
  const recentCustomers = customers.slice(0, 4)
  const bookingTotal = bookings.length
  const circumference = 2 * Math.PI * 48
  let statusOffset = 0

  const bookingPoints = monthlyBookings.map((month, index) => {
    const x = 46 + index * 86
    const maxCount = Math.max(...monthlyBookings.map((item) => item.count), 1)
    const y = 155 - (month.count / maxCount) * 112
    return { ...month, x, y }
  })
  const bookingLine = bookingPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const bookingArea = `${bookingLine} L ${bookingPoints[bookingPoints.length - 1].x} 158 L ${bookingPoints[0].x} 158 Z`
  const maxDemand = Math.max(...serviceDemand.map((item) => item.value), 1)
  const maxStock = Math.max(...productStock.map((item) => item.value), 1)

  return (
    <main className="admin-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="dashboard-eyebrow">Welcome back,</p>
          <h1>Dashboard Overview</h1>
          <p className="dashboard-subtitle">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        <div className="dashboard-period"><FaCalendarAlt /> Last 6 months</div>
      </div>

      {customerError && (
        <div className="dashboard-error" role="alert">
          <strong>Customer data unavailable.</strong> {customerError}
        </div>
      )}

      <section className="dashboard-stat-grid" aria-label="Business overview">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <article className="dashboard-stat-card" key={stat.label}>
              <span className={`dashboard-stat-icon ${stat.color}`}><Icon /></span>
              <div className="dashboard-stat-copy">
                <span className="dashboard-stat-label">{stat.label}</span>
                <strong className="dashboard-stat-value">{stat.value}</strong>
              </div>
              <FaEllipsisH className="dashboard-stat-menu" aria-hidden="true" />
            </article>
          )
        })}
      </section>

      <section className="dashboard-chart-grid" aria-label="Business analytics">
        <article className="dashboard-panel dashboard-chart-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Booking Trends</h2>
              <p>Bookings created over the last six months</p>
            </div>
            <span className="dashboard-chart-key"><i /> Bookings</span>
          </div>
          <div className="dashboard-line-chart">
            <svg viewBox="0 0 520 205" role="img" aria-label="Line chart of monthly bookings">
              <defs>
                <linearGradient id="booking-area-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2675df" stopOpacity=".2" />
                  <stop offset="100%" stopColor="#2675df" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[43, 80, 117, 155].map((y) => <line key={y} x1="46" y1={y} x2="476" y2={y} className="chart-grid-line" />)}
              <path d={bookingArea} fill="url(#booking-area-fill)" />
              <path d={bookingLine} className="booking-line" />
              {bookingPoints.map((point) => (
                <g key={`${point.year}-${point.month}`}>
                  <circle cx={point.x} cy={point.y} r="4.5" className="booking-point" />
                  <text x={point.x} y="184" className="chart-axis-label" textAnchor="middle">{point.label}</text>
                </g>
              ))}
              {[0, 1, 2, 3].map((step) => (
                <text key={step} x="34" y={159 - step * 37} className="chart-axis-label" textAnchor="end">
                  {Math.round(Math.max(...monthlyBookings.map((item) => item.count), 1) * step / 3)}
                </text>
              ))}
            </svg>
          </div>
        </article>

        <article className="dashboard-panel dashboard-chart-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Booking Status</h2>
              <p>Current booking breakdown</p>
            </div>
          </div>
          <div className="dashboard-donut-layout">
            <div className="dashboard-donut">
              <svg viewBox="0 0 120 120" role="img" aria-label={`Donut chart showing ${bookingTotal} bookings by status`}>
                <circle cx="60" cy="60" r="48" className="donut-track" />
                {bookingStatuses.map((status, index) => {
                  const dashLength = bookingTotal ? (status.value / bookingTotal) * circumference : 0
                  const circle = (
                    <circle
                      key={status.label}
                      cx="60"
                      cy="60"
                      r="48"
                      className="donut-segment"
                      stroke={statusColors[status.label] || chartPalette[index % chartPalette.length]}
                      strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                      strokeDashoffset={-statusOffset}
                    />
                  )
                  statusOffset += dashLength
                  return circle
                })}
              </svg>
              <div className="dashboard-donut-total"><strong>{bookingTotal}</strong><span>Bookings</span></div>
            </div>
            <ul className="dashboard-chart-legend">
              {bookingStatuses.map((status, index) => (
                <li key={status.label}>
                  <span className="dashboard-legend-label">
                    <i style={{ backgroundColor: statusColors[status.label] || chartPalette[index % chartPalette.length] }} />
                    {status.label}
                  </span>
                  <strong>{status.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="dashboard-panel dashboard-chart-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Most Requested Services</h2>
              <p>Top services by booking volume</p>
            </div>
          </div>
          {serviceDemand.length ? (
            <div className="dashboard-bar-list">
              {serviceDemand.map((service, index) => (
                <div className="dashboard-bar-row" key={service.label}>
                  <div className="dashboard-bar-label"><span>{service.label}</span><strong>{service.value}</strong></div>
                  <div className="dashboard-bar-track"><span style={{ width: `${(service.value / maxDemand) * 100}%`, backgroundColor: chartPalette[index % chartPalette.length] }} /></div>
                </div>
              ))}
            </div>
          ) : <p className="dashboard-empty-chart">Service booking data will appear here.</p>}
        </article>

        <article className="dashboard-panel dashboard-chart-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Product Inventory</h2>
              <p>Products grouped by available stock</p>
            </div>
          </div>
          <div className="dashboard-bar-list">
            {productStock.map((stock) => (
              <div className="dashboard-bar-row" key={stock.label}>
                <div className="dashboard-bar-label"><span>{stock.label}</span><strong>{stock.value}</strong></div>
                <div className="dashboard-bar-track"><span style={{ width: `${(stock.value / maxStock) * 100}%`, backgroundColor: stock.color }} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-table-grid" aria-label="Recent activity">
        <article className="dashboard-panel dashboard-table-panel">
          <div className="dashboard-panel-heading">
            <div className="dashboard-table-title"><FaCalendarAlt /><h2>Recent Bookings</h2></div>
            <Link to="/admin/bookings" className="dashboard-view-all">View all <FaArrowRight /></Link>
          </div>
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead><tr><th>Booking</th><th>Customer</th><th>Status</th></tr></thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.booking_number}</td>
                    <td>{booking.customer_name}</td>
                    <td><span className={`dashboard-status status-${(booking.status || 'other').toLowerCase().replace(/\s+/g, '-')}`}>{booking.status || 'Other'}</span></td>
                  </tr>
                ))}
                {!recentBookings.length && <tr><td className="dashboard-table-empty" colSpan="3">No bookings yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-panel dashboard-table-panel">
          <div className="dashboard-panel-heading">
            <div className="dashboard-table-title"><FaUsers /><h2>Recent Customers</h2></div>
            <Link to="/admin/customers" className="dashboard-view-all">View all <FaArrowRight /></Link>
          </div>
          <div className="dashboard-table-scroll">
            <table className="dashboard-table">
              <thead><tr><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {recentCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.full_name}</td>
                    <td>{customer.email}</td>
                  </tr>
                ))}
                {!recentCustomers.length && <tr><td className="dashboard-table-empty" colSpan="2">{customerError ? 'Customer records could not be loaded.' : 'No customers yet.'}</td></tr>}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  )
}

export default Dashboard

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import {
  FaArrowRight,
  FaClock,
  FaCogs,
  FaEnvelope,
  FaLeaf,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaTint,
  FaTruck,
  FaUserCog,
} from 'react-icons/fa'
import { addBooking } from '../../redux/slices/bookingSlice'
import { setServices } from '../../redux/slices/serviceSlice'
import { fetchServices, submitBooking } from '../../services/supabase'
import '../../styles/book-service.css'

const initialForm = {
  customer_name: '',
  phone: '',
  email: '',
  service_id: '',
  product_type: '',
  address: '',
  city: '',
  pincode: '',
  preferred_date: '',
  preferred_time: '',
  problem_description: '',
}

const productTypes = ['Domestic RO', 'Commercial RO', 'UV Purifier', 'Water Softener', 'Other']

/* Hourly slots; values are 24h "HH:MM" so they match what <input type="time"> used to send. */
const timeSlots = Array.from({ length: 10 }, (_, index) => {
  const hour = 9 + index
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour > 12 ? hour - 12 : hour
  return { value: `${String(hour).padStart(2, '0')}:00`, label: `${display}:00 ${suffix}` }
})

function BookService() {
  const services = useSelector((state) => state.services.items)
  const user = useSelector((state) => state.auth.user)
  const websiteContent = useSelector((state) => state.ui.websiteContent)
  const dispatch = useDispatch()
  const toast = useToast()
  const location = useLocation()
  const requestedServiceId = location.state?.serviceId || ''
  const [form, setForm] = useState(initialForm)
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [servicesError, setServicesError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const phone = websiteContent?.phone || '09724916029'
  const email = websiteContent?.email || 'hello@omenterprises.com'
  const address = websiteContent?.address || 'Near Khamtalav Chowk, Shitla Mata Mandir Road, Bhandara H O, Bhandara-441904, Maharashtra'
  const hours = websiteContent?.hours || 'Mon - Sun: 9:00 AM - 7:00 PM'

  useEffect(() => {
    let active = true
    fetchServices()
      .then((rows) => {
        if (active) {
          dispatch(setServices(rows))
          if (requestedServiceId && rows.some((service) => service.id === requestedServiceId)) {
            setForm((current) => ({ ...current, service_id: requestedServiceId }))
          }
        }
      })
      .catch((error) => {
        if (active) setServicesError(error.message || 'Unable to load services.')
      })
      .finally(() => {
        if (active) setIsLoadingServices(false)
      })

    return () => {
      active = false
    }
  }, [dispatch, requestedServiceId])

  useEffect(() => {
    if (!user) return

    setForm((current) => ({
      ...current,
      customer_name: current.customer_name || user.fullName || '',
      phone: current.phone || user.phone || '',
      email: current.email || user.email || '',
      address: current.address || user.address || '',
      city: current.city || user.city || '',
      pincode: current.pincode || user.pincode || '',
    }))
  }, [user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user?.id) {
      toast({ title: 'Please sign in to book a service', status: 'error', duration: 4000, isClosable: true })
      return
    }

    const selectedService = services.find((item) => item.id === form.service_id)
    if (!selectedService) {
      toast({ title: 'Choose a service before booking', status: 'error', duration: 4000, isClosable: true })
      return
    }

    const payload = {
      ...form,
      user_id: user.id,
      status: 'Pending',
      service_name: selectedService.name,
    }

    setIsSubmitting(true)
    try {
      const booking = await submitBooking(payload)
      dispatch(addBooking(booking))
      toast({ title: 'Service booked successfully', description: `Booking ID: ${booking.booking_number}`, status: 'success', duration: 4000, isClosable: true })
      setForm({
        ...initialForm,
        customer_name: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        service_id: requestedServiceId,
      })
    } catch (error) {
      toast({ title: 'Booking failed', description: error.message, status: 'error', duration: 4000, isClosable: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  return (
    <div className="bs-page">
      {/* HERO */}
      <section className="bs-hero">
        <div className="bs-hero-visual">
          <img src="/images/Premium_Purifier.png" alt="OM water purifier" />
        </div>
        <div className="bs-hero-copy">
          <p className="bs-eyebrow">BOOK A SERVICE</p>
          <h1>
            Clean Water.
            <span>When it matters.</span>
          </h1>
          <p className="bs-hero-text">
            Schedule a service request and our expert team will get in touch with you at your
            convenience. We ensure quick support and hassle-free service for your water purifier.
          </p>
          <ul className="bs-hero-points">
            <li>
              <span className="bs-icon"><FaTint /></span>
              <p><strong>Quick Response</strong><small>Within 24 Hours</small></p>
            </li>
            <li>
              <span className="bs-icon"><FaUserCog /></span>
              <p><strong>Expert Technicians</strong><small>Trained &amp; Certified</small></p>
            </li>
            <li>
              <span className="bs-icon"><FaCogs /></span>
              <p><strong>Genuine Spare Parts</strong><small>100% Original</small></p>
            </li>
          </ul>
        </div>
      </section>

      <div className="bs-container">
        {/* CONTACT + FORM */}
        <section className="bs-grid">
          <aside className="bs-side">
            <p className="bs-eyebrow bs-eyebrow-sm">GET IN TOUCH</p>
            <h2>Contact Our Service Team</h2>
            <p className="bs-side-intro">
              Need assistance with installation, repair, or maintenance? Our team is here to help.
              Reach out to us anytime.
            </p>
            <ul className="bs-info-list">
              <li>
                <span className="bs-icon"><FaPhoneAlt /></span>
                <div><b>Phone</b><span>{phone}</span></div>
              </li>
              <li>
                <span className="bs-icon"><FaEnvelope /></span>
                <div><b>Email</b><span>{email}</span></div>
              </li>
              <li>
                <span className="bs-icon"><FaMapMarkerAlt /></span>
                <div><b>Address</b><span>{address}</span></div>
              </li>
              <li>
                <span className="bs-icon"><FaClock /></span>
                <div><b>Working Hours</b><span>{hours}</span></div>
              </li>
            </ul>
            <p className="bs-script" aria-hidden="true">We&apos;re here to help!</p>
          </aside>

          <div className="bs-form-card">
            <h2>Book a Service</h2>
            <p className="bs-form-intro">
              Fill in the details below and our team will get back to you as soon as possible.
            </p>

            <form className="bs-form" onSubmit={handleSubmit}>
              <div className="bs-row">
                <label>
                  <span>Customer Name</span>
                  <input type="text" placeholder="Your name" value={form.customer_name} onChange={update('customer_name')} required />
                </label>
                <label>
                  <span>Phone Number</span>
                  <input type="tel" placeholder="Your mobile number" value={form.phone} onChange={update('phone')} required />
                </label>
              </div>

              <div className="bs-row">
                <label>
                  <span>Email</span>
                  <input type="email" placeholder="Your email" value={form.email} onChange={update('email')} required />
                </label>
                <label>
                  <span>Service Type</span>
                  <select value={form.service_id} onChange={update('service_id')} required disabled={isLoadingServices || Boolean(servicesError)}>
                    <option value="">{isLoadingServices ? 'Loading services...' : 'Select a service'}</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              {servicesError && <div className="bs-alert" role="alert">{servicesError}</div>}

              <label>
                <span>Product / Purifier Type</span>
                <select value={form.product_type} onChange={update('product_type')}>
                  <option value="">Select product type</option>
                  {productTypes.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <div className="bs-row">
                <label>
                  <span>Preferred Date</span>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.preferred_date}
                    onChange={update('preferred_date')}
                    required
                  />
                </label>
                <label>
                  <span>Preferred Time</span>
                  <select value={form.preferred_time} onChange={update('preferred_time')} required>
                    <option value="">Select time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Not in the mockup, but the booking needs a service address. Delete this block to match the mockup exactly. */}
              <div className="bs-row">
                <label>
                  <span>City</span>
                  <input type="text" placeholder="Your city" value={form.city} onChange={update('city')} required />
                </label>
                <label>
                  <span>Pincode</span>
                  <input type="text" placeholder="Your pincode" value={form.pincode} onChange={update('pincode')} required />
                </label>
              </div>
              <label>
                <span>Address</span>
                <input type="text" placeholder="Your full address" value={form.address} onChange={update('address')} required />
              </label>

              <label>
                <span>Problem Description</span>
                <textarea rows={4} placeholder="Tell us how we can help" value={form.problem_description} onChange={update('problem_description')} required />
              </label>

              <button type="submit" className="bs-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Booking...' : 'Book Service'} <FaArrowRight />
              </button>
            </form>
          </div>
        </section>

        {/* COVERAGE */}
        <div className="bs-coverage">
          <span className="bs-icon bs-icon-lg"><FaMapMarkerAlt /></span>
          <div>
            <strong>Our Service Coverage</strong>
            <small>{address}</small>
          </div>
          <a
            className="bs-directions"
            href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noreferrer"
          >
            Get Directions <FaArrowRight />
          </a>
        </div>

        {/* TRUST STRIP */}
        <section className="bs-trust" aria-label="Why book with us">
          <div>
            <span className="bs-icon bs-icon-lg"><FaCogs /></span>
            <p><strong>Genuine Spare Parts</strong><small>100% Original</small></p>
          </div>
          <div>
            <span className="bs-icon bs-icon-lg"><FaTruck /></span>
            <p><strong>Skilled Technicians</strong><small>Trained &amp; Certified</small></p>
          </div>
          <div>
            <span className="bs-icon bs-icon-lg"><FaLeaf /></span>
            <p><strong>On-Time Service</strong><small>Your Time Matters</small></p>
          </div>
          <div>
            <span className="bs-icon bs-icon-lg"><FaShieldAlt /></span>
            <p><strong>Customer Support</strong><small>Always Here</small></p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default BookService

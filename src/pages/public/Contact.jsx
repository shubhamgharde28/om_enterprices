import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaArrowRight,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSun,
  FaTint,
} from 'react-icons/fa'
import { useToast } from '@chakra-ui/react'
import { createContactMessage } from '../../services/supabase'
import '../../styles/contact.css'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  purpose: 'Water Purifier Installation',
  message: '',
}
function Contact() {
  const websiteContent = useSelector((state) => state.ui.websiteContent)
  const toast = useToast()
  const [form, setForm] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const phone = websiteContent.phone || '09724916029'
  const email = websiteContent.email || 'hello@omenterprises.com'
  const address = websiteContent.address || 'Near Khamtalav Chowk, Shitla Mata Mandir Road, Bhandara H O, Bhandara-441904, Maharashtra'
  const hours = websiteContent.hours || 'Mon - Sun: 9:00 AM - 7:00 PM'

  const handleSubmit = async (event) => {
    event.preventDefault()
    const submittedForm = Object.fromEntries(
      Object.entries(form).map(([field, value]) => [field, typeof value === 'string' ? value.trim() : value]),
    )

    if (Object.values(submittedForm).some((value) => !value)) {
      setErrorMessage('Please complete every field before sending your message.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    try {
      await createContactMessage(submittedForm)
      setForm(emptyForm)
      toast({
        title: 'Message sent',
        description: 'Our team will get back to you soon.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to send your message. Please try again.')
      toast({
        title: 'Unable to send message',
        description: error.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="water-home home-contact-page">
      <main className="ct-main">
        {/* HERO */}
        <section className="ct-hero">
          <div className="ct-hero-copy">
            <p className="ct-eyebrow">LET&apos;S TALK WATER</p>
            <h1 className="ct-hero-title">
              Better water starts
              <span>with a <em>conversation.</em></span>
            </h1>
            <p className="ct-hero-text">
              Have questions about our products, services or need help with your existing system?
              We&apos;re here to help.
            </p>
            <div className="ct-hero-buttons">
              <Link className="ct-btn ct-btn-primary" to="/book-service">
                Book a service <FaArrowRight />
              </Link>
              <a className="ct-btn ct-btn-outline" href={`tel:${phone}`}>
                Call our team
              </a>
            </div>
          </div>
          <div className="ct-hero-visual">
            <img src="/images/Premium_Purifier.png" alt="OM water purifier" />
          </div>
        </section>

        <div className="ct-container">
          {/* INFO + FORM */}
          <section className="ct-grid">
            <aside className="ct-card ct-info-card">
              <p className="ct-eyebrow ct-eyebrow-sm">CONTACT US</p>
              <h2>Contact OM Enterprises</h2>
              <p className="ct-info-intro">
                We&apos;re just a call or message away. Reach out to us for product inquiries,
                service support or any assistance you need. Our team is here to help you get the
                best water solutions.
              </p>

              <ul className="ct-info-list">
                <li>
                  <span className="ct-icon"><FaPhoneAlt /></span>
                  <div>
                    <b>Phone</b>
                    <span>{phone}</span>
                  </div>
                </li>
                <li>
                  <span className="ct-icon"><FaEnvelope /></span>
                  <div>
                    <b>Email</b>
                    <span>{email}</span>
                  </div>
                </li>
                <li>
                  <span className="ct-icon"><FaMapMarkerAlt /></span>
                  <div>
                    <b>Address</b>
                    <span>{address}</span>
                  </div>
                </li>
                <li>
                  <span className="ct-icon"><FaClock /></span>
                  <div>
                    <b>Working Hours</b>
                    <span>{hours}</span>
                  </div>
                </li>
              </ul>
            </aside>

            <div className="ct-card ct-form-card">
              <h3>Send us a message</h3>
              <p className="ct-form-intro">
                Fill in the details below and our team will get back to you as soon as possible.
              </p>

              <form className="ct-form" onSubmit={handleSubmit} noValidate={false}>
                {errorMessage && <div className="home-form-alert" role="alert">{errorMessage}</div>}

                <div className="ct-form-row">
                  <label>
                    <span>Name</span>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      maxLength={120}
                      required
                    />
                  </label>
                  <label>
                    <span>Mobile Number</span>
                    <input
                      type="tel"
                      placeholder="Your mobile number"
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      maxLength={30}
                      required
                    />
                  </label>
                </div>

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    placeholder="Your email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    maxLength={320}
                    required
                  />
                </label>

                <label>
                  <span>What can we help with?</span>
                  <select
                    value={form.purpose}
                    onChange={(event) => setForm({ ...form, purpose: event.target.value })}
                    required
                  >
                    <option>Water Purifier Installation</option>
                    <option>Water Purifier Repair</option>
                    <option>Maintenance and Servicing</option>
                    <option>Product Enquiry</option>
                    <option>Commercial Water Solutions</option>
                  </select>
                </label>

                <label>
                  <span>Message</span>
                  <textarea
                    rows={4}
                    placeholder="Tell us how we can help"
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    maxLength={5000}
                    required
                  />
                </label>

                <button type="submit" className="ct-btn ct-btn-primary ct-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'} <FaArrowRight />
                </button>
              </form>
            </div>
          </section>

          {/* OFFICE BANNER */}
          <div className="ct-office">
            <span className="ct-office-icon"><FaMapMarkerAlt /></span>
            <div className="ct-office-text">
              <p className="ct-eyebrow ct-eyebrow-sm">OUR OFFICE</p>
              <strong>Visit Our Office</strong>
              <small>{address}</small>
            </div>
            <a
              className="ct-office-btn"
              href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noreferrer"
            >
              Get directions <FaArrowRight />
            </a>
          </div>

          {/* CTA STRIP */}
          <div className="ct-cta">
            <div className="ct-cta-item">
              <span className="ct-icon"><FaTint /></span>
              <div>
                <strong>Need expert guidance?</strong>
                <small>
                  Our team will help you choose the right purifier for your home or office and
                  ensure prompt service.
                </small>
              </div>
            </div>
            <div className="ct-cta-item ct-cta-solar">
              <span className="ct-icon ct-icon-square"><FaSun /></span>
              <div>
                <small>Also get consultation for</small>
                <Link to="/solar">
                  Tata Solar Services <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Contact

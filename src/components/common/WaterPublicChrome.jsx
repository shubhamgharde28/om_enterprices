import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import '../../styles/home.css'
import {
  FaArrowRight,
  FaBars,
  FaBox,
  FaCalendarAlt,
  FaChevronRight,
  FaCog,
  FaEnvelope,
  FaFacebook,
  FaHome,
  FaInstagram,
  FaLeaf,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaTimes,
  FaTint,
  FaTruck,
  FaUser,
  FaYoutube,
} from 'react-icons/fa'
import NotificationPopover from './NotificationPopover'
import useBookingNotifications from '../../hooks/useBookingNotifications'

const copyrightYear = new Date().getFullYear()

function WaterPublicHeader() {
  const { pathname } = useLocation()
  const websiteContent = useSelector((state) => state.ui.websiteContent)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const {
    bookingNotifications,
    refreshNotifications,
    handleDismissNotification,
  } = useBookingNotifications()
  const isHomePage = pathname === '/'
  const phone = websiteContent.phone || '09724916029'
  const email = websiteContent.email || 'hello@omenterprises.com'
  const address = websiteContent.address || 'Near Khamtalav Chowk, Shitla Mata Mandir Road, Bhandara H O, Bhandara-441904, Maharashtra'
  const isActivePath = (path) => pathname === path || pathname.startsWith(`${path}/`)

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 80)
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileNavOpen])

  const closeMobileNav = () => setMobileNavOpen(false)

  return (
    <header className={`home-header${isHomePage ? '' : ' home-header-page'}${isScrolled ? ' is-scrolled' : ''}${mobileNavOpen ? ' has-open-drawer' : ''}`}>
      <Link className="home-logo" to="/" aria-label="OM Enterprises home">
        <img src="/logo.png" alt="OM Enterprises" />
      </Link>

      <nav className="home-nav" aria-label="Main navigation">
        <Link to="/" className={isHomePage ? 'is-active' : undefined} aria-current={isHomePage ? 'page' : undefined}>Home</Link>
        <Link to="/products" className={isActivePath('/products') ? 'is-active' : undefined} aria-current={isActivePath('/products') ? 'page' : undefined}>Products</Link>
        <Link to="/services" className={isActivePath('/services') ? 'is-active' : undefined} aria-current={isActivePath('/services') ? 'page' : undefined}>Services</Link>
        <Link to="/about" className={isActivePath('/about') ? 'is-active' : undefined} aria-current={isActivePath('/about') ? 'page' : undefined}>About Us</Link>
        <Link to="/contact" className={isActivePath('/contact') ? 'is-active' : undefined} aria-current={isActivePath('/contact') ? 'page' : undefined}>Contact</Link>
      </nav>

      <div className="home-header-actions">
        <Link className="home-switch-solar" to="/choose">Switch Solar</Link>
        <div className="home-header-notifications">
          <NotificationPopover
            title="Appointment updates"
            emptyMessage="No appointment updates."
            notifications={bookingNotifications}
            onDismiss={handleDismissNotification}
            onOpen={refreshNotifications}
          />
        </div>
        <Link className="home-button home-button-light home-header-cta" to="/book-service">
          Book a Service <FaArrowRight />
        </Link>
        <button
          className="home-mobile-menu"
          type="button"
          aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((isOpen) => !isOpen)}
        >
          {mobileNavOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {mobileNavOpen && (
        <>
          <button
            className="home-drawer-backdrop"
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobileNav}
          />
          <nav className="home-mobile-nav home-tablet-drawer" aria-label="Main menu">
            <div className="home-drawer-header">
              <Link className="home-logo" to="/" aria-label="OM Enterprises home" onClick={closeMobileNav}>
                <img src="/logo.png" alt="OM Enterprises" />
              </Link>
              <button
                className="home-drawer-close"
                type="button"
                aria-label="Close navigation menu"
                onClick={closeMobileNav}
              >
                <FaTimes />
              </button>
            </div>

            <div className="home-drawer-links">
              <Link className={isHomePage ? 'is-active' : undefined} aria-current={isHomePage ? 'page' : undefined} to="/" onClick={closeMobileNav}>
                <span><FaHome /></span><strong>Home</strong><FaChevronRight />
              </Link>
              <Link className={isActivePath('/products') ? 'is-active' : undefined} aria-current={isActivePath('/products') ? 'page' : undefined} to="/products" onClick={closeMobileNav}>
                <span><FaBox /></span><strong>Products</strong><FaChevronRight />
              </Link>
              <Link className={isActivePath('/services') ? 'is-active' : undefined} aria-current={isActivePath('/services') ? 'page' : undefined} to="/services" onClick={closeMobileNav}>
                <span><FaCog /></span><strong>Services</strong><FaChevronRight />
              </Link>
              <Link className={isActivePath('/about') ? 'is-active' : undefined} aria-current={isActivePath('/about') ? 'page' : undefined} to="/about" onClick={closeMobileNav}>
                <span><FaUser /></span><strong>About Us</strong><FaChevronRight />
              </Link>
              <Link className={isActivePath('/contact') ? 'is-active' : undefined} aria-current={isActivePath('/contact') ? 'page' : undefined} to="/contact" onClick={closeMobileNav}>
                <span><FaEnvelope /></span><strong>Contact</strong><FaChevronRight />
              </Link>
              <Link className={isActivePath('/book-service') ? 'is-active' : undefined} aria-current={isActivePath('/book-service') ? 'page' : undefined} to="/book-service" onClick={closeMobileNav}>
                <span><FaCalendarAlt /></span><strong>Book a Service</strong><FaChevronRight />
              </Link>
            </div>

            <Link className="home-drawer-promo" to="/products" onClick={closeMobileNav}>
              <span className="home-drawer-promo-icon"><FaTint /></span>
              <span className="home-drawer-promo-copy">
                <small>Clean water. Healthier tomorrow</small>
                <strong>Pure Water.<br />Better Living.</strong>
              </span>
              <span className="home-drawer-promo-arrow"><FaArrowRight /></span>
            </Link>

            <section className="home-drawer-contact" aria-label="Contact information">
              <h2>Get in touch</h2>
              <a href={`tel:${phone}`} onClick={closeMobileNav}>
                <span><FaPhoneAlt /></span>
                <span><strong>{phone}</strong><small>Mon – Sun, 9:00 AM – 7:00 PM</small></span>
              </a>
              <a href={`mailto:${email}`} onClick={closeMobileNav}>
                <span><FaEnvelope /></span>
                <span><strong>{email}</strong><small>We reply within 24 hours</small></span>
              </a>
              <div>
                <span><FaMapMarkerAlt /></span>
                <span><strong>{address}</strong><small>Visit us for purifier support</small></span>
              </div>
            </section>

            <div className="home-drawer-social">
              <strong>Follow us</strong>
              <span className="home-socials">
                <a href="https://facebook.com" aria-label="Facebook"><FaFacebook /></a>
                <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
                <a href="https://youtube.com" aria-label="YouTube"><FaYoutube /></a>
              </span>
            </div>
            <small className="home-drawer-copyright">© {copyrightYear} OM Enterprises. All rights reserved.</small>
          </nav>
        </>
      )}
    </header>
  )
}

function WaterPublicFooter() {
  const websiteContent = useSelector((state) => state.ui.websiteContent)
  const phone = websiteContent.phone || '09724916029'
  const email = websiteContent.email || 'hello@omenterprises.com'
  const address = websiteContent.address || 'Near Khamtalav Chowk, Shitla Mata Mandir Road, Bhandara H O, Bhandara-441904, Maharashtra'

  return (
    <footer className="home-footer">
      <div className="home-footer-main">
        <section className="home-footer-brand">
          <Link className="home-logo" to="/" aria-label="OM Enterprises home"><img src="/logo.png" alt="OM Enterprises" /></Link>
          <h2>Clean Water. <span>Healthy Life.</span></h2>
          <p>We provide reliable water purifier solutions and expert service to keep your family safe and healthy.</p>
          <div className="home-footer-values">
            <div><span><FaTint /></span><strong>Pure Water</strong><small>Every Home</small></div>
            <div><span><FaLeaf /></span><strong>Better Health</strong><small>For Your Family</small></div>
            <div><span><FaShieldAlt /></span><strong>Trusted Service</strong><small>Always</small></div>
          </div>
        </section>

        <nav className="home-footer-links" aria-label="Footer quick links">
          <strong>Quick Links</strong>
          <Link to="/products">Products <FaArrowRight /></Link>
          <Link to="/services">Services <FaArrowRight /></Link>
          <Link to="/about">About Us <FaArrowRight /></Link>
          <Link to="/contact">Contact <FaArrowRight /></Link>
        </nav>

        <section className="home-footer-contact">
          <strong>Contact</strong>
          <a href={`tel:${phone}`}><span><FaPhoneAlt /></span><span><b>{phone}</b><small>Call us for purifier support</small></span></a>
          <a href={`mailto:${email}`}><span><FaEnvelope /></span><span><b>{email}</b><small>We’re happy to help</small></span></a>
          <div><span><FaMapMarkerAlt /></span><span><b>Visit Us</b><small>{address}</small></span></div>
        </section>

        <section className="home-footer-follow">
          <strong>Follow Us</strong>
          <span className="home-socials">
            <a href="https://facebook.com" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://youtube.com" aria-label="YouTube"><FaYoutube /></a>
          </span>
          <div className="home-footer-newsletter" aria-label="Newsletter signup coming soon">
            <span className="home-footer-newsletter-icon"><FaTint /></span>
            <div><b>Stay Updated</b><p>Get the latest offers and tips for clean, healthy water.</p></div>
            <span className="home-footer-newsletter-arrow"><FaArrowRight /></span>
            <div className="home-footer-email-field"><FaEnvelope /><span>Enter your email</span><span><FaArrowRight /></span></div>
          </div>
        </section>
      </div>

      <div className="home-footer-bottom">
        <small className="home-copyright">© {copyrightYear} OM Enterprises. All rights reserved.</small>
        <div className="home-footer-trust">
          <span><FaShieldAlt /><b>100% Original<small>Products</small></b></span>
          <span><FaTruck /><b>On-Time<small>Service</small></b></span>
          <span><FaLeaf /><b>Customer<small>Satisfaction</small></b></span>
        </div>
      </div>
    </footer>
  )
}

export { WaterPublicHeader, WaterPublicFooter }

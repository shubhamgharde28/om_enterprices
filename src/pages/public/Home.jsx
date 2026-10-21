import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  FaArrowLeft,
  FaArrowRight,
  FaBolt,
  FaCheck,
  FaClock,
  FaCog,
  FaDesktop,
  FaFilter,
  FaHeadset,
  FaLeaf,
  FaShieldAlt,
  FaStar,
  FaStarHalfAlt,
  FaTint,
  FaTools,
  FaUserCheck,
} from 'react-icons/fa'
import { setProducts } from '../../redux/slices/productSlice'
import { setServices } from '../../redux/slices/serviceSlice'
import { setTestimonials } from '../../redux/slices/uiSlice'
import { fetchProducts, fetchServices, fetchTestimonials } from '../../services/supabase'
import { WaterPublicFooter, WaterPublicHeader } from '../../components/common/WaterPublicChrome'
import '../../styles/home.css'

const serviceHighlights = [
  { title: 'Installation', description: 'Professional & hassle-free installation service.', icon: FaTools },
  { title: 'Water Purifier Service', description: 'Regular cleaning & maintenance.', icon: FaFilter },
  { title: 'Repair & Support', description: 'Quick and reliable customer support.', icon: FaShieldAlt },
  { title: 'AMC Plans', description: 'Extended warranty & care plans.', icon: FaClock },
]

const reasons = [
  { title: '10+ Years', caption: 'of Experience', icon: FaTools },
  { title: '5,000+', caption: 'Happy Customers', icon: FaUserCheck },
  { title: '100%', caption: 'Genuine Products', icon: FaShieldAlt },
  { title: '24/7', caption: 'Customer Support', icon: FaClock },
]

const serviceSteps = [
  { title: 'Book Service', description: 'Schedule your service in just a few clicks.' },
  { title: 'Technician Assigned', description: 'We assign a certified technician.' },
  { title: 'Visit Scheduled', description: 'We confirm the date and time.' },
  { title: 'Service Completed', description: 'Get your purifier serviced & ready.' },
]
const featuredBenefits = [
  { label: '8 Stage Purification', icon: FaFilter },
  { label: 'Smart TDS Controller', icon: FaCheck },
  { label: 'UV Sterilization', icon: FaShieldAlt },
  { label: 'Mineral Retention', icon: FaTint },
]
const productValues = [
  { title: 'Pure Water', subtitle: 'Every Drop', icon: FaTint },
  { title: 'Better Health', subtitle: 'For Your Family', icon: FaShieldAlt },
  { title: 'Modern Design', subtitle: 'For Every Space', icon: FaLeaf },
  { title: 'Reliable Service', subtitle: 'Always With You', icon: FaCog },
]
const serviceAssurances = [
  { title: 'Expert Technicians', subtitle: 'Skilled & Verified', icon: FaShieldAlt },
  { title: 'On-Time Service', subtitle: 'Because Your Time Matters', icon: FaClock },
  { title: 'Genuine Parts', subtitle: '100% Original', icon: FaCog },
  { title: 'Customer First', subtitle: 'Always With You', icon: FaHeadset },
]
function Home() {
  const dispatch = useDispatch()
  const [activeProductIndex, setActiveProductIndex] = useState(0)
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0)
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false)
  const productItems = useSelector((state) => state.products.items)
  const serviceItems = useSelector((state) => state.services.items)
  const websiteContent = useSelector((state) => state.ui.websiteContent)
  const testimonialItems = useSelector((state) => state.ui.testimonials)
  const activeProducts = productItems.filter((product) => product.active)
  const featuredProducts = activeProducts.filter((product) => product.featured)
  const products = [...featuredProducts, ...activeProducts.filter((product) => !product.featured)].slice(0, 6)
  const activeServices = serviceItems.filter((service) => service.active).slice(0, 4)
  const testimonials = testimonialItems.filter((item) => item.active)
  const currentTestimonial = testimonials.length
    ? testimonials[activeTestimonialIndex % testimonials.length]
    : null
  const featuredProduct = featuredProducts[0] || activeProducts[0]
  const selectedProductIndex = products.length ? activeProductIndex % products.length : 0
  const currentProduct = products[selectedProductIndex]
  const previousProduct = products.length > 1
    ? products[(selectedProductIndex - 1 + products.length) % products.length]
    : null
  const nextProduct = products.length > 1
    ? products[(selectedProductIndex + 1) % products.length]
    : null
  const titleLines = (websiteContent.hero_title || 'Pure Water. Better Living.').match(/[^.]+\.?/g) || []

  useEffect(() => {
    if (testimonials.length < 2 || isTestimonialPaused) return undefined

    const intervalId = window.setInterval(() => {
      setActiveTestimonialIndex((index) => (index + 1) % testimonials.length)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [isTestimonialPaused, testimonials.length])

  useEffect(() => {
    let active = true
    fetchProducts()
      .then((rows) => {
        if (active) dispatch(setProducts(rows))
      })
      .catch((error) => {
        if (active) console.error('Unable to load products:', error)
      })

    return () => {
      active = false
    }
  }, [dispatch])

  useEffect(() => {
    let active = true
    fetchServices()
      .then((rows) => {
        if (active) dispatch(setServices(rows))
      })
      .catch((error) => {
        if (active) console.error('Unable to load services:', error)
      })

    return () => {
      active = false
    }
  }, [dispatch])

  useEffect(() => {
    let active = true
    fetchTestimonials()
      .then((rows) => {
        if (active) dispatch(setTestimonials(rows))
      })
      .catch((error) => {
        if (active) console.error('Unable to load testimonials:', error)
      })

    return () => {
      active = false
    }
  }, [dispatch])

  const formatPrice = (price) => Number(price || 0).toLocaleString('en-IN')
  const showPreviousProduct = () => setActiveProductIndex((index) => (index - 1 + products.length) % products.length)
  const showNextProduct = () => setActiveProductIndex((index) => (index + 1) % products.length)

  return (
    <div className="water-home">
      <WaterPublicHeader />

      <section className="home-hero" id="home">
        <picture className="home-hero-image">
          <source media="(max-width: 640px)" srcSet="/images/hero_mobile.png" />
          <img src="/images/hero_image.png" alt="" />
        </picture>
        <div className="home-hero-wash" />
        <div className="home-hero-content">
          <p className="home-eyebrow">Cleaner water. Healthier tomorrow</p>
          <h1 className="home-hero-title">
            {titleLines.map((line, index) => (
              <span className={index === titleLines.length - 1 ? 'home-title-accent' : ''} key={`${line}-${index}`}>
                {line.trim()}
              </span>
            ))}
          </h1>
          <p className="home-hero-copy">{websiteContent.hero_subtitle}</p>
          <div className="home-button-row">
            <Link className="home-button home-button-primary" to="/products">
              Explore Products <FaArrowRight />
            </Link>
            <Link className="home-button home-button-outline" to="/book-service">Book a Service</Link>
          </div>
          <div className="home-hero-promises">
            <div className="home-hero-promise">
              <span>EXPERT CARE</span>
              <strong>Support you can count on.</strong>
              <p>Installation, maintenance and repair from our purifier specialists.</p>
            </div>
            <div className="home-hero-promise">
              <span>THE OM PROMISE</span>
              <strong>Pure water, made simple.</strong>
              <p>The right purifier, expert installation and dependable care.</p>
            </div>
          </div>
          <div className="home-hero-benefits">
            <div><span><FaTint /></span><p><strong>100% Pure Water</strong><small>Healthy Family</small></p></div>
            <div><span><FaTools /></span><p><strong>Expert Installation</strong><small>Hassle Free Setup</small></p></div>
            <div><span><FaShieldAlt /></span><p><strong>Reliable Support</strong><small>Always With You</small></p></div>
          </div>
        </div>
        <a className="home-scroll-cue" href="#products"><span /> Scroll to explore</a>
      </section>

      <main>
        {activeServices.length > 0 && (
          <section className="home-services-showcase" id="our-services">
            <div className="home-section home-services-showcase-inner">
              <div className="home-services-showcase-heading">
                <p className="home-eyebrow">Our Services</p>
                <h2>Reliable Care for<br /><span>Every Purifier</span></h2>
                <p>From installation to maintenance, book trusted support from our service team.</p>
              </div>
              <div className="home-services-assurances">
                {serviceAssurances.map(({ title, subtitle, icon: Icon }) => (
                  <div className="home-service-assurance" key={title}>
                    <span><Icon /></span>
                    <strong>{title}</strong>
                    <small>{subtitle}</small>
                  </div>
                ))}
              </div>
              <div className="home-services-showcase-grid">
                {activeServices.map((service) => {
                  return (
                    <article className="home-service-showcase-card" key={service.id}>
                      <Link className="home-service-showcase-image" to="/book-service" state={{ serviceId: service.id }}>
                        <img src={service.image_url} alt={service.name} loading="lazy" />
                      </Link>
                      <div className="home-service-showcase-copy">
                        <h3>{service.name}</h3>
                        <p>{service.short_description || service.description}</p>
                        <div className="home-service-showcase-meta">
                          <strong>₹{formatPrice(service.price)}</strong>
                          {service.estimated_duration && <span><FaClock /> {service.estimated_duration}</span>}
                        </div>
                        <Link
                          className="home-service-showcase-book"
                          to="/book-service"
                          state={{ serviceId: service.id }}
                          aria-label={`Book ${service.name}`}
                        >
                          Book Service <FaArrowRight />
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
              <Link className="home-services-showcase-link" to="/services">
                View All Services <FaArrowRight />
              </Link>
            </div>
          </section>
        )}

        <section className="home-products-section" id="products">
          <div className="home-section home-products-inner">
            <div className="home-products-header">
              <div className="home-products-title">
                <p className="home-eyebrow">Our products</p>
                <h2>Explore Our<br /><span>Product Range</span></h2>
                <p>Find the perfect water purifier for your home or business.<br className="home-products-title-break" /> Clean water, better health, every day.</p>
              </div>
              <div className="home-product-values">
                {productValues.map(({ title, subtitle, icon: Icon }) => (
                  <div className="home-product-value" key={title}>
                    <span><Icon /></span>
                    <strong>{title}</strong>
                    <small>{subtitle}</small>
                  </div>
                ))}
              </div>
            </div>
            {currentProduct && (
              <>
                <div className="home-product-carousel">
                  {previousProduct && (
                    <article className="home-product-peek home-product-peek-left">
                      <Link className="home-product-peek-image" to={`/products/${previousProduct.slug}`} aria-label={`View ${previousProduct.name}`}>
                        <img src={previousProduct.image_url} alt="" />
                        <span>{previousProduct.featured ? 'Popular' : previousProduct.product_type}</span>
                      </Link>
                      <div className="home-product-peek-copy">
                        <Link className="home-product-peek-name" to={`/products/${previousProduct.slug}`}>{previousProduct.name}</Link>
                        <p>{previousProduct.short_description}</p>
                        <div><b>₹{formatPrice(previousProduct.price)}</b>{previousProduct.discount_percentage > 0 && <small>{previousProduct.discount_percentage}% OFF</small>}</div>
                        <Link className="home-product-peek-cta" to="/book-service">Book a Service <FaArrowRight /></Link>
                      </div>
                    </article>
                  )}

                  <article className="home-product-feature">
                    <Link className="home-product-feature-image" to={`/products/${currentProduct.slug}`} aria-label={`View ${currentProduct.name}`}>
                      <img src={currentProduct.image_url} alt={currentProduct.name} />
                      {currentProduct.featured && <span className="home-product-feature-badge"><FaStar /> Best Seller</span>}
                    </Link>
                    <div className="home-product-feature-copy">
                      <p className="home-product-feature-type">{currentProduct.product_type}</p>
                      <h3>{currentProduct.name}</h3>
                      <p className="home-product-feature-description">{currentProduct.short_description}</p>
                      <div className="home-product-feature-specs">
                        <div><span><FaTint /></span><small>{currentProduct.capacity || '—'}<br />Capacity</small></div>
                        <div><span><FaShieldAlt /></span><small>{currentProduct.purification_technology || 'Purifier'}<br />Technology</small></div>
                        <div><span><FaDesktop /></span><small>{currentProduct.rating ? `${currentProduct.rating} / 5` : currentProduct.product_type}<br />{currentProduct.rating ? 'Customer rating' : 'Product type'}</small></div>
                        <div><span><FaBolt /></span><small>{currentProduct.warranty || 'Genuine'}<br />Warranty</small></div>
                      </div>
                      <div className="home-product-feature-price">
                        <strong>₹{formatPrice(currentProduct.price)}</strong>
                        {currentProduct.original_price > currentProduct.price && <del>₹{formatPrice(currentProduct.original_price)}</del>}
                        {currentProduct.discount_percentage > 0 && <span>{currentProduct.discount_percentage}% OFF</span>}
                      </div>
                      <Link className="home-product-feature-cta" to="/book-service">Book a Service <FaArrowRight /></Link>
                    </div>
                  </article>

                  {nextProduct && (
                    <article className="home-product-peek home-product-peek-right">
                      <Link className="home-product-peek-image" to={`/products/${nextProduct.slug}`} aria-label={`View ${nextProduct.name}`}>
                        <img src={nextProduct.image_url} alt="" />
                        <span>{nextProduct.featured ? 'Popular' : nextProduct.product_type}</span>
                      </Link>
                      <div className="home-product-peek-copy">
                        <Link className="home-product-peek-name" to={`/products/${nextProduct.slug}`}>{nextProduct.name}</Link>
                        <p>{nextProduct.short_description}</p>
                        <div><b>₹{formatPrice(nextProduct.price)}</b>{nextProduct.discount_percentage > 0 && <small>{nextProduct.discount_percentage}% OFF</small>}</div>
                        <Link className="home-product-peek-cta" to="/book-service">Book a Service <FaArrowRight /></Link>
                      </div>
                    </article>
                  )}

                  {products.length > 1 && (
                    <>
                      <button className="home-product-carousel-arrow home-product-carousel-previous" type="button" onClick={showPreviousProduct} aria-label="Previous product">
                        <FaArrowLeft />
                      </button>
                      <button className="home-product-carousel-arrow home-product-carousel-next" type="button" onClick={showNextProduct} aria-label="Next product">
                        <FaArrowRight />
                      </button>
                    </>
                  )}
                </div>
                {products.length > 0 && (
                  <div className="home-product-carousel-dots" aria-label="Choose a product">
                    {products.map((product, index) => (
                      <button
                        type="button"
                        className={index === selectedProductIndex ? 'is-active' : ''}
                        key={product.id}
                        aria-label={`Show ${product.name}`}
                        aria-current={index === selectedProductIndex ? 'true' : undefined}
                        onClick={() => setActiveProductIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {featuredProduct && (
          <section className="home-section home-featured">
            <div className="home-featured-copy">
              <p className="home-eyebrow">Featured product</p>
              <h2>{featuredProduct.name}</h2>
              <p className="home-featured-tagline">Smart Purification. Superior Protection.</p>
              <p className="home-featured-description">
                Advanced 8-stage purification with smart TDS control, UV sterilization and mineral retention — for water that’s pure, safe and great-tasting.
              </p>
              <div className="home-product-points">
                {featuredBenefits.map((benefit) => {
                  const Icon = benefit.icon
                  return <span key={benefit.label}><Icon /> {benefit.label}</span>
                })}
              </div>
              <div className="home-price-line">
                <strong>₹{formatPrice(featuredProduct.price)}</strong>
                {featuredProduct.original_price && <del>₹{formatPrice(featuredProduct.original_price)}</del>}
                {featuredProduct.discount_percentage > 0 && <span>{featuredProduct.discount_percentage}% OFF</span>}
              </div>
              <Link className="home-button home-button-primary" to={`/products/${featuredProduct.slug}`}>
                View Details <FaArrowRight />
              </Link>
            </div>
          </section>
        )}

        <section className="home-section home-services-section" id="services">
          <div className="home-service-intro">
            <p className="home-eyebrow">Our services</p>
            <h2>Complete Care for<br />Your <span>Water Purifier</span></h2>
            <p>From installation to regular maintenance, we ensure your water purifier works at its best — always.</p>
          </div>
          <div className="home-service-grid">
            {serviceHighlights.map((service) => {
              const Icon = service.icon
              return (
                <Link className="home-service-card" to="/services" key={service.title}>
                  <span className="home-icon-disc"><Icon /></span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </Link>
              )
            })}
          </div>
          <Link className="home-button home-button-primary home-service-section-link" to="/services">
            Explore Services <FaArrowRight />
          </Link>
        </section>

        <section className="home-section home-trust-section" id="about">
          <div className="home-trust-copy">
            <p className="home-eyebrow">Why choose OM Enterprises</p>
            <h2>More Than Just a <span>Water Purifier</span></h2>
            <p>We’re committed to delivering clean water, reliable service and complete customer satisfaction.</p>
            <div className="home-stats">
              {reasons.map((reason) => {
                const Icon = reason.icon
                return (
                  <div className="home-stat" key={reason.title}>
                    <span className="home-icon-disc"><Icon /></span>
                    <strong>{reason.title}</strong>
                    <small>{reason.caption}</small>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="home-trust-image">
            <img src="/images/family.png" alt="A family enjoying clean drinking water" />
          </div>
        </section>

        <div className="home-how-testimonial-cta">
          <section className="home-section home-how-section" id="how-it-works">
            <div className="home-centered-heading">
              <h2>How It <span>Works</span></h2>
              <p>Getting pure water is simple and hassle-free.</p>
            </div>
            <div className="home-steps">
              {serviceSteps.map((step, index) => (
                <div className="home-step-card" key={step.title}>
                  <span className="home-step-number">{index + 1}</span>
                  <div className="home-step-copy"><h3>{step.title}</h3><p>{step.description}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="home-testimonials-section">
            <div className="home-centered-heading">
              <p className="home-eyebrow">Testimonials</p>
              <h2>What Our <span>Customers Say</span></h2>
              <p>Real people. Real experiences. Trusted by thousands.</p>
            </div>
            {currentTestimonial && (
              <article
                className="home-testimonial-card"
                onMouseEnter={() => setIsTestimonialPaused(true)}
                onMouseLeave={() => setIsTestimonialPaused(false)}
                onFocusCapture={() => setIsTestimonialPaused(true)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setIsTestimonialPaused(false)
                }}
              >
                <div className="home-testimonial-content">
                  <div
                    className="home-stars"
                    aria-label={currentTestimonial.rating == null ? 'Rating not provided' : `${currentTestimonial.rating} out of 5 stars`}
                  >
                    {Array.from({ length: Math.min(5, Math.floor(Number(currentTestimonial.rating) || 0)) }, (_, index) => <FaStar key={index} />)}
                    {Number(currentTestimonial.rating) % 1 >= 0.5 && <FaStarHalfAlt />}
                  </div>
                  <p>“{currentTestimonial.review}”</p>
                  <strong>{currentTestimonial.customer_name}</strong>
                  <small>
                    {currentTestimonial.rating} / 5
                    {currentTestimonial.date ? ` · ${currentTestimonial.date}` : ''}
                  </small>
                </div>
                {testimonials.length > 1 && (
                  <div className="home-testimonial-dots" aria-label="Choose a customer review">
                    {testimonials.map((testimonial, index) => (
                      <button
                        className={index === activeTestimonialIndex % testimonials.length ? 'is-active' : ''}
                        type="button"
                        key={testimonial.id}
                        aria-label={`Show review by ${testimonial.customer_name}`}
                        aria-current={index === activeTestimonialIndex % testimonials.length ? 'true' : undefined}
                        onClick={() => setActiveTestimonialIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </article>
            )}
          </section>

          <section className="home-cta-section">
            <div className="home-cta-icon"><FaTint /></div>
            <div><h2>Need Water Purifier Service?</h2><p>Book a service today and keep your water pure, safe and fresh.</p></div>
            <Link className="home-button home-button-light" to="/book-service">Book a Service <FaArrowRight /></Link>
          </section>
        </div>
      </main>

      <WaterPublicFooter />
    </div>
  )
}

export default Home

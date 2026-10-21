import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  FaCog,
  FaClock,
  FaHeadset,
  FaShieldAlt,
  FaTools,
} from 'react-icons/fa'
import ServiceCard from '../../components/service/ServiceCard'
import { setServices } from '../../redux/slices/serviceSlice'
import { fetchServices } from '../../services/supabase'

const highlights = [
  { icon: FaShieldAlt, title: 'Expert Technicians', subtitle: 'Skilled & Verified' },
  { icon: FaClock, title: 'On-Time Service', subtitle: 'Because Your Time Matters' },
  { icon: FaCog, title: 'Genuine Parts', subtitle: '100% Original' },
  { icon: FaHeadset, title: 'Customer First', subtitle: 'Always With You' },
]

function Services() {
  const dispatch = useDispatch()
  const services = useSelector((state) => state.services.items.filter((service) => service.active))
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    fetchServices()
      .then((rows) => {
        if (active) dispatch(setServices(rows))
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load services.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [dispatch])

  return (
    <section className="services-page">
      <div className="home-section home-services-showcase-inner services-page-inner">
        <div className="home-services-showcase-heading services-page-heading">
          <p className="home-eyebrow">Our Services</p>
          <h1>Reliable Care for<br /><span>Every Purifier</span></h1>
          <p>From installation to maintenance, book trusted support from our service team.</p>
        </div>

        <div className="home-services-assurances services-page-assurances">
          {highlights.map(({ icon: Icon, title, subtitle }) => (
            <div className="home-service-assurance" key={title}>
              <span><Icon /></span>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </div>
          ))}
        </div>

        {errorMessage ? (
          <p className="services-page-empty" role="alert">{errorMessage}</p>
        ) : isLoading ? (
          <p className="services-page-empty" role="status">Loading services…</p>
        ) : services.length > 0 ? (
          <div className="home-services-showcase-grid services-page-grid">
            {services.map((service) => (
              <ServiceCard service={service} key={service.id} />
            ))}
          </div>
        ) : (
          <p className="services-page-empty">No services are available right now.</p>
        )}
      </div>
    </section>
  )
}

export default Services

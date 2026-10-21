import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  FaArrowRight,
  FaBoxOpen,
  FaCheckCircle,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCog,
  FaDotCircle,
  FaFileAlt,
  FaFlask,
  FaHeadset,
  FaHeart,
  FaLayerGroup,
  FaLink,
  FaShieldAlt,
  FaStar,
  FaTint,
  FaTools,
  FaTruck,
  FaUserAlt,
  FaWalking,
} from 'react-icons/fa'
import { createProductEnquiry, fetchProducts } from '../../services/supabase'
import { setProducts } from '../../redux/slices/productSlice'
import '../../styles/product-details.css'

const specIcons = {
  'Product type': FaUserAlt,
  'Storage capacity': FaFlask,
  'Purification capacity': FaTint,
  'Purification stages': FaLayerGroup,
  'Water source compatibility': FaDotCircle,
  'Input TDS range': FaWalking,
  'Filter details': FaShieldAlt,
  'Filter lifespan': FaCog,
  'Power consumption': FaHeart,
  'Dimensions (W × H × D)': FaLink,
  'Suitable for': FaUserAlt,
  Warranty: FaShieldAlt,
  Installation: FaWalking,
  'Box contents': FaBoxOpen,
  Stock: FaCheckCircle,
}

const MOBILE_SPEC_PREVIEW = 6
const emptyEnquiryForm = {
  customer_name: '',
  phone: '',
  email: '',
  alternate_phone: '',
  message: '',
}

function ProductDetails() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const products = useSelector((state) => state.products.items)
  const user = useSelector((state) => state.auth.user)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const product = products.find((item) => String(item.slug) === slug || String(item.id) === slug)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [loadedProductSlug, setLoadedProductSlug] = useState(null)
  const [productLoadError, setProductLoadError] = useState(null)
  const [aboutOpen, setAboutOpen] = useState(true)
  const [specsOpen, setSpecsOpen] = useState(true)
  const [showAllSpecs, setShowAllSpecs] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState(emptyEnquiryForm)
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')
  const imageUrls = product
    ? [...new Set([...(product.image_urls ?? []), product.image_url].filter(Boolean))]
    : []
  const activeImageIndex = selectedProductId === product?.id ? selectedImageIndex : 0
  const purifierDetails = product?.purifier_details ?? {}
  const isLoadingProduct = !product && loadedProductSlug !== slug

  useEffect(() => {
    if (product) return undefined

    let active = true

    fetchProducts()
      .then((rows) => {
        if (active) dispatch(setProducts(rows))
      })
      .catch((error) => {
        if (active) {
          setProductLoadError({
            slug,
            message: error.message || 'Unable to load product.',
          })
        }
      })
      .finally(() => {
        if (active) setLoadedProductSlug(slug)
      })

    return () => {
      active = false
    }
  }, [dispatch, product, slug])

  if (isLoadingProduct) {
    return (
      <div className="pd-page">
        <div className="pd-container pd-not-found"><p role="status">Loading product…</p></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pd-page">
        <div className="pd-container pd-not-found">
          {productLoadError?.slug === slug
            ? <p role="alert">Unable to load product: {productLoadError.message}</p>
            : <h1>Product not found</h1>}
        </div>
      </div>
    )
  }

  const goToImage = (offset) => {
    setSelectedProductId(product.id)
    setSelectedImageIndex((activeImageIndex + offset + imageUrls.length) % imageUrls.length)
  }
  const specificationRows = [
    ['Product type', product.product_type],
    ['Storage capacity', purifierDetails.storage_capacity != null && purifierDetails.storage_capacity !== ''
      ? `${purifierDetails.storage_capacity} L`
      : product.capacity],
    ['Purification capacity', purifierDetails.purification_capacity],
    ['Purification stages', purifierDetails.purification_stages],
    ['Water source compatibility', purifierDetails.water_sources],
    ['Input TDS range', purifierDetails.input_tds_min != null || purifierDetails.input_tds_max != null
      ? `${purifierDetails.input_tds_min ?? '—'}–${purifierDetails.input_tds_max ?? '—'} ppm`
      : ''],
    ['Filter details', purifierDetails.filter_details],
    ['Filter lifespan', purifierDetails.filter_lifespan],
    ['Power consumption', purifierDetails.power_consumption != null && purifierDetails.power_consumption !== ''
      ? `${purifierDetails.power_consumption} W`
      : ''],
    ['Dimensions (W × H × D)', purifierDetails.dimensions],
    ['Suitable for', product.suitable_for],
    ['Warranty', product.warranty],
    ['Installation', product.installation_available
      ? purifierDetails.installation_details || 'Available'
      : 'Not available'],
    ['Box contents', purifierDetails.box_contents],
    ['Stock', product.stock != null ? `${product.stock} available` : ''],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '')

  const technologies = purifierDetails.technologies?.length
    ? purifierDetails.technologies
    : product.purification_technology?.split(/\s*\+\s*/).filter(Boolean) ?? []

  const openEnquiry = () => {
    setEnquiryForm({
      ...emptyEnquiryForm,
      customer_name: user?.fullName || '',
      phone: user?.phone || '',
      email: user?.email || '',
    })
    setEnquiryError('')
    onOpen()
  }

  const handleEnquiryChange = (event) => {
    setEnquiryForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleEnquirySubmit = async (event) => {
    event.preventDefault()
    const alternatePhone = enquiryForm.alternate_phone.trim()
    if (
      enquiryForm.customer_name.trim().length < 1
      || enquiryForm.customer_name.trim().length > 120
      || enquiryForm.phone.trim().length < 7
      || enquiryForm.phone.trim().length > 30
      || enquiryForm.email.trim().length < 3
      || enquiryForm.email.trim().length > 320
      || (alternatePhone && (alternatePhone.length < 7 || alternatePhone.length > 30))
      || enquiryForm.message.trim().length > 2000
    ) {
      setEnquiryError('Please check the name, contact number, email, alternate number, and message lengths.')
      return
    }

    setIsSubmittingEnquiry(true)
    setEnquiryError('')

    try {
      await createProductEnquiry({
        ...enquiryForm,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        product_type: product.product_type || '',
        product_price: product.price,
        product_image_url: product.image_url || imageUrls[0] || '',
      })
      onClose()
      toast({
        title: 'Enquiry submitted',
        description: 'Our team will contact you soon.',
        status: 'success',
        duration: 4500,
        isClosable: true,
      })
    } catch (error) {
      setEnquiryError(error.message || 'Unable to submit your enquiry. Please try again.')
    } finally {
      setIsSubmittingEnquiry(false)
    }
  }

  /* Desktop shows two columns: first half left, second half right. */
  const splitAt = Math.ceil(specificationRows.length / 2)
  const renderRow = ([label, value], index) => {
    const Icon = specIcons[label] || FaCheckCircle
    const hiddenOnMobile = !showAllSpecs && index >= MOBILE_SPEC_PREVIEW
    return (
      <li key={label} className={hiddenOnMobile ? 'pd-spec-extra' : undefined}>
        <span className="pd-spec-icon"><Icon /></span>
        <strong>{label}</strong>
        <span className="pd-spec-value">{value}</span>
      </li>
    )
  }

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* TOP: gallery + summary card */}
        <section className="pd-top">
          <div className="pd-gallery">
            <div className="pd-main-image">
              {imageUrls.length > 0 ? (
                <img src={imageUrls[activeImageIndex]} alt={`${product.name} image ${activeImageIndex + 1}`} />
              ) : (
                <div className="pd-no-image">No product images available</div>
              )}
              {imageUrls.length > 1 && (
                <>
                  <button type="button" className="pd-arrow pd-arrow-left" aria-label="Previous product image" onClick={() => goToImage(-1)}>
                    <FaChevronLeft />
                  </button>
                  <button type="button" className="pd-arrow pd-arrow-right" aria-label="Next product image" onClick={() => goToImage(1)}>
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            {imageUrls.length > 1 && (
              <div className="pd-thumbs">
                {imageUrls.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    type="button"
                    className={activeImageIndex === index ? 'is-active' : undefined}
                    aria-label={`Show product image ${index + 1}`}
                    aria-pressed={activeImageIndex === index}
                    onClick={() => {
                      setSelectedProductId(product.id)
                      setSelectedImageIndex(index)
                    }}
                  >
                    <img src={imageUrl} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="pd-summary">
            {product.product_type && <span className="pd-badge">{product.product_type}</span>}
            <h1>{product.name}</h1>
            <p className="pd-rating"><FaStar aria-hidden="true" /> {product.rating || 4.8} (Rated)</p>

            <div className="pd-price-row">
              <strong>₹{product.price.toLocaleString('en-IN')}</strong>
              {product.original_price && <s>₹{product.original_price.toLocaleString('en-IN')}</s>}
              {product.discount_percentage > 0 && <span className="pd-off">{product.discount_percentage}% OFF</span>}
            </div>

            {product.short_description && <p className="pd-short">{product.short_description}</p>}

            <div className="pd-actions">
              <button className="pd-btn pd-btn-primary" type="button" onClick={openEnquiry}>Enquire Now <FaArrowRight /></button>
              <Link className="pd-btn pd-btn-outline" to="/contact">Contact Us</Link>
            </div>

            {technologies.length > 0 && (
              <div className="pd-tech">
                <p>Purification technologies</p>
                <ul>
                  {technologies.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
              </div>
            )}

            <div className="pd-service-highlights" aria-label="Delivery and support information">
              <div>
                <span><FaTruck aria-hidden="true" /></span>
                <p><strong>Safe Delivery</strong><small>Carefully delivered to your door</small></p>
              </div>
              <div>
                <span><FaTools aria-hidden="true" /></span>
                <p><strong>Expert Installation</strong><small>Professional setup support</small></p>
              </div>
              <div>
                <span><FaHeadset aria-hidden="true" /></span>
                <p><strong>After-Sales Support</strong><small>Help when you need it</small></p>
              </div>
              <div>
                <span><FaShieldAlt aria-hidden="true" /></span>
                <p><strong>Warranty Assistance</strong><small>Support for product coverage</small></p>
              </div>
            </div>
          </aside>
        </section>

        {/* ABOUT */}
        {product.description && (
          <section className={`pd-panel pd-about${aboutOpen ? '' : ' is-collapsed'}`}>
            <button type="button" className="pd-panel-head" aria-expanded={aboutOpen} onClick={() => setAboutOpen((open) => !open)}>
              <span className="pd-panel-icon"><FaFileAlt /></span>
              <h2>About this product</h2>
              <FaChevronDown className="pd-chevron" aria-hidden="true" />
            </button>
            <p className="pd-about-text">{product.description}</p>
          </section>
        )}

        {/* SPECIFICATIONS */}
        {specificationRows.length > 0 && (
          <section className={`pd-panel pd-specs${specsOpen ? '' : ' is-collapsed'}`}>
            <button type="button" className="pd-panel-head pd-specs-head" aria-expanded={specsOpen} onClick={() => setSpecsOpen((open) => !open)}>
              <span className="pd-panel-icon"><FaFileAlt /></span>
              <h2>Specifications</h2>
              <FaChevronDown className="pd-chevron" aria-hidden="true" />
            </button>
            <div className="pd-specs-body">
              <div className="pd-specs-grid">
                <ul>{specificationRows.slice(0, splitAt).map((row, index) => renderRow(row, index))}</ul>
                <ul>{specificationRows.slice(splitAt).map((row, index) => renderRow(row, splitAt + index))}</ul>
              </div>
              {specificationRows.length > MOBILE_SPEC_PREVIEW && (
                <button type="button" className="pd-view-more" onClick={() => setShowAllSpecs((value) => !value)}>
                  {showAllSpecs ? 'View less' : 'View more'} <FaChevronDown className={showAllSpecs ? 'is-flipped' : undefined} />
                </button>
              )}
            </div>
          </section>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleEnquirySubmit}>
            <ModalHeader>Enquire about this product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {enquiryError && <Alert status="error" mb={4} borderRadius="md"><AlertIcon />{enquiryError}</Alert>}
              <div className="pd-enquiry-product">
                {product.image_url && <img src={product.image_url} alt="" />}
                <div>
                  <strong>{product.name}</strong>
                  <span>{[product.product_type, `₹${Number(product.price).toLocaleString('en-IN')}`].filter(Boolean).join(' · ')}</span>
                </div>
              </div>
              <FormControl mb={3} isRequired>
                <FormLabel>Name</FormLabel>
                <Input name="customer_name" autoComplete="name" value={enquiryForm.customer_name} onChange={handleEnquiryChange} maxLength={120} minLength={1} required />
              </FormControl>
              <FormControl mb={3} isRequired>
                <FormLabel>Contact number</FormLabel>
                <Input name="phone" type="tel" autoComplete="tel" value={enquiryForm.phone} onChange={handleEnquiryChange} minLength={7} maxLength={30} required />
              </FormControl>
              <FormControl mb={3} isRequired>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" autoComplete="email" value={enquiryForm.email} onChange={handleEnquiryChange} maxLength={320} required />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Alternate contact number <span className="pd-enquiry-optional">(optional)</span></FormLabel>
                <Input name="alternate_phone" type="tel" autoComplete="tel" value={enquiryForm.alternate_phone} onChange={handleEnquiryChange} minLength={7} maxLength={30} />
              </FormControl>
              <FormControl>
                <FormLabel>Message <span className="pd-enquiry-optional">(optional)</span></FormLabel>
                <Textarea name="message" value={enquiryForm.message} onChange={handleEnquiryChange} maxLength={2000} rows={3} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme="blue" type="submit" isLoading={isSubmittingEnquiry} loadingText="Submitting">
                Submit enquiry
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default ProductDetails

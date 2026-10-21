import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaArrowRight, FaFilter, FaHeart, FaSearch, FaShieldAlt, FaStar, FaTint, FaTimes } from 'react-icons/fa'
import EmptyState from '../../components/common/EmptyState'
import { setProducts } from '../../redux/slices/productSlice'
import { setCategories } from '../../redux/slices/categorySlice'
import { fetchCategories, fetchProducts } from '../../services/supabase'
import '../../styles/products.css'

const types = ['Domestic', 'Commercial', 'Accessories', 'Spare Parts']

/* Defensive getters: the first field that exists on your product row wins. */
const getImage = (product) => {
  const first = Array.isArray(product.images) ? product.images[0] : null
  const fromList = typeof first === 'string' ? first : first?.url || first?.image_url
  return product.image_url || product.image || product.thumbnail_url || fromList || '/images/Premium_Purifier.png'
}
const getMrp = (product) => Number(product.mrp ?? product.original_price ?? product.compare_at_price ?? product.old_price) || 0
const getDescription = (product) =>
  product.short_description ||
  product.description ||
  [product.purification_technology, product.capacity].filter(Boolean).join(' | ')
const formatPrice = (value) => `₹${Number(value).toLocaleString('en-IN')}`

function Products() {
  const products = useSelector((state) => state.products.items)
  const categories = useSelector((state) => state.categories.items)
  const dispatch = useDispatch()
  const resultsRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [type, setType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([fetchProducts(), fetchCategories()])
      .then(([productRows, categoryRows]) => {
        if (active) {
          dispatch(setProducts(productRows))
          dispatch(setCategories(categoryRows))
        }
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load products.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [dispatch])

  useEffect(() => {
    if (!filtersOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setFiltersOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [filtersOpen])

  const filteredProducts = useMemo(() => {
    const normalized = products.filter((product) => {
      const matchesText =
        !search ||
        [product.name, product.product_type, product.purification_technology, product.capacity]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      const matchesCategory = category === 'all' || product.category_id === category
      const matchesType = type === 'all' || product.product_type === type
      return matchesText && matchesCategory && matchesType
    })

    return [...normalized].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      return b.id.localeCompare(a.id)
    })
  }, [products, search, category, type, sortBy])

  return (
    <div className="pr-page">
      {/* HERO */}
      <section className="pr-hero">
        <div className="pr-hero-inner">
          <p className="pr-eyebrow">PURE WATER. BETTER LIVING.</p>
          <h1>Our <span>Water Purifiers</span></h1>
          <p className="pr-hero-text">
            Discover advanced, reliable and energy-efficient water purifiers for a healthier you and
            your family.
          </p>
        </div>
      </section>

      <div className="pr-container">
        {errorMessage && <p className="pr-error" role="alert">{errorMessage}</p>}

        {/* FILTER BAR */}
        <div className="pr-filters">
          <label className="pr-search">
            <FaSearch aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
          </label>
          <div className="pr-filter-options">
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">
              <option value="all">All Categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Type">
              <option value="all">All Types</option>
              {types.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort by">
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          <button
            type="button"
            className="pr-filter-btn"
            aria-expanded={filtersOpen}
            aria-controls="product-filter-drawer"
            onClick={() => {
              if (window.matchMedia('(max-width: 700px)').matches) {
                setFiltersOpen(true)
              } else {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
          >
            <FaFilter aria-hidden="true" /> Filter
          </button>
        </div>

        {filtersOpen && (
          <div className="pr-filter-drawer-wrap">
            <button
              type="button"
              className="pr-filter-backdrop"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            />
            <section
              className="pr-filter-drawer"
              id="product-filter-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-filter-title"
            >
              <div className="pr-filter-drawer-header">
                <h2 id="product-filter-title">Filters</h2>
                <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
                  <FaTimes aria-hidden="true" />
                </button>
              </div>
              <div className="pr-filter-drawer-options">
                <label>
                  <span>Category</span>
                  <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">
                    <option value="all">All Categories</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Type</span>
                  <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Type">
                    <option value="all">All Types</option>
                    {types.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Sort by</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort by">
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </label>
              </div>
              <div className="pr-filter-drawer-actions">
                <button type="button" className="pr-filter-reset" onClick={() => {
                  setCategory('all')
                  setType('all')
                  setSortBy('newest')
                }}>
                  Reset
                </button>
                <button type="button" className="pr-filter-apply" onClick={() => setFiltersOpen(false)}>
                  Show {filteredProducts.length} products
                </button>
              </div>
            </section>
          </div>
        )}

        {/* PRODUCT GRID */}
        <div ref={resultsRef} className="pr-results">
          {isLoading ? (
            <p className="pr-loading">Loading products…</p>
          ) : filteredProducts.length ? (
            <div className="pr-grid">
              {filteredProducts.map((product) => {
                const mrp = getMrp(product)
                const discount = mrp > product.price ? Math.round((1 - product.price / mrp) * 100) : 0
                return (
                  <article className="pr-card" key={product.id}>
                    <div className="pr-card-image">
                      <img src={getImage(product)} alt={product.name} loading="lazy" />
                    </div>
                    <div className="pr-card-body">
                      {product.product_type && <span className="pr-badge">{product.product_type}</span>}
                      <h3>{product.name}</h3>
                      <p className="pr-card-desc">{getDescription(product)}</p>
                      {product.rating ? (
                        <p className="pr-rating">
                          <FaStar aria-hidden="true" /> <b>{Number(product.rating).toFixed(1)}</b> (Rated)
                        </p>
                      ) : null}
                      <div className="pr-price-row">
                        <strong>{formatPrice(product.price)}</strong>
                        {discount > 0 && <s>{formatPrice(mrp)}</s>}
                        {discount > 0 && <span className="pr-off">{discount}% OFF</span>}
                      </div>
                    </div>
                    <Link className="pr-card-btn" to={`/products/${product.slug || product.id}`}>
                      View Details <FaArrowRight />
                    </Link>
                  </article>
                )
              })}
            </div>
          ) : (
            <EmptyState
              title="No products found"
              description="Try another search or filter combination."
              actionLabel="View all products"
              actionPath="/products"
            />
          )}
        </div>

        {/* TRUST STRIP */}
        <section className="pr-trust" aria-label="Why choose us">
          <div>
            <span className="pr-trust-icon"><FaTint /></span>
            <p><strong>Pure Water</strong><small>Every drop, 100% safe</small></p>
          </div>
          <div>
            <span className="pr-trust-icon"><FaHeart /></span>
            <p><strong>Better Health</strong><small>For your family&apos;s well-being</small></p>
          </div>
          <div>
            <span className="pr-trust-icon"><FaShieldAlt /></span>
            <p><strong>Trusted Service</strong><small>Installation &amp; support you can count on</small></p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Products

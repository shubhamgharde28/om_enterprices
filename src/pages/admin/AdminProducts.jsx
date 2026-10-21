import { Box, Button, Checkbox, CheckboxGroup, Container, FormControl, FormLabel, Grid, Input, Progress, Select, Stack, Table, Tbody, Td, Text, Textarea, Th, Thead, Tr, useToast } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaBoxOpen, FaChevronDown, FaImages, FaInfoCircle, FaPlus, FaTint, FaTools } from 'react-icons/fa'
import { addProduct, deleteProduct, setProducts, updateProduct } from '../../redux/slices/productSlice'
import { setCategories } from '../../redux/slices/categorySlice'
import { createProduct, deleteProductRecord, fetchCategories, fetchProducts, maxProductImageSize, updateProductRecord, uploadProductImage, validateProductImageFile } from '../../services/supabase'
import '../../styles/admin-products.css'

const purificationTechnologies = [
  'RO',
  'UV',
  'UF',
  'Copper',
  'Alkaline',
  'TDS Controller',
  'Mineralizer',
  'Activated Carbon',
  'Sediment Filter',
]

const defaultPurifierDetails = {
  technologies: ['RO', 'UV', 'UF'],
  purification_stages: '',
  water_sources: '',
  input_tds_min: '',
  input_tds_max: '',
  storage_capacity: '',
  purification_capacity: '',
  filter_details: '',
  filter_lifespan: '',
  power_consumption: '',
  dimensions: '',
  installation_details: '',
  box_contents: '',
}

const defaultProduct = {
  name: '',
  category_id: '',
  product_type: 'Domestic',
  short_description: '',
  description: '',
  price: 0,
  original_price: 0,
  stock: 0,
  capacity: '7 L',
  purification_technology: 'RO + UV + UF',
  suitable_for: 'Home use',
  warranty: '1 year',
  installation_available: true,
  featured: false,
  active: true,
  slug: '',
  image_url: '',
  additional_image_urls: '',
  purifier_details: { ...defaultPurifierDetails },
}

function AdminProducts() {
  const products = useSelector((state) => state.products.items)
  const categories = useSelector((state) => state.categories.items)
  const dispatch = useDispatch()
  const [form, setForm] = useState({ ...defaultProduct })
  const [editingId, setEditingId] = useState(null)
  const [activeView, setActiveView] = useState('products')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSelectedImageUploaded, setIsSelectedImageUploaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef(null)
  const saveInProgressRef = useRef(false)
  const uploadedImagesRef = useRef(new Map())
  const [openSections, setOpenSections] = useState({
    basic: true,
    specifications: true,
    installation: true,
  })
  const toast = useToast()

  const updatePurifierDetail = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      purifier_details: { ...currentForm.purifier_details, [field]: value },
    }))
  }

  useEffect(() => {
    let active = true
    Promise.all([fetchProducts(), fetchCategories()])
      .then(([rows, categoryRows]) => {
        if (active) {
          dispatch(setProducts(rows))
          dispatch(setCategories(categoryRows))
        }
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load products from Supabase.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [dispatch])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saveInProgressRef.current) return
    setErrorMessage('')
    const additionalImageUrls = form.additional_image_urls
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean)
    const imageUrls = [selectedImages.length ? '' : form.image_url.trim(), ...additionalImageUrls].filter(Boolean)
    const invalidImageUrl = imageUrls.find((url) => {
      try {
        const parsedUrl = new URL(url)
        return !['http:', 'https:'].includes(parsedUrl.protocol)
      } catch {
        return true
      }
    })

    if (invalidImageUrl) {
      setErrorMessage(`Enter a valid http or https image URL: ${invalidImageUrl}`)
      return
    }

    const purifierDetails = form.purifier_details
    const isWaterPurifier = ['Domestic', 'Commercial'].includes(form.product_type)
    const tdsMin = purifierDetails.input_tds_min === '' ? null : Number(purifierDetails.input_tds_min)
    const tdsMax = purifierDetails.input_tds_max === '' ? null : Number(purifierDetails.input_tds_max)
    if (isWaterPurifier && ((tdsMin !== null && tdsMax !== null && tdsMin > tdsMax)
      || (tdsMin !== null && tdsMin < 0)
      || (tdsMax !== null && tdsMax < 0))) {
      setErrorMessage('Input TDS minimum must be a non-negative value no greater than the maximum.')
      return
    }

    saveInProgressRef.current = true
    setIsSaving(true)
    const payload = {
      ...form,
      category_id: form.category_id || null,
      slug: form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      stock: Number(form.stock) || 0,
      capacity: isWaterPurifier && purifierDetails.storage_capacity !== ''
        ? `${purifierDetails.storage_capacity} L`
        : form.capacity,
      discount_percentage: form.original_price
        ? Math.max(0, Math.round((1 - Number(form.price) / Number(form.original_price)) * 100))
        : 0,
      purification_technology: isWaterPurifier
        ? purifierDetails.technologies.join(' + ')
        : '',
      image_url: imageUrls[0] || '',
      image_urls: imageUrls,
      purifier_details: isWaterPurifier ? {
        ...purifierDetails,
        purification_stages: purifierDetails.purification_stages === '' ? null : Number(purifierDetails.purification_stages),
        input_tds_min: tdsMin,
        input_tds_max: tdsMax,
        storage_capacity: purifierDetails.storage_capacity === '' ? null : Number(purifierDetails.storage_capacity),
        power_consumption: purifierDetails.power_consumption === '' ? null : Number(purifierDetails.power_consumption),
      } : {},
    }

    try {
      if (selectedImages.length) {
        const uploadedUrls = []
        for (const selectedImage of selectedImages) {
          let uploadedUrl = uploadedImagesRef.current.get(selectedImage.file)
          if (!uploadedUrl) {
            setIsUploadingImage(true)
            try {
              uploadedUrl = await uploadProductImage(selectedImage.file)
              uploadedImagesRef.current.set(selectedImage.file, uploadedUrl)
              setIsSelectedImageUploaded(true)
            } finally {
              setIsUploadingImage(false)
            }
          }
          uploadedUrls.push(uploadedUrl)
        }
        payload.image_url = uploadedUrls[0]
        payload.image_urls = [...uploadedUrls, ...additionalImageUrls]
      }

      if (editingId) {
        const savedProduct = await updateProductRecord(editingId, payload)
        dispatch(updateProduct(savedProduct))
        toast({ title: 'Product updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        const savedProduct = await createProduct(payload)
        dispatch(addProduct(savedProduct))
        toast({ title: 'Product saved to Supabase', status: 'success', duration: 2500, isClosable: true })
      }
      setForm({ ...defaultProduct })
      setEditingId(null)
      setSelectedImages([])
      setIsSelectedImageUploaded(false)
      uploadedImagesRef.current.clear()
      if (fileInputRef.current) fileInputRef.current.value = ''
      setActiveView('products')
    } catch (error) {
      if (error.productUpdated) dispatch(updateProduct(error.productUpdated))
      setErrorMessage(error.message || 'Unable to save product.')
    } finally {
      setIsSaving(false)
      saveInProgressRef.current = false
    }
  }

  const handleEdit = (product) => {
    const purifierDetails = product.purifier_details ?? {}
    setEditingId(product.id)
    setActiveView('form')
    setSelectedImages([])
    setIsSelectedImageUploaded(false)
    uploadedImagesRef.current.clear()
    setForm({
      ...defaultProduct,
      ...product,
      original_price: product.original_price ?? '',
      image_url: product.image_url ?? '',
      additional_image_urls: (product.image_urls ?? [])
        .filter((url) => url && url !== product.image_url)
        .join('\n'),
      purifier_details: {
        ...defaultPurifierDetails,
        ...purifierDetails,
        purification_stages: purifierDetails.purification_stages ?? '',
        water_sources: purifierDetails.water_sources ?? '',
        input_tds_min: purifierDetails.input_tds_min ?? '',
        input_tds_max: purifierDetails.input_tds_max ?? '',
        storage_capacity: purifierDetails.storage_capacity ?? '',
        purification_capacity: purifierDetails.purification_capacity ?? '',
        filter_details: purifierDetails.filter_details ?? '',
        filter_lifespan: purifierDetails.filter_lifespan ?? '',
        power_consumption: purifierDetails.power_consumption ?? '',
        dimensions: purifierDetails.dimensions ?? '',
        installation_details: purifierDetails.installation_details ?? '',
        box_contents: purifierDetails.box_contents ?? '',
        technologies: purifierDetails.technologies
          ?? (product.purification_technology
            ? product.purification_technology.split(/\s*\+\s*/)
            : defaultPurifierDetails.technologies),
      },
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    setErrorMessage('')
    try {
      await deleteProductRecord(product)
      dispatch(deleteProduct(product.id))
      toast({ title: 'Product deleted', status: 'success', duration: 2500, isClosable: true })
    } catch (error) {
      if (error.productDeleted) dispatch(deleteProduct(product.id))
      setErrorMessage(error.message || 'Unable to delete product.')
    }
  }

  const toggleSection = (section, isOpen) => {
    setOpenSections((current) => ({ ...current, [section]: isOpen }))
  }

  const isWaterPurifier = ['Domestic', 'Commercial'].includes(form.product_type)
  const openAddProductForm = () => {
    if (activeView !== 'form' || editingId) {
      setEditingId(null)
      setForm({ ...defaultProduct, purifier_details: { ...defaultPurifierDetails } })
      setSelectedImages([])
      setIsSelectedImageUploaded(false)
      uploadedImagesRef.current.clear()
      setErrorMessage('')
    }
    setActiveView('form')
  }

  const handleImageSelection = (event) => {
    const files = [...(event.target.files ?? [])]
    if (!files.length) return
    try {
      files.forEach(validateProductImageFile)
    } catch (error) {
      setErrorMessage(error.message)
      event.target.value = ''
      return
    }
    uploadedImagesRef.current.clear()
    setIsSelectedImageUploaded(false)
    setSelectedImages(files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })))
    setErrorMessage('')
  }

  const cancelProductEdit = () => {
    setEditingId(null)
    setForm({ ...defaultProduct, purifier_details: { ...defaultPurifierDetails } })
    setSelectedImages([])
    setIsSelectedImageUploaded(false)
    uploadedImagesRef.current.clear()
    setErrorMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setActiveView('products')
  }

  useEffect(() => () => {
    selectedImages.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl))
  }, [selectedImages])

  return (
    <Container className="admin-products" maxW="1500px" px={0}>
      <nav className="products-view-tabs" role="tablist" aria-label="Product management views">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'products'}
          className={`products-view-tab${activeView === 'products' ? ' is-active' : ''}`}
          onClick={() => setActiveView('products')}
        >
          <FaBoxOpen />
          <span>Products</span>
          <span className="products-view-count">{products.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'form'}
          className={`products-view-tab${activeView === 'form' ? ' is-active' : ''}`}
          onClick={openAddProductForm}
        >
          <FaPlus />
          <span>Add Product</span>
        </button>
      </nav>

      {activeView === 'form' ? (
        <section className="products-form-view" role="tabpanel">
          <div className="products-breadcrumbs">
            <button type="button" onClick={() => setActiveView('products')}>Products</button>
            <span aria-hidden="true">›</span>
            <strong>{editingId ? 'Edit Product' : 'Add Product'}</strong>
          </div>
          <header className="products-heading">
            <h1>{editingId ? 'Edit Product' : 'Add Product'}</h1>
            <p>{editingId ? 'Update the product details in your store.' : 'Fill in the details below to add a new product to your store.'}</p>
          </header>

          {errorMessage && <Box className="products-error" role="alert">{errorMessage}</Box>}

          <Stack as="form" className="products-form" spacing={0} onSubmit={handleSubmit}>
        <details className="product-form-section" open={openSections.basic} onToggle={(event) => toggleSection('basic', event.currentTarget.open)}>
          <summary className="product-section-summary">
            <span className="product-section-title"><FaInfoCircle /> Basic Information</span>
            <FaChevronDown className="product-section-chevron" />
          </summary>
          <Grid className="product-section-grid" templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={3}>
            <FormControl isRequired>
              <FormLabel>Product Name</FormLabel>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kent Supreme Plus" required />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select value={form.category_id || ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">No category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Price</FormLabel>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="₹ 0" required />
            </FormControl>
            <FormControl>
              <FormLabel>Original Price</FormLabel>
              <Input type="number" min="0" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} placeholder="₹ 0" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Stock</FormLabel>
              <Input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" required />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Product Type</FormLabel>
              <Select value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })}>
                <option>Domestic</option>
                <option>Commercial</option>
                <option>Accessories</option>
                <option>Spare Parts</option>
              </Select>
            </FormControl>
            <FormControl className="product-field-wide">
              <FormLabel>Short Description</FormLabel>
              <Textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="Enter a short description..." rows={2} />
            </FormControl>
            <FormControl className="product-field-wide">
              <FormLabel>Description</FormLabel>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add product details..." rows={3} />
            </FormControl>
          </Grid>
        </details>

        {isWaterPurifier && (
          <details className="product-form-section" open={openSections.specifications} onToggle={(event) => toggleSection('specifications', event.currentTarget.open)}>
            <summary className="product-section-summary">
              <span className="product-section-title"><FaTint /> Water Purifier Specifications</span>
              <FaChevronDown className="product-section-chevron" />
            </summary>
            <div className="product-specs-layout">
              <div className="product-specs-fields">
                <Grid className="product-section-grid" templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={3}>
                  <FormControl>
                    <FormLabel>Warranty</FormLabel>
                    <Select value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })}>
                      <option>6 months</option>
                      <option>1 year</option>
                      <option>18 months</option>
                      <option>2 years</option>
                      <option>3 years</option>
                      {!['6 months', '1 year', '18 months', '2 years', '3 years'].includes(form.warranty) && form.warranty && <option>{form.warranty}</option>}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Purification Capacity</FormLabel>
                    <Input value={form.purifier_details.purification_capacity} onChange={(e) => updatePurifierDetail('purification_capacity', e.target.value)} placeholder="e.g. 15 LPH" />
                  </FormControl>
                  <FormControl className="product-field-wide">
                    <FormLabel>Purification Technologies</FormLabel>
                    <CheckboxGroup
                      value={form.purifier_details.technologies}
                      onChange={(technologies) => setForm((currentForm) => ({
                        ...currentForm,
                        purification_technology: technologies.join(' + '),
                        purifier_details: { ...currentForm.purifier_details, technologies },
                      }))}
                    >
                      <Grid className="product-technology-grid" templateColumns={{ base: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }} gap={2}>
                        {purificationTechnologies.map((technology) => <Checkbox key={technology} value={technology}>{technology}</Checkbox>)}
                      </Grid>
                    </CheckboxGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Purification Stages</FormLabel>
                    <Input type="number" min="1" step="1" value={form.purifier_details.purification_stages} onChange={(e) => updatePurifierDetail('purification_stages', e.target.value)} placeholder="e.g. 7" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Water Source Compatibility</FormLabel>
                    <Input value={form.purifier_details.water_sources} onChange={(e) => updatePurifierDetail('water_sources', e.target.value)} placeholder="e.g. Municipal, borewell, tanker" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Input TDS Minimum (ppm)</FormLabel>
                    <Input type="number" min="0" value={form.purifier_details.input_tds_min} onChange={(e) => updatePurifierDetail('input_tds_min', e.target.value)} placeholder="e.g. 100" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Input TDS Maximum (ppm)</FormLabel>
                    <Input type="number" min="0" value={form.purifier_details.input_tds_max} onChange={(e) => updatePurifierDetail('input_tds_max', e.target.value)} placeholder="e.g. 2000" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Storage Capacity (litres)</FormLabel>
                    <Input type="number" min="0" step="0.1" value={form.purifier_details.storage_capacity} onChange={(e) => updatePurifierDetail('storage_capacity', e.target.value)} placeholder="e.g. 8" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Power Consumption (watts)</FormLabel>
                    <Input type="number" min="0" step="1" value={form.purifier_details.power_consumption} onChange={(e) => updatePurifierDetail('power_consumption', e.target.value)} placeholder="e.g. 60" />
                  </FormControl>
                  <FormControl className="product-field-wide">
                    <FormLabel>Filter Details</FormLabel>
                    <Textarea value={form.purifier_details.filter_details} onChange={(e) => updatePurifierDetail('filter_details', e.target.value)} placeholder="List included filters and their specifications" rows={2} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Filter Lifespan</FormLabel>
                    <Input value={form.purifier_details.filter_lifespan} onChange={(e) => updatePurifierDetail('filter_lifespan', e.target.value)} placeholder="e.g. 6,000 litres or 12 months" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Dimensions (W × H × D)</FormLabel>
                    <Input value={form.purifier_details.dimensions} onChange={(e) => updatePurifierDetail('dimensions', e.target.value)} placeholder="e.g. 30 × 45 × 25 cm" />
                  </FormControl>
                </Grid>
              </div>
            </div>
          </details>
        )}

        <details className="product-form-section" open={openSections.installation} onToggle={(event) => toggleSection('installation', event.currentTarget.open)}>
          <summary className="product-section-summary">
            <span className="product-section-title"><FaTools /> Installation &amp; Additional Details</span>
            <FaChevronDown className="product-section-chevron" />
          </summary>
          <Grid className="product-section-grid" templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={3}>
            {isWaterPurifier && (
              <>
                <FormControl className="product-field-wide">
                  <Checkbox isChecked={form.installation_available} onChange={(e) => setForm({ ...form, installation_available: e.target.checked })}>Installation available</Checkbox>
                </FormControl>
                {form.installation_available && (
                  <FormControl>
                    <FormLabel>Installation Details</FormLabel>
                    <Textarea value={form.purifier_details.installation_details} onChange={(e) => updatePurifierDetail('installation_details', e.target.value)} placeholder="Describe installation service, charges, or coverage" rows={2} />
                  </FormControl>
                )}
                <FormControl>
                  <FormLabel>Box Contents</FormLabel>
                  <Textarea value={form.purifier_details.box_contents} onChange={(e) => updatePurifierDetail('box_contents', e.target.value)} placeholder="List items included in the box" rows={2} />
                </FormControl>
              </>
            )}
            {!isWaterPurifier && (
              <FormControl>
                <FormLabel>Warranty</FormLabel>
                <Input value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} placeholder="e.g. 1 year" />
              </FormControl>
            )}
            <FormControl className="product-field-wide">
              <FormLabel>Primary Product Image</FormLabel>
              <Input
                ref={fileInputRef}
                className="product-image-file-input"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                aria-label="Choose product images"
                onChange={handleImageSelection}
              />
              <div className="product-image-upload">
                {(selectedImages.length
                  ? selectedImages
                  : (form.image_urls?.length ? form.image_urls : [form.image_url].filter(Boolean))
                    .map((url) => ({ previewUrl: url, file: null })))
                  .map((image, index) => (
                  <img
                    key={image.previewUrl}
                    className="product-image-preview"
                    src={image.previewUrl}
                    alt={`${form.name || 'Product'} image ${index + 1} preview`}
                  />
                  ))}
                <div className="product-image-upload-copy">
                  <Text fontSize="sm" fontWeight="600" color="gray.700">
                    {selectedImages.length
                      ? `${selectedImages.length} image${selectedImages.length === 1 ? '' : 's'} selected`
                      : (form.image_url ? 'Current product image' : 'No image selected')}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    JPEG, PNG, or WebP · Max {Math.round(maxProductImageSize / 1024 / 1024)} MB each. First selected image is primary.
                  </Text>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    mt={2}
                    isDisabled={isSaving}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {form.image_url || selectedImages.length ? 'Replace / Add Images' : 'Upload Product Image'}
                  </Button>
                </div>
              </div>
              {isUploadingImage && (
                <Box mt={3} role="status" aria-live="polite">
                  <Text fontSize="xs" color="blue.600" mb={1}>Uploading product image…</Text>
                  <Progress size="xs" isIndeterminate colorScheme="blue" />
                </Box>
              )}
              {selectedImages.length > 0 && isSelectedImageUploaded && (
                <Text mt={2} fontSize="xs" color="green.600" role="status">
                  Image uploaded. Save the product to publish the image.
                </Text>
              )}
            </FormControl>
          </Grid>
        </details>

        <div className="products-form-actions">
          <Button className="product-submit-button" type="submit" isLoading={isSaving}>
            <FaImages />
            {editingId ? 'Save Changes' : 'Add Product'}
          </Button>
          {editingId && <Button className="product-cancel-button" type="button" variant="ghost" onClick={cancelProductEdit}>Cancel Edit</Button>}
        </div>
          </Stack>
        </section>
      ) : (
      <>
      {errorMessage && <Box className="products-error" role="alert">{errorMessage}</Box>}
      <Box className="products-preview">
        <div className="products-preview-heading">
          <div>
            <h2>Product Details (Preview)</h2>
            <p>Manage the products available in your store.</p>
          </div>
          <span>{products.length} products</span>
        </div>
        <div className="products-table-scroll">
          <Table className="products-table" size="sm">
            <Thead>
              <Tr><Th>Name</Th><Th>Type</Th><Th>Price</Th><Th>Featured</Th><Th>Actions</Th></Tr>
            </Thead>
            <Tbody>
              {!isLoading && products.map((product) => (
                <Tr key={product.id}>
                  <Td>{product.name}</Td>
                  <Td>{product.product_type}</Td>
                  <Td>₹{product.price}</Td>
                  <Td><span className={`product-featured-badge${product.featured ? ' is-featured' : ''}`}>{product.featured ? 'Featured' : 'Standard'}</span></Td>
                  <Td>
                    <div className="product-row-actions">
                      <Button size="xs" onClick={() => handleEdit(product)}>Edit</Button>
                      <Button size="xs" onClick={async () => {
                        try {
                          const saved = await updateProductRecord(product.id, { ...product, featured: !product.featured })
                          dispatch(updateProduct(saved))
                        } catch (error) {
                          setErrorMessage(error.message || 'Unable to update product.')
                        }
                      }}>{product.featured ? 'Unfeature' : 'Feature'}</Button>
                      <Button size="xs" colorScheme="red" onClick={() => handleDelete(product)}>Delete</Button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {isLoading && <Tr><Td colSpan={5}>Loading products…</Td></Tr>}
              {!isLoading && products.length === 0 && <Tr><Td colSpan={5}>No products saved yet.</Td></Tr>}
            </Tbody>
          </Table>
        </div>
      </Box>
      </>
      )}
    </Container>
  )
}

export default AdminProducts

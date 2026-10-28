import { createClient } from '@supabase/supabase-js'
import { mockProducts, mockServices, mockBookings, mockCategories, mockTestimonials, mockWebsiteContent, mockContactMessages, mockProductEnquiries } from '../data/mockData'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const isSupabaseEnabled = Boolean(supabase)

let realtimeSubscriptionId = 0

const createRealtimeChannelName = (prefix) => `${prefix}-${++realtimeSubscriptionId}`

export const subscribeToBookingChanges = (filter, onChange) => {
  if (!isSupabaseEnabled) return () => {}

  const channel = supabase
    .channel(createRealtimeChannelName(`service-bookings-${(filter || 'all').replace(/[^a-zA-Z0-9]/g, '-')}`))
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'service_bookings',
        ...(filter ? { filter } : {}),
      },
      onChange,
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export const subscribeToContactMessageChanges = (onChange) => {
  if (!isSupabaseEnabled) return () => {}

  const channel = supabase
    .channel(createRealtimeChannelName('contact-message-notifications'))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'contact_messages' },
      onChange,
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export const subscribeToSolarRequestChanges = (onChange) => {
  if (!isSupabaseEnabled) return () => {}

  const channel = supabase
    .channel(createRealtimeChannelName('solar-request-notifications'))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'solar_requests' },
      onChange,
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export const subscribeToProductEnquiryChanges = (onChange) => {
  if (!isSupabaseEnabled) return () => {}

  const channel = supabase
    .channel(createRealtimeChannelName('product-enquiry-notifications'))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'product_enquiries' },
      onChange,
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export const fetchProducts = async ({ includeInactive = false } = {}) => {
  if (!isSupabaseEnabled) return mockProducts

  let query = supabase
    .from('products')
    .select('*, product_images(image_url, alt_text, display_order, is_primary), product_spare_parts!product_spare_parts_product_id_fkey(spare_part_id, display_order, spare_part:products!product_spare_parts_spare_part_id_fkey(id, name, slug, image_url, price, short_description, product_type, active))')
    .order('created_at', { ascending: false })
  if (!includeInactive) query = query.eq('active', true)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((product) => {
    const images = [...(product.product_images ?? [])]
      .sort((first, second) => first.display_order - second.display_order)
    const sparePartRelations = [...(product.product_spare_parts ?? [])]
      .sort((first, second) => first.display_order - second.display_order)
    const image_urls = images.map((image) => image.image_url).filter(Boolean)
    const primaryImageUrl = images.find((image) => image.is_primary)?.image_url
      || image_urls[0]
      || ''

    return {
      ...product,
      image_url: product.image_url || primaryImageUrl,
      image_urls: product.image_url && !image_urls.includes(product.image_url)
        ? [product.image_url, ...image_urls]
        : image_urls,
      spare_part_ids: sparePartRelations.map((relation) => relation.spare_part_id),
      spare_parts: sparePartRelations
        .map((relation) => relation.spare_part)
        .filter((sparePart) => sparePart?.active),
    }
  })
}

const productFields = [
  'name',
  'slug',
  'category_id',
  'product_type',
  'short_description',
  'description',
  'image_url',
  'price',
  'original_price',
  'discount_percentage',
  'stock',
  'capacity',
  'purification_technology',
  'purifier_details',
  'suitable_for',
  'warranty',
  'installation_available',
  'featured',
  'active',
  'rating',
]

const serializeProduct = (product) =>
  Object.fromEntries(
    productFields.map((field) => {
      if (field === 'rating' || field === 'discount_percentage' || field === 'stock') {
        return [field, product[field] ?? 0]
      }
      if (field === 'featured' || field === 'active' || field === 'installation_available') {
        return [field, product[field] ?? false]
      }
      if (field === 'original_price' || field === 'category_id') {
        return [field, product[field] || null]
      }
      if (field === 'purifier_details') {
        return [field, product[field] ?? {}]
      }
      return [field, product[field] ?? '']
    }),
  )

const saveProductSpareParts = async (productId, sparePartIds = []) => {
  const { error } = await supabase.rpc('set_product_spare_parts', {
    p_product_id: productId,
    p_spare_part_ids: sparePartIds,
  })
  if (error) throw error
}

const getProductImageUrls = (product) =>
  [...new Set((product.image_urls?.length ? product.image_urls : [product.image_url])
    .map((url) => url?.trim())
    .filter(Boolean))]

const productImageBucket = 'product'
export const maxProductImageSize = 5 * 1024 * 1024

export const validateProductImageFile = (file) => {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.')
  }
  if (file.size > maxProductImageSize) {
    throw new Error('Choose an image that is 5 MB or smaller.')
  }
}

const createUploadId = () => {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export const uploadProductImage = async (file) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')
  validateProductImageFile(file)

  const extensionByType = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const path = `${createUploadId()}.${extensionByType[file.type]}`
  const { data, error } = await supabase.storage
    .from(productImageBucket)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(`Unable to upload product image: ${error.message}`)
  if (!data?.path) throw new Error('The image upload completed without a storage path.')

  const { data: publicUrlData } = supabase.storage
    .from(productImageBucket)
    .getPublicUrl(data.path)

  if (!publicUrlData?.publicUrl) {
    throw new Error('The image uploaded, but Supabase did not return a public image URL.')
  }

  return publicUrlData.publicUrl
}

const getProductImageStoragePath = (imageUrl) => {
  if (!imageUrl || !supabaseUrl) return null

  try {
    const parsedImageUrl = new URL(imageUrl)
    const parsedSupabaseUrl = new URL(supabaseUrl)
    const projectPath = parsedSupabaseUrl.pathname.replace(/\/$/, '')
    const publicBucketPrefix = `${projectPath}/storage/v1/object/public/${productImageBucket}/`
    if (parsedImageUrl.origin !== parsedSupabaseUrl.origin
      || !parsedImageUrl.pathname.startsWith(publicBucketPrefix)) {
      return null
    }

    const path = decodeURIComponent(parsedImageUrl.pathname.slice(publicBucketPrefix.length))
    if (!path || path.split('/').some((segment) => segment === '.' || segment === '..')) return null
    return path
  } catch {
    return null
  }
}

const deleteUnusedProductImageFiles = async (candidatePaths) => {
  if (!candidatePaths.length) return

  const [productsResult, imagesResult] = await Promise.all([
    supabase.from('products').select('image_url'),
    supabase.from('product_images').select('image_url'),
  ])
  if (productsResult.error || imagesResult.error) {
    const details = [productsResult.error?.message, imagesResult.error?.message].filter(Boolean).join('; ')
    throw new Error(`Image references could not be checked: ${details}`)
  }

  const referencedPaths = new Set(
    [
      ...(productsResult.data ?? []).map((row) => row.image_url),
      ...(imagesResult.data ?? []).map((row) => row.image_url),
    ]
      .map(getProductImageStoragePath)
      .filter(Boolean),
  )
  const unusedPaths = candidatePaths.filter((path) => !referencedPaths.has(path))
  if (!unusedPaths.length) return

  const { error } = await supabase.storage.from(productImageBucket).remove(unusedPaths)
  if (error) throw new Error(`Unused image file(s) could not be removed from Storage: ${error.message}`)
}

const resolveCategoryId = async (categoryId, productType) => {
  if (!categoryId) return null
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(categoryId)) {
    return categoryId
  }

  const categorySlugByType = {
    Domestic: 'domestic-water-purifiers',
    Commercial: 'commercial-water-purifiers',
    Accessories: 'accessories',
    'Spare Parts': 'spare-parts',
  }
  const candidateSlugs = [categoryId.replace(/^cat-/, ''), categorySlugByType[productType]]
    .filter(Boolean)
    .map((slug) => slug.replace(/-/g, ' ').toLowerCase())

  const { data, error } = await supabase.from('categories').select('id, slug, name')
  if (error) throw error

  const match = data?.find((category) => {
    const normalizedSlug = category.slug?.replace(/-/g, ' ').toLowerCase()
    const normalizedName = category.name?.toLowerCase()
    return candidateSlugs.some((candidate) => candidate === normalizedSlug || candidate === normalizedName)
  })

  return match?.id ?? null
}

export const createProduct = async (product) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const image_urls = getProductImageUrls(product)
  const [image_url = ''] = image_urls
  const { image_url: _imageUrl, ...fields } = serializeProduct({ ...product, image_url })
  fields.category_id = await resolveCategoryId(product.category_id, product.product_type)
  const { data, error } = await supabase
    .from('products')
    .insert(fields)
    .select()
    .single()

  if (error) throw error

  try {
    await saveProductSpareParts(data.id, product.spare_part_ids)
  } catch (sparePartsError) {
    const { error: rollbackError } = await supabase.from('products').delete().eq('id', data.id)
    if (rollbackError) {
      throw new Error(`The product was created, but its spare parts could not be saved (${sparePartsError.message}); automatic cleanup also failed (${rollbackError.message}).`)
    }
    throw new Error(`Unable to save compatible spare parts: ${sparePartsError.message}`)
  }

  if (image_urls.length) {
    const { error: imageError } = await supabase
      .from('product_images')
      .insert(image_urls.map((url, index) => ({
        product_id: data.id,
        image_url: url,
        alt_text: data.name,
        display_order: index,
        is_primary: index === 0,
      })))

    if (imageError) {
      const { error: rollbackError } = await supabase.from('products').delete().eq('id', data.id)
      if (rollbackError) {
        throw new Error(`The product was created, but its image could not be saved (${imageError.message}); automatic cleanup also failed (${rollbackError.message}).`)
      }
      throw imageError
    }
  }

  return { ...data, image_url, image_urls }
}

export const updateProductRecord = async (id, product) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const [
    { data: previousProduct, error: previousProductError },
    { data: previousImages, error: previousImagesError },
    { data: previousSpareParts, error: previousSparePartsError },
  ] = await Promise.all([
    supabase.from('products').select('image_url').eq('id', id).single(),
    supabase.from('product_images').select('image_url').eq('product_id', id),
    supabase.from('product_spare_parts').select('spare_part_id').eq('product_id', id),
  ])
  if (previousProductError) throw previousProductError
  if (previousImagesError) throw previousImagesError
  if (previousSparePartsError) throw previousSparePartsError
  const previousSparePartIds = (previousSpareParts ?? []).map((relation) => relation.spare_part_id)

  const previousImagePaths = [...new Set([
    previousProduct.image_url,
    ...(previousImages ?? []).map((image) => image.image_url),
  ].map(getProductImageStoragePath).filter(Boolean))]
  const image_urls = getProductImageUrls(product)
  const [image_url = ''] = image_urls
  const newImagePaths = new Set(image_urls.map(getProductImageStoragePath).filter(Boolean))
  const replacedImagePaths = previousImagePaths.filter((path) => !newImagePaths.has(path))
  const { image_url: _imageUrl, ...fields } = serializeProduct({ ...product, image_url })
  fields.category_id = await resolveCategoryId(product.category_id, product.product_type)
  const { data, error } = await supabase.from('products').update(fields).eq('id', id).select().single()
  if (error) throw error

  try {
    await saveProductSpareParts(id, product.spare_part_ids)
  } catch (sparePartsError) {
    const errorWithProduct = new Error(`Product updated, but compatible spare parts could not be saved: ${sparePartsError.message}`)
    errorWithProduct.productUpdated = {
      ...data,
      image_url,
      image_urls,
      spare_part_ids: previousSparePartIds,
    }
    throw errorWithProduct
  }

  const { error: deleteError } = await supabase.from('product_images').delete().eq('product_id', id)
  if (deleteError) throw deleteError

  if (image_urls.length) {
    const { error: imageError } = await supabase.from('product_images').insert(image_urls.map((url, index) => ({
      product_id: id,
      image_url: url,
      alt_text: data.name,
      display_order: index,
      is_primary: index === 0,
    })))
    if (imageError) throw imageError
  }

  const updatedProduct = {
    ...data,
    image_url,
    image_urls,
    spare_part_ids: product.spare_part_ids ?? [],
  }
  try {
    await deleteUnusedProductImageFiles(replacedImagePaths)
  } catch (error) {
    const cleanupError = new Error(`Product updated, but the replaced image could not be removed: ${error.message}`)
    cleanupError.productUpdated = updatedProduct
    throw cleanupError
  }

  return updatedProduct
}

export const deleteProductRecord = async (product) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const productId = typeof product === 'string' ? product : product.id
  if (!productId) throw new Error('Cannot delete product without an ID.')

  const { data: linkedImages, error: linkedImagesError } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('product_id', productId)
  if (linkedImagesError) throw linkedImagesError

  const imageUrls = [
    ...(typeof product === 'object' ? getProductImageUrls(product) : []),
    ...(linkedImages ?? []).map((image) => image.image_url),
  ]
  const candidatePaths = [...new Set(imageUrls.map(getProductImageStoragePath).filter(Boolean))]

  const { error: deleteError } = await supabase.from('products').delete().eq('id', productId)
  if (deleteError) throw deleteError

  try {
    await deleteUnusedProductImageFiles(candidatePaths)
  } catch (error) {
    const cleanupError = new Error(`Product deleted, but its image file(s) could not be removed: ${error.message}`)
    cleanupError.productDeleted = true
    throw cleanupError
  }
}

export const fetchServices = async () => {
  if (!isSupabaseEnabled) return mockServices

  const { data, error } = await supabase.from('services').select('*').eq('active', true)
  if (error) throw error
  return data ?? mockServices
}

export const createService = async (service) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const name = service.name.trim()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const { data, error } = await supabase
    .from('services')
    .insert({ ...service, name, slug })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateServiceRecord = async (id, service) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const name = service.name.trim()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const { data, error } = await supabase
    .from('services')
    .update({
      name,
      slug,
      service_type: service.service_type,
      price: service.price,
      image_url: service.image_url?.trim() || '',
      active: service.active,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteServiceRecord = async (id) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}

export const fetchTechnicians = async () => {
  if (!isSupabaseEnabled) return []

  const { data, error } = await supabase.from('technicians').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export const createTechnician = async (technician) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const { data, error } = await supabase
    .from('technicians')
    .insert({
      full_name: technician.full_name.trim(),
      phone: technician.phone.trim(),
      email: technician.email.trim(),
      active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateTechnicianRecord = async (id, technician) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const { data, error } = await supabase
    .from('technicians')
    .update({
      full_name: technician.full_name.trim(),
      phone: technician.phone.trim(),
      email: technician.email.trim(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteTechnicianRecord = async (id) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const { error } = await supabase.from('technicians').delete().eq('id', id)
  if (error) throw error
}

export const fetchCategories = async () => {
  if (!isSupabaseEnabled) return mockCategories

  const { data, error } = await supabase.from('categories').select('*').eq('active', true)
  if (error) throw error
  return data ?? mockCategories
}

export const createCategory = async (category) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const name = category.name.trim()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug, active: true })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCategoryRecord = async (id, category) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const name = category.name.trim()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const { data, error } = await supabase
    .from('categories')
    .update({ name, slug })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteCategoryRecord = async (id) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export const createContactMessage = async (message) => {
  const contactMessage = {
    name: message.name.trim(),
    phone: message.phone.trim(),
    email: message.email.trim(),
    message: message.message.trim(),
    status: 'New',
  }

  if (!isSupabaseEnabled) {
    const savedMessage = {
      ...contactMessage,
      id: `contact-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    mockContactMessages.unshift(savedMessage)
    return savedMessage
  }

  const { error } = await supabase
    .from('contact_messages')
    .insert([contactMessage])
  if (error) throw error
  return contactMessage
}

export const fetchContactMessages = async () => {
  if (!isSupabaseEnabled) return mockContactMessages

  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export const createProductEnquiry = async (enquiry) => {
  const enquiryFields = {
    product_id: enquiry.product_id,
    product_name: enquiry.product_name.trim(),
    product_slug: enquiry.product_slug.trim(),
    product_type: enquiry.product_type.trim(),
    product_price: Number(enquiry.product_price) || 0,
    product_image_url: enquiry.product_image_url.trim(),
    customer_name: enquiry.customer_name.trim(),
    phone: enquiry.phone.trim(),
    email: enquiry.email.trim(),
    alternate_phone: enquiry.alternate_phone.trim(),
    message: enquiry.message.trim(),
    status: 'New',
  }

  if (!isSupabaseEnabled) {
    const savedEnquiry = {
      ...enquiryFields,
      id: `product-enquiry-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    mockProductEnquiries.unshift(savedEnquiry)
    return savedEnquiry
  }

  const { error } = await supabase
    .from('product_enquiries')
    .insert([{ ...enquiryFields, user_id: null }])
  if (error) throw error
  return { ...enquiryFields, user_id: null }
}

export const fetchProductEnquiries = async () => {
  if (!isSupabaseEnabled) return mockProductEnquiries

  const { data, error } = await supabase
    .from('product_enquiries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export const updateProductEnquiryStatus = async (enquiryId, status) => {
  if (!isSupabaseEnabled) {
    const enquiry = mockProductEnquiries.find((item) => item.id === enquiryId)
    if (!enquiry) throw new Error(`Product enquiry ${enquiryId} was not found.`)
    enquiry.status = status
    return enquiry
  }

  const { data, error } = await supabase
    .from('product_enquiries')
    .update({ status })
    .eq('id', enquiryId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const createSolarRequest = async (request) => {
  if (!isSupabaseEnabled) {
    throw new Error('Solar requests need a Supabase connection. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before submitting.')
  }

  const { monthly_bill, ...requestFields } = request
  const { error } = await supabase
    .from('solar_requests')
    .insert([{
      ...requestFields,
      monthly_electricity_bill: monthly_bill,
      status: 'Pending',
    }])
  if (error) throw error
}

export const fetchSolarRequests = async () => {
  if (!isSupabaseEnabled) {
    throw new Error('Solar requests need a Supabase connection. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before viewing submissions.')
  }

  const { data, error } = await supabase
    .from('solar_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export const fetchAdminCustomers = async () => {
  if (!isSupabaseEnabled) {
    throw new Error('Customer records need a Supabase connection. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before viewing customers.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, active, created_at')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export const updateSolarRequestStatus = async (requestId, status) => {
  if (!isSupabaseEnabled) {
    throw new Error('Solar request management requires a configured Supabase connection.')
  }

  const { data, error } = await supabase
    .from('solar_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateContactMessageStatus = async (messageId, status) => {
  if (!isSupabaseEnabled) {
    const message = mockContactMessages.find((item) => item.id === messageId)
    if (!message) throw new Error(`Contact message ${messageId} was not found.`)
    message.status = status
    return message
  }

  const { data, error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', messageId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const fetchTestimonials = async () => {
  if (!isSupabaseEnabled) return mockTestimonials

  const { data, error } = await supabase.from('testimonials').select('*').eq('active', true)
  if (error) throw error
  return (data ?? mockTestimonials).map((testimonial) => {
    const formatDate = (date) => date
      ? new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          timeZone: 'UTC',
          year: 'numeric',
        })
      : ''

    return {
      ...testimonial,
      date: testimonial.created_at ? formatDate(testimonial.created_at) : testimonial.date,
    }
  })
}

export const fetchAdminTestimonials = async () => {
  if (!isSupabaseEnabled) return mockTestimonials

  const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export const createTestimonial = async (testimonial) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      customer_name: testimonial.customer_name.trim(),
      rating: Number(testimonial.rating),
      review: testimonial.review.trim(),
      image_url: '',
      active: true,
      featured: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateTestimonialRecord = async (id, testimonial) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const { data, error } = await supabase
    .from('testimonials')
    .update({
      customer_name: testimonial.customer_name.trim(),
      rating: Number(testimonial.rating),
      review: testimonial.review.trim(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteTestimonialRecord = async (id) => {
  if (!supabase) throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')

  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw error
}

export const fetchWebsiteContent = async () => {
  if (!isSupabaseEnabled) return mockWebsiteContent

  const { data, error } = await supabase.from('website_content').select('*').limit(1).single()
  if (error) throw error
  return data ?? mockWebsiteContent
}

export const submitBooking = async (bookingPayload) => {
  if (!isSupabaseEnabled) {
    return {
      ...bookingPayload,
      booking_number: `OE-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Pending',
      created_at: new Date().toISOString(),
    }
  }

  const { data, error } = await supabase.from('service_bookings').insert([bookingPayload]).select().single()
  if (error) throw error
  return data
}

export const fetchBookings = async () => {
  if (!isSupabaseEnabled) return mockBookings

  const { data: bookings, error } = await supabase
    .from('service_bookings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error

  const assignedIds = [...new Set((bookings ?? []).map((booking) => booking.assigned_to).filter(Boolean))]
  if (!assignedIds.length) return (bookings ?? []).map((booking) => ({ ...booking, technician: null }))

  const { data: technicians, error: techniciansError } = await supabase
    .from('technicians')
    .select('id, full_name, phone, email')
    .in('id', assignedIds)
  if (techniciansError) throw techniciansError

  const techniciansById = new Map((technicians ?? []).map((technician) => [technician.id, technician]))
  return (bookings ?? []).map((booking) => ({
    ...booking,
    technician: techniciansById.get(booking.assigned_to) ?? null,
  }))
}

export const fetchMyBookings = async () => {
  if (!isSupabaseEnabled) {
    return mockBookings.map((booking) => ({
      ...booking,
      technician: booking.assigned_to ? { full_name: booking.assigned_to } : null,
    }))
  }

  const { data, error } = await supabase.rpc('get_my_service_bookings')
  if (error) throw error
  return data ?? []
}

export const updateBookingRecord = async (bookingId, updates) => {
  if (!isSupabaseEnabled) {
    const booking = mockBookings.find((item) => item.id === bookingId)
    if (!booking) throw new Error(`Booking ${bookingId} was not found.`)

    Object.assign(booking, updates)
    return {
      ...booking,
      technician: booking.technician
        ?? (booking.assigned_to ? { full_name: booking.assigned_to } : null),
    }
  }

  const { data, error } = await supabase
    .from('service_bookings')
    .update(updates)
    .eq('id', bookingId)
    .select('*')
    .single()

  if (error) throw error
  if (!data.assigned_to) return { ...data, technician: null }

  const { data: technician, error: technicianError } = await supabase
    .from('technicians')
    .select('id, full_name, phone, email')
    .eq('id', data.assigned_to)
    .maybeSingle()
  if (technicianError) throw technicianError
  return { ...data, technician }
}

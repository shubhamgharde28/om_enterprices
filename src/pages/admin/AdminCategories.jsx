import { Box, Button, Container, FormControl, FormLabel, Input, Stack, Table, Tbody, Td, Th, Thead, Tr, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaChevronRight, FaFolderOpen, FaPlus } from 'react-icons/fa'
import { addCategory, deleteCategory, setCategories, updateCategory } from '../../redux/slices/categorySlice'
import { createCategory, deleteCategoryRecord, fetchCategories, updateCategoryRecord } from '../../services/supabase'
import '../../styles/admin-categories.css'

function AdminCategories() {
  const categories = useSelector((state) => state.categories.items)
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [activeView, setActiveView] = useState('categories')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const toast = useToast()

  useEffect(() => {
    let active = true
    fetchCategories()
      .then((rows) => {
        if (active) dispatch(setCategories(rows))
      })
      .catch((error) => {
        if (active) setErrorMessage(error.message || 'Unable to load categories.')
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
    setIsSaving(true)
    setErrorMessage('')
    try {
      if (editingId) {
        const savedCategory = await updateCategoryRecord(editingId, { name })
        dispatch(updateCategory(savedCategory))
        toast({ title: 'Category updated', status: 'success', duration: 2500, isClosable: true })
      } else {
        const savedCategory = await createCategory({ name })
        dispatch(addCategory(savedCategory))
        toast({ title: 'Category saved to Supabase', status: 'success', duration: 2500, isClosable: true })
      }
      setName('')
      setEditingId(null)
      setActiveView('categories')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save category.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setName(category.name)
    setErrorMessage('')
    setActiveView('form')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setActiveView('categories')
  }

  const openAddCategoryForm = () => {
    if (activeView !== 'form' || editingId) {
      setEditingId(null)
      setName('')
      setErrorMessage('')
    }
    setActiveView('form')
  }

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) return
    setErrorMessage('')
    try {
      await deleteCategoryRecord(category.id)
      dispatch(deleteCategory(category.id))
      toast({ title: 'Category deleted', status: 'success', duration: 2500, isClosable: true })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete category.')
    }
  }

  return (
    <Container className="admin-categories" maxW="1500px" px={0}>
      <nav className="categories-view-tabs" role="tablist" aria-label="Category management views">
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'categories'}
          className={`categories-view-tab${activeView === 'categories' ? ' is-active' : ''}`}
          onClick={() => setActiveView('categories')}
        >
          <FaFolderOpen />
          <span>Categories</span>
          <span className="categories-view-count">{categories.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'form'}
          className={`categories-view-tab${activeView === 'form' ? ' is-active' : ''}`}
          onClick={openAddCategoryForm}
        >
          <FaPlus />
          <span>Add Category</span>
        </button>
      </nav>

      {activeView === 'form' ? (
        <section className="categories-form-view" role="tabpanel">
          <div className="categories-breadcrumbs">
            <button type="button" onClick={() => setActiveView('categories')}>Categories</button>
            <FaChevronRight aria-hidden="true" />
            <strong>{editingId ? 'Edit Category' : 'Add Category'}</strong>
          </div>
          <header className="categories-heading">
            <h1>{editingId ? 'Edit Category' : 'Add Category'}</h1>
            <p>{editingId ? 'Update category details for your store.' : 'Add a category to keep your products organized.'}</p>
          </header>

          {errorMessage && <Box className="categories-error" role="alert">{errorMessage}</Box>}

          <Box className="categories-form-card">
            <div className="categories-card-heading">
              <FaFolderOpen />
              <h2>Category Information</h2>
            </div>
            <Stack as="form" className="categories-form" spacing={4} onSubmit={handleSubmit}>
              <FormControl isRequired>
                <FormLabel>Category Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Domestic Water Purifiers" required />
              </FormControl>
              <div className="categories-form-actions">
                <Button className="categories-submit-button" type="submit" isLoading={isSaving}>
                  <FaPlus />
                  {editingId ? 'Save Changes' : 'Save Category'}
                </Button>
                {editingId && <Button className="categories-cancel-button" type="button" variant="ghost" onClick={cancelEdit}>Cancel Edit</Button>}
              </div>
            </Stack>
          </Box>
        </section>
      ) : (
        <>
          {errorMessage && <Box className="categories-error" role="alert">{errorMessage}</Box>}
          <Box className="categories-list-card">
            <div className="categories-list-heading">
              <div>
                <h2>Category Details</h2>
                <p>Manage the categories available in your store.</p>
              </div>
              <span>{categories.length} categories</span>
            </div>
            <div className="categories-table-scroll">
              <Table className="categories-table" size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {!isLoading && categories.map((category) => (
                    <Tr key={category.id}>
                      <Td>{category.name}</Td>
                      <Td><span className={`category-status${category.active ? ' is-active' : ''}`}>{category.active ? 'Active' : 'Inactive'}</span></Td>
                      <Td>
                        <div className="categories-row-actions">
                          <Button size="xs" onClick={() => handleEdit(category)}>Edit</Button>
                          <Button size="xs" colorScheme="red" onClick={() => handleDelete(category)}>Delete</Button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                  {isLoading && <Tr><Td colSpan={3}>Loading categories...</Td></Tr>}
                  {!isLoading && categories.length === 0 && <Tr><Td className="categories-empty" colSpan={3}>No categories saved yet.</Td></Tr>}
                </Tbody>
              </Table>
            </div>
          </Box>
        </>
      )}
    </Container>
  )
}

export default AdminCategories

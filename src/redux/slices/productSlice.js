import { createSlice } from '@reduxjs/toolkit'
import { mockProducts } from '../../data/mockData'

const initialState = {
  items: mockProducts,
  selectedProduct: null,
  loading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload
    },
    addProduct: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateProduct: (state, action) => {
      const index = state.items.findIndex((product) => product.id === action.payload.id)
      if (index >= 0) state.items[index] = action.payload
    },
    deleteProduct: (state, action) => {
      state.items = state.items.filter((product) => product.id !== action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setProducts, setSelectedProduct, addProduct, updateProduct, deleteProduct, setLoading, setError } = productSlice.actions
export default productSlice.reducer

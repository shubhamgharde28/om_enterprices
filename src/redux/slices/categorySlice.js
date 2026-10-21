import { createSlice } from '@reduxjs/toolkit'
import { mockCategories } from '../../data/mockData'

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: mockCategories,
    loading: false,
    error: null,
  },
  reducers: {
    setCategories: (state, action) => {
      state.items = action.payload
    },
    addCategory: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateCategory: (state, action) => {
      const index = state.items.findIndex((category) => category.id === action.payload.id)
      if (index >= 0) state.items[index] = action.payload
    },
    deleteCategory: (state, action) => {
      state.items = state.items.filter((category) => category.id !== action.payload)
    },
  },
})

export const { setCategories, addCategory, updateCategory, deleteCategory } = categorySlice.actions
export default categorySlice.reducer

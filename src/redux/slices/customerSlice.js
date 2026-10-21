import { createSlice } from '@reduxjs/toolkit'
import { mockCustomers } from '../../data/mockData'

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    items: mockCustomers,
    loading: false,
    error: null,
  },
  reducers: {
    setCustomers: (state, action) => {
      state.items = action.payload
    },
    addCustomer: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateCustomer: (state, action) => {
      const index = state.items.findIndex((customer) => customer.id === action.payload.id)
      if (index >= 0) state.items[index] = action.payload
    },
  },
})

export const { setCustomers, addCustomer, updateCustomer } = customerSlice.actions
export default customerSlice.reducer

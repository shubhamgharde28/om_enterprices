import { createSlice } from '@reduxjs/toolkit'
import { mockServices } from '../../data/mockData'

const initialState = {
  items: mockServices,
  loading: false,
  error: null,
}

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action) => {
      state.items = action.payload
    },
    addService: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateService: (state, action) => {
      const index = state.items.findIndex((service) => service.id === action.payload.id)
      if (index >= 0) state.items[index] = action.payload
    },
    deleteService: (state, action) => {
      state.items = state.items.filter((service) => service.id !== action.payload)
    },
  },
})

export const { setServices, addService, updateService, deleteService } = serviceSlice.actions
export default serviceSlice.reducer

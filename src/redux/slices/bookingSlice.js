import { createSlice } from '@reduxjs/toolkit'
import { mockBookings } from '../../data/mockData'

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    items: mockBookings,
    loading: false,
    error: null,
  },
  reducers: {
    setBookings: (state, action) => {
      state.items = action.payload
    },
    addBooking: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateBooking: (state, action) => {
      const index = state.items.findIndex((booking) => booking.id === action.payload.id)
      if (index >= 0) state.items[index] = action.payload
    },
    deleteBooking: (state, action) => {
      state.items = state.items.filter((booking) => booking.id !== action.payload)
    },
  },
})

export const { setBookings, addBooking, updateBooking, deleteBooking } = bookingSlice.actions
export default bookingSlice.reducer

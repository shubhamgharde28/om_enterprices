import { createSlice } from '@reduxjs/toolkit'
import { mockTestimonials, mockWebsiteContent } from '../../data/mockData'

const initialState = {
  toast: null,
  sidebarOpen: false,
  websiteContent: mockWebsiteContent,
  testimonials: mockTestimonials,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setToast: (state, action) => {
      state.toast = action.payload
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    setWebsiteContent: (state, action) => {
      state.websiteContent = action.payload
    },
    setTestimonials: (state, action) => {
      state.testimonials = action.payload
    },
  },
})

export const { setToast, setSidebarOpen, setWebsiteContent, setTestimonials } = uiSlice.actions
export default uiSlice.reducer

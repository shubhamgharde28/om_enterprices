import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productReducer from './slices/productSlice'
import categoryReducer from './slices/categorySlice'
import serviceReducer from './slices/serviceSlice'
import bookingReducer from './slices/bookingSlice'
import customerReducer from './slices/customerSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    services: serviceReducer,
    bookings: bookingReducer,
    customers: customerReducer,
    ui: uiReducer,
  },
})

export default store

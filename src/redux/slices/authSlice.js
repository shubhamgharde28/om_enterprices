import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  isAuthenticated: false,
  isAdminAuthenticated: false,
  isLoading: true,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isAdminAuthenticated = ['admin', 'staff'].includes(action.payload?.role)
      state.isLoading = false
      state.error = null
    },
    loginAdmin: (state, action) => {
      state.user = action.payload
      state.isAdminAuthenticated = true
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },
    setAuthenticatedUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = Boolean(action.payload)
      state.isAdminAuthenticated = ['admin', 'staff'].includes(action.payload?.role)
      state.isLoading = false
      state.error = null
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setAuthError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isAdminAuthenticated = false
      state.isLoading = false
      state.error = null
    },
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const {
  loginUser,
  loginAdmin,
  setAuthenticatedUser,
  setAuthLoading,
  setAuthError,
  logout,
  updateProfile,
} = authSlice.actions
export default authSlice.reducer

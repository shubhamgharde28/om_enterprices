import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setAuthError, setAuthenticatedUser } from '../../redux/slices/authSlice'
import { getCurrentUser } from '../../services/authService'
import { supabase } from '../../services/supabase'

function AuthInitializer({ children }) {
  const dispatch = useDispatch()

  useEffect(() => {
    let active = true
    const hydrateUser = async () => {
      try {
        const user = await getCurrentUser()
        if (active) dispatch(setAuthenticatedUser(user))
      } catch (error) {
        if (active) dispatch(setAuthError(error.message || 'Unable to restore your sign-in session.'))
      }
    }

    if (!supabase) {
      dispatch(setAuthenticatedUser(null))
      return undefined
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        queueMicrotask(hydrateUser)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [dispatch])

  return children
}

export default AuthInitializer

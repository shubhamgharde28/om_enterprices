import { supabase } from './supabase'

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings.')
  }
}

const getCustomerProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email, phone, address, city, pincode, role')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export const updateCustomerProfile = async (userId, profile) => {
  requireSupabase()

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: profile.fullName.trim(),
      phone: profile.phone.trim(),
      address: profile.address.trim(),
      city: profile.city.trim(),
      pincode: profile.pincode.trim(),
    })
    .eq('id', userId)
    .select('full_name, email, phone, address, city, pincode, role')
    .single()

  if (error) throw error
  return {
    id: userId,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    address: data.address,
    city: data.city,
    pincode: data.pincode,
    role: data.role,
  }
}

const ensureCustomerProfile = async (authUser, fullName = '', phone = '') => {
  const profile = {
    id: authUser.id,
    full_name: authUser.user_metadata?.full_name || fullName,
    email: authUser.email || '',
    phone: authUser.user_metadata?.phone || phone,
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select('full_name, email, phone, role')
    .single()

  if (error) {
    throw new Error(`Your authentication succeeded, but your profile could not be saved: ${error.message}`)
  }
  return data
}

export const getCurrentUser = async () => {
  requireSupabase()

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!data.session?.user) return null

  const authUser = data.session.user
  const profile = await getCustomerProfile(authUser.id)
  return {
    id: authUser.id,
    email: profile?.email || authUser.email,
    fullName: profile?.full_name || authUser.user_metadata?.full_name || authUser.email,
    phone: profile?.phone || authUser.user_metadata?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    pincode: profile?.pincode || '',
    role: profile?.role || 'customer',
  }
}

export const signUpCustomer = async ({ fullName, email, phone, password }) => {
  requireSupabase()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
    },
  })

  if (error) throw error
  if (!data.user) throw new Error('Supabase did not return the created account.')

  if (data.session) {
    await ensureCustomerProfile(data.user, fullName, phone)
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name || fullName,
      phone: data.user.user_metadata?.phone || phone,
      role: 'customer',
    },
    needsEmailConfirmation: !data.session,
  }
}

export const signInCustomer = async (email, password) => {
  requireSupabase()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data.user) throw new Error('Supabase did not return the signed-in user.')

  const profile = await ensureCustomerProfile(data.user, data.user.user_metadata?.full_name, data.user.user_metadata?.phone)
  return {
    id: data.user.id,
    email: data.user.email,
    fullName: profile?.full_name || data.user.user_metadata?.full_name || data.user.email,
    phone: profile?.phone || data.user.user_metadata?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    pincode: profile?.pincode || '',
    role: profile?.role || 'customer',
  }
}

export const resendSignupConfirmation = async (email) => {
  requireSupabase()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })

  if (error) throw error
}

const getAdminProfile = async (userId) => {
  requireSupabase()

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data || !['admin', 'staff'].includes(data.role)) {
    throw new Error('This account does not have admin access.')
  }

  return data
}

export const signInAdmin = async (email, password) => {
  requireSupabase()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  try {
    const profile = await getAdminProfile(data.user.id)
    return {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name || data.user.email,
      phone: data.user.user_metadata?.phone || '',
      role: profile.role,
    }
  } catch (error) {
    await supabase.auth.signOut()
    throw error
  }
}

export const getCurrentAdmin = async () => {
  requireSupabase()

  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!data.session?.user) return null

  try {
    const profile = await getAdminProfile(data.session.user.id)
    return {
      id: data.session.user.id,
      email: data.session.user.email,
      fullName: data.session.user.user_metadata?.full_name || data.session.user.email,
      role: profile.role,
    }
  } catch (error) {
    await supabase.auth.signOut()
    throw error
  }
}

export const signOut = async () => {
  if (!supabase) return

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

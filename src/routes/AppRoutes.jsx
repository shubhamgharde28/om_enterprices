import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { lazy, Suspense, useLayoutEffect } from 'react'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import WebsiteEntry from '../pages/public/WebsiteEntry'
import WebsiteChooser from '../pages/public/WebsiteChooser'
import Products from '../pages/public/Products'
import ProductDetails from '../pages/public/ProductDetails'
import Services from '../pages/public/Services'
import About from '../pages/public/About'
import Contact from '../pages/public/Contact'
import Login from '../pages/public/Login'
import Signup from '../pages/public/Signup'
import ForgotPassword from '../pages/public/ForgotPassword'
import ResetPassword from '../pages/public/ResetPassword'
import Profile from '../pages/public/Profile'
import BookService from '../pages/public/BookService'
import MyBookings from '../pages/public/MyBookings'
import BookingDetails from '../pages/public/BookingDetails'
import AdminLogin from '../pages/admin/AdminLogin'
import Dashboard from '../pages/admin/Dashboard'
import AdminProducts from '../pages/admin/AdminProducts'
import AdminCategories from '../pages/admin/AdminCategories'
import AdminServices from '../pages/admin/AdminServices'
import AdminTechnicians from '../pages/admin/AdminTechnicians'
import AdminBookings from '../pages/admin/AdminBookings'
import AdminCustomers from '../pages/admin/AdminCustomers'
import AdminTestimonials from '../pages/admin/AdminTestimonials'
import AdminSettings from '../pages/admin/AdminSettings'
import AdminContactMessages from '../pages/admin/AdminContactMessages'
import AdminSolarContactMessages from '../pages/admin/AdminSolarContactMessages'
import AdminSolarRequests from '../pages/admin/AdminSolarRequests'
import AdminProductEnquiries from '../pages/admin/AdminProductEnquiries'
const SolarLayout = lazy(() => import('../layouts/SolarLayout'))
const SolarHome = lazy(() => import('../pages/solar/SolarHome'))
const SolarServicesPage = lazy(() => import('../pages/solar/SolarServicesPage'))
const SolarContentPage = lazy(() => import('../pages/solar/SolarContentPage'))
const SolarAboutPage = lazy(() => import('../pages/solar/SolarAboutPage'))
const SolarFaqPage = lazy(() => import('../pages/solar/SolarFaqPage'))
const SolarRequestPage = lazy(() => import('../pages/solar/SolarRequestPage'))
const SolarContactPage = lazy(() => import('../pages/solar/SolarContactPage'))

function AppRoutes() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<WebsiteEntry />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/book-service" element={<BookService />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
        </Route>
      </Route>

      <Route path="/choose" element={<WebsiteChooser />} />

      <Route
        path="/solar"
        element={(
          <Suspense fallback={<LoadingSpinner label="Loading solar services..." />}>
            <SolarLayout />
          </Suspense>
        )}
      >
        <Route index element={<SolarHome />} />
        <Route path="services" element={<SolarServicesPage />} />
        <Route path="services/:serviceSlug" element={<SolarContentPage />} />
        <Route path="about" element={<SolarAboutPage />} />
        <Route path="faqs" element={<SolarFaqPage />} />
        <Route path="contact" element={<SolarContactPage />} />
        <Route path="request/:requestType" element={<SolarRequestPage />} />
        <Route path="consultation" element={<SolarRequestPage initialType="consultation" />} />
        <Route path="installation-quote" element={<SolarRequestPage initialType="installation" />} />
        <Route path="servicing" element={<SolarRequestPage initialType="servicing" />} />
        <Route path="inspection" element={<SolarRequestPage initialType="inspection" />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/spare-parts" element={<AdminProducts initialProductType="Spare Parts" />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/technicians" element={<AdminTechnicians />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/product-enquiries" element={<AdminProductEnquiries />} />
          <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
          <Route path="/admin/solar-contact-messages" element={<AdminSolarContactMessages />} />
          <Route path="/admin/solar-requests" element={<AdminSolarRequests />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes

import { Navigate } from 'react-router-dom'

/**
 * Wraps any route that requires the user to be logged in.
 * If no JWT is found in localStorage, redirects to /signin.
 *
 * Usage in App.jsx:
 *   <Route path="/ecosystem/:type" element={
 *     <ProtectedRoute><Layout><EcosystemBuilder /></Layout></ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/signin" replace />
  return children
}

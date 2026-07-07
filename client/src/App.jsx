import { useState, useEffect } from 'react'
import { Router, Route } from 'wouter'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import Home from './pages/Home'
import './App.css'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) return <div>Loading...</div>

  return (
    <Router>
      <Route path="/">
        {() => <Home />}
      </Route>
      
      <Route path="/admin">
        {() => isAuthenticated ? (
          <AdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      <Route path="/login">
        {() => isAuthenticated ? (
          <AdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>
    </Router>
  )
}

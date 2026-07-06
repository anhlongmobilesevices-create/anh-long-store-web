import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminDashboard({ user, onLogout }) {
  const [portfolio, setPortfolio] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', category: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('/api/portfolio')
      setPortfolio(response.data)
    } catch (err) {
      console.error('Error fetching portfolio:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (item) => {
    setSelectedItem(item)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || ''
    })
  }

  const handleSave = async () => {
    if (!selectedItem) return
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/portfolio/${selectedItem.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPortfolio()
      setSelectedItem(null)
      alert('Updated successfully')
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleDelete = async () => {
    if (!selectedItem || !window.confirm('Delete this item?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/portfolio/${selectedItem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPortfolio()
      setSelectedItem(null)
      alert('Deleted successfully')
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Admin Dashboard</h1>
        <button onClick={onLogout}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>Portfolio Items ({portfolio.length})</h2>
          <div style={{ maxHeight: '600px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
            {portfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                style={{
                  padding: '10px',
                  marginBottom: '5px',
                  cursor: 'pointer',
                  background: selectedItem?.id === item.id ? '#e0e0e0' : '#f5f5f5'
                }}
              >
                <strong>{item.title || 'Untitled'}</strong>
                <p style={{ fontSize: '12px', color: '#666' }}>{item.category}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2>Edit Item</h2>
          {selectedItem ? (
            <div>
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                />
              </div>
              <div>
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '5px', marginBottom: '10px', height: '100px' }}
                />
              </div>
              <div>
                <label>Category:</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSave} style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white' }}>
                  Save
                </button>
                <button onClick={handleDelete} style={{ flex: 1, padding: '10px', background: '#f44336', color: 'white' }}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <p>Select an item to edit</p>
          )}
        </div>
      </div>
    </div>
  )
}

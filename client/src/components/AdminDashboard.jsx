import { useState, useEffect } from 'react'
import axios from 'axios'
import { exportToCSV } from '../utils/exportCSV'
import './AdminDashboard.css'

export default function AdminDashboard({ user, onLogout }) {
  const [portfolio, setPortfolio] = useState([])
  const [filteredPortfolio, setFilteredPortfolio] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', category: '', image_url: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormData, setCreateFormData] = useState({ title: '', description: '', category: '', image_url: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [stats, setStats] = useState({ total: 0, categories: {} })
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const categories = [
    'All',
    'Thay Màn Hình iPhone',
    'Sửa Chữa iPad',
    'Sửa Chữa MacBook',
    'Sửa Chữa Điện Thoại Android',
    'Thay Pin Điện Thoại',
    'Sửa Cổng Sạc',
    'Sửa Chữa Nước'
  ]

  useEffect(() => {
    fetchPortfolio()
  }, [])

  useEffect(() => {
    filterPortfolio()
  }, [portfolio, searchTerm, selectedCategory])

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/portfolio')
      setPortfolio(response.data)
      calculateStats(response.data)
      setSelectedItems(new Set())
      setSelectAll(false)
    } catch (err) {
      console.error('Error fetching portfolio:', err)
      alert('Error loading portfolio')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const stats = { total: data.length, categories: {} }
    data.forEach(item => {
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1
    })
    setStats(stats)
  }

  const filterPortfolio = () => {
    let filtered = portfolio

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPortfolio(filtered)
    setCurrentPage(1)
  }

  const handleSelect = (item) => {
    setSelectedItem(item)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      image_url: item.image_url || ''
    })
  }

  const toggleItemSelection = (id) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set())
      setSelectAll(false)
    } else {
      const allIds = new Set(paginatedItems.map(item => item.id))
      setSelectedItems(allIds)
      setSelectAll(true)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      alert('Please select items to delete')
      return
    }

    if (!window.confirm(`Delete ${selectedItems.size} items?`)) return

    try {
      const token = localStorage.getItem('token')
      for (const id of selectedItems) {
        await axios.delete(`/api/portfolio/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      fetchPortfolio()
      alert(`Deleted ${selectedItems.size} items successfully`)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleCreate = async () => {
    if (!createFormData.title || !createFormData.category) {
      alert('Please fill in title and category')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/portfolio', createFormData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPortfolio()
      setCreateFormData({ title: '', description: '', category: '', image_url: '' })
      setShowCreateForm(false)
      alert('Portfolio item created successfully')
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    }
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

  const handleExportCSV = () => {
    exportToCSV(filteredPortfolio, `portfolio-${new Date().toISOString().split('T')[0]}.csv`)
  }

  // Pagination
  const totalPages = Math.ceil(filteredPortfolio.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedItems = filteredPortfolio.slice(startIdx, startIdx + itemsPerPage)

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🛠️ Admin Dashboard</h1>
        <div className="header-actions">
          <button className="export-btn" onClick={handleExportCSV}>📥 Export CSV</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Items</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        {Object.entries(stats.categories).slice(0, 3).map(([cat, count]) => (
          <div key={cat} className="stat-card">
            <h3>{cat.split(' ')[0]}</h3>
            <p className="stat-value">{count}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="create-form-container">
          <h2>Create New Portfolio Item</h2>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={createFormData.title}
              onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
              placeholder="Enter title"
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              placeholder="Enter description"
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select
              value={createFormData.category}
              onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="url"
              value={createFormData.image_url}
              onChange={(e) => setCreateFormData({ ...createFormData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleCreate}>Create</button>
            <button className="btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Panel - List */}
        <div className="list-panel">
          <div className="list-header">
            <h2>Portfolio Items ({filteredPortfolio.length})</h2>
            <div className="header-buttons">
              <button className="btn-create" onClick={() => setShowCreateForm(true)}>+ Add New</button>
              {selectedItems.size > 0 && (
                <button className="btn-bulk-delete" onClick={handleBulkDelete}>
                  🗑️ Delete ({selectedItems.size})
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Category Filter */}
          <div className="filter-container">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Select All */}
          <div className="select-all-container">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={toggleSelectAll}
              id="selectAll"
            />
            <label htmlFor="selectAll">Select All on this page</label>
          </div>

          {/* Items List */}
          <div className="items-list">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className={`item-card ${selectedItem?.id === item.id ? 'active' : ''} ${selectedItems.has(item.id) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="item-content" onClick={() => handleSelect(item)}>
                  <div className="item-title">{item.title}</div>
                  <div className="item-category">{item.category}</div>
                  <div className="item-preview">{item.description?.substring(0, 50)}...</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Edit */}
        <div className="edit-panel">
          <h2>Edit Item</h2>
          {selectedItem ? (
            <div>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="6"
                />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {formData.image_url && (
                <div className="image-preview">
                  <img src={formData.image_url} alt="Preview" />
                </div>
              )}
              <div className="form-actions">
                <button className="btn-save" onClick={handleSave}>💾 Save</button>
                <button className="btn-delete" onClick={handleDelete}>🗑️ Delete</button>
              </div>
            </div>
          ) : (
            <p className="no-selection">Select an item to edit</p>
          )}
        </div>
      </div>
    </div>
  )
}

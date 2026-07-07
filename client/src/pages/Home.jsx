import { useState } from 'react'
import { Link } from 'wouter'
import '../styles/Home.css'

export default function Home() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleContactSubmit = (e) => {
    e.preventDefault()
    alert(`Thank you! We'll contact you at ${email}`)
    setEmail('')
    setMessage('')
  }

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">🛠️ Anh Long Mobile</div>
          <nav className="nav">
            <a href="#services">Services</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#contact">Contact</a>
            <Link href="/admin" className="admin-link">Admin</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>Professional Phone Repair Services</h1>
          <p>Expert repairs for iPhone, iPad, MacBook, and Android devices</p>
          <button className="cta-btn">Get Started</button>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📱</div>
              <h3>Screen Replacement</h3>
              <p>Fast and reliable screen replacement for all devices</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🔋</div>
              <h3>Battery Replacement</h3>
              <p>Genuine batteries with warranty</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💧</div>
              <h3>Water Damage Repair</h3>
              <p>Professional water damage restoration</p>
            </div>
            <div className="service-card">
              <div className="service-icon">⚙️</div>
              <h3>Component Repair</h3>
              <p>Charging port, speaker, microphone repairs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section id="portfolio" className="portfolio-preview">
        <div className="container">
          <h2>Recent Projects</h2>
          <p>Check out our latest repair work</p>
          <button className="view-portfolio-btn">View Full Portfolio</button>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Get in Touch</h2>
          <form onSubmit={handleContactSubmit} className="contact-form">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <textarea
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              required
            />
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Anh Long Mobile. All rights reserved.</p>
          <div className="footer-links">
            <a href="#admin">Admin Login</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

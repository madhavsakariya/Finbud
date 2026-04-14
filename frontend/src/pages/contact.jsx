import { useState, useEffect } from 'react'
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Phone, Clock, MapPin } from 'lucide-react'
import './contact.css'

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function Contact() {
  useScrollReveal()

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (status.message) setStatus({ type: '', message: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all required fields.' })
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setStatus({ type: 'success', message: "Thank you! Your message has been sent. We'll get back to you within 24 hours." })
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const infoItems = [
    { icon: <Mail size={20} />, title: 'Email Us', detail: 'support@finbudai.com', sub: 'We reply within 24 hours' },
    { icon: <Clock size={20} />, title: 'Live Chat', detail: '9 AM – 6 PM IST', sub: 'Monday to Saturday' },
    { icon: <MapPin size={20} />, title: 'Follow Us', detail: '@finbudai', sub: 'On all social platforms' },
  ]

  const reasons = [
    '💡 Get expert financial advice',
    '🤝 Partnership opportunities',
    '🐛 Report bugs or issues',
    '✨ Feature requests',
    '❓ General inquiries',
  ]

  return (
    <div className="contact-page">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="contact-hero">
        <div className="contact-hero-grain" />
        <div className="contact-hero-content">
          <div className="contact-eyebrow">Get In Touch</div>
          <h1>We'd Love to<br /><span className="contact-title-accent">Hear From You</span></h1>
          <p>Have questions about FinBud AI? We're here to help. Reach out and our team will get back to you quickly.</p>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <section className="contact-main">
        <div className="contact-inner">

          {/* Info sidebar */}
          <div className="contact-info reveal-left">
            <h2>Contact Information</h2>
            <p className="contact-info-desc">Fill out the form and we'll get back to you within 24 hours.</p>

            <div className="contact-info-items">
              {infoItems.map((item, i) => (
                <div key={i} className="contact-info-item">
                  <div className="contact-info-icon">{item.icon}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p className="info-detail">{item.detail}</p>
                    <p className="info-sub">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-reasons">
              <h3>Why Contact Us?</h3>
              <ul>
                {reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-wrap reveal-right">
            <div className="contact-form-card">
              <h2>Send a Message</h2>
              <p className="form-subtitle">We typically respond within one business day.</p>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name <span className="req">*</span></label>
                    <div className="input-wrap">
                      <User className="input-ico" size={17} />
                      <input type="text" name="name" value={formData.name} onChange={handleChange}
                        placeholder="Your name" disabled={isSubmitting} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address <span className="req">*</span></label>
                    <div className="input-wrap">
                      <Mail className="input-ico" size={17} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="you@example.com" disabled={isSubmitting} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <div className="input-wrap">
                    <MessageSquare className="input-ico" size={17} />
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange}
                      placeholder="How can we help?" disabled={isSubmitting} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Message <span className="req">*</span></label>
                  <textarea name="message" value={formData.message} onChange={handleChange}
                    placeholder="Tell us more about your inquiry..." rows="5" disabled={isSubmitting} />
                </div>

                {status.message && (
                  <div className={`form-status ${status.type}`}>
                    {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span>{status.message}</span>
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><span className="spinner" />Sending...</>
                  ) : (
                    <><Send size={18} />Send Message</>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}

export default Contact
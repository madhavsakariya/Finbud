import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, Sparkles, TrendingUp, DollarSign, Lightbulb } from 'lucide-react'
import '../app.css'

const API_URL = 'http://localhost:5000/api'

function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    axios.get(`${API_URL}/suggestions`)
      .then(res => setSuggestions(res.data.suggestions))
      .catch(err => console.error(err))
    
    setMessages([{
      type: 'ai',
      text: "👋 Hi! I'm your Finance AI assistant. Ask me anything about personal finance, investing, retirement planning, or money management!",
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text = input) => {
    if (!text.trim()) return

    const userMessage = {
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        question: text.trim()
      })

      const aiMessage = {
        type: 'ai',
        text: response.data.answer,
        timestamp: new Date(),
        responseTime: response.data.response_time
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = {
        type: 'error',
        text: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <>
    {/*
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <DollarSign className="logo-icon" />
            <h1>FinBud AI</h1>
          </div>
          <div className="tagline">
            <Sparkles size={16} />
            <span>Your Personal Finance Assistant</span>
          </div>
        </div>
      </header>*/}

      <div className="main-content">
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                {msg.type === 'ai' && (
                  <div className="avatar ai-avatar">
                    <TrendingUp size={20} />
                  </div>
                )}
                <div className="message-content">
                  <p>{msg.text}</p>
                  {msg.responseTime && (
                    <span className="response-time">{msg.responseTime}s</span>
                  )}
                </div>
                {msg.type === 'user' && (
                  <div className="avatar user-avatar">You</div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="message ai">
                <div className="avatar ai-avatar">
                  <TrendingUp size={20} />
                </div>
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form className="input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about investing, saving, retirement..."
              disabled={isLoading}
              className="input-field"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="send-btn"
            >
              <Send size={20} />
            </button>
          </form>
        </div>

        <aside className="sidebar">
          <div className="sidebar-header">
            <Lightbulb size={20} />
            <h3>Suggested Questions</h3>
          </div>
          <div className="sidebar-content">
            <p className="sidebar-description">
              Click any question to get started:
            </p>
            <div className="sidebar-suggestions">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="sidebar-suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  <span className="suggestion-number">{idx + 1}</span>
                  <span className="suggestion-text">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

export default Chat
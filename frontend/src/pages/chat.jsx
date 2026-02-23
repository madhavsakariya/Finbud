import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, TrendingUp, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react'
import '../app.css'

const API_URL = 'http://localhost:5000/api'

function Chat() {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('chat_messages')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)

  const userId = JSON.parse(localStorage.getItem('user'))?.id || 'anonymous'

  // Load suggestions + show welcome message if no history
  useEffect(() => {
    axios.get(`${API_URL}/suggestions`)
      .then(res => setSuggestions(res.data.suggestions))
      .catch(err => console.error(err))

    const existingMessages = sessionStorage.getItem('chat_messages')
    if (!existingMessages || JSON.parse(existingMessages).length === 0) {
      setMessages([{
        type: 'ai',
        text: "👋 Hi! I'm FinBud, your Indian Finance AI assistant. Ask me anything about personal finance, investing, taxes, or money management!",
        timestamp: new Date()
      }])
    }
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ✅ Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('chat_messages', JSON.stringify(messages))
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
        question: text.trim(),
        user_id: userId
      })

      const aiMessage = {
        type: 'ai',
        text: response.data.answer,
        timestamp: new Date(),
        responseTime: response.data.response_time,
        chatId: response.data.chat_id,
        question: text.trim(),
        feedback: null
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

  const sendFeedback = async (msgIdx, rating) => {
    const msg = messages[msgIdx]

    setMessages(prev => prev.map((m, i) =>
      i === msgIdx ? { ...m, feedback: rating } : m
    ))

    try {
      await axios.post(`${API_URL}/feedback`, {
        chat_id: msg.chatId,
        user_id: userId,
        question: msg.question,
        answer: msg.text,
        rating: rating
      })
    } catch (error) {
      console.error('Feedback failed:', error)
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

                  {/* Feedback buttons — only on AI messages with a chatId */}
                  {msg.type === 'ai' && msg.chatId && (
                    <div className="feedback-row">
                      <span className="feedback-label" style={{ display: 'block', width: '100%' }}>
                        Please provide feedback for us to improve
                      </span>
                      <span className="feedback-label">Was this helpful?</span>
                      <button
                        className={`feedback-btn ${msg.feedback === 1 ? 'active-up' : ''}`}
                        onClick={() => sendFeedback(idx, 1)}
                        disabled={msg.feedback !== null}
                        title="Helpful"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        className={`feedback-btn ${msg.feedback === 0 ? 'active-down' : ''}`}
                        onClick={() => sendFeedback(idx, 0)}
                        disabled={msg.feedback !== null}
                        title="Not helpful"
                      >
                        <ThumbsDown size={14} />
                      </button>
                      {msg.feedback !== null && (
                        <span className="feedback-thanks">Thanks for your feedback!</span>
                      )}
                    </div>
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
              placeholder="Ask about investing, taxes, retirement..."
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
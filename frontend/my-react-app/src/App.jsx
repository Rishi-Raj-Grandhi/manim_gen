import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState('')
  const [systemStatus, setSystemStatus] = useState(null)

  const API_BASE_URL = 'http://localhost:8000'

  useEffect(() => {
    fetchVideos()
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/status`)
      setSystemStatus(response.data)
    } catch (err) {
      console.error('Error checking system status:', err)
      setSystemStatus({ status: 'error', message: 'Cannot connect to backend' })
    }
  }

  const fetchVideos = async () => {
    try {
      setLoading(true)
      // Add cache-busting parameter to ensure fresh data
      const timestamp = Date.now()
      const response = await axios.get(`${API_BASE_URL}/api/videos?t=${timestamp}`)
      setVideos(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching videos:', err)
      setError('Failed to fetch videos. Make sure the FastAPI backend server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSelect = (video) => {
    setSelectedVideo(video)
    setIsPlaying(false)
  }

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt for video generation')
      return
    }

    try {
      setGenerating(true)
      setGenerationStatus('🎬 Generating video from your prompt...')
      
      // Call the backend to generate video
      const response = await axios.post(`${API_BASE_URL}/api/generate`, {
        prompt: prompt.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const generatedFilename = response.data.generated_filename
      setGenerationStatus(`✅ Video generated successfully! Code length: ${response.data.code_length} characters. Refreshing...`)
      
      // Wait a moment then refresh the video list and select the new video
      setTimeout(async () => {
        await fetchVideos()
        
        // Find and select the newly generated video
        const newVideo = videos.find(video => video.name === generatedFilename)
        if (newVideo) {
          setSelectedVideo(newVideo)
          setGenerationStatus(`🎬 New video "${generatedFilename}" is now playing!`)
        } else {
          setGenerationStatus('✅ Video generated! Check the recent videos list.')
        }
        
        setPrompt('')
        
        // Clear status after 5 seconds
        setTimeout(() => {
          setGenerationStatus('')
        }, 5000)
      }, 2000)

    } catch (err) {
      console.error('Error generating video:', err)
      setGenerationStatus('❌ Error generating video. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading videos...</h2>
          <p>Make sure your backend server is running on port 8000</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchVideos} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Manim Video Generator</h1>
        <p>Generate 2D Animation Videos with AI</p>
      </header>

      <div className="app-content">
        {/* Left Side - Prompt Input */}
        <div className="prompt-section">
          <div className="prompt-card">
            <h2>🎨 Generate New Video</h2>
            <p className="prompt-description">
              Describe the animation you want to create. Be specific about colors, shapes, movements, and effects.
            </p>
            
            <div className="prompt-input-container">
              {systemStatus && (
                <div className={`system-status ${systemStatus.status}`}>
                  <span>{systemStatus.status === 'ready' ? '✅' : '❌'} {systemStatus.message}</span>
                </div>
              )}
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Create a red circle that grows from small to large, then rotates 360 degrees with a blue background..."
                className="prompt-textarea"
                rows={6}
                disabled={generating || systemStatus?.status !== 'ready'}
              />
              
              <div className="prompt-examples">
                <h4>💡 Example Prompts:</h4>
                <ul>
                  <li>"A green square that bounces up and down"</li>
                  <li>"A purple triangle that morphs into a circle"</li>
                  <li>"Multiple colored dots that move in a spiral pattern"</li>
                  <li>"A text animation that fades in and out"</li>
                </ul>
              </div>
              
              <button 
                onClick={handleGenerateVideo}
                disabled={generating || !prompt.trim() || systemStatus?.status !== 'ready'}
                className="generate-btn"
              >
                {generating ? '🎬 Generating...' : '🚀 Generate Video'}
              </button>
              
              {generationStatus && (
                <div className="generation-status">
                  {generationStatus}
                </div>
              )}
            </div>
          </div>

          <div className="recent-videos">
            <h3>📹 Recent Videos ({videos.length})</h3>
            {videos.length === 0 ? (
              <div className="no-videos">
                <p>No videos yet. Generate your first video!</p>
              </div>
            ) : (
              <div className="video-list-compact">
                {videos.slice(0, 5).map((video, index) => (
                  <div
                    key={index}
                    className={`video-item-compact ${selectedVideo?.name === video.name ? 'selected' : ''}`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="video-thumbnail-compact">
                                          <video
                      src={`${API_BASE_URL}${video.url}?t=${Date.now()}`}
                      muted
                      onLoadedMetadata={(e) => {
                        const canvas = document.createElement('canvas')
                        canvas.width = e.target.videoWidth
                        canvas.height = e.target.videoHeight
                        const ctx = canvas.getContext('2d')
                        ctx.drawImage(e.target, 0, 0)
                        e.target.style.display = 'none'
                      }}
                    />
                      <div className="play-overlay-compact">▶</div>
                    </div>
                    <div className="video-info-compact">
                      <h4>{video.name}</h4>
                      <p>{formatFileSize(video.size || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Video Player */}
        <div className="video-section">
          {selectedVideo ? (
            <div className="video-player">
              <h2>🎬 Now Playing: {selectedVideo.name}</h2>
              <div className="video-container">
                <video
                  controls
                  autoPlay={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="main-video"
                  key={`${selectedVideo.name}-${Date.now()}`}
                >
                  <source src={`${API_BASE_URL}${selectedVideo.url}?t=${Date.now()}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="video-details">
                <p><strong>File:</strong> {selectedVideo.name}</p>
                <p><strong>Size:</strong> {formatFileSize(selectedVideo.size || 0)}</p>
                <p><strong>Created:</strong> {formatDate(selectedVideo.created)}</p>
                <p><strong>URL:</strong> <code>{API_BASE_URL}{selectedVideo.url}</code></p>
              </div>
            </div>
          ) : (
            <div className="no-video-selected">
              <div className="welcome-message">
                <h2>🎬 Welcome to Manim Video Generator</h2>
                <p>Generate amazing 2D animations using AI-powered prompts!</p>
                <div className="features">
                  <div className="feature">
                    <span>🎨</span>
                    <p>Create custom animations</p>
                  </div>
                  <div className="feature">
                    <span>🤖</span>
                    <p>AI-powered generation</p>
                  </div>
                  <div className="feature">
                    <span>⚡</span>
                    <p>Fast rendering</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="app-footer">
        <p>Powered by Manim + LangGraph + OpenAI</p>
        <button onClick={fetchVideos} className="refresh-btn">
          🔄 Refresh Videos
        </button>
      </footer>
    </div>
  )
}

export default App

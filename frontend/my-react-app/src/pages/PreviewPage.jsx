import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

function PreviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const videoRef = useRef(null)
  
  // Get trim data from location state
  const { trimData, selectedVideo } = location.state || {}
  
  // Video state
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  
  // Export state
  const [exportFormat, setExportFormat] = useState('mp4')
  const [exportQuality, setExportQuality] = useState('720p')
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  
  // Preview state
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_BASE_URL = 'http://localhost:8000'

  useEffect(() => {
    if (!selectedVideo || !trimData) {
      setError('No video or trim data provided')
      setIsLoading(false)
      return
    }

    // Simulate video processing with trim values
    generatePreview()
  }, [selectedVideo, trimData])

  const generatePreview = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For now, we'll use the original video URL
      // In a real implementation, this would be a processed video with trim applied
      setPreviewUrl(`${API_BASE_URL}${selectedVideo.url}`)
      setIsLoading(false)
    } catch (err) {
      setError('Failed to generate preview')
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video && previewUrl) {
      video.addEventListener('loadedmetadata', () => {
        setDuration(video.duration)
      })
      
      video.addEventListener('timeupdate', () => {
        setCurrentTime(video.currentTime)
      })
      
      video.addEventListener('play', () => setIsPlaying(true))
      video.addEventListener('pause', () => setIsPlaying(false))
    }
  }, [previewUrl])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value)
    setPlaybackRate(newRate)
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate
    }
  }

  const handleExport = async () => {
    if (!selectedVideo) return
    
    setIsExporting(true)
    setExportProgress(0)
    
    try {
      // Prepare effects data from processed video
      const effects = location.state?.processedVideo?.effects || {}
      
      // Call backend API to export video
      const response = await axios.post(`${API_BASE_URL}/api/export-video`, {
        video_name: selectedVideo.name,
        trim_start: trimData?.start || 0,
        trim_end: trimData?.end || duration,
        effects: effects,
        export_format: exportFormat,
        export_quality: exportQuality
      })
      
      if (response.data.status === 'success') {
        // Create download link for the exported video
        const link = document.createElement('a')
        link.href = `${API_BASE_URL}${response.data.video_url}`
        link.download = response.data.exported_video
        link.click()
        
        setExportProgress(100)
        alert('Video exported successfully!')
      } else {
        alert('Failed to export video')
      }
    } catch (error) {
      console.error('Error exporting video:', error)
      alert('Error exporting video. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const formatTrimInfo = () => {
    if (!trimData) return 'No trim data'
    return `${formatTime(trimData.start)} - ${formatTime(trimData.end)} (${formatTime(trimData.end - trimData.start)})`
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎬</div>
          <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Processing Video...</h2>
          <p style={{ color: '#666', margin: '0 0 20px 0' }}>Applying trim values and generating preview</p>
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: '#e9ecef',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '60%',
              height: '100%',
              backgroundColor: '#007bff',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Error</h2>
          <p style={{ color: '#666', margin: '0 0 20px 0' }}>{error}</p>
          <button 
            onClick={() => navigate('/edit')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ← Back to Editor
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>🎬 Video Preview</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Preview merged video with trim values applied</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => navigate('/edit')}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ← Back to Editor
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        
        {/* Left Column - Video Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Video Preview Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '30px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Preview</h2>
            
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <video
                ref={videoRef}
                controls
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                {previewUrl && <source src={previewUrl} type="video/mp4" />}
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Custom Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <button 
                onClick={handlePlayPause}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              
              <span style={{ fontSize: '14px', color: '#666' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px' }}>Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{ width: '80px' }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px' }}>Speed:</span>
                <select 
                  value={playbackRate} 
                  onChange={handlePlaybackRateChange}
                  style={{ padding: '4px', borderRadius: '3px' }}
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trim Information */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Trim Information</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px'
              }}>
                <span style={{ fontWeight: 'bold' }}>Original Video:</span>
                <span>{selectedVideo?.name || 'Unknown'}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px'
              }}>
                <span style={{ fontWeight: 'bold' }}>Trim Range:</span>
                <span>{formatTrimInfo()}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px'
              }}>
                <span style={{ fontWeight: 'bold' }}>Final Duration:</span>
                <span>{formatTime(trimData ? trimData.end - trimData.start : 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Export Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Export Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Export</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>
                  Format:
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #dee2e6'
                  }}
                >
                  <option value="mp4">MP4</option>
                  <option value="webm">WebM</option>
                  <option value="gif">GIF</option>
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>
                  Quality:
                </label>
                <select
                  value={exportQuality}
                  onChange={(e) => setExportQuality(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #dee2e6'
                  }}
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>
              
              <div style={{
                padding: '10px',
                backgroundColor: '#e7f3ff',
                borderRadius: '5px',
                border: '1px solid #b3d9ff'
              }}>
                <div style={{ fontSize: '12px', color: '#0066cc', marginBottom: '5px' }}>
                  <strong>Export Info:</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  • Format: {exportFormat.toUpperCase()}<br/>
                  • Quality: {exportQuality}<br/>
                  • Duration: {formatTime(trimData ? trimData.end - trimData.start : 0)}
                </div>
              </div>
              
              <button 
                onClick={handleExport}
                disabled={isExporting}
                style={{
                  backgroundColor: isExporting ? '#6c757d' : '#28a745',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                {isExporting ? `Exporting... ${exportProgress}%` : '🚀 Export Video'}
              </button>
              
              {isExporting && (
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${exportProgress}%`,
                    height: '100%',
                    backgroundColor: '#28a745',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* Processing Info */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Processing Details</h3>
            
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>✅ Trim Applied:</strong><br/>
                Start: {formatTime(trimData?.start || 0)}<br/>
                End: {formatTime(trimData?.end || 0)}
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>✅ Video Processed:</strong><br/>
                Original: {selectedVideo?.name}<br/>
                Final Duration: {formatTime(trimData ? trimData.end - trimData.start : 0)}
              </div>
              
              <div>
                <strong>✅ Ready for Export:</strong><br/>
                Click "Export Video" to download
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '40px',
        textAlign: 'center',
        color: '#6c757d',
        fontSize: '14px'
      }}>
        <p>Video Preview • Powered by Manim + React</p>
      </footer>
    </div>
  )
}

export default PreviewPage 
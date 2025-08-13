import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTrimContext } from '../contexts/TrimContext'

function EditPage() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const { getVideoTrims, setVideoTrimsForVideo, updateVideoTrims, getAllTrims } = useTrimContext()

  // Video list state
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)

  // Video state
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Timeline state
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [isTrimming, setIsTrimming] = useState(false)
  const [trimStartHandle, setTrimStartHandle] = useState(0)
  const [trimEndHandle, setTrimEndHandle] = useState(100)

  // Effects state
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [blur, setBlur] = useState(0)
  const [selectedEffect, setSelectedEffect] = useState('none')



  // Timeline markers
  const [markers, setMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)

  const API_BASE_URL = 'http://localhost:8000'

  // Fetch videos on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const timestamp = Date.now()
        const response = await axios.get(`${API_BASE_URL}/api/videos?t=${timestamp}`)
        setVideos(response.data)
        // Default to first video if available
        if (response.data.length > 0) {
          setSelectedVideo(response.data[0])
        }
      } catch (err) {
        setVideos([])
      }
    }
    fetchVideos()
  }, [])

  // Update duration and trim when video changes
  useEffect(() => {
    if (videoRef.current && selectedVideo) {
      videoRef.current.load()
      videoRef.current.onloadedmetadata = () => {
        const videoDuration = videoRef.current.duration
        setDuration(videoDuration)
        
        // Load persistent trim values for this video
        const savedTrims = getVideoTrims(selectedVideo.name)
        if (savedTrims.start === 0 && savedTrims.end === 0) {
          // No saved trims, set defaults and save them
          setTrimStart(0)
          setTrimEnd(videoDuration)
          setTrimStartHandle(0)
          setTrimEndHandle(100)
          
          // Save the default trim values for this video
          setVideoTrimsForVideo(selectedVideo.name, { start: 0, end: videoDuration })
        } else {
          // Use saved trim values
          setTrimStart(savedTrims.start)
          setTrimEnd(savedTrims.end)
          setTrimStartHandle((savedTrims.start / videoDuration) * 100)
          setTrimEndHandle((savedTrims.end / videoDuration) * 100)
        }
      }
    }
  }, [selectedVideo, getVideoTrims])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener('timeupdate', () => {
        setCurrentTime(video.currentTime)
      })
      video.addEventListener('play', () => setIsPlaying(true))
      video.addEventListener('pause', () => setIsPlaying(false))
    }
  }, [])

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

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
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

  const addMarker = () => {
    const newMarker = {
      id: Date.now(),
      time: currentTime,
      label: `Marker ${markers.length + 1}`,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }
    setMarkers([...markers, newMarker])
  }

  const removeMarker = (markerId) => {
    setMarkers(markers.filter(marker => marker.id !== markerId))
  }

  const jumpToMarker = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleTrimStartChange = (e) => {
    const newStart = parseFloat(e.target.value)
    setTrimStartHandle(newStart)
    const newStartTime = (newStart / 100) * duration
    setTrimStart(newStartTime)
    
    // Save trim values persistently - save both start and end together
    if (selectedVideo) {
      setVideoTrimsForVideo(selectedVideo.name, { start: newStartTime, end: trimEnd })
    }
  }

  const handleTrimEndChange = (e) => {
    const newEnd = parseFloat(e.target.value)
    setTrimEndHandle(newEnd)
    const newEndTime = (newEnd / 100) * duration
    setTrimEnd(newEndTime)
    
    // Save trim values persistently - save both start and end together
    if (selectedVideo) {
      setVideoTrimsForVideo(selectedVideo.name, { start: trimStart, end: newEndTime })
    }
  }

  const applyEffect = (effectType) => {
    setSelectedEffect(effectType)
    const video = videoRef.current
    if (video) {
      // Reset all effects
      video.style.filter = ''
      switch (effectType) {
        case 'grayscale':
          video.style.filter = 'grayscale(100%)'
          break
        case 'sepia':
          video.style.filter = 'sepia(100%)'
          break
        case 'invert':
          video.style.filter = 'invert(100%)'
          break
        case 'blur':
          video.style.filter = `blur(${blur}px)`
          break
        case 'custom':
          video.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
          break
        default:
          video.style.filter = ''
      }
    }
  }

  const handleMergeAndPreview = async () => {
    if (!selectedVideo) {
      alert('Please select a video first')
      return
    }
    
    try {
      // Get all videos and their trim values
      const allTrims = getAllTrims()
      console.log('All available trims:', allTrims)
      console.log('All videos:', videos.map(v => v.name))
      
      const videosToMerge = []
      const trimsToMerge = []
      
      // Add the currently selected video with its trim values
      videosToMerge.push(selectedVideo.name)
      trimsToMerge.push({
        start: trimStart,
        end: trimEnd
      })
      
      // Add other videos that have trim values set
      videos.forEach(video => {
        if (video.name !== selectedVideo.name && allTrims[video.name]) {
          const videoTrims = allTrims[video.name]
          // Include any video that has been loaded and has trim values
          // This will include videos with default trims (start=0, end=duration) as well as custom trims
          console.log(`Adding video ${video.name} with trims:`, videoTrims)
          videosToMerge.push(video.name)
          trimsToMerge.push({
            start: videoTrims.start,
            end: videoTrims.end
          })
        }
      })
      
      if (videosToMerge.length === 0) {
        alert('No videos with trim values found. Please set trim values for at least one video.')
        return
      }
      
      console.log('Merging videos:', videosToMerge)
      console.log('With trims:', trimsToMerge)
      
      // Call the merge API
      const response = await axios.post(`${API_BASE_URL}/api/merge`, {
        videos: videosToMerge,
        trims: trimsToMerge
      })
      
      if (response.data.status === 'success') {
        // Navigate to preview page with merged video data
        navigate('/preview', {
          state: {
            selectedVideo: {
              name: `Merged Video (${videosToMerge.length} clips)`,
              url: response.data.mergedVideo,
              isMerged: true
            },
            trimData: {
              start: 0,
              end: 0,
              duration: 0,
              isMerged: true
            },
            mergedVideo: response.data,
            originalVideos: videosToMerge,
            originalTrims: trimsToMerge
          }
        })
      } else {
        alert('Failed to merge videos')
      }
    } catch (error) {
      console.error('Error merging videos:', error)
      alert('Error merging videos. Please try again.')
    }
  }

  const getVideoFilter = () => {
    if (selectedEffect === 'custom') {
      return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
    }
    return ''
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>🎬 Video Editor</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Edit and enhance your generated videos</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
        >
          ← Back to Home
        </button>
      </header>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Left Column - Video Player and Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Video Selector */}
          <div style={{
            backgroundColor: 'white', borderRadius: '10px', padding: '10px 20px', marginBottom: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)', overflowX: 'auto', display: 'flex', alignItems: 'center', gap: '16px', minHeight: '80px'
          }}>
            {videos.length === 0 ? (
              <span style={{ color: '#888' }}>No videos available</span>
            ) : (
              videos.map((video, idx) => {
                const videoTrims = getVideoTrims(video.name)
                const hasTrims = videoTrims.start !== 0 || videoTrims.end !== 0
                
                return (
                  <div
                    key={video.name}
                    onClick={() => setSelectedVideo(video)}
                    style={{
                      border: selectedVideo && selectedVideo.name === video.name ? '2px solid #007bff' : '2px solid transparent',
                      borderRadius: '8px',
                      padding: '4px',
                      cursor: 'pointer',
                      background: selectedVideo && selectedVideo.name === video.name ? '#e7f1ff' : 'transparent',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px',
                      position: 'relative'
                    }}
                    title={`${video.name}${hasTrims ? ` (Trim: ${videoTrims.start.toFixed(1)}s - ${videoTrims.end.toFixed(1)}s)` : ''}`}
                  >
                    <video
                      src={`${API_BASE_URL}${video.url}`}
                      style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '4px', marginBottom: '4px' }}
                      muted
                    />
                    <span style={{ fontSize: '11px', color: '#333', textAlign: 'center', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.name}</span>
                    {hasTrims && (
                      <div style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#28a745',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }}
                      title="Has trim values set"
                      />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Video Player Section */}
          <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Video Player</h2>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <video
                ref={videoRef}
                controls
                style={{ width: '100%', maxWidth: '600px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', filter: getVideoFilter() }}
              >
                {selectedVideo && <source src={`${API_BASE_URL}${selectedVideo.url}`} type="video/mp4" />}
                Your browser does not support the video tag.
              </video>
            </div>
            {/* Custom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <button 
                onClick={handlePlayPause}
                style={{ backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 16px', cursor: 'pointer' }}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <span style={{ fontSize: '14px', color: '#666' }}>{formatTime(currentTime)} / {formatTime(duration)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px' }}>Volume:</span>
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} style={{ width: '80px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px' }}>Speed:</span>
                <select value={playbackRate} onChange={handlePlaybackRateChange} style={{ padding: '4px', borderRadius: '3px' }}>
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

          {/* Timeline Section */}
          <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333' }}>Timeline</h2>
              <button 
                onClick={addMarker}
                style={{ backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px' }}
              >
                📍 Add Marker
              </button>
            </div>
            {/* Timeline Track */}
            <div style={{ width: '100%', height: '60px', backgroundColor: '#f8f9fa', border: '2px solid #dee2e6', borderRadius: '8px', position: 'relative', marginBottom: '20px', cursor: 'pointer' }} onClick={handleSeek}>
              {/* Progress Bar */}
              <div style={{ width: `${(currentTime / duration) * 100}%`, height: '100%', backgroundColor: '#007bff', borderRadius: '6px', transition: 'width 0.1s ease' }} />
              {/* Trim Handles */}
              <div style={{ position: 'absolute', left: `${trimStartHandle}%`, top: 0, width: '4px', height: '100%', backgroundColor: '#dc3545', cursor: 'ew-resize' }} />
              <div style={{ position: 'absolute', left: `${trimEndHandle}%`, top: 0, width: '4px', height: '100%', backgroundColor: '#dc3545', cursor: 'ew-resize' }} />
              {/* Markers */}
              {markers.map(marker => (
                <div
                  key={marker.id}
                  style={{ position: 'absolute', left: `${(marker.time / duration) * 100}%`, top: '50%', transform: 'translateY(-50%)', width: '8px', height: '20px', backgroundColor: marker.color, borderRadius: '2px', cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); jumpToMarker(marker.time) }}
                  title={marker.label}
                />
              ))}
            </div>
            {/* Timeline Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px' }}>Trim Start:</span>
                <input type="range" min="0" max="100" value={trimStartHandle} onChange={handleTrimStartChange} style={{ width: '100px' }} />
                <span style={{ fontSize: '12px' }}>{formatTime(trimStart)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px' }}>Trim End:</span>
                <input type="range" min="0" max="100" value={trimEndHandle} onChange={handleTrimEndChange} style={{ width: '100px' }} />
                <span style={{ fontSize: '12px' }}>{formatTime(trimEnd)}</span>
              </div>
            </div>
            {/* Markers List */}
            {markers.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Markers:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {markers.map(marker => (
                    <div key={marker.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', backgroundColor: marker.color, color: 'white', borderRadius: '15px', fontSize: '12px' }}>
                      <span>{marker.label}</span>
                      <span>{formatTime(marker.time)}</span>
                      <button onClick={() => removeMarker(marker.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Effects and Export */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Effects Section */}
          <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Effects</h3>
            {/* Preset Effects */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Preset Effects:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['none', 'grayscale', 'sepia', 'invert'].map(effect => (
                  <button key={effect} onClick={() => applyEffect(effect)} style={{ backgroundColor: selectedEffect === effect ? '#007bff' : '#f8f9fa', color: selectedEffect === effect ? 'white' : '#333', border: '1px solid #dee2e6', borderRadius: '5px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize' }}>{effect}</button>
                ))}
              </div>
            </div>
            {/* Custom Effects */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Custom Effects:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Brightness: {brightness}%</label>
                  <input type="range" min="0" max="200" value={brightness} onChange={(e) => { setBrightness(parseInt(e.target.value)); applyEffect('custom') }} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Contrast: {contrast}%</label>
                  <input type="range" min="0" max="200" value={contrast} onChange={(e) => { setContrast(parseInt(e.target.value)); applyEffect('custom') }} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Saturation: {saturation}%</label>
                  <input type="range" min="0" max="200" value={saturation} onChange={(e) => { setSaturation(parseInt(e.target.value)); applyEffect('custom') }} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Blur: {blur}px</label>
                  <input type="range" min="0" max="10" value={blur} onChange={(e) => { setBlur(parseInt(e.target.value)); applyEffect('blur') }} style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
          {/* Export Section */}
          <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Merge & Preview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Current Video Trim: {formatTime(trimStart)} - {formatTime(trimEnd)}</label>
                <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '5px', fontSize: '12px', color: '#666' }}>Duration: {formatTime(trimEnd - trimStart)}</div>
              </div>
              
              {/* Merge Summary */}
              {(() => {
                const allTrims = getAllTrims()
                const videosWithTrims = videos.filter(video => {
                  const trims = allTrims[video.name]
                  return trims && (trims.start !== 0 || trims.end !== 0)
                })
                
                if (videosWithTrims.length > 0) {
                  return (
                    <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
                      <div style={{ fontSize: '12px', color: '#856404', marginBottom: '8px' }}>
                        <strong>📹 Videos to Merge ({videosWithTrims.length}):</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', maxHeight: '100px', overflowY: 'auto' }}>
                        {videosWithTrims.map(video => {
                          const trims = allTrims[video.name]
                          return (
                            <div key={video.name} style={{ marginBottom: '4px', padding: '4px', backgroundColor: '#fff', borderRadius: '3px' }}>
                              <strong>{video.name}</strong>: {formatTime(trims.start)} - {formatTime(trims.end)} ({formatTime(trims.end - trims.start)})
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
                return null
              })()}
              
              <div style={{ padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '5px', border: '1px solid #b3d9ff' }}>
                <div style={{ fontSize: '12px', color: '#0066cc', marginBottom: '5px' }}>
                  <strong>Merge Info:</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  • Videos with trim values will be merged in order<br/>
                  • Each video will be trimmed according to its settings<br/>
                  • Click "Merge and Preview" to see the result
                </div>
              </div>
              
              {/* Debug Button */}
              <button 
                onClick={() => {
                  const allTrims = getAllTrims()
                  console.log('=== DEBUG: Current Trim State ===')
                  console.log('All trims:', allTrims)
                  console.log('All videos:', videos.map(v => v.name))
                  console.log('Selected video:', selectedVideo?.name)
                  console.log('Current trim values:', { start: trimStart, end: trimEnd })
                  console.log('================================')
                }} 
                style={{ 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  padding: '8px 16px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  width: '100%',
                  marginBottom: '10px'
                }}
              >
                🔍 Debug Trim State
              </button>
              
              <button 
                onClick={handleMergeAndPreview} 
                style={{ 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  padding: '12px 20px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  width: '100%' 
                }}
              >
                🎬 Merge and Preview
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer style={{ marginTop: '40px', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>
        <p>Video Editor • Powered by Manim + React</p>
      </footer>
    </div>
  )
}

export default EditPage 
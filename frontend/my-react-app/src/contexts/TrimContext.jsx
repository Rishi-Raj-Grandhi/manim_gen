import { createContext, useContext, useState, useEffect } from 'react'

const TrimContext = createContext()

export const useTrimContext = () => {
  const context = useContext(TrimContext)
  if (!context) {
    throw new Error('useTrimContext must be used within a TrimProvider')
  }
  return context
}

export const TrimProvider = ({ children }) => {
  // Store trim values for each video by video name
  const [videoTrims, setVideoTrims] = useState({})
  
  // Load trim values from localStorage on mount
  useEffect(() => {
    const savedTrims = localStorage.getItem('videoTrims')
    if (savedTrims) {
      try {
        setVideoTrims(JSON.parse(savedTrims))
      } catch (error) {
        console.error('Failed to parse saved trim values:', error)
      }
    }
  }, [])
  
  // Save trim values to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('videoTrims', JSON.stringify(videoTrims))
  }, [videoTrims])
  
  // Get trim values for a specific video
  const getVideoTrims = (videoName) => {
    return videoTrims[videoName] || { start: 0, end: 0 }
  }
  
  // Set trim values for a specific video
  const setVideoTrimsForVideo = (videoName, trimData) => {
    setVideoTrims(prev => ({
      ...prev,
      [videoName]: {
        start: trimData.start || 0,
        end: trimData.end || 0
      }
    }))
  }
  
  // Update trim values for a specific video
  const updateVideoTrims = (videoName, trimData) => {
    setVideoTrims(prev => ({
      ...prev,
      [videoName]: {
        ...prev[videoName],
        ...trimData
      }
    }))
  }
  
  // Clear trim values for a specific video
  const clearVideoTrims = (videoName) => {
    setVideoTrims(prev => {
      const newTrims = { ...prev }
      delete newTrims[videoName]
      return newTrims
    })
  }
  
  // Get all trim values
  const getAllTrims = () => {
    return videoTrims
  }
  
  const value = {
    videoTrims,
    getVideoTrims,
    setVideoTrimsForVideo,
    updateVideoTrims,
    clearVideoTrims,
    getAllTrims
  }
  
  return (
    <TrimContext.Provider value={value}>
      {children}
    </TrimContext.Provider>
  )
} 
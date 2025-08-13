import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import EditPage from './pages/EditPage'
import PreviewPage from './pages/PreviewPage'
import { TrimProvider } from './contexts/TrimContext'
import './App.css'

function App() {
  return (
    <TrimProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/edit" element={<EditPage />} />
            <Route path="/preview" element={<PreviewPage />} />
          </Routes>
        </div>
      </Router>
    </TrimProvider>
  )
}

export default App

// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import Home from './pages/Home'
// import EditPage from './pages/EditPage'
// import PreviewPage from './pages/PreviewPage'
// import './App.css'

// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/edit" element={<EditPage />} />
//           <Route path="/preview" element={<PreviewPage />} />
//         </Routes>
//       </div>
//     </Router>
//   )
// }

// export default App


import { useState } from "react";
import { generateVideo } from "./api";
import VideoPlayer from "./VideoPlayer";

export default function App() {
  const [prompt, setPrompt] = useState("Draw a red square");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null); // { url, key }

  const onGenerate = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await generateVideo(prompt);
      setResult({ url: data.video_url, key: data.s3_key });
    } catch (e) {
      setErr(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1>🎬 Manim Video Generator</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          style={{ flex: 1, padding: 10, fontSize: 16 }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the animation…"
        />
        <button onClick={onGenerate} disabled={loading}>
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      {result && (
        <>
          <p style={{ fontFamily: "monospace" }}>S3 key: {result.key}</p>
          <VideoPlayer initialUrl={result.url} keyPath={result.key} ttl={3600} />
        </>
      )}
    </div>
  );
}

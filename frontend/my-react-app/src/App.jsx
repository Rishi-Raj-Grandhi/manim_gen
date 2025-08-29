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


// import { useState } from "react";
// import { generateVideo } from "./api";
// import VideoPlayer from "./VideoPlayer";

// export default function App() {
//   const [prompt, setPrompt] = useState("Draw a red square");
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");
//   const [result, setResult] = useState(null); // { url, key }

//   const onGenerate = async () => {
//     setLoading(true);
//     setErr("");
//     try {
//       const data = await generateVideo(prompt);
//       setResult({ url: data.video_url, key: data.s3_key });
//     } catch (e) {
//       setErr(e.message || "Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
//       <h1>🎬 Manim Video Generator</h1>

//       <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
//         <input
//           style={{ flex: 1, padding: 10, fontSize: 16 }}
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Describe the animation…"
//         />
//         <button onClick={onGenerate} disabled={loading}>
//           {loading ? "Generating…" : "Generate"}
//         </button>
//       </div>

//       {err && <div style={{ color: "crimson" }}>{err}</div>}

//       {result && (
//         <>
//           <p style={{ fontFamily: "monospace" }}>S3 key: {result.key}</p>
//           <VideoPlayer initialUrl={result.url} keyPath={result.key} ttl={3600} />
//         </>
//       )}
//     </div>
//   );
// }


import { useState } from "react";
import { generateVideo, listVideos, mergeVideos, deleteVideo } from "./api";
import VideoPlayer from "./VideoPlayer";

export default function App() {
  const [prompt, setPrompt] = useState("Draw a red square");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null); // { url, key }
  const [videos, setVideos] = useState([]); // list of recent videos
  const [selected, setSelected] = useState(new Set()); // filenames selected for merge

  const onGenerate = async () => {
    setLoading(true);
    setErr("");
    setResult(null);
    try {
      const data = await generateVideo(prompt);
      // backend returns { video_url, s3_key, storage }
      setResult({ url: data.video_url, key: data.s3_key, storage: data.storage });
    } catch (e) {
      setErr(e.message || "Failed to generate video");
    } finally {
      setLoading(false);
    }
  };

  const refreshList = async () => {
    try {
      const list = await listVideos();
      // sort by modified desc
      const sorted = [...list].sort(
        (a, b) => new Date(b.modified) - new Date(a.modified)
      );
      setVideos(sorted);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSelect = (name) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const onMerge = async () => {
    if (selected.size < 2) {
      setErr("Select at least two videos to merge");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const data = await mergeVideos(Array.from(selected));
      setResult({ url: data.video_url, key: null, storage: data.storage });
      await refreshList();
    } catch (e) {
      setErr(e.message || "Failed to merge videos");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    setErr("");
    try {
      // attempt delete by filename under prefix
      await Promise.all(Array.from(selected).map((name) => deleteVideo({ name })));
      setSelected(new Set());
      await refreshList();
    } catch (e) {
      setErr(e.message || "Failed to delete selected videos");
    } finally {
      setLoading(false);
    }
  };

  // Load recent videos on mount
  if (videos.length === 0) {
    // simple lazy init without useEffect to keep the file minimal
    // eslint-disable-next-line novoid
    void refreshList();
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 16, fontFamily: "system-ui, sans-serif", display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <h1>🎬 Manim Video Generator</h1>
      </div>

      {/* Sidebar: recent videos */}
      <aside style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, height: "calc(100vh - 200px)", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <strong>Recent videos</strong>
          <button onClick={refreshList} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6 }}>Refresh</button>
        </div>
        {videos.length === 0 ? (
          <div style={{ color: "#666", fontSize: 13 }}>No videos yet</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {videos.map(v => (
              <li key={v.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", borderBottom: "1px solid #f2f2f2" }}>
                <input type="checkbox" checked={selected.has(v.name)} onChange={() => toggleSelect(v.name)} />
                <span title={v.name} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{v.name}</span>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onMerge} disabled={loading || selected.size < 2} style={{ marginTop: 12, width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #333", cursor: selected.size < 2 ? "not-allowed" : "pointer" }}>
          {loading ? "Merging…" : `Merge ${selected.size || 0} selected`}
        </button>
        <button onClick={onDelete} disabled={loading || selected.size === 0} style={{ marginTop: 8, width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #b91c1c", color: "#b91c1c", cursor: selected.size === 0 ? "not-allowed" : "pointer" }}>
          {loading ? "Deleting…" : `Delete ${selected.size || 0} selected`}
        </button>
      </aside>

      <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          style={{ flex: 1, padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ddd" }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the animation…"
        />
        <button
          onClick={onGenerate}
          disabled={loading}
          style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #333", cursor: "pointer" }}
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      {result && (
        <>
          <p style={{ fontFamily: "monospace", fontSize: 13, color: "#555" }}>
            S3 key: {result.key}
            {" "}
            <span style={{
              marginLeft: 12,
              padding: "2px 6px",
              borderRadius: 6,
              background: result.storage === "s3" ? "#e6f4ea" : "#eef2ff",
              color: result.storage === "s3" ? "#137333" : "#1e3a8a",
              border: "1px solid #ddd",
            }}>
              storage: {result.storage || "unknown"}
            </span>
          </p>
          <VideoPlayer initialUrl={result.url} keyPath={result.key} ttl={3600} />
        </>
      )}
      </div>
    </div>
  );
}

const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

// Call the /api/generate endpoint
export async function generateVideo(prompt) {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { video_url, s3_key, ... }
}

// Call the /api/s3-url endpoint to refresh presigned URLs
export async function refreshUrl(key, ttl = 3600) {
  const res = await fetch(
    `${BASE}/api/s3-url?key=${encodeURIComponent(key)}&ttl=${ttl}`
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { url, key, ttl }
}

// List available videos (recent first handled in UI)
export async function listVideos() {
  const res = await fetch(`${BASE}/api/videos`);
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // [{name,url,size,created,modified}]
}

// Merge multiple videos by filename
export async function mergeVideos(videos, outputFormat = "mp4") {
  const res = await fetch(`${BASE}/api/merge-videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videos, output_format: outputFormat }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { video_url, merged_video, storage }
}

// Delete a video from S3 by key or by filename (under prefix)
export async function deleteVideo({ key, name }) {
  const params = new URLSearchParams();
  if (key) params.set("key", key);
  if (name) params.set("name", name);
  const res = await fetch(`${BASE}/api/video?${params.toString()}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
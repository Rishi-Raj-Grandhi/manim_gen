import { useEffect, useState } from "react";
import { refreshUrl } from "./api";

export default function VideoPlayer({
  initialUrl,
  keyPath,
  ttl = 3600,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  playsInline = true,
  preload = "metadata",
  poster,
  style,
}) {
  const [url, setUrl] = useState(initialUrl);

  // Keep local url in sync when a new initialUrl is provided
  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (!keyPath) return;
    // refresh ~5 min before expiry (works for 1h TTL; adjust if you changed it)
    const refreshEveryMs = Math.max((ttl - 300) * 1000, 60_000);
    const id = setInterval(async () => {
      try {
        const { url: fresh } = await refreshUrl(keyPath, ttl);
        setUrl(fresh);
      } catch (e) {
        console.error("Failed to refresh presigned URL:", e);
      }
    }, refreshEveryMs);
    return () => clearInterval(id);
  }, [keyPath, ttl]);

  return (
    <video
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      preload={preload}
      poster={poster}
      style={{ width: "100%", maxWidth: 960, borderRadius: 12, ...(style || {}) }}
      src={url}
    />
  );
}

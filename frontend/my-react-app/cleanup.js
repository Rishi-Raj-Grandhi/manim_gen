#!/usr/bin/env node

/**
 * Cleanup script for frontend dev server
 * This script is called when the Vite dev server stops to clean up generated videos
 */

import axios from 'axios';

const BACKEND_URL = "http://localhost:8000";

const cleanup = async () => {
  try {
    console.log("🧹 Frontend stopping - cleaning up generated videos...");
    const response = await axios.post(`${BACKEND_URL}/api/cleanup`);
    
    if (response.data.status === 'success') {
      console.log("✅ Media folder cleared successfully");
    } else {
      console.log("⚠️  Cleanup completed with warnings");
    }
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log("💡 Backend server is not running - skipping cleanup");
    }
  }
};

// Run cleanup immediately
cleanup();



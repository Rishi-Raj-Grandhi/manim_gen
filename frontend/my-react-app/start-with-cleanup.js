#!/usr/bin/env node

/**
 * Enhanced dev server script with automatic cleanup
 * This script starts Vite and ensures cleanup runs when the server stops
 */

import { spawn } from 'child_process';
import axios from 'axios';

const BACKEND_URL = "http://localhost:8000";

// Start Vite dev server
console.log("🚀 Starting Vite dev server with cleanup...");
const viteProcess = spawn("npm", ["run", "dev"], { 
  stdio: "inherit",
  shell: true
});

// Cleanup function
const cleanup = async () => {
  try {
    console.log("\n🧹 Frontend dev server stopping - cleaning up generated videos...");
    const response = await axios.post(`${BACKEND_URL}/api/cleanup`, {}, {
      timeout: 5000 // 5 second timeout
    });
    
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
  } finally {
    console.log("👋 Frontend dev server stopped");
    process.exit(0);
  }
};

// Handle various shutdown signals
process.on("SIGINT", cleanup);   // Ctrl+C
process.on("SIGTERM", cleanup);  // Termination signal
process.on("SIGQUIT", cleanup);  // Quit signal

// Handle Vite process exit
viteProcess.on('exit', (code) => {
  console.log(`\n📱 Vite dev server exited with code ${code}`);
  cleanup();
});

// Handle Vite process errors
viteProcess.on('error', (err) => {
  console.error("❌ Vite process error:", err);
  cleanup();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error("❌ Uncaught exception:", err);
  cleanup();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error("❌ Unhandled promise rejection:", reason);
  cleanup();
});



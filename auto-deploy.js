#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

console.log('🚀 Auto-Deploy Service Starting...');

// Watch for file changes
const watchPaths = [
  '*.html',
  '*.css', 
  '*.js',
  'supabase/migrations/*.sql'
];

const watcher = chokidar.watch(watchPaths, {
  ignored: /node_modules|\.git|public/,
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100
  }
});

// Auto-sync when files change
watcher.on('change', (filePath) => {
  console.log(`📝 File changed: ${filePath}`);
  console.log('🔄 Auto-syncing...');
  
  // Build and deploy in background
  require('child_process').exec('npm run build && npm run deploy', { 
    stdio: 'pipe' 
  }, (error, stdout, stderr) => {
    if (error) {
      console.log('⚠️ Sync warning:', error.message);
    } else {
      console.log('✅ Auto-sync complete');
    }
  });
});

watcher.on('ready', () => {
  console.log('👀 Watching for file changes...');
  console.log('✅ Auto-deploy service is running');
  console.log('🔄 Files will sync automatically when changed');
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('🛑 Auto-deploy service stopped');
  watcher.close();
  process.exit(0);
});
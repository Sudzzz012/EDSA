#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// Create public directory
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public directory');
}

// Copy HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
  fs.copyFileSync(file, path.join(publicDir, file));
  console.log(`✅ Copied ${file}`);
});

// Copy image files
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
const imageFiles = fs.readdirSync('.').filter(file => 
  imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
);
imageFiles.forEach(file => {
  fs.copyFileSync(file, path.join(publicDir, file));
  console.log(`✅ Copied ${file}`);
});

// Copy supabase directory if it exists
const supabaseDir = path.join(__dirname, 'supabase');
const publicSupabaseDir = path.join(publicDir, 'supabase');
if (fs.existsSync(supabaseDir)) {
  fs.cpSync(supabaseDir, publicSupabaseDir, { recursive: true });
  console.log('✅ Copied supabase directory');
}

// Copy other important files
const otherFiles = ['package.json', 'README.md', '.gitignore'];
otherFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(publicDir, file));
    console.log(`✅ Copied ${file}`);
  }
});

// List contents of public directory
console.log('\n📁 Contents of public directory:');
const publicContents = fs.readdirSync(publicDir);
publicContents.forEach(item => {
  const stats = fs.statSync(path.join(publicDir, item));
  const type = stats.isDirectory() ? 'DIR' : 'FILE';
  const size = stats.isFile() ? `(${Math.round(stats.size / 1024)}KB)` : '';
  console.log(`   ${type}: ${item} ${size}`);
});

console.log('\n🎉 Build completed successfully!');
console.log(`📊 Total files/directories: ${publicContents.length}`);
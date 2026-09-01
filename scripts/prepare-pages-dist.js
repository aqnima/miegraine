const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const nextDir = path.join(rootDir, '.next');
const publicDir = path.join(rootDir, 'public');

// 1. Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Copy public directory
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
}

// 3. Copy .next/static to dist/_next/static
const nextStatic = path.join(nextDir, 'static');
const distNextStatic = path.join(distDir, '_next', 'static');
if (fs.existsSync(nextStatic)) {
  fs.mkdirSync(path.join(distDir, '_next'), { recursive: true });
  fs.cpSync(nextStatic, distNextStatic, { recursive: true });
}

// 4. Recursive copy HTML files from .next/server/app
function copyHtmlFiles(srcDir, targetDir) {
  if (!fs.existsSync(srcDir)) return;
  const items = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(srcDir, item.name);
    if (item.isDirectory()) {
      if (item.name === '(auth)') {
        copyHtmlFiles(srcPath, targetDir);
      } else if (!item.name.startsWith('_') && item.name !== 'page' && !item.name.endsWith('.svg') && !item.name.endsWith('.webmanifest')) {
        const subTarget = path.join(targetDir, item.name);
        fs.mkdirSync(subTarget, { recursive: true });
        copyHtmlFiles(srcPath, subTarget);
      }
    } else if (item.name.endsWith('.html') && !item.name.startsWith('_global')) {
      const baseName = item.name.replace('.html', '');
      if (baseName === 'index') {
        fs.copyFileSync(srcPath, path.join(targetDir, 'index.html'));
      } else if (baseName === '_not-found') {
        fs.copyFileSync(srcPath, path.join(targetDir, '404.html'));
      } else {
        const destFolder = path.join(targetDir, baseName);
        fs.mkdirSync(destFolder, { recursive: true });
        fs.copyFileSync(srcPath, path.join(destFolder, 'index.html'));
        fs.copyFileSync(srcPath, path.join(targetDir, item.name));
      }
    }
  }
}

copyHtmlFiles(path.join(nextDir, 'server', 'app'), distDir);

// 5. Ensure fallback index.html for SPA client routing
const dashboardHtmlPath = path.join(distDir, 'dashboard', 'index.html');
const superadminHtmlPath = path.join(distDir, 'superadmin', 'index.html');

function ensureSectionFallback(dir, fallbackHtml) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const hasHtml = items.some((it) => it.isFile() && it.name === 'index.html');
  if (!hasHtml) {
    fs.writeFileSync(path.join(dir, 'index.html'), fallbackHtml);
  }
  for (const item of items) {
    if (item.isDirectory() && !item.name.startsWith('_')) {
      ensureSectionFallback(path.join(dir, item.name), fallbackHtml);
    }
  }
}

if (fs.existsSync(dashboardHtmlPath)) {
  const dashboardHtml = fs.readFileSync(dashboardHtmlPath, 'utf8');
  ensureSectionFallback(path.join(distDir, 'dashboard'), dashboardHtml);
}

if (fs.existsSync(superadminHtmlPath)) {
  const superadminHtml = fs.readFileSync(superadminHtmlPath, 'utf8');
  ensureSectionFallback(path.join(distDir, 'superadmin'), superadminHtml);
}

console.log('✅ Cloudflare Pages dist package prepared successfully at dist/');

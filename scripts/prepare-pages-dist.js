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

// 4. Copy all compiled files (.html, .rsc, .segments, etc.) from .next/server/app
function copyAllServerApp(srcDir, targetDir) {
  if (!fs.existsSync(srcDir)) return;
  const items = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(srcDir, item.name);
    if (item.isDirectory()) {
      if (item.name === '(auth)') {
        copyAllServerApp(srcPath, targetDir);
      } else if (!item.name.endsWith('.webmanifest') && !item.name.endsWith('.svg')) {
        const subTarget = path.join(targetDir, item.name);
        if (fs.existsSync(subTarget) && !fs.statSync(subTarget).isDirectory()) {
          fs.rmSync(subTarget, { force: true });
        }
        fs.mkdirSync(subTarget, { recursive: true });
        copyAllServerApp(srcPath, subTarget);
      }
    } else {
      const directTarget = path.join(targetDir, item.name);
      if (!fs.existsSync(directTarget) || !fs.statSync(directTarget).isDirectory()) {
        fs.copyFileSync(srcPath, directTarget);
      }

      // If it's an HTML page (e.g. pos.html), also ensure pos/index.html exists for clean URL routing
      if (item.name.endsWith('.html') && !item.name.startsWith('_global')) {
        const baseName = item.name.replace('.html', '');
        if (baseName === 'index') {
          fs.copyFileSync(srcPath, path.join(targetDir, 'index.html'));
        } else if (baseName === '_not-found') {
          fs.copyFileSync(srcPath, path.join(targetDir, '404.html'));
        } else {
          const destFolder = path.join(targetDir, baseName);
          if (fs.existsSync(destFolder) && !fs.statSync(destFolder).isDirectory()) {
            fs.rmSync(destFolder, { force: true });
          }
          fs.mkdirSync(destFolder, { recursive: true });
          fs.copyFileSync(srcPath, path.join(destFolder, 'index.html'));
        }
      }

      // If it's an RSC payload (e.g. pos.rsc), also copy into pos/page.rsc for client router
      if (item.name.endsWith('.rsc')) {
        const baseName = item.name.replace('.rsc', '');
        if (baseName !== 'index') {
          const destFolder = path.join(targetDir, baseName);
          if (fs.existsSync(destFolder) && fs.statSync(destFolder).isDirectory()) {
            fs.copyFileSync(srcPath, path.join(destFolder, 'page.rsc'));
            fs.copyFileSync(srcPath, path.join(destFolder, 'index.rsc'));
          }
        }
      }
    }
  }
}

copyAllServerApp(path.join(nextDir, 'server', 'app'), distDir);

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

console.log('✅ Cloudflare Pages dist package with RSC payloads prepared successfully at dist/');

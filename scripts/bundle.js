/* Inlines frontend/css/styles.css and all frontend/js/*.js into one self-contained
   frontend/servehub.html (the single-file demo build). Run: node scripts/bundle.js */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const fe = path.join(root, 'frontend');
const pub = path.join(root, 'public');

let html = fs.readFileSync(path.join(fe, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(fe, 'css', 'styles.css'), 'utf8');
const scripts = [
  'js/data.js', 'js/store.js', 'js/ui.js', 'js/components/locationPicker.js',
  'js/pages/public.js', 'js/pages/auth.js', 'js/pages/booking.js',
  'js/pages/customer.js', 'js/pages/professional.js', 'js/pages/admin.js', 'js/chatbot.js', 'js/app.js',
];

html = html.replace(/<link rel="stylesheet" href="css\/styles.css" \/>/, () => `<style>\n${css}\n</style>`);
for (const s of scripts) {
  const code = fs.readFileSync(path.join(fe, s), 'utf8');
  html = html.replace(new RegExp(`<script src="${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" defer></script>`), () => `<script>\n${code}\n</script>`);
}

fs.writeFileSync(path.join(fe, 'servehub.html'), html);
console.log('frontend/servehub.html written:', (html.length / 1024).toFixed(0) + ' KB');

// Ensure root public directory exists for Vercel deployment compatibility
try {
  if (fs.cpSync) {
    fs.cpSync(fe, pub, { recursive: true });
  } else {
    fs.mkdirSync(pub, { recursive: true });
    fs.copyFileSync(path.join(fe, 'servehub.html'), path.join(pub, 'servehub.html'));
    fs.copyFileSync(path.join(fe, 'index.html'), path.join(pub, 'index.html'));
  }
  console.log('public/ build directory updated for Vercel deployment.');
} catch (err) {
  console.warn('Warning updating public directory:', err.message);
}

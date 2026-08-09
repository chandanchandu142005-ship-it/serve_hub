/* Inlines frontend/css/styles.css and all frontend/js/*.js into one self-contained
   frontend/servehub.html (the single-file demo build). Run: node scripts/bundle.js */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const fe = path.join(root, 'frontend');

let html = fs.readFileSync(path.join(fe, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(fe, 'css', 'styles.css'), 'utf8');
const scripts = [
  'js/data.js', 'js/store.js', 'js/ui.js',
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

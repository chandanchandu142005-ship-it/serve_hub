/* Servehub — one-command Android APK builder (Bubblewrap / TWA).
   Usage:  node scripts/build-apk.js [url]
   Defaults to http://localhost:5501/servehub when no url is given.
   Requirements (checked here): Node >= 18, Java JDK 17+, Android SDK.
   Output: frontend/servehub.apk (served by the app at /servehub.apk). */
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FE = path.join(ROOT, 'frontend');
const URL = process.argv[2] || 'http://localhost:5501/servehub';
const log = m => console.log(m);

const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', cwd: opts.cwd || ROOT, shell: true });

function preflight() {
  log('\n— Preflight —');
  let java = false, sdk = false;
  try { execSync('java -version 2>&1', { stdio: 'ignore' }); java = true; log('  ✓ Java JDK found'); }
  catch (e) { log('  ✗ Java JDK NOT found'); }
  const sdkHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (sdkHome && fs.existsSync(sdkHome)) { sdk = true; log('  ✓ Android SDK found (' + sdkHome + ')'); }
  else log('  ✗ Android SDK NOT found (set ANDROID_HOME)');
  if (!java) {
    log('\nInstall a JDK first (e.g. Temurin 17: https://adoptium.net) and add it to PATH.\n');
    process.exit(1);
  }
  if (!sdk) {
    log('\nNo Android SDK — Bubblewrap can auto-download the command-line tools, but a real\n' +
        'build works best with the SDK. Either install Android Studio\n' +
        '(https://developer.android.com/studio) or set ANDROID_HOME and re-run.\n');
  }
  return java && sdk;
}

function writeManifest() {
  log('\n— Filling twa-manifest.json for ' + URL + ' —');
  const tpl = JSON.parse(fs.readFileSync(path.join(ROOT, 'android', 'twa-manifest.json'), 'utf8'));
  let u;
  try { u = new URL(URL); }
  catch (e) { log('  ✗ Invalid URL: ' + URL); process.exit(1); }
  const host = u.hostname;
  const base = u.origin;
  tpl.host = host;
  tpl.startUrl = u.pathname + u.search + u.hash;
  tpl.iconUrl = base + '/icons/icon-512.png';
  tpl.maskableIconUrl = base + '/icons/maskable-512.png';
  tpl.webManifestUrl = base + '/manifest.webmanifest';
  tpl.shortcuts = (tpl.shortcuts || []).map(s => ({ ...s, url: u.pathname + (s.url.includes('#') ? s.url.slice(s.url.indexOf('#')) : '') }));
  const out = path.join(ROOT, 'android', 'twa-manifest.json');
  fs.writeFileSync(out, JSON.stringify(tpl, null, 2));
  log('  ✓ wrote ' + out);
}

function build() {
  log('\n— Running Bubblewrap (first run downloads the CLI + builds the Gradle project) —');
  log('  This step takes a few minutes the first time.\n');
  const cwd = path.join(ROOT, 'android');
  fs.mkdirSync(cwd, { recursive: true });
  // Bubblewrap accepts a local manifest path — the manifest lives in android/,
  // so init from the file directly (no need to serve it over HTTP).
  run('npx -y @bubblewrap/cli init --manifest=./twa-manifest.json', { cwd });
  run('npx -y @bubblewrap/cli build', { cwd });

  // Bubblewrap writes the signed APK somewhere under android/ — copy it to frontend/.
  const apks = [];
  (function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.apk')) apks.push(p);
    }
  })(cwd);
  const apk = apks.find(f => /signed|release/i.test(f)) || apks[0];
  if (!apk) { log('\nBuild finished but no APK found under android/ — check Bubblewrap output above.'); process.exit(1); }
  const dest = path.join(FE, 'servehub.apk');
  fs.copyFileSync(apk, dest);
  log('\n✓ APK ready → ' + dest + ' (' + (fs.statSync(dest).size / 1048576).toFixed(1) + ' MB)');
  log('  The site now serves it at http://localhost:5501/servehub.apk — the\n  “Download Android app” button links straight to it. Install the APK on any\n  Android phone (enable “Install unknown apps” for your file manager/browser).');
}

const ok = preflight();
if (ok) { writeManifest(); build(); }
else {
  log('\nPreflight incomplete — fix the ✗ items above and re-run. (For a no-tools build,\nuse PWABuilder: https://www.pwabuilder.com — paste your HTTPS Servehub URL and\ndownload the Android package. See android/README.md.)');
  process.exit(1);
}

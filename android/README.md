# Servehub — Android app (APK)

Servehub ships as a **Progressive Web App** and can be packaged into a real
**Android APK** that installs like any Play Store app. There are two ways:

## Option A — PWABuilder (no tools, 2 minutes, recommended)

1. Deploy Servehub somewhere **public + HTTPS** (the PWA install feature only
   activates on HTTPS, and APK install works best from a public URL).
2. Open [pwabuilder.com](https://www.pwabuilder.com), paste your Servehub URL,
   and click **Start**. It reads `manifest.webmanifest` + `sw.js`
   automatically (both are already in the project).
3. Go to the **Package for stores** step → **Android** → **Download**.
   You get a signed `.apk` ready to sideload.

No Android Studio, no Java, no SDK.

## Option B — Local build with Bubblewrap (full control)

Requires once: **Java JDK 17+** and the **Android SDK**
(https://developer.android.com/studio or command-line tools only). Then:

```bash
# 1. Serve the app somewhere Bubblewrap can reach, e.g. your dev server:
npm run dev:web                      # → http://localhost:5501

# 2. Build the APK (checks java/sdk, fills the manifest from your URL,
#    runs Bubblewrap, copies servehub.apk into frontend/):
npm run build:apk                    # or:  npm run build:apk -- http://localhost:5501/servehub
```

That's it — the finished APK lands at **`frontend/servehub.apk`** and the
site's “Download Android app” button starts serving it at `/servehub.apk`.

### What it builds

- **TWA** (Trusted Web Activity): full-screen app window, push-notification
  ready, home-screen icon — wrapping `frontend/servehub.html`.
- `fallbackType: "customtabs"` means the app also works for a **LAN-only /
  localhost** URL (no Digital Asset Links needed).
- For a public domain, switch `fallbackType` to `"twa"` and drop the
  `assetlinks.json` file into your web root (Bubblewrap prints the exact
  file contents).

### Files

| File | Purpose |
|---|---|
| `android/twa-manifest.json` | Bubblewrap config (replace `servehub.example.com` with your real URL) |
| `android/README.md` | this file |
| `frontend/servehub.apk` | the built APK (created by `npm run build:apk`, served at `/servehub.apk`) |
| `frontend/manifest.webmanifest` | PWA manifest PWABuilder also reads |
| `frontend/sw.js` | service worker (offline + installability) |

### Troubleshooting

- `npm run build:apk` fails with “Java not found” → install a JDK (e.g.
  Temurin 17) and re-run.
- “Android SDK not found” → set `ANDROID_HOME` to your SDK folder (or let
  Android Studio install it) and re-run.
- APK says “App not installed” → enable “Install unknown apps” for your
  browser / file manager, and make sure you install over the same app
  signature (re-install: uninstall first if you used a different key).

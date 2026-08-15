/* ==================================================================
   SERVEHUB ELECTRON PRELOAD SCRIPT
   Provides safe context bridge API exposure for Electron desktop app.
   ================================================================== */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ServeHubDesktop', {
  platform: process.platform,
  isElectron: true,
  getVersion: () => process.env.npm_package_version || '1.0.0',
});

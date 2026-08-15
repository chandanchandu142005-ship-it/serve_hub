/* ==================================================================
   EXACT GPS LOCATION PICKER & INTERACTIVE MAP COMPONENT
   Supports:
   - High accuracy device GPS geolocation
   - Interactive draggable marker
   - Reverse geocoding (address, city, state, pincode, country)
   - Map mode toggles (Roadmap, Satellite, Hybrid)
   - Address search with autocomplete suggestions
   - Google Maps JS API + Leaflet fallback
   - Address confirmation section ("Is this your exact location?")
   ================================================================== */

(function () {
  'use strict';

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getIcon(name, size = 16) {
    if (typeof window.icon === 'function') return window.icon(name, size);
    return `<span class="ic-fallback">📍</span>`;
  }

  class LocationPicker {
    constructor(containerEl, options = {}) {
      this.container = typeof containerEl === 'string' ? document.querySelector(containerEl) : containerEl;
      this.options = Object.assign({
        initialLat: 19.0760,
        initialLng: 72.8777,
        initialZoom: 16,
        onLocationConfirmed: null,
        onLocationChanged: null,
        googleMapsApiKey: '',
      }, options);

      this.currentLat = this.options.initialLat;
      this.currentLng = this.options.initialLng;
      this.currentAddress = null;
      this.mapMode = 'roadmap'; // 'roadmap' | 'satellite' | 'hybrid'
      this.isConfirmed = false;
      this.isLocating = false;

      this.mapEngine = 'leaflet'; // 'google' | 'leaflet'
      this.gMap = null;
      this.gMarker = null;
      this.lMap = null;
      this.lMarker = null;
      this.lLayers = {};

      this.init();
    }

    async init() {
      if (!this.container) return;
      this.renderSkeleton();

      // Check Google Maps API Key
      const key = this.options.googleMapsApiKey || window.SH_GOOGLE_MAPS_KEY || '';
      if (key && !window.google?.maps) {
        await this.loadGoogleMapsScript(key);
      }

      if (window.google?.maps) {
        this.mapEngine = 'google';
      } else {
        this.mapEngine = 'leaflet';
        await this.ensureLeafletLoaded();
      }

      this.renderUI();
      setTimeout(() => {
        this.initMap();
        this.bindEvents();
        this.reverseGeocode(this.currentLat, this.currentLng);
      }, 50);
    }

    renderSkeleton() {
      this.container.innerHTML = `
        <div class="sh-loc-picker-wrapper">
          <div class="sh-loc-loading-skeleton" style="height:380px;background:var(--surface-2);border-radius:16px;display:flex;align-items:center;justify-content:center;color:var(--ink-3)">
            <span class="spinner" style="width:24px;height:24px;border:3px solid var(--primary);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;margin-right:10px"></span>
            Initializing interactive location map…
          </div>
        </div>
      `;
    }

    renderUI() {
      const icon = getIcon;
      this.container.innerHTML = `
        <div class="sh-loc-picker-card card glass" style="padding:20px;border-radius:18px;margin-bottom:20px">
          
          <!-- Header & Location Search -->
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px">
              <div>
                <h3 style="font-size:18px;font-weight:900;margin:0;color:var(--ink);display:flex;align-items:center;gap:8px">
                  ${icon('pin', 20)} Select Service Location
                </h3>
                <p class="xsmall muted" style="margin:4px 0 0 0">
                  Pinpoint your exact location using high-accuracy GPS, interactive map, satellite view, or address search.
                </p>
              </div>
              
              <button type="button" class="btn btn-primary btn-sm" id="sh-btn-gps-detect" style="display:flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(37,99,235,0.25)">
                ${icon('navigation', 15)} Detect Exact Location
              </button>
            </div>

            <!-- Address Search Input -->
            <div style="position:relative">
              <div class="sh-input-wrapper" style="margin-bottom:0">
                <span class="sh-input-icon" style="color:var(--primary)">${icon('search', 16)}</span>
                <input type="text" class="sh-input-control" id="sh-loc-search-input" placeholder="Search for your address, building, or landmark…" autocomplete="off" style="padding-left:40px;padding-right:36px">
                <button type="button" id="sh-loc-search-clear" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ink-3);cursor:pointer;display:none">
                  ${icon('x', 14)}
                </button>
              </div>
              <div id="sh-loc-search-results" class="sh-search-dropdown" style="display:none"></div>
            </div>
          </div>

          <!-- GPS Permission Error Banner (Hidden by default) -->
          <div id="sh-loc-permission-banner" class="sh-alert-banner warning" style="display:none;margin-bottom:14px;background:#FFFBEB;border:1.5px solid #F59E0B;border-radius:12px;padding:12px 16px">
            <div style="display:flex;gap:10px;align-items:flex-start">
              <span style="color:#D97706;font-size:18px">ℹ️</span>
              <div>
                <b style="color:#92400E;font-size:13px;display:block">Location Access Disabled</b>
                <span style="color:#78350F;font-size:12.5px;line-height:1.4">
                  Location access is disabled. Please enable location permission in your browser/device settings or select your location manually on the map using search or by dragging the pin.
                </span>
              </div>
            </div>
          </div>

          <!-- Interactive Map Container with Floating Controls -->
          <div style="position:relative;width:100%;border-radius:16px;overflow:hidden;border:1.5px solid var(--line);box-shadow:var(--sh-md)">
            
            <div id="sh-interactive-map" style="width:100%;height:380px;background:#E2E8F0;z-index:1"></div>

            <!-- Floating Map View Mode Controls (Roadmap / Satellite / Hybrid) -->
            <div class="sh-map-mode-toggle" style="position:absolute;top:12px;right:12px;z-index:1000;display:flex;background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);border-radius:10px;padding:3px;box-shadow:0 4px 14px rgba(0,0,0,0.15);border:1px solid rgba(0,0,0,0.08)">
              <button type="button" class="sh-map-mode-btn ${this.mapMode === 'roadmap' ? 'active' : ''}" data-mode="roadmap">
                🗺️ Roadmap
              </button>
              <button type="button" class="sh-map-mode-btn ${this.mapMode === 'satellite' ? 'active' : ''}" data-mode="satellite">
                🛰️ Satellite
              </button>
              <button type="button" class="sh-map-mode-btn ${this.mapMode === 'hybrid' ? 'active' : ''}" data-mode="hybrid">
                🌐 Hybrid
              </button>
            </div>

            <!-- Floating Draggable Pin Help Pill -->
            <div style="position:absolute;bottom:12px;left:12px;z-index:1000;background:rgba(15,23,42,0.85);color:#fff;backdrop-filter:blur(6px);padding:6px 12px;border-radius:20px;font-size:11.5px;font-weight:600;display:flex;align-items:center;gap:6px">
              ${icon('move', 13)} Drag marker or tap map to set exact spot
            </div>
          </div>

          <!-- Address Confirmation & Coordinate Display Card -->
          <div class="sh-address-confirm-box" style="margin-top:16px;background:var(--surface-2);border-radius:14px;padding:16px;border:1px solid var(--line)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px">
              <div>
                <div style="font-size:12px;font-weight:800;color:var(--primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">
                  📍 Selected Address Details
                </div>
                <div id="sh-loc-address-text" style="font-size:14.5px;font-weight:800;color:var(--ink);line-height:1.4">
                  <span class="spinner inline" style="width:14px;height:14px"></span> Resolving location address…
                </div>
              </div>
              <span id="sh-loc-badge" class="badge badge-primary" style="flex:none">Exact GPS</span>
            </div>

            <!-- Structured Detail Pills (City, State, Pin, Country, Lat/Lng) -->
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;font-size:12px" id="sh-loc-meta-grid">
              <span class="badge" id="sh-meta-latlng" style="background:var(--card);color:var(--ink-2);border:1px solid var(--line)">
                Lat: ${this.currentLat.toFixed(5)}, Lng: ${this.currentLng.toFixed(5)}
              </span>
              <span class="badge" id="sh-meta-city" style="background:var(--card);color:var(--ink-2);border:1px solid var(--line)">
                City: —
              </span>
              <span class="badge" id="sh-meta-pincode" style="background:var(--card);color:var(--ink-2);border:1px solid var(--line)">
                Pin: —
              </span>
            </div>

            <!-- Confirmation Prompt ("Is this your exact location?") -->
            <div style="border-top:1px dashed var(--line);padding-top:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
              <div style="font-size:13.5px;font-weight:700;color:var(--ink)">
                Is this your exact location?
              </div>
              <div style="display:flex;gap:8px">
                <button type="button" class="btn btn-outline btn-sm" id="sh-btn-change-loc">
                  Change Location
                </button>
                <button type="button" class="btn btn-primary btn-sm" id="sh-btn-confirm-loc" style="background:var(--success);border-color:var(--success)">
                  ✓ Confirm Location
                </button>
              </div>
            </div>
          </div>

        </div>
      `;
    }

    initMap() {
      const mapEl = document.getElementById('sh-interactive-map');
      if (!mapEl) return;

      if (this.mapEngine === 'google' && window.google?.maps) {
        this.initGoogleMap(mapEl);
      } else {
        this.initLeafletMap(mapEl);
      }
    }

    initGoogleMap(mapEl) {
      const mapType = this.mapMode === 'satellite' ? 'satellite' : (this.mapMode === 'hybrid' ? 'hybrid' : 'roadmap');
      this.gMap = new google.maps.Map(mapEl, {
        center: { lat: this.currentLat, lng: this.currentLng },
        zoom: this.options.initialZoom,
        mapTypeId: mapType,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      this.gMarker = new google.maps.Marker({
        position: { lat: this.currentLat, lng: this.currentLng },
        map: this.gMap,
        draggable: true,
        animation: google.maps.Animation.DROP,
        title: 'Drag me to set exact service location',
      });

      this.gMarker.addListener('dragend', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        this.updatePosition(lat, lng, true);
      });

      this.gMap.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        this.gMarker.setPosition({ lat, lng });
        this.updatePosition(lat, lng, true);
      });

      setTimeout(() => {
        if (this.gMap && window.google?.maps) {
          google.maps.event.trigger(this.gMap, 'resize');
          this.gMap.setCenter({ lat: this.currentLat, lng: this.currentLng });
        }
      }, 250);
    }

    initLeafletMap(mapEl) {
      if (!window.L) return;
      try {
        if (this.lMap) {
          this.lMap.remove();
        }
      } catch (e) {}

      this.lMap = L.map(mapEl, {
        center: [this.currentLat, this.currentLng],
        zoom: this.options.initialZoom,
        zoomControl: true,
      });

      // Layer definitions
      this.lLayers.roadmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      });

      this.lLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles © Esri'
      });

      this.lLayers.hybrid = L.layerGroup([
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', { maxZoom: 19 })
      ]);

      const activeLayer = this.lLayers[this.mapMode] || this.lLayers.roadmap;
      activeLayer.addTo(this.lMap);

      // Custom Red Pin Icon
      const pinIcon = L.divIcon({
        className: 'sh-custom-leaflet-marker',
        html: `<div style="width:38px;height:38px;background:#2563EB;border:3px solid #fff;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:18px;box-shadow:0 4px 14px rgba(37,99,235,0.4);transform:translate(-50%,-50%)">📍</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      this.lMarker = L.marker([this.currentLat, this.currentLng], {
        draggable: true,
        icon: pinIcon,
      }).addTo(this.lMap);

      this.lMarker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        this.updatePosition(lat, lng, true);
      });

      this.lMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        this.lMarker.setLatLng([lat, lng]);
        this.updatePosition(lat, lng, true);
      });
    }

    setMapMode(mode) {
      this.mapMode = mode;
      this.container.querySelectorAll('.sh-map-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
      });

      if (this.mapEngine === 'google' && this.gMap) {
        const mapType = mode === 'satellite' ? 'satellite' : (mode === 'hybrid' ? 'hybrid' : 'roadmap');
        this.gMap.setMapTypeId(mapType);
      } else if (this.mapEngine === 'leaflet' && this.lMap) {
        Object.values(this.lLayers).forEach(layer => this.lMap.removeLayer(layer));
        const layer = this.lLayers[mode] || this.lLayers.roadmap;
        layer.addTo(this.lMap);
      }
    }

    updatePosition(lat, lng, fetchAddress = true) {
      this.currentLat = lat;
      this.currentLng = lng;

      // Update map center & marker
      if (this.mapEngine === 'google' && this.gMap && this.gMarker) {
        const pos = { lat, lng };
        this.gMap.panTo(pos);
        this.gMarker.setPosition(pos);
      } else if (this.mapEngine === 'leaflet' && this.lMap && this.lMarker) {
        this.lMap.panTo([lat, lng]);
        this.lMarker.setLatLng([lat, lng]);
      }

      // Update meta coordinates badge
      const latLngBadge = document.getElementById('sh-meta-latlng');
      if (latLngBadge) latLngBadge.textContent = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;

      if (fetchAddress) {
        this.reverseGeocode(lat, lng);
      }
    }

    async detectGPSLocation() {
      const gpsBtn = document.getElementById('sh-btn-gps-detect');
      const banner = document.getElementById('sh-loc-permission-banner');
      if (banner) banner.style.display = 'none';

      this.isLocating = true;
      const icon = getIcon;
      if (gpsBtn) {
        gpsBtn.disabled = true;
        gpsBtn.innerHTML = `${icon('timer', 15)} Detecting Location…`;
      }

      const fallbackIpLocation = async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              this.isLocating = false;
              if (gpsBtn) {
                gpsBtn.disabled = false;
                gpsBtn.innerHTML = `${icon('navigation', 15)} Detect Exact Location`;
              }
              if (banner) banner.style.display = 'none';
              this.updatePosition(data.latitude, data.longitude, true);
              if (window.toast) toast(`📍 Location detected (${data.city || 'City'})!`, 'success');
              return true;
            }
          }
        } catch (e) {}

        try {
          const res = await fetch('https://ip-api.com/json/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.lat && data.lon) {
              this.isLocating = false;
              if (gpsBtn) {
                gpsBtn.disabled = false;
                gpsBtn.innerHTML = `${icon('navigation', 15)} Detect Exact Location`;
              }
              if (banner) banner.style.display = 'none';
              this.updatePosition(data.lat, data.lon, true);
              if (window.toast) toast(`📍 Location detected (${data.city || 'City'})!`, 'success');
              return true;
            }
          }
        } catch (e) {}

        return false;
      };

      if (!('geolocation' in navigator) || (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')) {
        const ok = await fallbackIpLocation();
        if (ok) return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.isLocating = false;
          if (gpsBtn) {
            gpsBtn.disabled = false;
            gpsBtn.innerHTML = `${icon('navigation', 15)} Detect Exact Location`;
          }
          if (banner) banner.style.display = 'none';
          const { latitude, longitude } = pos.coords;
          this.updatePosition(latitude, longitude, true);
          if (window.toast) toast('📍 High-accuracy GPS location detected!', 'success');
        },
        async (err) => {
          const ok = await fallbackIpLocation();
          if (ok) return;

          this.isLocating = false;
          if (gpsBtn) {
            gpsBtn.disabled = false;
            gpsBtn.innerHTML = `${icon('navigation', 15)} Detect Exact Location`;
          }

          if (banner) {
            banner.style.display = 'block';
            if (err.code === 1) {
              banner.querySelector('span').textContent = 'Location access disabled by browser security. Using city location. You can drag the pin on map manually.';
            } else {
              banner.querySelector('span').textContent = 'Location detection timed out. Select your location manually on the map.';
            }
          }
          if (window.toast) toast('Location permission required. Select on map manually.', 'warn');
        },
        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 0,
        }
      );
    }

    async reverseGeocode(lat, lng) {
      const addressTextEl = document.getElementById('sh-loc-address-text');
      if (addressTextEl) {
        addressTextEl.innerHTML = `<span class="spinner inline" style="width:14px;height:14px"></span> Resolving location address…`;
      }

      let formattedAddress = '';
      let city = 'Mumbai';
      let state = 'Maharashtra';
      let pincode = '400050';
      let country = 'India';
      let line = '';

      try {
        // Try BigDataCloud
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        if (res.ok) {
          const data = await res.json();
          city = data.city || data.principalSubdivision || city;
          state = data.principalSubdivision || state;
          country = data.countryName || country;
          pincode = (data.postcode || pincode).replace(/\D/g, '').slice(0, 6) || pincode;
          line = [data.locality, data.city, data.principalSubdivision].filter(Boolean).join(', ');
        }
      } catch (e) {}

      if (!line) {
        try {
          // Fallback Nominatim
          const res2 = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if (res2.ok) {
            const d = await res2.json();
            const a = d.address || {};
            line = d.display_name || 'Exact GPS position';
            city = a.city || a.town || a.suburb || city;
            state = a.state || state;
            country = a.country || country;
            pincode = (a.postcode || pincode).replace(/\D/g, '').slice(0, 6) || pincode;
          }
        } catch (e) {}
      }

      formattedAddress = line || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;

      this.currentAddress = {
        formattedAddress,
        latitude: lat,
        longitude: lng,
        city,
        state,
        pincode,
        country,
      };

      if (addressTextEl) {
        addressTextEl.textContent = formattedAddress;
      }

      const cityBadge = document.getElementById('sh-meta-city');
      if (cityBadge) cityBadge.textContent = `City: ${city}`;
      const pinBadge = document.getElementById('sh-meta-pincode');
      if (pinBadge) pinBadge.textContent = `Pin: ${pincode}`;

      if (typeof this.options.onLocationChanged === 'function') {
        this.options.onLocationChanged(this.currentAddress);
      }
    }

    async searchAddress(query) {
      if (!query || query.trim().length < 3) return;
      const resultsEl = document.getElementById('sh-loc-search-results');
      if (!resultsEl) return;

      resultsEl.style.display = 'block';
      resultsEl.innerHTML = `<div style="padding:10px;font-size:13px;color:var(--ink-3)">Searching addresses…</div>`;

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const items = await res.json();
          if (items && items.length > 0) {
            resultsEl.innerHTML = items.map(item => `
              <div class="sh-search-item" data-lat="${item.lat}" data-lng="${item.lon}" data-name="${esc(item.display_name)}" style="padding:10px 14px;border-bottom:1px solid var(--line);cursor:pointer;font-size:13px">
                📍 <b>${esc(item.display_name.split(',')[0])}</b>
                <div class="xsmall muted">${esc(item.display_name)}</div>
              </div>
            `).join('');

            resultsEl.querySelectorAll('.sh-search-item').forEach(el => {
              el.addEventListener('click', () => {
                const lat = parseFloat(el.dataset.lat);
                const lng = parseFloat(el.dataset.lng);
                this.updatePosition(lat, lng, true);
                resultsEl.style.display = 'none';
                const input = document.getElementById('sh-loc-search-input');
                if (input) input.value = el.dataset.name;
              });
            });
            return;
          }
        }
      } catch (e) {}

      resultsEl.innerHTML = `<div style="padding:10px;font-size:13px;color:var(--warn-600)">No address matches found. Please adjust search query or pick on map.</div>`;
    }

    bindEvents() {
      // GPS button
      const gpsBtn = document.getElementById('sh-btn-gps-detect');
      if (gpsBtn) gpsBtn.addEventListener('click', () => this.detectGPSLocation());

      // Mode buttons
      this.container.querySelectorAll('.sh-map-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => this.setMapMode(btn.dataset.mode));
      });

      // Search input
      const searchInput = document.getElementById('sh-loc-search-input');
      const searchClear = document.getElementById('sh-loc-search-clear');
      let debounceTimer = null;

      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const val = searchInput.value;
          if (searchClear) searchClear.style.display = val ? 'block' : 'none';
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => this.searchAddress(val), 400);
        });
      }

      if (searchClear) {
        searchClear.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          searchClear.style.display = 'none';
          const resultsEl = document.getElementById('sh-loc-search-results');
          if (resultsEl) resultsEl.style.display = 'none';
        });
      }

      // Confirmation buttons
      const confirmBtn = document.getElementById('sh-btn-confirm-loc');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          this.isConfirmed = true;
          if (window.toast) toast('📍 Location confirmed! Proceeding with booking.', 'success');
          if (typeof this.options.onLocationConfirmed === 'function') {
            this.options.onLocationConfirmed(this.currentAddress);
          }
        });
      }

      const changeBtn = document.getElementById('sh-btn-change-loc');
      if (changeBtn) {
        changeBtn.addEventListener('click', () => {
          this.detectGPSLocation();
        });
      }
    }

    loadGoogleMapsScript(key) {
      return new Promise((resolve) => {
        if (window.google?.maps) return resolve(true);
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    }

    ensureLeafletLoaded() {
      return new Promise((resolve) => {
        if (window.L) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    }
  }

  window.LocationPicker = LocationPicker;
})();

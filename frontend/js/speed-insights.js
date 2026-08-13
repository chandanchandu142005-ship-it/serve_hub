/* ============ VERCEL SPEED INSIGHTS ============ */
/* Loads and initializes Vercel Speed Insights for performance monitoring */
(() => {
  // Speed Insights initialization using the Web Vitals approach
  // Reference: https://vercel.com/docs/speed-insights/quickstart
  
  window.si = window.si || function () { 
    (window.siq = window.siq || []).push(arguments); 
  };
  
  // Load the Speed Insights script from Vercel
  // Note: The actual script path will be provided by Vercel after enabling Speed Insights in the dashboard
  // For local development and non-Vercel deployments, this will be a no-op
  // On Vercel deployments with Speed Insights enabled, this will track Web Vitals
  
  if (typeof window !== 'undefined') {
    // Initialize with basic configuration
    // This will automatically track Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/speed-insights/script.js';
    
    // Only load if script exists (on Vercel with Speed Insights enabled)
    script.onerror = () => {
      // Silently fail if not on Vercel or Speed Insights not enabled
      console.debug('Speed Insights: Not available (expected in local development)');
    };
    
    document.head.appendChild(script);
  }
})();
